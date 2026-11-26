/**
 * ผู้ช่วย AI ศูนย์ควบคุมสถานการณ์ PM2.5 สคพ.11 (PM2570.html) — ใช้ Claude API แทน Gemini
 *
 * หน้าเว็บส่งข้อมูลล่าสุด (ฝุ่น จุดความร้อน สภาพอากาศ พยากรณ์การระบายอากาศ) มาที่สคริปต์นี้
 * สคริปต์ตรวจรหัสผ่าน แล้วส่งให้ Claude วิเคราะห์ API key อยู่ในการตั้งค่าของสคริปต์นี้เท่านั้น
 * ไม่อยู่ในโค้ดหน้าเว็บ จึงไม่มีใครคัดลอกไปใช้ได้
 *
 * วิธีติดตั้ง (ทำครั้งเดียว):
 *   1. https://platform.claude.com > API keys > สร้าง key ใหม่ (ต้องมีเครดิตในบัญชี)
 *   2. script.google.com > New project > วางโค้ดไฟล์นี้ทั้งไฟล์ > Save
 *      (สร้างโปรเจกต์ใหม่ อย่าวางทับสคริปต์ Gemini ตัวเดิม เพราะ incident.html ยังใช้ตัวเดิม
 *       ดึงค่าฝุ่น live_pm25 อยู่)
 *   3. Project Settings (รูปเฟือง) > Script properties > Add:
 *        ANTHROPIC_API_KEY = key จากข้อ 1
 *        AI_PASSWORD       = รหัสผ่านที่เจ้าหน้าที่ใช้กดปุ่ม AI (ใช้รหัสเดิมได้)
 *        DAILY_LIMIT       = จำนวนครั้งสูงสุดที่เรียก Claude ได้ต่อวัน (ไม่ใส่ก็ได้ ค่าเริ่มต้น 60)
 *        CLAUDE_MODEL      = (ไม่ใส่ก็ได้) ค่าเริ่มต้น claude-opus-5-5
 *   4. เลือกฟังก์ชัน testSetup ที่แถบด้านบน > Run > อนุญาตสิทธิ์ > ดูผลใน Execution log
 *      ถ้าเห็นข้อความวิเคราะห์ภาษาไทย แปลว่าใช้งานได้
 *   5. Deploy > New deployment > type "Web app"
 *        Execute as: Me      Who has access: Anyone
 *      คัดลอก Web app URL (ลงท้าย /exec) ไปใส่ในตัวแปร CLAUDE_ADVISOR_URL ใน js/maps11v70.js
 *
 * แก้โค้ดภายหลัง: Deploy > Manage deployments > แก้ (รูปดินสอ) > Version: New version
 * URL จะคงเดิม หน้าเว็บไม่ต้องแก้
 *
 * ค่าใช้จ่ายโดยประมาณ (Claude Opus 5.5: $4 / $20 ต่อล้านโทเคน input / output):
 * ครั้งละประมาณ 0.03–0.10 ดอลลาร์ ดูจำนวนโทเคนที่ใช้จริงได้ที่เมนู Executions ของสคริปต์นี้
 *
 * ข้อมูลที่หน้าเว็บส่งมา (POST, body เป็น JSON):
 *   { password, mode: "line_draft" | "free_advice", contextData: "ข้อความข้อมูลล่าสุด" }
 * ตอบกลับ: { result, model } หรือ { error } (รหัสผ่านผิดตอบ { error: "Unauthorized" })
 */

var API_URL = 'https://api.anthropic.com/v1/messages';
var API_VERSION = '2026-10-21';
var DEFAULT_MODEL = 'claude-opus-5-5';
var DEFAULT_DAILY_LIMIT = 60;
var CACHE_SECONDS = 600;          // กดซ้ำด้วยข้อมูลชุดเดิมภายใน 10 นาที ได้คำตอบเดิม ไม่เสียค่าใช้จ่ายซ้ำ
var MAX_CONTEXT_CHARS = 30000;

