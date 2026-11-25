// Tests for scripts/draft_new_standards.mjs in issue mode: the URL checks and the PR description.
// Run with: node --test test/draft-new-standards.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(new URL('../scripts/draft_new_standards.mjs', import.meta.url));

const EXISTING = {
    id: '2560-01', year: 2560, title: 'มาตรฐานควบคุมฝุ่นละอองจากโรงงาน <!-- fixes #1 @octocat พ.ศ. ๒๕๖๐',
    date: '๑ ม.ค. ๒๕๖๐', ref: '-', link: 'https://www.pcd.go.th/old.pdf',
};
const post = fields => ({
    id: 9001, date: '2026-09-10T11:18:16', types: [],
    title: 'ประกาศกรมควบคุมมลพิษ เรื่อง มาตรฐานควบคุมฝุ่นละอองจากโรงงาน พ.ศ. ๒๕๖๙',
    link: 'https://www.pcd.go.th/laws/9001/',
    pdf: 'https://www.pcd.go.th/wp-content/uploads/2026/09/pcd-9001.pdf',
    ...fields,
});

// Runs the script the way the workflow does and returns what it wrote.
function draft(posts, existing = EXISTING) {
    const dir = mkdtempSync(join(tmpdir(), 'draft-standards-'));
    try {
        const dbPath = join(dir, 'standards.json');
        writeFileSync(dbPath, JSON.stringify({ updated: '2026-01-01', ignoredPcdIds: [], entries: [existing] }));
        const env = { ...process.env, ISSUE_BODY: '```json\n' + JSON.stringify(posts) + '\n```', ISSUE_NUMBER: '7', PR_BODY_FILE: join(dir, 'pr-body.md') };
        delete env.GITHUB_OUTPUT;
        const run = spawnSync(process.execPath, [SCRIPT, dbPath], { env, encoding: 'utf8' });
        const read = name => { try { return readFileSync(join(dir, name), 'utf8'); } catch { return null; } };
        return { status: run.status, stderr: run.stderr, db: JSON.parse(read('standards.json')), body: read('pr-body.md') };
    } finally {
        rmSync(dir, { recursive: true, force: true });
    }
}

test('rejects a link or PDF that only starts with a pcd.go.th URL', () => {
    const r1 = draft([post({ pdf: 'https://www.pcd.go.th/x https://evil.example/wp-content/uploads/fake.pdf' })]);
    assert.notEqual(r1.status, 0);
    assert.match(r1.stderr, /PDF for 9001 is not a \.pdf on pcd\.go\.th/);
    assert.equal(r1.db.entries.length, 1);

    const r2 = draft([post({ link: 'https://www.pcd.go.th/x https://evil.example/' })]);
    assert.notEqual(r2.status, 0);
    assert.match(r2.stderr, /Link for 9001 is not on pcd\.go\.th/);

    const r3 = draft([post({ link: 'https://www.pcd.go.th.evil.example/laws/9001/' })]);
    assert.notEqual(r3.status, 0);
});

test('rejects a PDF link that is not a .pdf', () => {
    const r = draft([post({ pdf: 'https://www.pcd.go.th/wp-content/uploads/2026/09/page.html' })]);
    assert.notEqual(r.status, 0);
    assert.match(r.stderr, /PDF for 9001/);
});

test('uses the checked PDF link as it is', () => {
    const pdf = 'https://pcd.go.th/wp-content/uploads/2026/09/Notice.PDF';
    const r = draft([post({ pdf })]);
    assert.equal(r.status, 0, r.stderr);
    assert.equal(r.db.entries[0].link, pdf);
    assert.equal(r.db.entries[0].pcdId, 9001);
});

test('without a PDF, the entry links to the post', () => {
    const r = draft([post({ pdf: undefined })]);
    assert.equal(r.status, 0, r.stderr);
    assert.equal(r.db.entries[0].link, 'https://www.pcd.go.th/laws/9001/');
});

test('titles and links in the PR description are inline code', () => {
    const r = draft([post({ title: 'ประกาศกรมควบคุมมลพิษ เรื่อง มาตรฐานควบคุมฝุ่นละอองจากโรงงาน `<!--` fixes #1 @octocat พ.ศ. ๒๕๖๙' })]);
    assert.equal(r.status, 0, r.stderr);
    const lines = r.body.split('\n');
    assert.ok(lines.includes('### 1. `มาตรฐานควบคุมฝุ่นละอองจากโรงงาน <!-- fixes #1 @octocat พ.ศ. ๒๕๖๙`'), r.body);
    assert.ok(lines.includes('- โพสต์บนเว็บ คพ.: `https://www.pcd.go.th/laws/9001/`'));
    assert.ok(lines.includes('- ไฟล์ PDF: `https://www.pcd.go.th/wp-content/uploads/2026/09/pcd-9001.pdf`'));
    assert.ok(r.body.includes('`2560-01` `มาตรฐานควบคุมฝุ่นละอองจากโรงงาน <!-- fixes #1 @octocat พ.ศ. ๒๕๖๐`'), r.body);
    // Outside code spans, none of it is left; the checklist is still there.
    const outside = r.body.replace(/`[^`\n]*`/g, '');
    for (const s of ['<!--', '@octocat', 'fixes #1']) assert.ok(!outside.includes(s), `${s} outside code: ${outside}`);
    assert.ok(r.body.includes('### ก่อนกด Merge โปรดตรวจ'));
    assert.ok(r.body.includes('Closes #7'));
});

test('a code span cannot be broken by line breaks in a title from standards.json', () => {
    const existing = { ...EXISTING, title: 'มาตรฐานควบคุมฝุ่นละอองจากโรงงาน\n\n<!-- @octocat พ.ศ. ๒๕๖๐' };
    const r = draft([post({ title: 'ประกาศกรมควบคุมมลพิษ เรื่อง มาตรฐานควบคุมฝุ่นละอองจากโรงงาน @octocat พ.ศ. ๒๕๖๙' })], existing);
    assert.equal(r.status, 0, r.stderr);
    assert.ok(r.body.includes('`มาตรฐานควบคุมฝุ่นละอองจากโรงงาน <!-- @octocat พ.ศ. ๒๕๖๐`'), r.body);
});
