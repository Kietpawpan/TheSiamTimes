# Siam Times BB Gun (ปืนบีบีกัน) – web game

A BB gun game, in English and in Thai, in the same back room as Siam Times Slingshot and Darts: blue panelling, a cream sign that reads **The Siam Times** in Chomsky (this time over *Newsroom Air Gun Club*), two green pendant lamps, a dartboard and a chalk scoreboard. Five red and white soda cans stand on a table at the back, 4 m away, with an eight-pane window right behind them. Shoot the cans down against the clock without putting a BB through the glass.

There is an English version and a Thai version, each a whole game in one HTML file. There is no build step: open either file in a browser. Each has a link to the other in its control rail, and both share the same best scores, gun, steadiness and sound setting.

| Version | File | On the site |
|---|---|---|
| English | `GA-bbgun-en.html` | https://thesiamtimes.com/BBGun/GA-bbgun-en.html |
| Thai (ภาษาไทย) | `GA-bbgun-th.html` | https://thesiamtimes.com/BBGun/GA-bbgun-th.html |

They work offline; only the Newsreader and Sarabun text fonts come from Google Fonts, and the pages fall back to system fonts without them.

## Controls

- **Aiming stick, bottom left of the room** (เล็ง): touch and drag, and the sight moves that way, freely, anywhere in the room. The further you drag the faster it moves (the speed rises roughly with the square of the drag), so a short drag is for fine work. The stick centres itself wherever your thumb lands in the bottom-left corner.
- **Fire button, bottom right** (ยิง): tap to fire; hold it for full auto with the rifle. It shows the BBs left, and a ring fills round it while the gun reloads or the hammer or lever comes back. The small button above it reloads; an empty gun reloads by itself.
- Both thumbs work at once (multi-touch). Dragging anywhere else in the room also moves the sight, one for one with your finger or the mouse.
- Keyboard: arrows or W A S D move the sight (Shift to go slow), Space fires (hold for full auto), R reloads, 1–4 pick a gun.

## The guns

All four are BB guns firing 4.5 mm copper-plated steel BBs, and every one has an orange muzzle tip.

| Gun | Holds | Action | In play |
|---|---|---|---|
| **1911 Pistol** (ปืนพก 1911) | 8 | Semi-automatic, 0.15 s between shots | The slide kicks back on each shot and locks back on an empty magazine. The magazine drops out of the grip on a 1.3 s reload. |
| **Revolver** (ลูกโม่) | 6 | Single action: the hammer is cocked (and the cylinder turns) before each shot, 0.48 s | The most accurate gun, and the hardest kick. A case-coloured frame, walnut grip and brass trigger guard, after the old cowboy "smoke wagon". Loads one BB at a time through the gate; firing stops the loading. |
| **Lever shotgun** (ลูกซองคานเหวี่ยง) | 5 shells | Lever action, 0.78 s; six BBs a shell in a 1° cone | Modelled on the 1887 lever-action shotgun. Enough for two cans at once, but the high BBs find the glass. Loads shell by shell. |
| **Auto rifle** (ปืนกลยาว) | 30 | Full auto, about 12 shots a second | The muzzle climbs and the BBs spread wider the longer you hold the trigger: pull the sight down against it. A red-dot sight on the rail. 1.9 s magazine change. |

Every shot kicks the sight up, and it settles back at a rate that depends on the gun.

## Games and scoring

| Game | Rules |
|---|---|
| 5 Rounds | Twenty seconds a round to knock down five cans, with as many BBs as you like (reloading costs time). A three-second countdown starts each round. The cans are set up differently each round: in a row, staggered, a pyramid of 3 + 2, stacked in twos, spread wide. |
| Practice | No clock. The cans are set up again, in a random layout, once they are all down; the scoreline shows your accuracy. |

| | Points |
|---|---|
| Each can knocked down | +100 |
| Each extra can knocked down by the same shot | +50 |
| Hitting a can in mid-air (one an earlier shot sent flying) | +50 |
| Clearing all five: each second left on the clock | +25 |
| Each pane of glass a BB goes through | −150 |

A BB leaves a hole and a star of cracks in a pane; the third hit on the same pane knocks it out of the frame. A pane is charged once. The glazier replaces the glass before every round. Each gun keeps its own best score; in 5 Rounds, changing the gun starts a new game.

**Steadiness**: on Easy the sight is still and a dot shows what the BB will hit (green on a can, red on glass). On Normal the sight drifts a little as you breathe; on Pro it drifts more and the BBs spread wider.

Best scores, the gun, the steadiness and the sound setting are kept in the browser's local storage.

## How it works

- Real sizes: 330 ml cans are 66 mm across and 115 mm tall, the table top is 1.02 m from the floor, the cans are 4 m away, the dartboard's bull is at the regulation 1.73 m. A BB is 4.5 mm and 0.35 g, and leaves the muzzle at 95–125 m/s depending on the gun.
- BBs fly in real time with gravity and air drag, in steps of 6 mm or less so a fast BB cannot pass through a can between steps. A can that is hit flies off and tumbles, knocks over any can it runs into, and cans stacked on it fall. BBs bounce off the panelling, the frame, the sign and the slate, come to rest on the table or the floor, and stick in the dartboard; they leave dents and chips in the wall.
- The room, window, sign, dartboard and chalkboard are drawn once per resize (and again when a pane falls out), as in Slingshot. The camera is your eye; on a tall, narrow screen it sees a little less of the room so the cans stay big enough to hit.
- The guns are small 3D models made of boxes, slanted blocks and many-sided cylinders, shaded by the lamps over the table. As in most first-person games, the gun is drawn through a wider lens than the room, which lets it sit low and to the right in a three-quarter view; it turns so that its bore, as drawn, runs through the sight, and BBs leave from the point in the room that lies where its muzzle is drawn. The slide, hammer, cylinder, lever and magazines move.
- Sounds are made in the browser with Web Audio; there are no sound files.

## Keeping the two versions the same

The `<script>` in the two files is identical, with every word of the game in both languages; each page takes its language from its own `<html lang>`. The HTML differs only in its language: the `lang` attribute, title, description, the words written into the page before the script fills them in, and the link to the other version. When you change the game, make the same change in both files, then check that the scripts still match:

```bash
diff <(sed -n '/<script>/,$p' GA-bbgun-en.html) <(sed -n '/<script>/,$p' GA-bbgun-th.html) && echo same
```

## Font

The sign and the heading use **Chomsky** by Fredrick R. Brennan, under the SIL Open Font License 1.1 (`Chomsky-LICENSE.txt`, which must stay with the game). The page embeds the same Latin-only WOFF2 subset of `Chomsky.otf` as `Darts/GA-darts.html`; see `Darts/README.md` for how to rebuild it.