// effort = ความลึกในการคิดของ Claude ยิ่งสูงยิ่งละเอียดแต่ช้าและแพงขึ้น
// UrlFetchApp รอคำตอบได้ประมาณ 60 วินาที ถ้าหมดเวลา สคริปต์จะลองใหม่ด้วย effort "low" ให้อัตโนมัติ
var MODES = {
  line_draft: {
    effort: 'low',
    maxTokens: 6000,
    task: [
      'ร่างข้อความรายงานสถานการณ์ PM₂.₅ ประจำวัน สำหรับส่งในกลุ่ม LINE ของ สคพ.11 และหน่วยงานเครือข่ายในพื้นที่',
      'ยาวไม่เกินประมาณ 15 บรรทัด อ่านจบบนมือถือได้ เรียงตามนี้',
      '1. บรรทัดหัว: 🌫️ สถานการณ์ PM₂.₅ พื้นที่ สคพ.11 พร้อมวันที่และเวลาของข้อมูล',
      '2. ภาพรวม 1–2 ประโยค',
      '3. รายจังหวัด จังหวัดละ 1 บรรทัด: วงกลมสีตามระดับของค่ารอบ 07.00 น. (🔵 ดีมาก 🟢 ดี 🟡 ปานกลาง 🟠 เริ่มมีผลกระทบ 🔴 มีผลกระทบ) ชื่อจังหวัด ค่ารอบ 07.00 น. ค่า Real-time ล่าสุด และจำนวนจุดความร้อน',
      '4. แนวโน้ม 24–48 ชั่วโมงจากพยากรณ์การระบายอากาศและฝน 1–2 บรรทัด',
      '5. คำแนะนำสุขภาพหรือมาตรการที่เหมาะกับระดับวันนี้ 1–2 บรรทัด',
      '6. บรรทัดท้าย: ที่มา: คพ. (Air4Thai), NASA FIRMS, กรมอุตุนิยมวิทยา, Open-Meteo'
    ].join('\n')
  },
  free_advice: {
    effort: 'medium',
    maxTokens: 12000,
    task: [
      'เขียนบันทึกวิเคราะห์สถานการณ์เสนอ ผอ.สคพ.11 ยาวประมาณ 300–500 คำ ขึ้นต้นด้วย "เรียน ผอ.สคพ.11" แล้วแบ่งหัวข้อตามนี้',
      '**1. สถานการณ์ปัจจุบัน** ค่าฝุ่น จุดความร้อน และการระบายอากาศของวันนี้ ระบุจังหวัดที่ค่าสูงสุดหรือมีแนวโน้มเพิ่มขึ้น',
      '**2. แนวโน้ม 24–48 ชั่วโมง** อิงข้อมูลพยากรณ์ ระบุจังหวัดและช่วงเวลาที่เสี่ยงฝุ่นสะสมที่สุด พร้อมระดับความมั่นใจ (สูง/ปานกลาง/ต่ำ) และเหตุผลสั้น ๆ',
      '**3. จังหวัดที่ควรจับตา** เฉพาะจังหวัดที่ข้อมูลชี้ เช่น โควต้าวันเกินมาตรฐานเหลือน้อย ค่าฝุ่นเพิ่มขึ้นต่อเนื่อง หรือจุดความร้อนเพิ่มขึ้น ถ้าไม่มีให้บอกว่าไม่มี',
      '**4. ข้อเสนอแนะ** 3–5 ข้อ เรียงตามความสำคัญ แต่ละข้อระบุผู้ดำเนินการและกรอบเวลา',
      '**5. ข้อจำกัดของข้อมูล** 1–2 บรรทัด เฉพาะข้อมูลที่ขาดหรือผิดปกติในรอบนี้'
    ].join('\n')
  }
};

