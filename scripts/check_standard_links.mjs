#!/usr/bin/env node
// ตรวจสอบลิงก์เอกสารทั้งหมดใน pollutionStandards.html
// ใช้งาน:  node scripts/check_standard_links.mjs [path/to/pollutionStandards.html] [--base=https://example.go.th/docs/]
//   --base  ที่อยู่ของไฟล์ PDF ภายใน (ลิงก์ที่ไม่ขึ้นต้นด้วย http) ถ้าไม่ระบุจะตรวจว่ามีไฟล์อยู่ในโฟลเดอร์เดียวกับ HTML
// ต้องใช้ Node.js 18 ขึ้นไป (มี fetch ในตัว) และต้องเชื่อมต่ออินเทอร์เน็ตได้
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';

const args = process.argv.slice(2);
const htmlPath = args.find(a => !a.startsWith('--')) || 'pollutionStandards.html';
const base = (args.find(a => a.startsWith('--base=')) || '').slice('--base='.length);
const CONCURRENCY = 4;
const TIMEOUT_MS = 30000;

const html = await readFile(htmlPath, 'utf8');
const entries = [];
const itemRe = /\{\s*year:\s*(\d{4}),\s*title:\s*(["'])(.*?)\2,[^\n]*?\blink:\s*"([^"]*)"([^\n]*)/g;
for (const m of html.matchAll(itemRe)) {
    const [, year, , title, link, rest] = m;
    const pending = /pending:\s*true/.test(rest);
    if (link) entries.push({ year, title, url: link, pending });
    const alt = rest.match(/altLinks:\s*\[([^\]]*)\]/);
    if (alt) for (const a of alt[1].matchAll(/"([^"]+)"/g)) entries.push({ year, title, url: a[1], pending, alt: true });
}

const pendingCount = (html.match(/pending:\s*true/g) || []).length;
console.log(`พบลิงก์ ${entries.length} รายการ (รายการรอตรวจสอบ ${pendingCount} รายการ)\n`);

async function check(entry) {
    const isRemote = /^https?:\/\//i.test(entry.url);
    if (!isRemote && !base) {
        try {
            await access(path.resolve(path.dirname(htmlPath), entry.url));
            return { ...entry, ok: true, status: 'local' };
        } catch {
            return { ...entry, ok: false, status: 'ไม่พบไฟล์ในเครื่อง' };
        }
    }
    const url = isRemote ? entry.url : base + entry.url;
    for (const method of ['HEAD', 'GET']) {
        try {
            const res = await fetch(url, {
                method,
                redirect: 'follow',
                headers: method === 'GET' ? { Range: 'bytes=0-1023' } : {},
                signal: AbortSignal.timeout(TIMEOUT_MS),
            });
            res.body?.cancel?.();
            const type = res.headers.get('content-type') || '';
            if (res.ok || res.status === 206) {
                const notPdf = url.toLowerCase().endsWith('.pdf') && type.includes('text/html');
                return { ...entry, url, ok: !notPdf, status: `${res.status}${notPdf ? ' (ได้หน้า HTML แทน PDF)' : ''}` };
            }
            if (method === 'GET') return { ...entry, url, ok: false, status: String(res.status) };
        } catch (err) {
            if (method === 'GET') return { ...entry, url, ok: false, status: err.name === 'TimeoutError' ? 'หมดเวลา' : err.message };
        }
    }
}

const results = [];
let next = 0;
await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
    while (next < entries.length) {
        const entry = entries[next++];
        const r = await check(entry);
        results.push(r);
        process.stdout.write(r.ok ? '.' : 'x');
    }
}));

const broken = results.filter(r => !r.ok);
console.log(`\n\nใช้งานได้ ${results.length - broken.length} / ${results.length}`);
if (broken.length) {
    console.log('\nลิงก์ที่มีปัญหา:');
    for (const b of broken.sort((a, b) => b.year - a.year)) {
        console.log(`- [${b.year}] ${b.title.slice(0, 80)}${b.alt ? ' (ลิงก์สำรอง)' : ''}\n    ${b.url}\n    สถานะ: ${b.status}`);
    }
    process.exitCode = 1;
}
