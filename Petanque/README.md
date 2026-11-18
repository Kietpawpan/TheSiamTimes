# Siam Times Pétanque (เปตอง) – web game

A pétanque game, in English and in Thai. The court is a 4 × 15 m gravel piste at dusk, with festoon lights and a cream sign at the far end that reads **The Siam Times** in Chomsky, the masthead font of thesiamtimes.com, over *Newsroom Pétanque Club* (ชมรมเปตองห้องข่าว on the Thai page).

There is an English version and a Thai version, each a whole game in one HTML file. There is no build step: open either file in a browser. Each has a link to the other at the top of its control rail, and both share the same record against The Editor, best practice distance, difficulty and sound setting.

| Version | File | On the site |
|---|---|---|
| English | `GA-petanque.html` | https://thesiamtimes.com/Petanque/GA-petanque.html |
| Thai (ภาษาไทย) | `GA-petanque-th.html` | https://thesiamtimes.com/Petanque/GA-petanque-th.html |

The English page keeps the address it has always had, which the front page links to. They work offline; only the Newsreader and Sarabun text fonts come from Google Fonts, and the pages fall back to system fonts without them.

## Playing

- **Tap or drag on the court** to choose where the ball should stop, or use the **Aim** (ทิศทาง, −12° to +12°) and **Distance** (ระยะ, 1 to 14.5 m) sliders. The blue ring shows where your hand is aiming right now, the dotted arc shows the flight, and the small white ring shows where the ball first lands.
- **Style** (วิธีโยน) decides how it gets there:

| Style | What it does |
|---|---|
| Roll (เรียด) | Bowled low; lands just past the circle and rolls the rest. Most affected by bumps in the gravel. |
| Half lob (ครึ่งลอย) | The usual point: lands a little past halfway and rolls the rest. |
| High lob (ลอยโด่ง) | Drops almost dead. Gets over boules in the way. |
| Shoot (ชู้ต) | Lands hard right on the ring, to knock a boule or the jack away. A shot that stops where it hit is a carreau (คาโร). |

- **Difficulty** (ความยาก): Easy, Normal and Pro set how much your hand drifts, how bumpy the gravel is (it changes every end), and how accurate The Editor is.
- Keyboard: ← → aim, ↑ ↓ distance (Shift for bigger steps), 1–4 style, Space throws.

Games:

| Game | Rules |
|---|---|
| vs Computer (เล่นกับคอม) | Singles against The Editor (บรรณาธิการ), first to 13. |
| Two players (เล่นสองคน) | Two people on one device take turns, first to 13. |
| Practice (ฝึกซ้อม) | Three boules at a jack placed for you; every throw is measured. |

Rules follow singles pétanque: the jack must stop 6 to 10 m from the circle and 50 cm from the side boards (three tries, then the other side places it); the side not holding the point plays next; at the end of an end the side with the closest boule scores one point per boule closer than the other side's best; the winner throws the next jack. A ball that touches the boards is dead. If the jack goes dead while both sides still have boules, the end is void; if only one side has boules left, it scores one point for each.

Your record against The Editor, your best practice distance, the difficulty and the sound setting are kept in the browser's local storage, under `siamTimesPetanque.v1`, which both versions share.

## How it works

- Real sizes: boules are 73 mm and 700 g, the jack 30 mm and 18 g, the circle 50 cm across.
- Every ball is simulated in 3D at 480 steps a second: a ballistic flight, an impact with the gravel that takes most of the bounce and some of the forward speed, rolling friction, and steel-on-steel or steel-on-wood collisions. Each end gets its own gentle bumps in the gravel, which push rolling balls but not flying ones.
- The Distance setting means "where it would stop on flat gravel". At start-up the game runs the same physics for a range of landing spots for each style, and uses that table to find the landing spot for any distance.
- The camera sits behind the circle on the centre line and frames the jack, your target and the sign. The court is drawn in perspective one band of screen rows at a time from a top-down gravel texture.
- Sounds are made in the browser with Web Audio; there are no sound files.

## Keeping the two versions the same

The `<script>` in the two files is identical, with every word of the game in both languages in one table, `STR = { th: {...}, en: {...} }`; each page takes its language from its own `<html lang>`. The table holds everything the player reads or hears from a screen reader: labels, buttons, notes, the how-to list, the messages under the scoreline (built by small functions, so each language keeps its own grammar), the result card, aria-labels, and the words drawn on the canvas (the club's name on the sign, the 6 m and 10 m marks, the measured distances and the pop-up toasts, which are set in Sarabun on the Thai page). Only *The Siam Times* masthead stays in Latin, in Chomsky.

The HTML differs only in its language: the `lang` attribute, title, description, the words written into the page before the script fills them in, and the link to the other version. The styles are shared too: `html:lang(th)` rules set Thai in Sarabun, a little larger, without capitals, italics or wide letter-spacing. When you change the game, make the same change in both files, then check that the scripts still match:

```bash
diff <(sed -n '/<script>/,$p' GA-petanque.html) <(sed -n '/<script>/,$p' GA-petanque-th.html) && echo same
```

The story game *Chandler's Promise* plays its own copies, `Promise/games/Petanque/GA-petanque.html` and `GA-petanque-th.html`. Those copies are these two files plus three additions: a viewport that does not zoom, a `storyDone` function that tells the story how a game ended (called in `finishEnd` when a side reaches 13), and a `<script>` before `</body>` that stops pinch and double-tap zoom. After changing the game here, copy both files there and put those additions back; `diff GA-petanque.html ../Promise/games/Petanque/GA-petanque.html` should then show only them, and the two story files' scripts should match each other.

## Font

The sign and the heading use **Chomsky** by Fredrick R. Brennan, under the SIL Open Font License 1.1 (`Chomsky-LICENSE.txt`, which must stay with the game). Both pages embed the same Latin-only WOFF2 subset of `Chomsky.otf` as `Darts/GA-darts.html`; see `Darts/README.md` for how to rebuild it.