// ข้อเท็จจริงที่ Claude ต้องใช้ทุกครั้ง แก้ที่นี่ที่เดียวเมื่อมาตรฐานหรือเป้าหมายเปลี่ยน
// (ปีฐาน/ปีเป้าหมายของจำนวนวันเกินมาตรฐาน หน้าเว็บส่งมาในข้อมูล แก้ที่ js/maps11v70.js)
var SYSTEM_PROMPT = [
  'คุณเป็นผู้ช่วยนักวิเคราะห์ของศูนย์ควบคุมสถานการณ์ PM₂.₅ สำนักงานสิ่งแวดล้อมและควบคุมมลพิษที่ 11 (สคพ.11) จังหวัดนครราชสีมา พื้นที่รับผิดชอบ 4 จังหวัด ได้แก่ นครราชสีมา ชัยภูมิ บุรีรัมย์ และสุรินทร์',
  'ผู้อ่านคือผู้อำนวยการ สคพ.11 (ผอ.สคพ.11) และเจ้าหน้าที่ซึ่งเชี่ยวชาญด้านคุณภาพอากาศอยู่แล้ว ไม่ต้องอธิบายความรู้พื้นฐาน',
  'แต่ละครั้งคุณจะได้รับข้อมูลล่าสุดจากหน้าเว็บของศูนย์ฯ ในแท็ก <data> พร้อมวันและเวลาที่ประมวลผล ให้วิเคราะห์จากข้อมูลชุดนั้นเป็นหลัก',
  '',
  'ข้อเท็จจริงอ้างอิง (ใช้ค่าเหล่านี้แทนสิ่งที่คุณจำมา):',
  '- มาตรฐาน PM₂.₅ ของประเทศไทย: ค่าเฉลี่ย 24 ชั่วโมงไม่เกิน 37.5 มคก./ลบ.ม. และค่าเฉลี่ยรายปีไม่เกิน 15 มคก./ลบ.ม. ใช้บังคับตั้งแต่ 1 มิถุนายน 2566 ค่าเดิม 50 และ 25 มคก./ลบ.ม. ยกเลิกแล้ว ห้ามอ้างเป็นมาตรฐานปัจจุบัน',
  '- ระดับคุณภาพอากาศที่ศูนย์ฯ ใช้: 0–15.0 ดีมาก (ฟ้า) · 15.1–25.0 ดี (เขียว) · 25.1–37.5 ปานกลาง (เหลือง) · 37.6–75.0 เริ่มมีผลกระทบต่อสุขภาพ (ส้ม) · 75.1 ขึ้นไป มีผลกระทบต่อสุขภาพ (แดง)',
  '- ค่า "รอบ 07.00 น." คือค่าที่ศูนย์ฯ ใช้รายงานประจำวันและนับวันเกินมาตรฐาน ค่า "Real-time" เป็นค่ารายชั่วโมงล่าสุด ใช้ดูทิศทางระหว่างวันเท่านั้น อย่าใช้ค่ารายชั่วโมงตัดสินว่าเกินมาตรฐาน 24 ชั่วโมงหรือไม่',
  '- อัตราการระบายอากาศ (VR) = เพดานการระบายอากาศ (BLH, เมตร) × ความเร็วลมที่ระดับ 10 เมตร (เมตร/วินาที) หน่วย ตร.ม./วินาที เกณฑ์ของกรมอุตุนิยมวิทยา: ต่ำกว่า 2,000 แย่ (ฝุ่นสะสมตัว) · 2,000–3,999 ปานกลาง · 4,000–7,999 ดี · 8,000 ขึ้นไป ดีมาก',
  '- BLH ต่ำลงเองทุกคืนถึงเช้าตรู่ ค่า VR ช่วงเช้า (06–09 น.) จึงบอกโอกาสฝุ่นสะสมตอนเช้าได้ดีกว่าค่าสูงสุดตอนบ่าย ค่า BLH หรือ VR ของชั่วโมงปัจจุบันขึ้นกับเวลาที่ดึงข้อมูล ให้ดูเวลาประกอบเสมอ',
  '- เป้าหมายจำนวนวันเกินมาตรฐาน: แต่ละจังหวัดต้องมีวันที่ PM₂.₅ เกินมาตรฐานในปีเป้าหมายน้อยกว่าปีฐานอย่างน้อย 5% (ปีและตัวเลขอยู่ในข้อมูล) "โควต้า" คือจำนวนวันที่ยังเกินได้อีกโดยไม่พลาดเป้า จังหวัดที่ปีฐานมีวันเกินน้อย โควต้าก็น้อยตามสัดส่วน',
  '- จุดความร้อนรายวันมาจาก NASA FIRMS (ดาวเทียม VIIRS) นับเฉพาะใน 4 จังหวัด ข้อมูลชุดนี้ไม่มีจุดความร้อนของจังหวัดอื่นหรือประเทศเพื่อนบ้าน ห้ามสรุปว่ามีหรือไม่มีการเผาข้ามแดน บอกได้เพียงว่าทิศลมเปิดโอกาสให้ควันจากทิศใดพัดเข้ามา',
  '- ศูนย์ฯ ใช้เครื่องมือเหล่านี้อยู่แล้ว อย่าเสนอให้เริ่มใช้ราวกับยังไม่มี: PM₂.₅ รายชั่วโมงจาก Air4Thai, จุดความร้อน NASA FIRMS และ GISTDA ย้อนหลัง 30 วันพร้อมแผนที่, กราฟพยากรณ์ VR ของกรมอุตุนิยมวิทยา, แบบจำลอง Windy (ECMWF), เรดาร์ตรวจอากาศพิมาย',
  '',
  'ปฏิทินฤดูกาลทั่วไปของอีสานตอนล่าง (เป็นบริบทประกอบ ไม่ใช่ข้อมูลตรวจวัด):',
  '- ต.ค.–ธ.ค. เก็บเกี่ยวข้าวนาปี มีการเผาฟางและตอซัง ลมมรสุมตะวันออกเฉียงเหนือเริ่มพัดปกคลุม อากาศเย็นและแห้งลง',
  '- ธ.ค.–เม.ย. ฤดูหีบอ้อย การเผาอ้อยก่อนตัดเป็นแหล่งฝุ่นสำคัญของพื้นที่',
  '- ม.ค.–มี.ค. มักเป็นช่วงที่ฝุ่นสะสมสูงสุด เมื่อความกดอากาศสูงแผ่ลงมา ลมอ่อน และมีชั้นอากาศผกผันช่วงเช้า',
  '- ก.พ.–เม.ย. ไฟป่าและการเผาเตรียมพื้นที่เพาะปลูก รวมถึงการเผาในประเทศเพื่อนบ้าน ซึ่งส่งผลเมื่อลมพัดมาจากทิศนั้น',
  '',
  'หลักการเขียน:',
  '- ตัวเลขทุกตัวต้องมาจากข้อมูลที่ได้รับหรือคำนวณจากข้อมูลนั้นโดยตรง ห้ามคิดขึ้นเอง ค่าใดเป็น N/A หรือ "-" ให้บอกว่าไม่มีข้อมูล',
  '- แยกให้ชัดว่าส่วนใดเป็นค่าตรวจวัด ส่วนใดเป็นค่าพยากรณ์ และส่วนใดเป็นการประเมินของคุณ',
  '- ประเมินความเสี่ยง 24–48 ชั่วโมงจากข้อมูลพยากรณ์ที่ให้มา (VR, BLH, ลม, ฝน) ร่วมกับแนวโน้มค่าฝุ่นย้อนหลังและจุดความร้อน อย่าคาดการณ์จากความรู้ทั่วไปอย่างเดียว',
  '- ให้น้ำหนักตามสถานการณ์จริง ถ้าค่าฝุ่นต่ำและพยากรณ์การระบายอากาศดี ให้บอกตรง ๆ ว่าสถานการณ์ปกติ ไม่ต้องหาความเสี่ยงมาเติม ถ้าพบสัญญาณเสี่ยง ให้ชี้ว่าจังหวัดใด ช่วงเวลาใด เพราะอะไร',
  '- ข้อเสนอแนะต้องทำได้จริงในบทบาทของ สคพ.11 เช่น ประสาน ทสจ. จังหวัด อปท. เกษตรจังหวัด โรงงานน้ำตาล หน่วยป้องกันไฟป่า ระบุว่าใครทำอะไร เมื่อไร และเหมาะกับระดับสถานการณ์',
  '- ใช้ภาษาไทยแบบราชการที่กระชับ ไม่เกริ่นนำ ไม่กล่าวถึงตัวเองว่าเป็น AI ไม่ใช้สรรพนามแทนตัวเอง',
  '- รูปแบบ: ข้อความล้วนสำหรับวางใน LINE ใช้ **ตัวหนา** ได้เฉพาะหัวข้อ ใช้เลขข้อ 1. 2. 3. หรือขีด - นำรายการ ห้ามใช้ตาราง ห้ามใช้เครื่องหมาย # ทำหัวข้อ เขียน PM₂.₅ ด้วยตัวห้อย'
].join('\n');

