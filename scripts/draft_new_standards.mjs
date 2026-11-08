#!/usr/bin/env node
// Drafts standards.json entries for announcements the Pollution Control Department (PCD)
// has posted but the database doesn't have yet. Run by .github/workflows/draft-new-standards.yml,
// which opens a pull request with the result; nothing reaches the site until it is merged.
//
//   node scripts/draft_new_standards.mjs [standards.json]
//
// Writes the PR description to pr-body.md (or $PR_BODY_FILE) and, on GitHub Actions,
// sets the output "count" to the number of new entries.
//
// The rules that decide whether a post is a draft, is a standard, or is already in the
// database are copied from pollutionStandards.html (and the iOS app). Keep them in step.
import { readFile, writeFile, appendFile } from 'node:fs/promises';

const DB_PATH = process.argv[2] || 'standards.json';
const API = process.env.PCD_API_URL ||
    'https://www.pcd.go.th/wp-json/wp/v2/laws?per_page=50&_fields=id,date,title,lawstype,link,content';
const PR_BODY_FILE = process.env.PR_BODY_FILE || 'pr-body.md';
const HEADERS = { 'User-Agent': 'Mozilla/5.0 (compatible; TheSiamTimes-standards-bot/1.0; +https://thesiamtimes.com/pollutionStandards.html)' };

// ---- Thai text helpers (same as the page) ----
const TH_DIGITS = '๐๑๒๓๔๕๖๗๘๙';
const toArabic = s => s.replace(/[๐-๙]/g, d => TH_DIGITS.indexOf(d));
const toThaiDigits = s => String(s).replace(/[0-9]/g, d => TH_DIGITS[d]);
const MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const NAMED = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—', hellip: '…', lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”' };
const decodeEntities = s => String(s).replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) =>
    e[0] === '#' ? String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : +e.slice(1)) : (NAMED[e.toLowerCase()] ?? m));

// ---- Matching rules (copied from pollutionStandards.html) ----
const matchKey = title => {
    let t = decodeEntities(title).trim().replace(/^\(ร่าง\)\s*/, '');
    const i = t.indexOf('เรื่อง');
    if (i >= 0 && i < 160) t = t.slice(i + 'เรื่อง'.length);
    t = t.trim().replace(/^กฎกระทรวง\s*/, '');
    return toArabic(t.replace(/เเ/g, 'แ').replace(/ํา/g, 'ำ')).replace(/[^ก-๛0-9A-Za-z]/g, '');
};
const titleYear = title => { const m = toArabic(title).match(/พ\.\s?ศ\.\s?(\d{4})/); return m ? +m[1] : null; };
const similarity = (a, b) => {
    if (!a.length || !b.length) return a.length === b.length ? 1 : 0;
    let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
    for (let i = 1; i <= a.length; i++) {
        const cur = [i];
        for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        prev = cur;
    }
    return 1 - prev[b.length] / Math.max(a.length, b.length);
};
const isInsertion = (a, b) => {
    const [s, l] = a.length <= b.length ? [a, b] : [b, a];
    if (!s.length || s.length / l.length < 0.85) return false;
    let i = 0;
    for (const ch of l) if (i < s.length && ch === s[i]) i++;
    return i === s.length;
};
const NOT_STANDARD_TYPES = [101, 102, 103, 104, 118, 120, 130];
const NOT_STANDARD_WORDS = ['คำพิพากษา', 'พระราชบัญญัติ', 'นโยบาย', 'บัญชีรายชื่อ', 'แต่งตั้ง', 'ระเบียบ', 'แบ่งส่วนราชการ', 'ไซเบอร์', 'จริยธรรม', 'ข้อมูลส่วนบุคคล'];
const isDraft = law => law.types.includes(121) || law.title.startsWith('(ร่าง)') || law.title.includes('รับฟังความคิดเห็น') || law.title.startsWith('ขอเชิญ');
const isStandard = law => !law.types.some(t => NOT_STANDARD_TYPES.includes(t)) && !NOT_STANDARD_WORDS.some(w => law.title.includes(w));

