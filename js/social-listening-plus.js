/* social-listening-plus.js: finds more news, filters it better, and adds listening tools
 * to SocialListening3.html (EPO 11 / สคพ.11 environmental news monitor).
 *
 * What it changes:
 *  - Searches every keyword in the selected topics (the page searched only the first 14 of
 *    each 32), in small groups so Google News doesn't cut results off at 100. A group that
 *    still fills up is split in two and searched again.
 *  - Also searches every district and well-known place (เขาใหญ่, ทับลาน, พนมรุ้ง...), and
 *    keeps stories that name only a district. District names that are also everyday words
 *    (คง, ปราสาท, คูเมือง...) only count when written as อ./อำเภอ.
 *  - Scores relevance: words like ประชุม or อบรม on their own no longer make a story count.
 *  - Groups the same story from several outlets, marks news that is new since the last scan,
 *    and shows live PM2.5 from the Pollution Control Department's Air4Thai stations.
 *
 * The pure logic lives in SocialListeningPlus (tested in test/social-listening.test.js);
 * the part at the bottom connects it to the page.
 */
(function (global) {
  "use strict";

  // ----------------------------------------------------------------------------------
  // Places
  // ----------------------------------------------------------------------------------

  /** Districts and places for each province. `ambiguous` names are also everyday words or
   *  common elsewhere, so they only count when written as "อ.X" / "อำเภอX". */
  var LOCATIONS = {
    "นครราชสีมา": {
      names: ["นครราชสีมา", "โคราช"],
      districts: ["ปากช่อง", "พิมาย", "บัวใหญ่", "สีคิ้ว", "ปักธงชัย", "ด่านขุนทด", "ครบุรี", "เสิงสาง",
        "วังน้ำเขียว", "จักราช", "ห้วยแถลง", "ประทาย", "บ้านเหลื่อม", "หนองบุญมาก", "สูงเนิน",
        "ขามทะเลสอ", "ขามสะแกแสง", "โนนไทย", "ลำทะเมนชัย", "ชุมพวง", "แก้งสนามนาง"],
      ambiguous: ["คง", "โชคชัย", "โนนสูง", "โนนแดง", "เมืองยาง", "พระทองคำ", "เทพารักษ์", "สีดา",
        "บัวลาย", "เฉลิมพระเกียรติ"],
      places: ["เขาใหญ่", "ลำตะคอง", "ทับลาน", "ลำพระเพลิง", "ลำมูลบน"]
    },
    "ชัยภูมิ": {
      names: ["ชัยภูมิ"],
      districts: ["ภูเขียว", "แก้งคร้อ", "เกษตรสมบูรณ์", "บำเหน็จณรงค์", "คอนสวรรค์", "หนองบัวแดง",
        "บ้านเขว้า", "คอนสาร", "เทพสถิต", "หนองบัวระเหว", "บ้านแท่น", "ภักดีชุมพล", "เนินสง่า",
        "ซับใหญ่"],
      ambiguous: ["จัตุรัส"],
      places: ["ลำปะทาว", "ชีลอง", "ป่าหินงาม", "ตาดโตน"]
    },
    "บุรีรัมย์": {
      names: ["บุรีรัมย์"],
      districts: ["นางรอง", "ประโคนชัย", "ละหานทราย", "ลำปลายมาศ", "สตึก", "พุทไธสง", "กระสัง",
        "บ้านกรวด", "หนองกี่", "ปะคำ", "หนองหงส์", "พลับพลาชัย", "ห้วยราช", "บ้านใหม่ไชยพจน์",
        "โนนดินแดง", "แคนดง"],
      ambiguous: ["คูเมือง", "นาโพธิ์", "โนนสุวรรณ", "ชำนิ", "บ้านด่าน", "เฉลิมพระเกียรติ"],
      places: ["พนมรุ้ง", "ห้วยตลาด", "ลำนางรอง"]
    },
    "สุรินทร์": {
      names: ["สุรินทร์"],
      districts: ["ศีขรภูมิ", "สังขะ", "รัตนบุรี", "สำโรงทาบ", "ท่าตูม", "จอมพระ", "ชุมพลบุรี",
        "กาบเชิง", "บัวเชด", "พนมดงรัก", "เขวาสินรินทร์", "โนนนารายณ์"],
      ambiguous: ["ปราสาท", "ลำดวน", "สนม", "ศรีณรงค์"],
      places: ["ห้วยเสนง"]
    }
  };

  /** The other 72 provinces. A story about one of them that mentions a district name only in
   *  passing is not counted, unless the district is written as อ./อำเภอ. */
  var OTHER_PROVINCES = ["กรุงเทพ", "กระบี่", "กาญจนบุรี", "กาฬสินธุ์", "กำแพงเพชร", "ขอนแก่น",
    "จันทบุรี", "ฉะเชิงเทรา", "ชลบุรี", "ชัยนาท", "ชุมพร", "เชียงราย", "เชียงใหม่", "ตรัง", "ตราด",
    "ตาก", "นครนายก", "นครปฐม", "นครพนม", "นครศรีธรรมราช", "นครสวรรค์", "นนทบุรี", "นราธิวาส",
    "น่าน", "บึงกาฬ", "ปทุมธานี", "ประจวบคีรีขันธ์", "ปราจีนบุรี", "ปัตตานี", "พระนครศรีอยุธยา",
    "อยุธยา", "พะเยา", "พังงา", "พัทลุง", "พิจิตร", "พิษณุโลก", "เพชรบุรี", "เพชรบูรณ์", "แพร่",
    "ภูเก็ต", "มหาสารคาม", "มุกดาหาร", "แม่ฮ่องสอน", "ยโสธร", "ยะลา", "ร้อยเอ็ด", "ระนอง",
    "ระยอง", "ราชบุรี", "ลพบุรี", "ลำปาง", "ลำพูน", "เลย", "ศรีสะเกษ", "สกลนคร", "สงขลา", "สตูล",
    "สมุทรปราการ", "สมุทรสงคราม", "สมุทรสาคร", "สระแก้ว", "สระบุรี", "สิงห์บุรี", "สุโขทัย",
    "สุพรรณบุรี", "สุราษฎร์ธานี", "หนองคาย", "หนองบัวลำภู", "อ่างทอง", "อำนาจเจริญ", "อุดรธานี",
    "อุตรดิตถ์", "อุทัยธานี", "อุบลราชธานี"];

  // ----------------------------------------------------------------------------------
  // Relevance
  // ----------------------------------------------------------------------------------

  /** Words that hint at an environmental story but don't prove it: a story needs two of
   *  them, or one plus a CONTEXT word, unless it has a specific pollution word. */
  var WEAK_TERMS = ["เดือดร้อน", "ร้องเรียน", "โรงงาน", "ฟื้นฟู", "อนุรักษ์", "ลำน้ำ", "แหล่งน้ำ",
    "ควัน", "สั่งปิด", "บุกตรวจ", "ปลูกต้นไม้", "ปลูกป่า", "คาร์บอน", "เหมือง", "โรงสี", "พลาสติก",
    "ฟาร์ม", "ลานมัน",
    // Complaint words: people complain about many things, not only pollution.
    "ร้องสอบ", "ชาวบ้านร้อง", "ชาวบ้านโวย"];

  /** Extra words that show a story is environmental, used for relevance only (not searched):
   *  forest and watershed issues, which the page's keyword lists don't cover. */
  var EXTRA_TOPIC_TERMS = ["ต้นน้ำ", "บุกรุกป่า", "รุกป่า", "ป่าสงวน", "ลักลอบตัดไม้", "ตัดไม้ทำลายป่า",
    "สัตว์ป่า", "โปแตช", "ผลกระทบสิ่งแวดล้อม"];

  /** Words that never make a story count on their own: meetings, training, floods, relief. */
  var CONTEXT_TERMS = ["ประชุม", "อบรม", "รณรงค์", "จิตอาสา", "แผนปฏิบัติการ", "ตรวจสอบ", "น้ำท่วม",
    "ภัยแล้ง", "ทรัพยากร", "ลงพื้นที่", "เฝ้าระวัง", "แก้ไขปัญหา"];

  /** Pages that show up in news results but aren't news. */
  var NOISE = [/iqair/i, /^คุณภาพอากาศใน/, /^ค่าฝุ่น\s*pm\s*2\.5\s*วันนี้/i];

  function lower(s) { return String(s || "").toLowerCase(); }
  function unique(list) {
    var seen = Object.create(null), out = [];
    list.forEach(function (x) { var k = lower(x).trim(); if (k && !seen[k]) { seen[k] = 1; out.push(x.trim()); } });
    return out;
  }
  function chunk(list, size) {
    var out = [];
    for (var i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
    return out;
  }
  function quote(term) {
    var clean = String(term).trim().replace(/^"+|"+$/g, "");
    return /\s/.test(clean) ? '"' + clean + '"' : clean;
  }
  function orGroup(terms) { return "(" + terms.map(quote).join(" OR ") + ")"; }

  /** Every place name in LOCATIONS. The topic lists include rivers like ลำตะคอง; a river's
   *  name says where a story is, not that it's about pollution, so it isn't a topic word. */
  function placeNames() {
    var names = Object.create(null);
    Object.keys(LOCATIONS).forEach(function (prov) {
      var l = LOCATIONS[prov];
      [prov].concat(l.names, l.districts, l.ambiguous, l.places).forEach(function (n) { names[lower(n)] = 1; });
    });
    ["แม่น้ำมูล", "ลำน้ำมูล", "ลำจักราช", "ลำชี", "แม่น้ำชี"].forEach(function (n) { names[n] = 1; });
    return names;
  }

  /** Builds the relevance word lists from the page's topic settings. */
  function buildVocabulary(topicConfig, customTerms) {
    var skip = placeNames();
    WEAK_TERMS.concat(CONTEXT_TERMS).forEach(function (w) { skip[lower(w)] = 1; });
    var strong = [];
    Object.keys(topicConfig).forEach(function (key) {
      var t = topicConfig[key];
      strong = strong.concat(t.searchTerms || [], t.detectKeywords || []);
    });
    strong = unique(strong.concat(EXTRA_TOPIC_TERMS)).filter(function (w) { return !skip[lower(w)]; });
    strong = unique(strong.concat(customTerms || []));
    return { strong: strong.map(lower), weak: WEAK_TERMS.map(lower), context: CONTEXT_TERMS.map(lower) };
  }

  /**
   * How clearly a story is about the environment; 2 or more counts.
   * A pollution word scores 3 in the title, 2 elsewhere. A weak word scores 1, and a context
   * word adds 1 only when there's already a weak word.
   */
  function relevanceScore(article, vocab) {
    var title = lower(article.title), body = lower(article.description), score = 0, weak = 0, context = 0;
    function has(w) { return title.indexOf(w) >= 0 || body.indexOf(w) >= 0; }
    vocab.strong.forEach(function (w) {
      if (title.indexOf(w) >= 0) score += 3;
      else if (body.indexOf(w) >= 0) score += 2;
    });
    vocab.weak.forEach(function (w) { if (has(w)) weak++; });
    (vocab.context || []).forEach(function (w) { if (has(w)) context++; });
    return score + weak + (weak > 0 && context > 0 ? 1 : 0);
  }

  function isNoise(article) {
    var title = String(article.title || ""), source = String(article.source || "");
    return NOISE.some(function (re) { return re.test(title) || re.test(source); });
  }

  // ----------------------------------------------------------------------------------
  // Matching places in a story
  // ----------------------------------------------------------------------------------

  function namesOtherProvince(text) {
    return OTHER_PROVINCES.some(function (p) {
      // Short names (ตาก, เลย, น่าน...) are everyday words too, so need จ./จังหวัด.
      if (p.length <= 4) return text.indexOf("จ." + p) >= 0 || text.indexOf("จังหวัด" + p) >= 0;
      return text.indexOf(p) >= 0;
    });
  }

  /** Titles that come before a person's name. สุรินทร์ in particular is a common given name
   *  (the Director-General of the Pollution Control Department is ดร.สุรินทร์ วรกิจธำรง). */
  var PERSON_TITLE = /(?:ดร\.|นาย|นาง|นางสาว|น\.ส\.|คุณ|ผศ\.|รศ\.|ศ\.|พล\.[ก-ฮ]\.|พ\.[ก-ฮ]\.[ก-ฮ]\.|ร\.[ก-ฮ]\.[ก-ฮ]\.|ส\.ส\.|ส\.ว\.|อธิบดี|ผู้ว่าฯ?)\s*$/;

  /** Position of a place name, skipping places where it's someone's name. */
  function placeIndex(text, name) {
    var from = 0;
    while (true) {
      var i = text.indexOf(name, from);
      if (i < 0) return -1;
      if (!PERSON_TITLE.test(text.slice(Math.max(0, i - 12), i))) return i;
      from = i + name.length;
    }
  }

  function prefixedIndex(text, name) {
    var forms = ["อ." + name, "อ. " + name, "อำเภอ" + name, "อำเภอ " + name];
    var best = -1;
    forms.forEach(function (f) { var i = text.indexOf(f); if (i >= 0 && (best < 0 || i < best)) best = i; });
    return best;
  }

  /**
   * Which of the 4 provinces a story is about, best match first:
   * [{ province, how: "province"|"district"|"place", position }]
   * Title matches come before body matches.
   */
  function matchLocations(article) {
    var title = String(article.title || ""), full = title + " \n " + String(article.description || "");
    var other = namesOtherProvince(full);
    // Google's summaries list related headlines too. If this headline is about another
    // province, a mention of ours further down is probably from one of those.
    var titleIsElsewhere = namesOtherProvince(title);
    var results = [];
    Object.keys(LOCATIONS).forEach(function (prov) {
      var loc = LOCATIONS[prov], best = null;
      function consider(pos, how, inTitle) {
        if (pos < 0) return;
        var rank = (inTitle ? 0 : 100000) + pos;
        if (!best || rank < best.rank) best = { province: prov, how: how, rank: rank };
      }
      function find(name, how, needsPrefix) {
        var p;
        if (needsPrefix) {
          p = prefixedIndex(title, name); consider(p, how, true);
          p = prefixedIndex(full, name); consider(p, how, false);
        } else {
          consider(placeIndex(title, name), how, true);
          consider(placeIndex(full, name), how, false);
        }
      }
      loc.names.forEach(function (n) { find(n, "province", false); });
      var ownNamed = best !== null;
      // When another province is named and this one isn't, bare district names are probably
      // a coincidence (e.g. a road or village of the same name elsewhere).
      var bareOk = ownNamed || !other;
      loc.districts.forEach(function (n) { find(n, "district", !bareOk); });
      loc.places.forEach(function (n) { find(n, "place", !bareOk); });
      loc.ambiguous.forEach(function (n) { find(n, "district", true); });
      if (best && titleIsElsewhere && best.rank >= 100000) best = null;
      if (best) results.push(best);
    });
    results.sort(function (a, b) { return a.rank - b.rank; });
    return results.map(function (r) { return { province: r.province, how: r.how, position: r.rank }; });
  }

  // ----------------------------------------------------------------------------------
  // Search plan
  // ----------------------------------------------------------------------------------

  /**
   * The Google News searches to run.
   *  options.provinces: ["นครราชสีมา", ...]
   *  options.topics:    [[term, ...], ...]  one list per selected topic
   *  options.custom:    [term, ...]
   *  options.mode:      "quick" | "deep"
   *  options.when:      "when:7d" etc. ("" for no limit)
   * Returns [{ query, province, kind, terms }]
   */
  function buildSearchPlan(options) {
    var deep = options.mode === "deep";
    var groupSize = 8;
    var plan = [];

    // Province names × every topic's keywords (quick: the first 16 of each topic).
    var termGroups = [];
    if (options.custom && options.custom.length) termGroups = termGroups.concat(chunk(unique(options.custom), groupSize));
    options.topics.forEach(function (terms) {
      var list = unique(terms);
      termGroups = termGroups.concat(chunk(deep ? list : list.slice(0, 16), groupSize));
    });

    // Districts and places × the most telling words from each topic.
    var core = [];
    var perTopic = deep ? 4 : 2;
    options.topics.forEach(function (terms) { core = core.concat(unique(terms).slice(0, perTopic)); });
    core = unique((options.custom || []).concat(core));
    var coreGroups = chunk(core, 10);

    options.provinces.forEach(function (prov) {
      var loc = LOCATIONS[prov];
      if (!loc) return;
      var nameGroup = orGroup(loc.names);
      termGroups.forEach(function (terms) {
        plan.push({ query: (nameGroup + " " + orGroup(terms) + " " + (options.when || "")).trim(),
                    province: prov, kind: "province", terms: terms, places: loc.names });
      });
      chunk(loc.districts.concat(loc.places), 8).forEach(function (places) {
        coreGroups.forEach(function (terms) {
          plan.push({ query: (orGroup(places) + " " + orGroup(terms) + " " + (options.when || "")).trim(),
                      province: prov, kind: "district", terms: terms, places: places });
        });
      });
    });
    return plan;
  }

  /**
   * Google News date limit for a period. Google accepts "when:<days>d" up to a year and
   * "after:YYYY-MM-DD" for longer. ("when:1m", which the page used for 30 days, returns
   * nothing at all, and no limit returns stories from any year.)
   */
  function whenOperator(hours, now) {
    var days = Math.max(1, Math.ceil(hours / 24));
    if (days <= 365) return "when:" + days + "d";
    var since = new Date((now || Date.now()) - days * 24 * 3600 * 1000);
    var pad = function (n) { return (n < 10 ? "0" : "") + n; };
    return "after:" + since.getUTCFullYear() + "-" + pad(since.getUTCMonth() + 1) + "-" + pad(since.getUTCDate());
  }

  /** Splits a search whose results filled up, so nothing is cut off. */
  function splitSearch(search, when) {
    if (search.terms.length < 2) return [];
    var half = Math.ceil(search.terms.length / 2);
    return [search.terms.slice(0, half), search.terms.slice(half)].map(function (terms) {
      return { query: (orGroup(search.places) + " " + orGroup(terms) + " " + (when || "")).trim(),
               province: search.province, kind: search.kind, terms: terms, places: search.places, isSplit: true };
    });
  }

  // ----------------------------------------------------------------------------------
  // Grouping the same story from several outlets
  // ----------------------------------------------------------------------------------

  /** Tags outlets put in front of headlines, which say nothing about the story. */
  var TITLE_TAGS = /^\s*(?:update\s*:|\(?คลิป\)?|ด่วน!*|ล่าสุด!*|news\d*\.?|breaking\s*:?)\s*/i;

  function normalizeTitle(title) {
    var t = String(title || "");
    for (var i = 0; i < 3; i++) t = t.replace(TITLE_TAGS, "");
    return lower(t).replace(/[\s"'“”‘’!?.,:;()\[\]{}\-–—_|/\\#@]+/g, "");
  }
  function bigrams(s) {
    var set = Object.create(null), n = 0;
    for (var i = 0; i < s.length - 1; i++) { var b = s.substr(i, 2); if (!set[b]) { set[b] = 1; n++; } }
    return { set: set, size: n };
  }
  /** How alike two headlines are, 0–1: the larger of their overall overlap and how much of
   *  the shorter one is inside the longer (outlets often shorten or lengthen a headline). */
  function similarity(a, b) {
    if (!a.size || !b.size) return 0;
    var shared = 0;
    for (var k in a.set) if (b.set[k]) shared++;
    var jaccard = shared / (a.size + b.size - shared);
    var containment = shared / Math.min(a.size, b.size);
    return Math.max(jaccard, containment * 0.75);
  }

  /**
   * Merges reports of the same story. Each result keeps the newest report's title and link,
   * plus `outlets`: [{ source, link, title, pubDate }] for every report.
   */
  function groupStories(articles, threshold) {
    threshold = threshold || 0.5;
    var groups = [];
    var byLink = Object.create(null);
    articles.slice().sort(function (a, b) { return new Date(b.pubDate) - new Date(a.pubDate); }).forEach(function (art) {
      var norm = normalizeTitle(art.title);
      if (!norm) return;
      var grams = bigrams(norm);
      var target = (art.link && byLink[art.link]) || null;
      if (!target) {
        for (var i = 0; i < groups.length; i++) {
          if (groups[i].norm === norm || similarity(groups[i].grams, grams) >= threshold) { target = groups[i]; break; }
        }
      }
      var outlet = { source: art.source, link: art.link, title: art.title, pubDate: art.pubDate };
      if (target) {
        var dup = target.story.outlets.some(function (o) { return o.link === art.link || (o.source === art.source && normalizeTitle(o.title) === norm); });
        if (!dup) target.story.outlets.push(outlet);
        if (!target.story.description && art.description) target.story.description = art.description;
      } else {
        var story = {};
        for (var key in art) story[key] = art[key];
        story.outlets = [outlet];
        groups.push({ norm: norm, grams: grams, story: story });
        target = groups[groups.length - 1];
      }
      if (art.link) byLink[art.link] = target;
    });
    return groups.map(function (g) {
      var sources = unique(g.story.outlets.map(function (o) { return o.source || ""; }).filter(Boolean));
      g.story.outletCount = Math.max(1, sources.length);
      return g.story;
    });
  }

  // ----------------------------------------------------------------------------------
  // PM2.5 (Air4Thai, Pollution Control Department)
  // ----------------------------------------------------------------------------------

  /** Thai AQI bands for PM2.5 (µg/m³, 24-hour average), as used by Air4Thai. */
  function pm25Level(value) {
    var v = parseFloat(value);
    if (!(v >= 0)) return { label: "ไม่มีข้อมูล", color: "slate" };
    if (v <= 15) return { label: "คุณภาพดีมาก", color: "sky" };
    if (v <= 25) return { label: "คุณภาพดี", color: "emerald" };
    if (v <= 37.5) return { label: "ปานกลาง", color: "yellow" };
    if (v <= 75) return { label: "เริ่มมีผลกระทบต่อสุขภาพ", color: "orange" };
    return { label: "มีผลกระทบต่อสุขภาพ", color: "rose" };
  }

  /** Picks the stations in the 4 provinces out of Air4Thai's getNewAQI_JSON response. */
  function stationsForProvinces(json, provinces) {
    var stations = (json && json.stations) || [];
    var out = [];
    stations.forEach(function (s) {
      var area = String(s.areaTH || "");
      var prov = (provinces || Object.keys(LOCATIONS)).filter(function (p) { return area.indexOf(p) >= 0; })[0];
      if (!prov) return;
      var last = s.AQILast || {}, pm = last.PM25 || {};
      out.push({ province: prov, id: s.stationID, name: s.nameTH, area: area.trim(),
                 pm25: parseFloat(pm.value), date: last.date, time: last.time, level: pm25Level(pm.value) });
    });
    var order = Object.keys(LOCATIONS);
    out.sort(function (a, b) { return order.indexOf(a.province) - order.indexOf(b.province); });
    return out;
  }

  global.SocialListeningPlus = {
    LOCATIONS: LOCATIONS,
    OTHER_PROVINCES: OTHER_PROVINCES,
    WEAK_TERMS: WEAK_TERMS,
    CONTEXT_TERMS: CONTEXT_TERMS,
    similarity: function (a, b) { return similarity(bigrams(normalizeTitle(a)), bigrams(normalizeTitle(b))); },
    buildVocabulary: buildVocabulary,
    relevanceScore: relevanceScore,
    isNoise: isNoise,
    matchLocations: matchLocations,
    buildSearchPlan: buildSearchPlan,
    splitSearch: splitSearch,
    whenOperator: whenOperator,
    groupStories: groupStories,
    normalizeTitle: normalizeTitle,
    pm25Level: pm25Level,
    stationsForProvinces: stationsForProvinces
  };
})(typeof window !== "undefined" ? window : this);

/* ======================================================================================
 * Page integration (browser only). Uses the page's own functions and settings:
 * currentState, TOPIC_CONFIG, TIMEFRAMES, fetchRssXmlWithFallback, parseRssResponseToArticles,
 * classifySingleNewsItem, renderDashboard, showToast.
 * ====================================================================================== */
(function () {
  "use strict";
  if (typeof document === "undefined") return;
  var SLP = window.SocialListeningPlus;

  var PARALLEL_SEARCHES = 6;     // the fetch service handles about this many at once
  var RESULT_CAP = 95;           // Google News returns at most 100; at this many, split the search
  var SEEN_KEY = "slp_seen_v1";  // stories already shown, for the "ใหม่" (new) badge
  var latestPm25 = [];

  // ---- "New since last scan" ---------------------------------------------------------

  function loadSeen() {
    try { return JSON.parse(localStorage.getItem(SEEN_KEY) || "{}") || {}; } catch (e) { return {}; }
  }
  function saveSeen(items) {
    try {
      var seen = loadSeen(), now = Date.now(), maxAge = 90 * 24 * 3600 * 1000;
      items.forEach(function (item) {
        seen["t:" + SLP.normalizeTitle(item.title)] = now;
        (item.outlets || []).forEach(function (o) { if (o.link) seen["l:" + o.link] = now; });
      });
      var keys = Object.keys(seen).filter(function (k) { return now - seen[k] < maxAge; })
        .sort(function (a, b) { return seen[b] - seen[a]; }).slice(0, 6000);
      var trimmed = {};
      keys.forEach(function (k) { trimmed[k] = seen[k]; });
      localStorage.setItem(SEEN_KEY, JSON.stringify(trimmed));
    } catch (e) { /* private browsing: badges just won't persist */ }
  }
  function isNewStory(story, seen) {
    if (seen["t:" + SLP.normalizeTitle(story.title)]) return false;
    return !(story.outlets || []).some(function (o) { return o.link && seen["l:" + o.link]; });
  }

  // ---- Turning raw search results into the dashboard's news items ----------------------

  function buildItems(rawArticles, settings, seen) {
    var selected = currentState.selectedProvinces;
    var kept = [];
    rawArticles.forEach(function (art) {
      var t = new Date(art.pubDate).getTime();
      if (settings.cutoff && !isNaN(t) && t < settings.cutoff) return;
      if (SLP.isNoise(art)) return;
      var score = SLP.relevanceScore(art, settings.vocab);
      if (score < 2) return;
      var places = SLP.matchLocations(art).filter(function (m) { return selected.indexOf(m.province) >= 0; });
      if (!places.length) return;
      art.matchedProvince = places[0].province;
      art.matchedBy = places[0].how;
      art.relevance = score;
      kept.push(art);
    });

    var stories = SLP.groupStories(kept);
    return stories.map(function (story, i) {
      var item = classifySingleNewsItem(story, i, story.matchedProvince);
      item.outlets = story.outlets;
      item.outletCount = story.outletCount;
      item.matchedBy = story.matchedBy;
      item.relevance = story.relevance;
      item.isNew = isNewStory(story, seen);
      return item;
    }).sort(function (a, b) { return new Date(b.pubDate) - new Date(a.pubDate); });
  }

  function countItems(result) {
    if (!result || typeof result.content !== "string") return 0;
    return (result.content.match(/<item>/g) || []).length;
  }

  // ---- The scan ------------------------------------------------------------------------

  async function scanNews() {
    var banner = document.getElementById("fetchingStatusBanner");
    var titleEl = document.getElementById("fetchingStatusTitle");
    var subEl = document.getElementById("fetchingStatusSub");
    var progBadge = document.getElementById("fetchingProgressBadge");
    var btn = document.getElementById("btnAutoFetch");

    if (!currentState.selectedProvinces.length) { showToast("กรุณาเลือกจังหวัดอย่างน้อย 1 จังหวัด", "warning"); return; }

    var tf = TIMEFRAMES[currentState.timeframe];
    var mode = currentState.scanMode || "quick";
    var customInput = (document.getElementById("customKeywords") || {}).value || "";
    var custom = customInput.split(",").map(function (s) { return s.trim(); }).filter(Boolean);
    var topics = currentState.selectedTopics.map(function (k) { return (TOPIC_CONFIG[k] || {}).searchTerms || []; })
      .filter(function (l) { return l.length; });

    var when = SLP.whenOperator(tf.hours);
    var queue = SLP.buildSearchPlan({ provinces: currentState.selectedProvinces, topics: topics, custom: custom,
                                      mode: mode, when: when });
    var settings = { vocab: SLP.buildVocabulary(TOPIC_CONFIG, custom), cutoff: Date.now() - tf.hours * 3600 * 1000 };
    var seen = loadSeen();
    var raw = [], rawLinks = Object.create(null);
    var total = queue.length, done = 0, failed = 0, splits = 0;
    var lastRender = 0, renderTimer = null;

    banner.classList.remove("hidden");
    btn.disabled = true;
    btn.classList.add("opacity-75");
    titleEl.textContent = "กำลังค้นหาข่าว" + (mode === "deep" ? "แบบละเอียด" : "แบบเร็ว") + " (" + tf.label + ")...";
    subEl.textContent = "ค้นทั้งชื่อจังหวัด อำเภอ และสถานที่สำคัญ ใน " + currentState.selectedProvinces.join(" • ");

    function render(final) {
      lastRender = Date.now();
      var items = buildItems(raw, settings, seen);
      currentState.newsItems = items;
      currentState.aiExecutiveSummaryHtml = null;
      renderDashboard();
      return items;
    }
    function scheduleRender() {
      if (renderTimer) return;
      var wait = Math.max(0, 1500 - (Date.now() - lastRender));
      renderTimer = setTimeout(function () { renderTimer = null; render(false); }, wait);
    }

    async function worker() {
      while (queue.length) {
        var search = queue.shift();
        var url = "https://news.google.com/rss/search?q=" + encodeURIComponent(search.query) + "&hl=th&gl=TH&ceid=TH:th";
        var result = null;
        try { result = await fetchRssXmlWithFallback(url); } catch (e) { result = null; }
        if (!result) {
          failed++;
        } else {
          if (countItems(result) >= RESULT_CAP && !search.isSplit) {
            var parts = SLP.splitSearch(search, when);
            queue.push.apply(queue, parts);
            total += parts.length;
            splits++;
          }
          parseRssResponseToArticles(result, tf.hours, search.province, false).forEach(function (art) {
            var key = art.link || art.title;
            if (!rawLinks[key]) { rawLinks[key] = 1; raw.push(art); }
          });
        }
        done++;
        progBadge.textContent = "ค้นแล้ว " + done + "/" + total + " ชุดคำค้น";
        scheduleRender();
      }
    }

    try {
      var workers = [];
      for (var i = 0; i < PARALLEL_SEARCHES; i++) workers.push(worker());
      await Promise.all(workers);
      if (renderTimer) { clearTimeout(renderTimer); renderTimer = null; }
      var items = render(true);
      var newCount = items.filter(function (x) { return x.isNew; }).length;
      var reports = items.reduce(function (n, x) { return n + (x.outlets ? x.outlets.length : 1); }, 0);
      saveSeen(items);
      if (items.length) {
        showToast("พบ " + items.length + " เรื่อง (" + reports + " รายงานข่าว) • ใหม่ " + newCount + " เรื่อง" +
                  (failed ? " • ค้นไม่สำเร็จ " + failed + " ชุด" : ""), "success");
        document.getElementById("dashboardSection").scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        showToast(failed === done ? "เชื่อมต่อไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" :
                  "ไม่พบข่าวสิ่งแวดล้อมในพื้นที่ช่วงนี้ ลองขยายห้วงเวลาหรือใช้การค้นหาแบบละเอียด", "warning");
      }
    } catch (err) {
      console.error(err);
      showToast("เกิดข้อผิดพลาดในการค้นหา กรุณาลองใหม่อีกครั้ง", "error");
    } finally {
      banner.classList.add("hidden");
      btn.disabled = false;
      btn.classList.remove("opacity-75");
    }
  }

  // ---- Scan mode buttons -----------------------------------------------------------------

  function selectScanMode(mode) {
    currentState.scanMode = mode;
    try { localStorage.setItem("slp_scan_mode", mode); } catch (e) {}
    document.querySelectorAll("[data-scan-mode]").forEach(function (b) {
      var on = b.getAttribute("data-scan-mode") === mode;
      b.classList.toggle("bg-emerald-600", on);
      b.classList.toggle("text-white", on);
      b.classList.toggle("border-emerald-600", on);
      b.classList.toggle("bg-white", !on);
      b.classList.toggle("text-slate-700", !on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    updateScanEstimate();
  }
  function updateScanEstimate() {
    var el = document.getElementById("scanModeEstimate");
    if (!el || typeof TIMEFRAMES === "undefined") return;
    var topics = currentState.selectedTopics.map(function (k) { return (TOPIC_CONFIG[k] || {}).searchTerms || []; })
      .filter(function (l) { return l.length; });
    var count = function (mode) {
      return SLP.buildSearchPlan({ provinces: currentState.selectedProvinces, topics: topics, custom: [], mode: mode, when: "" }).length;
    };
    el.textContent = "เร็ว ≈ " + count("quick") + " ชุดคำค้น • ละเอียด ≈ " + count("deep") + " ชุดคำค้น (รวมทุกอำเภอ)";
  }

  // ---- PM2.5 panel ------------------------------------------------------------------------

  var COLOR_CLASSES = {
    sky: "bg-sky-50 border-sky-200 text-sky-900", emerald: "bg-emerald-50 border-emerald-200 text-emerald-900",
    yellow: "bg-yellow-50 border-yellow-300 text-yellow-900", orange: "bg-orange-50 border-orange-300 text-orange-900",
    rose: "bg-rose-50 border-rose-300 text-rose-900", slate: "bg-slate-50 border-slate-200 text-slate-700"
  };
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  async function loadPm25() {
    var panel = document.getElementById("pm25Cards");
    var status = document.getElementById("pm25Status");
    if (!panel) return;
    status.textContent = "กำลังโหลด...";
    try {
      var result = await fetchRssXmlWithFallback("http://air4thai.pcd.go.th/services/getNewAQI_JSON.php");
      if (!result || !result.content) throw new Error("no data");
      latestPm25 = SLP.stationsForProvinces(JSON.parse(result.content));
      if (!latestPm25.length) throw new Error("no stations");
      panel.innerHTML = latestPm25.map(function (s) {
        var cls = COLOR_CLASSES[s.level.color] || COLOR_CLASSES.slate;
        var value = isNaN(s.pm25) || s.pm25 < 0 ? "–" : s.pm25.toFixed(1);
        return '<div class="rounded-xl border p-3 ' + cls + '">' +
          '<div class="text-xs font-bold">จ.' + esc(s.province) + '</div>' +
          '<div class="mt-1 flex items-baseline gap-1"><span class="text-2xl font-heading font-bold">' + value + '</span>' +
          '<span class="text-[11px] opacity-80">µg/m³</span></div>' +
          '<div class="text-[11px] font-semibold">' + esc(s.level.label) + '</div>' +
          '<div class="text-[10px] opacity-70 mt-1 leading-snug">' + esc(s.name) + '</div></div>';
      }).join("");
      var t = latestPm25[0];
      status.textContent = "ข้อมูล ณ " + (t.date || "") + " " + (t.time || "") + " น.";
    } catch (e) {
      console.warn("PM2.5 unavailable", e);
      status.textContent = "โหลดข้อมูลไม่สำเร็จ";
    }
  }

  // ---- Add PM2.5 and outlet counts to the LINE report --------------------------------------

  var originalLineReport = window.generateLineTextReport;
  if (typeof originalLineReport === "function") {
    window.generateLineTextReport = function () {
      var text = originalLineReport();
      if (latestPm25.length) {
        text += "\n━━━━━━━━━━━━━━━━━━\n🌫️ ค่า PM2.5 ล่าสุด (Air4Thai กรมควบคุมมลพิษ):\n" + latestPm25.map(function (s) {
          var v = isNaN(s.pm25) || s.pm25 < 0 ? "ไม่มีข้อมูล" : s.pm25.toFixed(1) + " µg/m³ (" + s.level.label + ")";
          return "• " + s.province + ": " + v;
        }).join("\n");
      }
      var big = (currentState.newsItems || []).filter(function (x) { return x.outletCount > 1; })
        .sort(function (a, b) { return b.outletCount - a.outletCount; }).slice(0, 5);
      if (big.length) {
        text += "\n━━━━━━━━━━━━━━━━━━\n📢 ประเด็นที่หลายสำนักข่าวรายงาน:\n" + big.map(function (x, i) {
          return "  " + (i + 1) + ") " + x.title + " (" + x.outletCount + " สำนักข่าว)";
        }).join("\n");
      }
      return text;
    };
  }

  // ---- Sorting the news list ----------------------------------------------------------------

  var originalApplyFilters = window.applyNewsListFilters;
  if (typeof originalApplyFilters === "function") {
    window.applyNewsListFilters = function () {
      var sort = (document.getElementById("sortNewsSelect") || {}).value || "newest";
      var items = currentState.newsItems || [];
      var byDate = function (a, b) { return new Date(b.pubDate) - new Date(a.pubDate); };
      if (sort === "outlets") items.sort(function (a, b) { return (b.outletCount || 1) - (a.outletCount || 1) || byDate(a, b); });
      else if (sort === "new") items.sort(function (a, b) { return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0) || byDate(a, b); });
      else items.sort(byDate);
      return originalApplyFilters();
    };
  }

  // ---- Start -----------------------------------------------------------------------------

  window.fetchGoogleNewsAndAnalyze = scanNews;
  window.selectScanMode = selectScanMode;
  window.loadPm25 = loadPm25;

  ["toggleProvince", "selectAllProvinces", "toggleTopic", "selectAllTopics"].forEach(function (name) {
    var original = window[name];
    if (typeof original !== "function") return;
    window[name] = function () { var r = original.apply(this, arguments); updateScanEstimate(); return r; };
  });

  function start() {
    var mode = "quick";
    try { mode = localStorage.getItem("slp_scan_mode") || "quick"; } catch (e) {}
    selectScanMode(mode === "deep" ? "deep" : "quick");
    loadPm25();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