var THAI_DAYS = ['', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์'];
var THAI_MONTHS = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];

function doGet() {
  return json_({ ok: true, service: 'PM2.5 Claude advisor' });
}

function doPost(e) {
  try {
    var req = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    return json_(handle_(req));
  } catch (err) {
    console.error(err);
    return json_({ error: 'คำขอไม่ถูกต้อง' });
  }
}

function handle_(req) {
  var props = PropertiesService.getScriptProperties();
  var password = props.getProperty('AI_PASSWORD');
  var apiKey = props.getProperty('ANTHROPIC_API_KEY');
  if (!password || !apiKey) return { error: 'ยังไม่ได้ตั้งค่า AI_PASSWORD หรือ ANTHROPIC_API_KEY ใน Script properties' };

  if (!safeEqual_(String(req.password || ''), password)) {
    Utilities.sleep(1000); // ชะลอการเดารหัสผ่าน
    return { error: 'Unauthorized' };
  }

  var mode = Object.prototype.hasOwnProperty.call(MODES, req.mode) ? req.mode : 'line_draft';
  var contextData = String(req.contextData || '').trim();
  if (!contextData) return { error: 'ไม่มีข้อมูลส่งมาให้วิเคราะห์' };
  if (contextData.length > MAX_CONTEXT_CHARS) return { error: 'ข้อมูลยาวเกินกำหนด' };

  var cache = CacheService.getScriptCache();
  var cacheKey = 'ai:' + Utilities.base64EncodeWebSafe(
    Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, mode + '\n' + contextData, Utilities.Charset.UTF_8));
  var hit = cache.get(cacheKey);
  if (hit) return JSON.parse(hit);

  if (!takeQuota_(props)) return { error: 'วันนี้เรียกใช้ AI ครบจำนวนที่กำหนดแล้ว (DAILY_LIMIT) โปรดลองใหม่พรุ่งนี้' };

  var model = props.getProperty('CLAUDE_MODEL') || DEFAULT_MODEL;
  var userText = 'วันและเวลาที่ประมวลผล: ' + thaiNow_() + ' (เวลาประเทศไทย)\n\n' +
    'งานที่ต้องทำ:\n' + MODES[mode].task + '\n\n<data>\n' + contextData + '\n</data>';

  var out = callClaude_(apiKey, model, mode, userText);
  if (out.result) {
    try { cache.put(cacheKey, JSON.stringify(out), CACHE_SECONDS); } catch (err) { /* ใหญ่เกิน cache ก็ยังตอบได้ */ }
  }
  return out;
}

