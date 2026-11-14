# Siam Times Slingshot (หนังสติ๊ก) – web game

A slingshot game in one HTML file. Five red and white soda cans stand on a table at the back of The Siam Times back room, the same dim, blue-panelled room as Siam Times Darts: a cream sign that reads **The Siam Times** in Chomsky over the window, two green pendant lamps, a dartboard with three darts still in it, and a chalk scoreboard. A window with eight panes of glass is right behind the cans. Knock the cans off without breaking the glass.

The game starts in Thai; the **English** button in the control rail switches every word in the game, and the choice is remembered.

Everything is in `GA-slingshot.html`. There is no build step: open the file in a browser. On the site it is at https://thesiamtimes.com/Slingshot/GA-slingshot.html. It works offline; only the Newsreader and Sarabun text fonts come from Google Fonts, and the page falls back to system fonts without them.

## Playing

- **Aim** (เล็งซ้าย–ขวา, −15° to +15°) and **Arc** (วิถีโค้ง, the elevation, −10° to +40°) point the slingshot. Tap or drag on the wall to aim there; the blue ring shows where the slingshot points in a straight line, before gravity pulls the stone down.
- **Draw** (แรงง้าง, 0–100 %) sets the release speed, from 5 to 16 m/s. Drag the pouch of the slingshot down to draw it and let go to shoot, or set the draw with its slider and press **Release**.
- **Arc, side view**: a panel in the corner shows the room from the side, with the curve of the shot you are setting up, the cans in its path and the window pane it would reach. The faint dotted line, in the room and in the panel, is where your last stone went.
- **Steadiness**: on Easy the hand is still and the dotted line runs the whole way to where the stone will hit (green on a can, red on glass). On Normal the hand drifts a little and you see the first half of the arc; on Pro it drifts more, the draw varies by up to 2.5 %, and you see only the start.
- Keyboard: ← → aim, ↑ ↓ arc (Shift for 1° steps), W/S draw, Space releases (or sets up the next round).

Games:

| Game | Rules |
|---|---|
| 5 Rounds | Five cans and six stones a round. Each round sets the cans up differently: in a row, staggered, a pyramid of 3 + 2, stacked in twos, spread wide. |
| Practice | As many stones as you like; the cans are set up again, in a random layout, once they are all down. |

Scoring:

| | Points |
|---|---|
| Each can knocked down | +100 |
| Each extra can knocked down by the same stone | +50 |
| Clearing all five cans: each stone left over | +50 |
| Each pane of glass broken | −150 |

A stone through a pane that is already broken costs nothing more. The glazier replaces the glass before every round. Your best score, the steadiness, the language and the sound setting are kept in the browser's local storage.

## How it works

- Real sizes: 330 ml cans are 66 mm across and 115 mm tall, the stone is 19 mm, the table top is 1.02 m from the floor, the cans are 4 m from the slingshot, and the dartboard's bull is at the regulation 1.73 m.
- The stone is simulated in 3D at 900 steps a second: a ballistic flight, then bounces off cans, the table top and its front edge, the wall, the sign, the dartboard, the side walls and the floor. A can it hits flies off and tumbles, knocks over any can it runs into, and the cans stacked on top of it fall when it goes. Flights play 1.6× slower than real time so you can follow them.
- The camera is your eye, behind and above the slingshot held out at arm's length. The room, window, sign, dartboard and chalkboard are drawn once per resize (and again when a pane breaks); the table is drawn on its own layer so cans that fall behind it are hidden.
- Sounds are made in the browser with Web Audio; there are no sound files.

## Font

The sign and the heading use **Chomsky** by Fredrick R. Brennan, under the SIL Open Font License 1.1 (`Chomsky-LICENSE.txt`, which must stay with the game). The page embeds the same Latin-only WOFF2 subset of `Chomsky.otf` as `Darts/GA-darts.html`; see `Darts/README.md` for how to rebuild it.
