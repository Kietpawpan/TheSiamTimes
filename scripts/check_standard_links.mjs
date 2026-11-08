#!/usr/bin/env node
// ตรวจสอบลิงก์เอกสารทั้งหมดใน standards.json (ข้อมูลของ pollutionStandards.html และแอป iOS)
// ใช้งาน:  node scripts/check_standard_links.mjs [path/to/standards.json] [--base=https://example.go.th/docs/]
//   --base  ที่อยู่ของไฟล์ PDF ภายใน (ลิงก์ที่ไม่ขึ้นต้นด้วย http) ถ้าไม่ระบุจะตรวจว่ามีไฟล์อยู่ในโฟลเดอร์เดียวกับ standards.json
// ต้องใช้ Node.js 18 ขึ้นไป (มี fetch ในตัว) และต้องเชื่อมต่ออินเทอร์เน็ตได้
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';

const args = process.argv.slice(2);
const htmlPath = args.find(a => !a.startsWith('--')) || 'standards.json';
const base = (args.find(a => a.startsWith('--base=')) || '').slice('--base='.length);
const CONCURRENCY = 4;
const TIMEOUT_MS = 30000;

const database = JSON.parse(await readFile(htmlPath, 'utf8'));
const entries = database.entries
    .filter(e => e.link)
    .map(e => ({ year: e.year, title: `${e.id} ${e.title}`, url: e.link }));
const ids = new Set(database.entries.map(e => e.id));
for (const e of database.entries) {
    if (e.cancelledBy && !ids.has(e.cancelledBy)) console.log(`! ${e.id}: cancelledBy "${e.cancelledBy}" ไม่มีในข้อมูล`);
}
console.log(`พบลิงก์ ${entries.length} รายการ จาก ${database.entries.length} ประกาศ\n`);

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
        console.log(`- [${b.year}] ${b.title.slice(0, 80)}\n    ${b.url}\n    สถานะ: ${b.status}`);
    }
    process.exitCode = 1;
}
