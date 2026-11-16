# Siam Times Wastebasket (โยนกระดาษ) – web game

A paper-throwing game, in Thai and in English, set in The Siam Times editor's office: the same dim, blue-panelled room as Siam Times Slingshot and BB Gun, with a cream sign that reads **The Siam Times** in Chomsky (over *The Editor's Office*), two green pendant lamps, a window over the night city with curtains, a framed front page from 1864, a cork board, a clock at five to midnight, a bookcase and bundles of back numbers. You sit at the desk with a portable typewriter. Each spoiled page is rolled out of the typewriter, crumpled into a ball and thrown at the wastebasket across the room.

There is a Thai version and an English version, each a whole game in one HTML file. There is no build step: open either file in a browser. Each has a link to the other in its control rail, and both share the same best score, power bar speed and sound setting.

| Version | File | On the site |
|---|---|---|
| Thai (ภาษาไทย) | `GA-wastebasket-th.html` | https://thesiamtimes.com/Wastebasket/GA-wastebasket-th.html |
| English | `GA-wastebasket-en.html` | https://thesiamtimes.com/Wastebasket/GA-wastebasket-en.html |

They work offline; only the Newsreader and Sarabun text fonts come from Google Fonts, and the pages fall back to system fonts without them.

## Controls

- **Arrow pad, bottom left of the room** (เล็ง): ◀ ▶ turn the throw left and right (0.5° a press, up to 35°), ▲ ▼ raise and lower it (1° a press, 5° to 60°). Hold a button to keep going; it speeds up after a second. The centre of the pad shows the aim. A dashed line on the floor shows where the paper goes in still air, and an arrow from your hand shows the direction of the throw.
- **Power bar and Throw button, bottom right** (แรง, โยน): the bar runs from weakest to strongest and back all the time. Press Throw to stop it: the ball leaves your hand at the speed where the bar stopped, 2.5 to 10 m/s. The power is read at the moment of the press (the event's timestamp), not at the next frame. A dark tick on the bar marks the power of your last throw, and a faint dotted line in the room shows where it went.
- **Power bar speed** (ความเร็วแถบพลัง): Slow, Normal or Fast, 1.9, 1.3 or 0.9 seconds from weakest to strongest.
- Between balls and levels the Throw button becomes Next or Retry.
- Keyboard: arrows aim (Shift for five times the step); Space or Enter stops the bar and throws, or goes on to the next level or try.

## Rules

Three balls of paper a level, and all three must go in to move on. Miss one and the level starts again from the first ball (the try count goes up), and the points from that try are lost.

| Game | Rules |
|---|---|
| 10 Levels | Levels 1 to 10 in order. A ball set alight by a candle that comes to rest outside the basket sets the room on fire, and the game is over. Clearing level 10 wins. |
| Practice | Pick any level from the level strip in the rail. Throw as often as you like; nothing is scored and fires do not end the game (the room is put out and the level starts again). The scoreline shows balls in out of balls thrown. |

| | Points |
|---|---|
| Each ball in | +100 |
| In without touching the rim, a wall or anything else | +50 |
| In off a wall | +50 |
| Clearing a level | +50 × the level number |
| Clearing it on the first try | +100 |

The best score is kept in the browser's local storage under `siamTimesWastebasket.v1`, with the power bar speed and the sound setting.

## The levels

The basket moves and changes size every level: a woven rattan basket or a green tin bin with brass bands, 29 to 38 cm across the top.

| Level | Name | Basket | Hazards |
|---|---|---|---|
| 1 | The big basket | rattan, 38 cm, 2.85 m away | – |
| 2 | The tin bin | tin, 34 cm, to the left | – |
| 3 | The first candle | rattan, 34 cm, to the right | a candlestick behind the basket |
| 4 | Against the left wall | tin, 31 cm | a candle on a side table behind it |
| 5 | Under the window | rattan, 32 cm, against the back wall, nearly 5 m away | candles on the window sill |
| 6 | Over the flame | tin, 30 cm | a candlestick right in the path: lob over it |
| 7 | The far corner | rattan, 30 cm | a candlestick halfway, a candle on a table |
| 8 | A breeze at the window | tin, 32 cm | the window open, wind 1 m/s bent to the right; candles |
| 9 | Gusts | rattan, 30 cm, far left | stronger wind to the left, in gusts; candles |
| 10 | Storm night | tin, 29 cm | rain, lightning, wind that swings from side to side; four candles |

**Candles**: paper that touches a candle or its flame catches fire and burns for a few seconds. If it comes to rest outside the basket, or touches the curtains or the bundles of old newspapers, the fire spreads across the floor to the bundles, the curtains, the bookcase, the basket and the desk, the room fills with smoke, and the game is over. If it lands in the basket, the basket goes up in flames, someone off to the left puts it out with an extinguisher, the basket stays scorched for the rest of the level, and the level starts again. A burning ball that sails out of the open window is just a miss.

**Wind**: in the last three levels the casements are open. The wind comes in at the window and blows towards you, bent to one side; it gusts (the strength varies by 25–42 %) and in the storm its direction swings by up to 32°. The wind box in the top-right corner shows its speed and an arrow seen from above (straight down means straight at you); the curtains lift, the candle flames lean, and dust and leaves blow in from outside. The ball feels the wind as it changes during the flight, so the same aim can land differently a few seconds later; waiting for a lull helps. A simulation of the game's own physics checked that every level has throws that go in, and for the windy levels at every point of the gust cycle.

## How it works

- Real sizes: a crumpled A4 sheet is a 64 mm ball of about 5 g; you sit at a desk 76 cm high with your eye at 1.22 m and the ball leaves your hand at 1.02 m; the room is 4.4 m wide and the back wall 5.75 m from your eye.
- The ball flies in fixed steps of 1/600 s (so a throw comes out the same at any frame rate), with gravity and quadratic air drag against the moving air of the wind. Flights play 1.15× slower than real time.
- The basket is an open, slightly tapered cylinder with a rolled rim (a torus). Once the ball's centre drops below the rim it is either inside or outside, and the wall keeps it there; it bounces off the rim, the inside wall and the bottom, and settles in the basket on top of any paper already there. The ball also bounces off the floor, the walls, the window glass (or flies out of the open window), the sill, the desk, the bookcase, the bundles, the lamps, and the candlesticks and table. The ceiling's beams knock it off in a random direction, so there are no reliable trick shots off the ceiling.
- Before each ball the spoiled sheet is rolled out of the typewriter (ratchet clicks), yanked out (a zip of paper) and crumpled into the ball in your hand (crackles); the outline morphs from the page into the ball's own lumpy outline.
- The room, the window, the sign, the front page, the cork board, the clock, the bookcase and the bundles are drawn once per resize and level; the desk with the typewriter, the spike and the coffee cup on a second layer. The basket, the candles, the curtains, the paper, the rain and the fire are drawn every frame. Flames, smoke and the extinguisher's spray are particles drawn with soft sprites.
- Sounds are made in the browser with Web Audio: the typewriter, the paper, the rim (a tin ring or a dull cane knock), the end-of-line bell when a level is cleared, the wind, the fire and the thunder. There are no sound files, and nothing plays until you first tap or press a key.

## Keeping the two versions the same

The `<script>` in the two files is identical, with every word of the game in both languages; each page takes its language from its own `<html lang>`. The HTML differs only in its language: the `lang` attribute, title, description, the words written into the page before the script fills them in, and the link to the other version. When you change the game, make the same change in both files, then check that the scripts still match:

```bash
diff <(sed -n '/<script>/,$p' GA-wastebasket-en.html) <(sed -n '/<script>/,$p' GA-wastebasket-th.html) && echo same
```

## Font

The sign, the front page and the heading use **Chomsky** by Fredrick R. Brennan, under the SIL Open Font License 1.1 (`Chomsky-LICENSE.txt`, which must stay with the game). The page embeds the same Latin-only WOFF2 subset of `Chomsky.otf` as `Darts/GA-darts.html`; see `Darts/README.md` for how to rebuild it.
