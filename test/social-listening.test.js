// Tests for the pure logic in js/social-listening-plus.js (used by socialListening4.html).
// Run with: node --test test/social-listening.test.js
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { SocialListeningPlus: SLP } = require("../js/social-listening-plus.js");

const provinces = (title, description = "") =>
  SLP.matchLocations({ title, description }).map((m) => m.province);

test("finds the province from its name, short name, district or landmark", () => {
  assert.deepEqual(provinces("น้ำเสียไหลลงลำตะคอง จ.นครราชสีมา"), ["นครราชสีมา"]);
  assert.deepEqual(provinces("ค่าฝุ่นโคราชพุ่งสูง"), ["นครราชสีมา"]);
  assert.deepEqual(provinces("ชาวบ้านพิมายร้องโรงงานปล่อยน้ำเสีย"), ["นครราชสีมา"]);
  assert.deepEqual(provinces("ไฟป่าลุกลามเขาใหญ่"), ["นครราชสีมา"]);
});

test("a title match ranks ahead of a match only in the description", () => {
  assert.deepEqual(provinces("บ่อขยะไฟไหม้ จ.บุรีรัมย์", "ห่างจากชายแดน จ.สุรินทร์"), ["บุรีรัมย์", "สุรินทร์"]);
});

test("district names that are everyday words need อ./อำเภอ", () => {
  assert.deepEqual(provinces("ปราสาทหินพนมรุ้งจัดงานลดขยะ"), ["บุรีรัมย์"]);
  assert.deepEqual(provinces("ชาวบ้าน อ.ปราสาท ร้องเรียนกลิ่นเหม็น"), ["สุรินทร์"]);
});

test("a person called สุรินทร์ is not the province", () => {
  assert.deepEqual(provinces("ดร.สุรินทร์ ลงพื้นที่ตรวจน้ำเสีย จ.ชัยภูมิ"), ["ชัยภูมิ"]);
  assert.deepEqual(provinces("อธิบดีกรมควบคุมมลพิษ สุรินทร์ วรกิจธำรง ตรวจบ่อขยะ จ.บุรีรัมย์"), ["บุรีรัมย์"]);
  assert.deepEqual(provinces("ฝุ่น PM2.5 เกินมาตรฐาน จ.สุรินทร์"), ["สุรินทร์"]);
});

test("bare district names don't count in a story about another province", () => {
  assert.deepEqual(provinces("น้ำเสียที่ จ.ขอนแก่น ถนนบัวใหญ่"), []);
  assert.deepEqual(provinces("น้ำเสียที่ จ.ขอนแก่น ไหลถึง อ.บัวใหญ่"), ["นครราชสีมา"]);
});

test("relevance: a pollution word counts, meeting/training words alone do not", () => {
  const vocab = SLP.buildVocabulary({ water: { searchTerms: ["น้ำเสีย"], detectKeywords: ["ปลาตาย"] } }, []);
  assert.ok(SLP.relevanceScore({ title: "ชาวบ้านพบปลาตายจำนวนมาก" }, vocab) >= 2);
  assert.ok(SLP.relevanceScore({ title: "ประชุมอบรมเจ้าหน้าที่ประจำปี" }, vocab) < 2);
  assert.ok(SLP.relevanceScore({ title: "ชาวบ้านร้องเรียน โรงงาน" }, vocab) >= 2);
});

test("date limit: when:Nd up to a year, after:YYYY-MM-DD beyond", () => {
  assert.equal(SLP.whenOperator(24), "when:1d");
  assert.equal(SLP.whenOperator(720), "when:30d");
  const now = Date.UTC(2026, 10, 23);
  assert.equal(SLP.whenOperator(3 * 8760, now), "after:2023-11-24");
});

test("groups the same story from several outlets", () => {
  const stories = SLP.groupStories([
    { title: "ชาวบ้านสีคิ้วร้องโรงงานปล่อยน้ำเสียลงลำตะคอง ปลาตาย", source: "ไทยรัฐ", link: "a", pubDate: "2026-11-23T01:00:00Z" },
    { title: "ด่วน! ชาวบ้านสีคิ้วร้องโรงงานปล่อยน้ำเสียลงลำตะคอง ปลาตายเกลื่อน", source: "มติชน", link: "b", pubDate: "2026-11-23T02:00:00Z" },
    { title: "บุรีรัมย์เร่งดับไฟไหม้บ่อขยะ", source: "เดลินิวส์", link: "c", pubDate: "2026-11-23T03:00:00Z" },
  ]);
  assert.equal(stories.length, 2);
  const grouped = stories.find((s) => s.outlets.length === 2);
  assert.equal(grouped.outletCount, 2);
  assert.equal(grouped.link, "b", "keeps the newest report's link");
});

test("search plan: every topic keyword is searched in deep mode", () => {
  const terms = Array.from({ length: 32 }, (_, i) => "คำ" + i);
  const plan = SLP.buildSearchPlan({ provinces: ["ชัยภูมิ"], topics: [terms], custom: [], mode: "deep", when: "when:1d" });
  const searched = new Set(plan.filter((p) => p.kind === "province").flatMap((p) => p.terms));
  assert.equal(searched.size, 32);
  assert.ok(plan.every((p) => p.query.endsWith("when:1d")));
});

test("PM2.5 bands follow Air4Thai", () => {
  assert.equal(SLP.pm25Level(10).label, "คุณภาพดีมาก");
  assert.equal(SLP.pm25Level(30).label, "ปานกลาง");
  assert.equal(SLP.pm25Level(80).color, "rose");
  assert.equal(SLP.pm25Level(-1).label, "ไม่มีข้อมูล");
});
