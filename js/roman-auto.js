/* roman-auto.js: romanize ordinary Thai without dashes between syllables.
 *
 * Works alongside roman.js (Copyright © 2023 Montri Kiatphaophan, MIT License) and uses its
 * syllable table, so the results match. roman.js needs each syllable separated by a dash;
 * this finds the syllables itself by splitting each word into the fewest syllables that are
 * in the table. Dashes typed by the reader still mark syllable breaks, so any word that
 * comes out wrong can be corrected the old way.
 *
 * The same rules are used in The Siam Times iOS app (SiamTimesKit/ThaiRomanizer.swift).
 * Keep EXCEPTIONS and LINKING below in step with RomanizationExceptions.swift.
 */
(function (global) {
  "use strict";

  // Words whose romanization can't be worked out syllable by syllable, mostly because the
  // syllables join when spoken (ราชบุรี is read ราด-ชะ-บุ-รี: Ratchaburi).
  // Values with spaces are written as separate words.
  var EXCEPTIONS = {
    // Common words, mostly from Pali and Sanskrit
    "วิทยา": "WITTHAYA", "ศาสนา": "SATSANA", "สุขภาพ": "SUKKHAPHAP",
    "ทรัพยากร": "SAPPHAYAKON", "อุตสาหกรรม": "UTSAHAKAM", "สาธารณ": "SATHARANA",
    "พลัง": "PHALANG", "ประวัติศาสตร์": "PRAWATTISAT", "ประวัติ": "PRAWAT",
    "ภูมิภาค": "PHUMIPHAK", "ภูมิศาสตร์": "PHUMISAT", "เศรษฐกิจ": "SETTHAKIT",
    "อากาศ": "AKAT", "มลพิษ": "MONLAPHIT", "คุณภาพ": "KHUNNAPHAP", "อนุรักษ์": "ANURAK",
    "พัฒนา": "PHATTHANA", "สถาบัน": "SATHABAN", "ปฏิบัติ": "PATIBAT", "ศึกษา": "SUEKSA",
    "ประชาชน": "PRACHACHON",
    // All 77 provinces, as the Royal Institute writes them
    "กรุงเทพมหานคร": "KRUNG THEP MAHA NAKHON", "กระบี่": "KRABI", "กาญจนบุรี": "KANCHANABURI",
    "กาฬสินธุ์": "KALASIN", "กำแพงเพชร": "KAMPHAENG PHET", "ขอนแก่น": "KHON KAEN",
    "จันทบุรี": "CHANTHABURI", "ฉะเชิงเทรา": "CHACHOENGSAO", "ชลบุรี": "CHON BURI",
    "ชัยนาท": "CHAI NAT", "ชัยภูมิ": "CHAIYAPHUM", "ชุมพร": "CHUMPHON", "เชียงราย": "CHIANG RAI",
    "เชียงใหม่": "CHIANG MAI", "ตรัง": "TRANG", "ตราด": "TRAT", "ตาก": "TAK",
    "นครนายก": "NAKHON NAYOK", "นครปฐม": "NAKHON PATHOM", "นครพนม": "NAKHON PHANOM",
    "นครราชสีมา": "NAKHON RATCHASIMA", "นครศรีธรรมราช": "NAKHON SI THAMMARAT",
    "นครสวรรค์": "NAKHON SAWAN", "นนทบุรี": "NONTHABURI", "นราธิวาส": "NARATHIWAT",
    "น่าน": "NAN", "บึงกาฬ": "BUENG KAN", "บุรีรัมย์": "BURI RAM", "ปทุมธานี": "PATHUM THANI",
    "ประจวบคีรีขันธ์": "PRACHUAP KHIRI KHAN", "ปราจีนบุรี": "PRACHIN BURI", "ปัตตานี": "PATTANI",
    "พระนครศรีอยุธยา": "PHRA NAKHON SI AYUTTHAYA", "พะเยา": "PHAYAO", "พังงา": "PHANG NGA",
    "พัทลุง": "PHATTHALUNG", "พิจิตร": "PHICHIT", "พิษณุโลก": "PHITSANULOK",
    "เพชรบุรี": "PHETCHABURI", "เพชรบูรณ์": "PHETCHABUN", "แพร่": "PHRAE", "ภูเก็ต": "PHUKET",
    "มหาสารคาม": "MAHA SARAKHAM", "มุกดาหาร": "MUKDAHAN", "แม่ฮ่องสอน": "MAE HONG SON",
    "ยโสธร": "YASOTHON", "ยะลา": "YALA", "ร้อยเอ็ด": "ROI ET", "ระนอง": "RANONG",
    "ระยอง": "RAYONG", "ราชบุรี": "RATCHABURI", "ลพบุรี": "LOP BURI", "ลำปาง": "LAMPANG",
    "ลำพูน": "LAMPHUN", "เลย": "LOEI", "ศรีสะเกษ": "SI SA KET", "สกลนคร": "SAKON NAKHON",
    "สงขลา": "SONGKHLA", "สตูล": "SATUN", "สมุทรปราการ": "SAMUT PRAKAN",
    "สมุทรสงคราม": "SAMUT SONGKHRAM", "สมุทรสาคร": "SAMUT SAKHON", "สระแก้ว": "SA KAEO",
    "สระบุรี": "SARABURI", "สิงห์บุรี": "SING BURI", "สุโขทัย": "SUKHOTHAI",
    "สุพรรณบุรี": "SUPHAN BURI", "สุราษฎร์ธานี": "SURAT THANI", "สุรินทร์": "SURIN",
    "หนองคาย": "NONG KHAI", "หนองบัวลำภู": "NONG BUA LAM PHU", "อ่างทอง": "ANG THONG",
    "อำนาจเจริญ": "AMNAT CHAROEN", "อุดรธานี": "UDON THANI", "อุตรดิตถ์": "UTTARADIT",
    "อุทัยธานี": "UTHAI THANI", "อุบลราชธานี": "UBON RATCHATHANI"
  };

  // Syllables that join onto the next syllable in compound words, when one follows.
  var LINKING = {
    "ราช": "RATCHA",    // ราชการ Ratchakan
    "ธรรม": "THAMMA",   // ธรรมชาติ Thammachat
    "กรรม": "KAMMA",    // กรรมการ Kammakan
    "พุทธ": "PHUTTHA",  // พุทธศาสนา Phutthasatsana
    "สัตว": "SATTA"     // สัตวแพทย์ Sattaphaet
  };

  var TONE_MARKS = /[่-๋]/;
  var THANTHAKHAT = "์";            // ์
  var SARA_I = "ิ", SARA_U = "ุ";
  var SILENT_PAIR_STARTS = "ทตดกปพ";     // ทร์ in จันทร์, ตร์ in ศาสตร์
  var LONG_VOWELS = "าีืู"; // า ี ื ู
  var LEADING_VOWELS = "เแโ";    // เ แ โ
  var VOWELS = "AEIOU";

  function isConsonant(ch) { return ch >= "ก" && ch <= "ฮ"; }
  function isThai(ch) { return ch >= "฀" && ch <= "๿"; }

  function parseTable(source) {
    var start = source.indexOf("new Map([");
    var end = source.indexOf("]);");
    if (start < 0 || end < 0) throw new Error("Syllable table not found in roman.js");
    var body = source.slice(start).slice(0, end - start).replace(/\/\/[^\n]*/g, "");
    var table = Object.create(null);
    var pair = /\[\s*'([^']*)'\s*\x2c\s*'([^']*)'\s*\]/g;
    var m;
    while ((m = pair.exec(body))) {
      if (m[1] && /^[฀-๿]+$/.test(m[1]) && /^[A-Z]+$/.test(m[2])) table[m[1]] = m[2];
    }

    // กำหนดค่าพยางค์สระ แ-บ ที่ตกหล่นหรือคลาดเคลื่อนเพิ่มเติม
    // 1. พยัญชนะเดี่ยว ก ถึง ฮ (44 ตัว)
    table["แกบ"] = "KAEP";
    table["แขบ"] = "KHAEP";
    table["แฃบ"] = "KHAEP";
    table["แคบ"] = "KHAEP";
    table["แฅบ"] = "KHAEP";
    table["แฆบ"] = "KHAEP";
    table["แงบ"] = "NGAEP";
    table["แจบ"] = "CHAEP";
    table["แฉบ"] = "CHAEP";
    table["แชบ"] = "CHAEP";
    table["แซบ"] = "SAEP";
    table["แฌบ"] = "CHAEP";
    table["แญบ"] = "YAEP";
    table["แฎบ"] = "DAEP";
    table["แฏบ"] = "TAEP";
    table["แฐบ"] = "THAEP";
    table["แฑบ"] = "THAEP";
    table["แฒบ"] = "THAEP";
    table["แณบ"] = "NAEP";
    table["แดบ"] = "DAEP";
    table["แตบ"] = "TAEP";
    table["แถบ"] = "THAEP";
    table["แทบ"] = "THAEP";
    table["แธบ"] = "THAEP";
    table["แนบ"] = "NAEP";
    table["แบบ"] = "BAEP";
    table["แปบ"] = "PAEP";
    table["แผบ"] = "PHAEP";
    table["แฝบ"] = "FAEP";
    table["แพบ"] = "PHAEP";
    table["แฟบ"] = "FAEP";
    table["แภบ"] = "PHAEP";
    table["แมบ"] = "MAEP";
    table["แยบ"] = "YAEP";
    table["แรบ"] = "RAEP";
    table["แลบ"] = "LAEP";
    table["แวบ"] = "WAEP";
    table["แศบ"] = "SAEP";
    table["แษบ"] = "SAEP";
    table["แสบ"] = "SAEP";
    table["แหบ"] = "HAEP";
    table["แฬบ"] = "LAEP";
    table["แอบ"] = "AEP";
    table["แฮบ"] = "HAEP";

    // 2. คำควบกล้ำ (ร ล ว)
    table["แกรบ"] = "KRAEP";
    table["แขรบ"] = "KHRAEP";
    table["แครบ"] = "KHRAEP";
    table["แตรบ"] = "TRAEP";
    table["แปรบ"] = "PRAEP";
    table["แพรบ"] = "PHRAEP";
    table["แกลบ"] = "KLAEP";
    table["แขลบ"] = "KHLAEP";
    table["แคลบ"] = "KHLAEP";
    table["แปลบ"] = "PLAEP";
    table["แผลบ"] = "PHLAEP";
    table["แพลบ"] = "PHLAEP";
    table["แฟลบ"] = "FLAEP";
    table["แกวบ"] = "KWAEP";
    table["แขวบ"] = "KHWAEP";
    table["แควบ"] = "KHWAEP";

    // 3. อักษรนำ (ห นำ)
    table["แหงบ"] = "NGAEP";
    table["แหญบ"] = "YAEP";
    table["แหนบ"] = "NAEP";
    table["แหมบ"] = "MAEP";
    table["แหยบ"] = "YAEP";
    table["แหรบ"] = "RAEP";
    table["แหลบ"] = "LAEP";
    table["แหวบ"] = "WAEP";

    return table;
  }

  /** Removes tone marks and letters silenced by ์, remembering where each kept letter came from. */
  function normalize(chars) {
    var out = [], origins = [];
    for (var i = 0; i < chars.length; i++) {
      var ch = chars[i];
      if (TONE_MARKS.test(ch)) continue;
      if (ch === THANTHAKHAT) {
        var last = out[out.length - 1];
        if (last === SARA_I || last === SARA_U) { out.pop(); origins.pop(); }
        last = out[out.length - 1];
        if (last && isConsonant(last)) {
          out.pop(); origins.pop();
          var before = out[out.length - 1];
          if (last === "ร" && before && SILENT_PAIR_STARTS.indexOf(before) >= 0) { out.pop(); origins.pop(); }
        }
        continue;
      }
      out.push(ch); origins.push(i);
    }
    return { chars: out, origins: origins };
  }

  function Romanizer(table) {
    this.table = table;
    this.exceptions = Object.create(null);
    var longest = 1, key;
    for (key in table) longest = Math.max(longest, Array.from(key).length);
    for (key in EXCEPTIONS) {
      var k = normalize(Array.from(key)).chars.join("");
      this.exceptions[k] = EXCEPTIONS[key];
      longest = Math.max(longest, Array.from(k).length);
    }
    this.maxKeyLength = longest;
  }

  /** Splits a word into the fewest syllables; single letters cost a little more, exceptions win. */
  Romanizer.prototype.segment = function (s) {
    var n = s.length, INF = Infinity;
    if (!n) return [];
    var cost = new Array(n + 1).fill(INF), back = new Array(n + 1).fill(null);
    cost[0] = 0;
    for (var i = 0; i < n; i++) {
      if (cost[i] === INF) continue;
      for (var j = i + 1; j <= Math.min(n, i + this.maxKeyLength); j++) {
        var key = s.slice(i, j).join(""), step, part;
        if (key in this.exceptions) { step = 1; part = { kind: "exception", roman: this.exceptions[key] }; }
        else if (key in this.table) { step = j - i === 1 ? 13 : 10; part = { kind: "syllable", thai: key, roman: this.table[key] }; }
        else continue;
        if (cost[i] + step < cost[j]) { cost[j] = cost[i] + step; part.start = i; part.end = j; back[j] = part; }
      }
      if (cost[i] + 100 < cost[i + 1]) { cost[i + 1] = cost[i] + 100; back[i + 1] = { kind: "other", ch: s[i], start: i, end: i + 1 }; }
    }
    var parts = [], pos = n;
    while (pos > 0 && back[pos]) { parts.unshift(back[pos]); pos = back[pos].start; }
    return this.mergeSilentFinalVowel(parts, s);
  };

  /** ชาติ, ภูมิ, เหตุ: the final ิ/ุ isn't pronounced after a long open syllable (ต and ม only). */
  Romanizer.prototype.mergeSilentFinalVowel = function (parts, s) {
    if (parts.length < 2) return parts;
    var last = parts[parts.length - 1], prev = parts[parts.length - 2];
    if (last.kind !== "syllable" || prev.kind !== "syllable" || last.end - last.start !== 2) return parts;
    var c = s[last.start], v = s[last.start + 1];
    if ((c !== "ต" && c !== "ม") || (v !== SARA_I && v !== SARA_U)) return parts;
    var p = s.slice(prev.start, prev.end);
    var longOpen = LONG_VOWELS.indexOf(p[p.length - 1]) >= 0 || (p.length === 2 && LEADING_VOWELS.indexOf(p[0]) >= 0);
    var merged = p.join("") + c;
    if (!longOpen || !(merged in this.table)) return parts;
    return parts.slice(0, -2).concat([{ kind: "syllable", thai: merged, roman: this.table[merged], start: prev.start, end: last.end }]);
  };

  /** Adds a syllable, with roman.js's dash rules: before a vowel, and between a vowel and "ng". */
  function appendSyllable(word, roman) {
    if (!roman) return word;
    if (word) {
      var prev = word[word.length - 1];
      if (VOWELS.indexOf(roman[0]) >= 0 || (VOWELS.indexOf(prev) >= 0 && roman.indexOf("NG") === 0)) word += "-";
    }
    return word + roman;
  }

  Romanizer.prototype.assemble = function (parts) {
    var words = [], current = "", previous = "";
    function flush() { if (current) words.push(current); current = ""; }
    for (var i = 0; i < parts.length; i++) {
      var part = parts[i], isLast = i === parts.length - 1;
      if (part.kind === "exception" && part.roman.indexOf(" ") >= 0) {
        flush(); current = part.roman; flush(); previous = part.roman;
      } else if (part.kind === "exception") {
        current = appendSyllable(current, part.roman); previous = part.roman;
      } else if (part.kind === "syllable") {
        var roman = (!isLast && LINKING[part.thai]) || part.roman;
        current = appendSyllable(current, roman); previous = roman;
      } else if (part.ch === "ๆ") {                       // ๆ repeats the previous word
        flush(); current = previous.split(" ").pop();
      } else if (part.ch >= "๐" && part.ch <= "๙") { // Thai digits
        current += String(part.ch.charCodeAt(0) - 0x0E50);
      } else if (!isThai(part.ch)) {                           // keep numbers, Latin, punctuation
        current += part.ch;
      }
    }
    flush();
    return words.join(" ");
  };

  /** Returns { roman: "Maenam Chaophraya", syllables: "แม่-น้ำ เจ้า-พระ-ยา" }. */
  Romanizer.prototype.romanize = function (text) {
    var self = this, romanWords = [], syllableWords = [];
    String(text).split(/\s+/).filter(Boolean).forEach(function (word) {
      var parts = [], pieces = [];
      word.split("-").filter(Boolean).forEach(function (chunk) {
        var original = Array.from(chunk), norm = normalize(original);
        var chunkParts = self.segment(norm.chars), prevOther = false;
        chunkParts.forEach(function (part, index) {
          var start = norm.origins[part.start];
          var end = index + 1 < chunkParts.length ? norm.origins[chunkParts[index + 1].start] : original.length;
          var piece = original.slice(start, end).join(""), isOther = part.kind === "other";
          // Keep numbers and non-Thai text together rather than dashing every character.
          if (isOther && prevOther && pieces.length) pieces[pieces.length - 1] += piece; else pieces.push(piece);
          prevOther = isOther;
        });
        if (!chunkParts.length && original.length) pieces.push(chunk);
        parts = parts.concat(chunkParts);
      });
      romanWords.push(self.assemble(parts));
      syllableWords.push(pieces.join("-"));
    });
    var roman = romanWords.join(" ").split(" ").filter(Boolean).map(function (w) {
      w = w.toLowerCase();
      var i = w.search(/[a-z]/);
      return i < 0 ? w : w.slice(0, i) + w[i].toUpperCase() + w.slice(i + 1);
    }).join(" ");
    return { roman: roman, syllables: syllableWords.join(" ") };
  };

  global.RomanAuto = {
    Romanizer: Romanizer,
    parseTable: parseTable,
    EXCEPTIONS: EXCEPTIONS,
    LINKING: LINKING,
    /** Downloads roman.js and builds a romanizer from its syllable table. */
    load: function (url) {
      return fetch(url).then(function (response) {
        if (!response.ok) throw new Error("HTTP " + response.status);
        return response.text();
      }).then(function (source) { return new Romanizer(parseTable(source)); });
    }
  };
})(typeof window !== "undefined" ? window : this);