function callClaude_(apiKey, model, mode, userText) {
  var cfg = MODES[mode];
  var effort = cfg.effort;
  // โมเดลรุ่นใหม่มีตัวคัดกรองความปลอดภัยที่อาจปฏิเสธคำขอ (stop_reason "refusal")
  // fallbacks "default" ให้ Anthropic ส่งต่อไปโมเดลสำรองที่เหมาะสมในคำขอเดียวกันโดยอัตโนมัติ
  var useFallback = /^claude-(opus-5|sonnet-5-5|fable-5)/.test(model);

  for (var attempt = 1; attempt <= 2; attempt++) {
    var body = {
      model: model,
      max_tokens: cfg.maxTokens,
      output_config: { effort: effort },
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userText }]
    };
    var headers = { 'x-api-key': apiKey, 'anthropic-version': API_VERSION };
    if (useFallback) {
      body.fallbacks = 'default';
      headers['anthropic-beta'] = 'server-side-fallback-2026-07-01';
    }

    var res;
    try {
      res = UrlFetchApp.fetch(API_URL, {
        method: 'post',
        contentType: 'application/json',
        headers: headers,
        payload: JSON.stringify(body),
        muteHttpExceptions: true
      });
    } catch (err) {
      console.warn('Claude fetch failed (attempt ' + attempt + ', effort ' + effort + '): ' + err);
      if (attempt === 1) {
        effort = 'low'; // ส่วนใหญ่คือหมดเวลารอ ลองใหม่ให้คิดสั้นลง
        continue;
      }
      return { error: 'Claude ตอบไม่ทันเวลาที่ Apps Script รอได้ โปรดลองใหม่อีกครั้ง' };
    }

    var code = res.getResponseCode();
    if ((code === 429 || code >= 500) && attempt === 1) {
      Utilities.sleep(3000);
      continue;
    }
    return parseClaude_(code, res.getContentText(), model);
  }
  return { error: 'เชื่อมต่อ Claude ไม่สำเร็จ' };
}

