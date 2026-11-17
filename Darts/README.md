# Siam Times Darts (ปาเป้า) – web game

A darts game, in English and in Thai. The board hangs on a dark wood-panelled wall under a cream sign that reads **The Siam Times** in Chomsky, the masthead font of thesiamtimes.com, over *Newsroom Darts Club* (ชมรมปาเป้าห้องข่าว on the Thai page).

There is an English version and a Thai version, each a whole game in one HTML file. There is no build step: open either file in a browser. Each has a link to the other at the top of its control rail, and both share the same best scores, steadiness and sound setting.

| Version | File | On the site |
|---|---|---|
| English | `GA-darts.html` | https://thesiamtimes.com/Darts/GA-darts.html |
| Thai (ภาษาไทย) | `GA-darts-th.html` | https://thesiamtimes.com/Darts/GA-darts-th.html |

The English page keeps its original name, with no `-en`, because the front page and older links point to it. They work offline; only the Newsreader and Sarabun text fonts come from Google Fonts, and the pages fall back to system fonts without them.

## Playing

- **Horizontal angle** (มุมซ้าย–ขวา, −8° to +8°) and **vertical angle** (มุมขึ้น–ลง, −5° to +25°) aim the dart. Use the sliders, the − and + buttons (hold to repeat), or tap and drag on the wall. The blue ring shows where the dart is pointing.
- **Power** (แรงปา, 0–100 %) sets the release speed, from 6 to 18 m/s. Gravity pulls the dart down on the way, so a slow throw has to be aimed higher.
- **Steadiness** (ความนิ่งของมือ): on Easy the hand barely moves and a gold dot shows where the dart will land; on Normal and Pro the hand drifts and the power varies a little, so you let go at the right moment.
- Keyboard: arrow keys aim (Shift for 1° steps), W/S power, Space throws or collects the darts.

Games:

| Game | Rules |
|---|---|
| Score Attack (ล่าแต้ม) | 10 rounds of 3 darts; highest total wins. |
| 501 | Count down from 501, finish exactly on zero with a double or the bull. Going below zero or leaving 1 is a bust. The scoreline suggests a checkout from 170 down. |
| Practice (ฝึกซ้อม) | No limit; shows the three-dart average. |

Best scores, steadiness and the sound setting are kept in the browser's local storage, under `siamTimesDarts.v1`, the same key for both languages, so they carry over from one to the other.

The scoreline writes darts the usual short way in both languages: T20 for a treble, D16 for a double; the bull is BULL (บูล in Thai).

## How it works

- The scene is a canvas drawn with real measurements: bull 1.73 m from the floor, board face 2.37 m from the throw line, and the standard ring sizes (bull 12.7 mm, outer bull 31.8 mm, treble and double rings 8 mm wide, doubles outer edge 170 mm from the centre).
- A throw is a projectile from the hand (0.45 m past the line) to the board. Where it reaches the board decides the score; flights play 2.4× slower than real time so you can follow them.
- Wall, sign and board are drawn once per resize; darts, the aim ring and labels are drawn each frame. On the Thai page, the text drawn on the canvas (the line under the masthead and the labels over each dart) is set in Sarabun.
- Sounds are made in the browser with Web Audio; there are no sound files.

## Keeping the two versions the same

The `<script>` in the two files is identical, with every word of the game in both languages in one table, `STR = { th: {...}, en: {...} }`; each page takes its language from its own `<html lang>`. The HTML differs only in its language: the `lang` attribute, title, description, the words written into the page before the script fills them in, and the link to the other version. The styles are the same in both, with `html:lang(th)` rules that set Thai in Sarabun and adjust its sizes. When you change the game, make the same change in both files, then check that the scripts still match:

```bash
diff <(sed -n '/<script>/,$p' GA-darts.html) <(sed -n '/<script>/,$p' GA-darts-th.html) && echo same
```

The story game *Chandler's Promise* plays its own copies, `Promise/games/Darts/GA-darts.html` and `GA-darts-th.html`: the same two files plus the story additions (the no-zoom viewport and script, and `storyDone`; see `Promise/README.md`). Update them when you change these.

## Font

The sign and the heading use **Chomsky** by Fredrick R. Brennan, under the SIL Open Font License 1.1 (`Chomsky-LICENSE.txt`, which must stay with the game). Both pages embed a Latin-only WOFF2 subset of `Chomsky.otf` (kept in the Apple-developer repo at `SiamTimes/SiamTimes/Fonts/Chomsky.otf`). The font has no reserved font name, so the subset keeps the name Chomsky. To rebuild it:

```bash
pip install fonttools brotli
pyftsubset Chomsky.otf --unicodes="U+0020-007E,U+00A0-00FF,U+2013-2014,U+2018-201D" \
  --layout-features='*' --flavor=woff2 --output-file=chomsky.woff2
base64 -w0 chomsky.woff2   # paste into the @font-face src in GA-darts.html and GA-darts-th.html
```
