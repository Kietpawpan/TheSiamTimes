# Siam Times Darts – web game

A darts game in one HTML file. The board hangs on a dark wood-panelled wall under a cream sign that reads **The Siam Times** in Chomsky, the masthead font of thesiamtimes.com. All text in the game is in English.

Everything is in `GA-darts.html`. There is no build step: open the file in a browser. On the site it is at https://thesiamtimes.com/Darts/GA-darts.html. It works offline; only the Newsreader text font comes from Google Fonts, and the page falls back to Georgia without it.

## Playing

- **Horizontal angle** (−8° to +8°) and **vertical angle** (−5° to +25°) aim the dart. Use the sliders, the − and + buttons (hold to repeat), or tap and drag on the wall. The blue ring shows where the dart is pointing.
- **Power** (0–100 %) sets the release speed, from 6 to 18 m/s. Gravity pulls the dart down on the way, so a slow throw has to be aimed higher.
- **Steadiness**: on Easy the hand barely moves and a gold dot shows where the dart will land; on Normal and Pro the hand drifts and the power varies a little, so you let go at the right moment.
- Keyboard: arrow keys aim (Shift for 1° steps), W/S power, Space throws or collects the darts.

Games:

| Game | Rules |
|---|---|
| Score Attack | 10 rounds of 3 darts; highest total wins. |
| 501 | Count down from 501, finish exactly on zero with a double or the bull. Going below zero or leaving 1 is a bust. The scoreline suggests a checkout from 170 down. |
| Practice | No limit; shows the three-dart average. |

Best scores, steadiness and the sound setting are kept in the browser's local storage.

## How it works

- The scene is a canvas drawn with real measurements: bull 1.73 m from the floor, board face 2.37 m from the throw line, and the standard ring sizes (bull 12.7 mm, outer bull 31.8 mm, treble and double rings 8 mm wide, doubles outer edge 170 mm from the centre).
- A throw is a projectile from the hand (0.45 m past the line) to the board. Where it reaches the board decides the score; flights play 2.4× slower than real time so you can follow them.
- Wall, sign and board are drawn once per resize; darts, the aim ring and labels are drawn each frame.
- Sounds are made in the browser with Web Audio; there are no sound files.

## Font

The sign and the heading use **Chomsky** by Fredrick R. Brennan, under the SIL Open Font License 1.1 (`Chomsky-LICENSE.txt`, which must stay with the game). The page embeds a Latin-only WOFF2 subset of `Chomsky.otf` (kept in the Apple-developer repo at `SiamTimes/SiamTimes/Fonts/Chomsky.otf`). The font has no reserved font name, so the subset keeps the name Chomsky. To rebuild it:

```bash
pip install fonttools brotli
pyftsubset Chomsky.otf --unicodes="U+0020-007E,U+00A0-00FF,U+2013-2014,U+2018-201D" \
  --layout-features='*' --flavor=woff2 --output-file=chomsky.woff2
base64 -w0 chomsky.woff2   # paste into the @font-face src in GA-darts.html
```