function parseClaude_(code, text, model) {
  var data;
  try { data = JSON.parse(text); } catch (err) { return { error: 'Claude ตอบกลับผิดรูปแบบ (HTTP ' + code + ')' }; }

  if (code !== 200) {
    var msg = (data && data.error && data.error.message) || '';
    console.error('Claude API ' + code + ': ' + msg);
    if (code === 401) return { error: 'ANTHROPIC_API_KEY ไม่ถูกต้อง' };
    if (code === 403) return { error: 'API key นี้ไม่มีสิทธิ์ใช้งาน: ' + msg };
    if (code === 404) return { error: 'ไม่พบโมเดล ' + model + ' (ตรวจค่า CLAUDE_MODEL)' };
    if (code === 429) return { error: 'เรียกใช้ Claude ถี่เกินโควต้าของบัญชี โปรดลองใหม่ภายหลัง' };
    if (code >= 500) return { error: 'เซิร์ฟเวอร์ Claude หนาแน่น โปรดลองใหม่อีกครั้ง' };
    return { error: 'Claude API ไม่รับคำขอ (HTTP ' + code + '): ' + msg };
  }

  console.log('model=' + data.model + ' stop=' + data.stop_reason + ' usage=' + JSON.stringify(data.usage));

  if (data.stop_reason === 'refusal') {
    return { error: 'Claude ปฏิเสธคำขอนี้ โปรดลองใหม่อีกครั้ง' };
  }
  var result = (data.content || [])
    .filter(function (b) { return b.type === 'text'; })
    .map(function (b) { return b.text; })
    .join('')
    .trim();
  if (!result) return { error: 'Claude ไม่ได้ส่งข้อความกลับมา' };
  if (data.stop_reason === 'max_tokens') result += '\n\n(ข้อความถูกตัดเพราะยาวเกินกำหนด)';
  return { result: result, model: data.model };
}

// นับจำนวนครั้งที่เรียก Claude ต่อวัน (เวลาไทย) เก็บใน Script properties
function takeQuota_(props) {
  var limit = Number(props.getProperty('DAILY_LIMIT')) || DEFAULT_DAILY_LIMIT;
  var day = Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd');
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return false;
  try {
    var q = {};
    try { q = JSON.parse(props.getProperty('AI_QUOTA') || '{}'); } catch (err) { q = {}; }
    var used = q.day === day ? Number(q.used) || 0 : 0;
    if (used >= limit) return false;
    props.setProperty('AI_QUOTA', JSON.stringify({ day: day, used: used + 1 }));
    return true;
  } finally {
    lock.releaseLock();
  }
}

function thaiNow_() {
  var now = new Date();
  var f = function (pattern) { return Utilities.formatDate(now, 'Asia/Bangkok', pattern); };
  return 'วัน' + THAI_DAYS[Number(f('u'))] + 'ที่ ' + Number(f('d')) + ' ' + THAI_MONTHS[Number(f('M')) - 1] +
    ' ' + (Number(f('yyyy')) + 543) + ' เวลา ' + f('HH.mm') + ' น.';
}

// เทียบรหัสผ่านโดยใช้เวลาเท่ากันทุกกรณี
function safeEqual_(a, b) {
  var diff = a.length ^ b.length;
  var n = Math.max(a.length, b.length);
  for (var i = 0; i < n; i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// กด Run ฟังก์ชันนี้ในหน้าแก้โค้ด เพื่อทดสอบว่า key และรหัสผ่านตั้งไว้ถูกต้อง (นับเป็น 1 ครั้งของ DAILY_LIMIT)
function testSetup() {
  var props = PropertiesService.getScriptProperties();
  var sample = [
    'ข้อมูล ณ วันนี้ (ข้อมูลทดสอบ ไม่ใช่ค่าจริง)',
    '* นครราชสีมา',
    '  - PM₂.₅ รอบ 07.00 น. วันนี้: 21.5 มคก./ลบ.ม. (ดี)',
    '  - ย้อนหลัง 4 วันก่อน → เมื่อวาน: 18.0 → 19.2 → 20.1 → 20.8',
    '  - จุดความร้อน 24 ชม. ล่าสุด: 2 จุด',
    '  - พยากรณ์ พรุ่งนี้: VR ช่วงเช้า 06–09 น. 1,450 (แย่) | VR สูงสุดช่วงกลางวัน 7,900 (ดี) | โอกาสฝนสูงสุด 0%'
  ].join('\n');
  var out = handle_({ password: props.getProperty('AI_PASSWORD'), mode: 'line_draft', contextData: sample });
  console.log(JSON.stringify(out, null, 2));
}
