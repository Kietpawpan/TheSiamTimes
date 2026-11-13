# Siam Times Pétanque – web game

A pétanque game in one HTML file. The court is a 4 × 15 m gravel piste at dusk, with festoon lights and a cream sign at the far end that reads **The Siam Times** in Chomsky, the masthead font of thesiamtimes.com. All text in the game is in English.

Everything is in `GA-petanque.html`. There is no build step: open the file in a browser. On the site it is at https://thesiamtimes.com/Petanque/GA-petanque.html. It works offline; only the Newsreader text font comes from Google Fonts, and the page falls back to Georgia without it.

## Playing

- **Tap or drag on the court** to choose where the ball should stop, or use the **Aim** (−12° to +12°) and **Distance** (1 to 14.5 m) sliders. The blue ring shows where your hand is aiming right now, the dotted arc shows the flight, and the small white ring shows where the ball first lands.
- **Style** decides how it gets there:

| Style | What it does |
|---|---|
| Roll | Bowled low; lands just past the circle and rolls the rest. Most affected by bumps in the gravel. |
| Half lob | The usual point: lands a little past halfway and rolls the rest. |
| High lob | Drops almost dead. Gets over boules in the way. |
| Shoot | Lands hard right on the ring, to knock a boule or the jack away. A shot that stops where it hit is a carreau. |

- **Difficulty**: Easy, Normal and Pro set how much your hand drifts, how bumpy the gravel is (it changes every end), and how accurate The Editor is.
- Keyboard: ← → aim, ↑ ↓ distance (Shift for bigger steps), 1–4 style, Space throws.

Games:

| Game | Rules |
|---|---|
| vs Computer | Singles against The Editor, first to 13. |
| Two players | Two people on one device take turns, first to 13. |
| Practice | Three boules at a jack placed for you; every throw is measured. |

Rules follow singles pétanque: the jack must stop 6 to 10 m from the circle and 50 cm from the side boards (three tries, then the other side places it); the side not holding the point plays next; at the end of an end the side with the closest boule scores one point per boule closer than the other side's best; the winner throws the next jack. A ball that touches the boards is dead. If the jack goes dead while both sides still have boules, the end is void; if only one side has boules left, it scores one point for each.

Your record against The Editor, your best practice distance, the difficulty and the sound setting are kept in the browser's local storage.

## How it works

- Real sizes: boules are 73 mm and 700 g, the jack 30 mm and 18 g, the circle 50 cm across.
- Every ball is simulated in 3D at 480 steps a second: a ballistic flight, an impact with the gravel that takes most of the bounce and some of the forward speed, rolling friction, and steel-on-steel or steel-on-wood collisions. Each end gets its own gentle bumps in the gravel, which push rolling balls but not flying ones.
- The Distance setting means "where it would stop on flat gravel". At start-up the game runs the same physics for a range of landing spots for each style, and uses that table to find the landing spot for any distance.
- The camera sits behind the circle on the centre line and frames the jack, your target and the sign. The court is drawn in perspective one band of screen rows at a time from a top-down gravel texture.
- Sounds are made in the browser with Web Audio; there are no sound files.

## Font

The sign and the heading use **Chomsky** by Fredrick R. Brennan, under the SIL Open Font License 1.1 (`Chomsky-LICENSE.txt`, which must stay with the game). The page embeds the same Latin-only WOFF2 subset of `Chomsky.otf` as `Darts/GA-darts.html`; see `Darts/README.md` for how to rebuild it.