// ---- Helpers for the draft entries ----
// PCD's own announcements are stored without the "ประกาศ… เรื่อง" prefix, like the rest of the database.
const OWN_PREFIX = /^ประกาศ(?:กระทรวงทรัพยากรธรรมชาติและสิ่งแวดล้อม|กรมควบคุมมลพิษ|คณะกรรมการสิ่งแวดล้อมแห่งชาติ|คณะกรรมการควบคุมมลพิษ)\s*เรื่อง\s*/;
const entryTitle = title => title.replace(OWN_PREFIX, '').trim();
// "2026-09-10T11:18:16" (site time, Bangkok) → "๑๐ ก.ย. ๒๕๖๙"
const thaiDate = iso => { const [y, m, d] = iso.slice(0, 10).split('-').map(Number); return toThaiDigits(`${d} ${MONTHS[m - 1]} ${y + 543}`); };
// Same subject, any year or edition — used to suggest which older entry a new one may cancel.
const topicKey = title => matchKey(title).replace(/พศ\d{4}/g, '').replace(/ฉบับที่\d+/g, '');
const findPdf = text => {
    const all = [...String(text).matchAll(/https?:\/\/[^"'\s<>]+?\.pdf/gi)].map(m => m[0]);
    return all.find(u => u.includes('/wp-content/uploads/')) || all[0] || null;
};
const bangkokToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(new Date());

// standards.json is written one entry per line, so a new entry is a one-line diff.
const formatEntry = e => '{' + Object.entries(e).map(([k, v]) => `${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(', ') + '}';
const formatDatabase = db => {
    const head = Object.entries(db).filter(([k]) => k !== 'entries').map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)},`);
    return ['{', ...head, '  "entries": [', db.entries.map(e => '    ' + formatEntry(e)).join(',\n'), '  ]', '}'].join('\n') + '\n';
};

async function fetchText(url) {
    const response = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error(`${url} → HTTP ${response.status}`);
    return response.text();
}

const original = await readFile(DB_PATH, 'utf8');
const db = JSON.parse(original);
if (formatDatabase(db) !== original) {
    console.warn('! standards.json is not in the one-entry-per-line layout; it will be rewritten in that layout.');
}
const ignored = new Set(db.ignoredPcdIds || []);
const matchIndex = db.entries.map(e => ({ key: matchKey(e.title), year: titleYear(e.title) ?? e.year, entry: e }));
const findEntry = law => {
    const byId = db.entries.find(e => e.pcdId === law.id);
    if (byId) return byId;
    const key = matchKey(law.title);
    const exact = matchIndex.find(m => m.key === key);
    if (exact) return exact.entry;
    const year = titleYear(law.title);
    if (!year) return null;
    const close = matchIndex.find(m => m.year === year && (similarity(key, m.key) >= 0.97 || isInsertion(key, m.key)));
    return close ? close.entry : null;
};

const posts = JSON.parse(await fetchText(API)).map(x => ({
    id: x.id,
    title: decodeEntities(x.title.rendered).replace(/\s+/g, ' ').trim(),
    date: x.date,
    types: x.lawstype || [],
    link: x.link,
    content: x.content?.rendered || '',
}));
console.log(`PCD: ${posts.length} posts`);

const missing = posts.filter(l => !isDraft(l) && isStandard(l) && !ignored.has(l.id) && !findEntry(l))
    .sort((a, b) => b.date.localeCompare(a.date));
console.log(`New announcements: ${missing.length}`);

const nextNumber = {};
const drafts = [];
for (const law of missing) {
    let pdf = findPdf(law.content);
    if (!pdf) {
        try { pdf = findPdf(await fetchText(law.link)); } catch (error) { console.warn(`! ${law.link}: ${error.message}`); }
    }
    const year = titleYear(law.title) ?? (+law.date.slice(0, 4) + 543);
    if (!(year in nextNumber)) {
        const used = db.entries.map(e => e.id.match(new RegExp(`^${year}-(\\d+)$`))).filter(Boolean).map(m => +m[1]);
        nextNumber[year] = Math.max(0, ...used) + 1;
    }
    const entry = {
        id: `${year}-${String(nextNumber[year]++).padStart(2, '0')}`,
        year,
        title: entryTitle(law.title),
        date: thaiDate(law.date),
        ref: '-',
        link: pdf || law.link,
        pcdId: law.id,
    };
    const topic = topicKey(law.title);
    const related = db.entries.filter(e => !e.cancelledBy && topicKey(e.title) === topic);
    drafts.push({ entry, law, pdf, related });
}

if (drafts.length) {
    db.entries = [...drafts.map(d => d.entry), ...db.entries];
    db.updated = bangkokToday();
    await writeFile(DB_PATH, formatDatabase(db));
}

const body = [
    `ระบบพบประกาศใหม่บนเว็บกรมควบคุมมลพิษ **${drafts.length} ฉบับ** ที่ยังไม่อยู่ใน \`standards.json\` จึงร่างรายการไว้ให้ตรวจ`,
    '',
    ...drafts.flatMap(({ entry, law, pdf, related }, i) => [
        `### ${i + 1}. ${entry.title}`,
        '',
        `- รหัส \`${entry.id}\` · ปี ${entry.year} · \`pcdId: ${law.id}\``,
        `- โพสต์บนเว็บ คพ.: ${law.link}`,
        pdf ? `- ไฟล์ PDF: ${pdf}` : '- ⚠️ ไม่พบไฟล์ PDF ในโพสต์ จึงใส่ลิงก์หน้าโพสต์ไว้แทน',
        `- วันที่ในร่าง (\`${entry.date}\`) คือวันที่ คพ. โพสต์ ไม่ใช่วันที่ลงนามหรือวันที่ลงราชกิจจานุเบกษา`,
        related.length
            ? `- อาจยกเลิกฉบับเดิม (เรื่องเดียวกัน): ${related.map(e => `\`${e.id}\` ${e.title}`).join(' · ')} — ถ้าใช่ ให้ใส่ \`"cancelledBy": "${entry.id}"\` ที่รายการนั้น`
            : '- ไม่พบฉบับเดิมที่เป็นเรื่องเดียวกันในฐานข้อมูล',
        '',
    ]),
    '### ก่อนกด Merge โปรดตรวจ',
    '',
    '- [ ] ชื่อเรื่องถูกต้อง',
    '- [ ] `date` เป็นวันที่ลงนาม หรือวันที่ลงราชกิจจานุเบกษา',
    '- [ ] `ref` ใส่ เล่ม/ตอน/หน้า ถ้าลงราชกิจจานุเบกษา (ถ้าไม่ได้ลง ให้คงเป็น `-`)',
    '- [ ] ถ้าประกาศใหม่ยกเลิกฉบับเก่า ใส่ `cancelledBy` ที่ฉบับเก่าแล้ว',
    '',
    'แก้ได้ที่แท็บ **Files changed** → ปุ่ม **⋯** ที่ `standards.json` → **Edit file** แล้ว Commit เข้า branch นี้',
    '',
    'ถ้าไม่ต้องการเพิ่มรายการใด: ลบบรรทัดนั้นออกจาก PR แล้วเพิ่ม `pcdId` ลงใน `"ignoredPcdIds"` ที่ต้นไฟล์ `standards.json` ระบบจะไม่เสนอรายการนั้นอีก',
    '',
    '_PR นี้สร้างโดย GitHub Action `draft-new-standards` ระหว่างที่ PR นี้ยังเปิดอยู่ ระบบจะไม่สร้างหรือแก้ PR ใหม่ทับ_',
].join('\n');
await writeFile(PR_BODY_FILE, body + '\n');

if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `count=${drafts.length}\n`);
for (const { entry } of drafts) console.log(`+ ${entry.id} ${entry.title}`);
