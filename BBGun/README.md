# Siam Times BB Gun (ปืนบีบีกัน) – web game

A BB gun game, in English and in Thai, in the same back room as Siam Times Slingshot and Darts: blue panelling, a cream sign that reads **The Siam Times** in Chomsky (this time over *Newsroom Air Gun Club*), two green pendant lamps, a dartboard and a chalk scoreboard. Five red and white soda cans stand on a table at the back, 4 m away, with an eight-pane window right behind them; in the last two rounds they hang on threads from a rope across the window. Shoot the cans down against the clock without putting a BB through the glass or the sign. The lamps can be shot out too, which leaves the room darker.

There is an English version and a Thai version, each a whole game in one HTML file. There is no build step: open either file in a browser. Each has a link to the other in its control rail, and both share the same best scores, gun, steadiness, sight speed and sound setting.

| Version | File | On the site |
|---|---|---|
| English | `GA-bbgun-en.html` | https://thesiamtimes.com/BBGun/GA-bbgun-en.html |
| Thai (ภาษาไทย) | `GA-bbgun-th.html` | https://thesiamtimes.com/BBGun/GA-bbgun-th.html |

They work offline; only the Newsreader and Sarabun text fonts come from Google Fonts, and the pages fall back to system fonts without them.

## Controls

- **Aiming stick, bottom left of the room** (เล็ง): touch and drag, and the sight moves with your thumb, freely, anywhere in the room, and stops the moment your thumb stops: it has no momentum and never keeps going on its own. Moved slowly it goes one for one with your thumb, for fine work; flicked, it goes up to three times as far. The thumb's speed is measured over the last 45 ms only, so the extra reach falls away as soon as the thumb slows, and the sight does not run past the target. The stick centres itself wherever your thumb lands in the bottom-left corner, and slides along if you pull past its rim.
- **Sight speed** (ความไวศูนย์เล็ง): Slow, Medium or Fast scales all of this (0.7×, 1×, 1.45×), for the stick, dragging elsewhere and the keys.
- **Fire button, bottom right** (ยิง): tap to fire; hold it for full auto with the rifle. It shows the BBs left, and a ring fills round it while the gun reloads or the hammer or lever comes back. The small button above it reloads; an empty gun reloads by itself.
- Both thumbs work at once (multi-touch). Dragging anywhere else in the room also moves the sight, one for one with your finger or the mouse.
- Keyboard: arrows or W A S D move the sight, speeding up the longer you hold them (Shift to go slow); Space fires (hold for full auto), R reloads, 1–4 pick a gun.

## The guns

All four are BB guns firing 4.5 mm copper-plated steel BBs, and every one has an orange muzzle tip.

| Gun | Holds | Action | In play |
|---|---|---|---|
| **1911 Pistol** (ปืนพก 1911) | 8 | Semi-automatic, 0.15 s between shots | The slide kicks back on each shot and locks back on an empty magazine. Reload: magazine out, new magazine in, and the slide released if it was locked (1.1 s from empty). |
| **Revolver** (ลูกโม่) | 6 | Single action: the hammer is cocked (and the cylinder turns) before each shot, 0.48 s | The most accurate gun, and the hardest kick. A case-coloured frame, walnut grip and brass trigger guard, after the old cowboy "smoke wagon". Reload: gate open at half cock, one cartridge at a time (the cylinder clicks round after each), gate shut, hammer cocked. Firing stops the loading. |
| **Lever shotgun** (ลูกซองคานเหวี่ยง) | 5 shells | Lever action, 0.78 s; six BBs a shell in a 1° cone | Modelled on the 1887 lever-action shotgun. Enough for two cans at once, but the high BBs find the glass. Loads shell by shell, and works the lever if it was empty. |
| **Auto rifle** (ปืนกลยาว) | 30 | Full auto, about 12 shots a second | The muzzle climbs and the BBs spread wider the longer you hold the trigger: pull the sight down against it. A red-dot sight on the rail. Reload: magazine out, new magazine in, and the charging handle pulled if it ran dry (1.6 s from empty). |

Every shot kicks the sight up, and it settles back at a rate that depends on the gun.

## Loading the gun

Before every round (and when Practice starts or you change guns in it) the gun is loaded in front of you before the clock starts: it is held up and turned so you can see it, with the room dimmed and a little light from behind you, and every step makes its own sound at the moment it happens.

| Gun | What you see and hear |
|---|---|
| 1911 Pistol | The magazine slides up the grip and clicks home, a palm taps it, the locked-back slide is released and slams forward. |
| Revolver | Half cock and the loading gate opens; six brass cartridges go in one at a time, each clicking into its chamber as the cylinder ratchets round; the gate shuts and the hammer is cocked. |
| Lever shotgun | Five red shells are pushed down into the action one at a time, then the lever is worked: clack down, chunk up. |
| Auto rifle | The magazine goes up the well and latches, a palm taps it, the charging handle is drawn back against its spring and let go. |

The ammunition count fills as the rounds go in. Then comes the three-second countdown, and only then the clock. Tap Fire (or press Space) to skip the loading. Reloads during play use the same steps and sounds, with the gun tilted rather than held up.

## Upgrades

Four upgrades make aiming easier. Each is switched on or off by itself, applies to every gun, and is remembered.

| Upgrade | Effect |
|---|---|
| Laser sight (เลเซอร์ชี้เป้า) | A laser module under the barrel puts a red dot where the BB will land, with a faint beam, on any steadiness. The dot moves with the drift of your hand. |
| Stabiliser (กริปกันสั่น) | The drift of your hand falls to 30%, the kick of each shot to half, and the rifle's spread grows more slowly. |
| Match barrel (ลำกล้องแม่นยำ) | The BBs spread half as wide (for the shotgun, a tighter ring). |
| Aim assist (ช่วยเล็ง) | The sight moves at 30% of its usual speed while it is over a can that is still up, and returns to full speed away from the cans. It never moves the sight by itself. |

## Games and scoring

| Game | Rules |
|---|---|
| 7 Rounds | Twenty seconds a round to knock down five cans, with as many BBs as you like (reloading costs time). A three-second countdown starts each round. The cans are set up differently each round: in a row, staggered, a pyramid of 3 + 2, stacked in twos, spread wide; then, for rounds 6 and 7, hanging on threads from a rope across the window, first barely moving and then swinging. |
| Practice | No clock. The cans are set up again, in a random layout (any of the seven), once they are all down; the scoreline shows your accuracy. |

| | Points |
|---|---|
| Each can knocked down | +100 |
| Each extra can knocked down by the same shot | +50 |
| Hitting a can in mid-air (one an earlier shot sent flying) | +50 |
| Cutting a can's thread with a BB | +50 |
| Clearing all five: each second left on the clock | +25 |
| Each pane of glass a BB goes through | −150 |
| Each shot that hits The Siam Times sign | −300 |

A BB leaves a hole and a star of cracks in a pane; the third hit on the same pane knocks it out of the frame. A pane is charged once. The sign is charged once for each shot that hits it, however many of a shotgun's BBs strike it. Each gun keeps its own best score; in 7 Rounds, changing the gun starts a new game.

**Hanging cans**: a solid hit snaps the thread and drops the can (it counts as down); a glancing hit, near the edge of the can, only sets it swinging. Missing a hanging can usually means the window behind it.

**Lamps**: a BB through the opening of a shade pops the bulb. The room darkens, most of all on that lamp's side, and stays dark until the next round. It costs no points. A BB that strikes the outside of a shade rings off it and sets the lamp swinging a little.

Before each round the glazier replaces the glass and the bulbs.

**Steadiness**: on Easy the sight is still, the gun never runs out of BBs (no reloading), and a dot shows what the BB will hit (green on a can, red on anything that costs points or breaks). On Normal the sight drifts a little as you breathe; on Pro it drifts more and the BBs spread wider.

Best scores, the gun, the upgrades, the steadiness, the sight speed and the sound setting are kept in the browser's local storage, under `siamTimesBBGun.v2`. Settings carry over from the earlier five-round version; its best scores do not.

## How it works

- Real sizes: 330 ml cans are 66 mm across and 115 mm tall, the table top is 1.02 m from the floor, the cans are 4 m away, the dartboard's bull is at the regulation 1.73 m. A BB is 4.5 mm and 0.35 g, and leaves the muzzle at 95–125 m/s depending on the gun.
- BBs fly in real time with gravity and air drag, in steps of 6 mm or less so a fast BB cannot pass through a can between steps. A can that is hit flies off and tumbles, knocks over any can it runs into, and cans stacked on it fall. BBs bounce off the panelling, the frame, the sign and the slate, come to rest on the table or the floor, and stick in the dartboard; they leave dents and chips in the wall.
- A hanging can is a pendulum on its thread, swinging both sideways and to and fro (never through the glass). A BB that hits it passes on its momentum; past a threshold the thread snaps. Threads are tested against the whole path a BB covered in each step, so a BB cannot slip past one.
- The room, window, sign, dartboard and chalkboard are drawn once per resize (and again when a pane falls out or a bulb is shot out), as in Slingshot. The lamps, the rope and the threads are drawn every frame. The camera is your eye; on a tall, narrow screen it sees a little less of the room so the cans stay big enough to hit.
- A reload or the loading scene is a list of steps (magazine out, magazine in, slide; or gate, each cartridge or shell, gate, hammer or lever). Each step lasts a set time, plays its sounds at set points in that time, and does its work (rounds in, slide forward) as it ends; the moving parts follow the step. The sounds are built from three things: a metal click (a hard transient and four inharmonic ringing modes), metal sliding on metal (a sweep of filtered noise) and a dull knock.
- The guns are small 3D models made of boxes, slanted blocks and many-sided cylinders, shaded by the lamps over the table. As in most first-person games, the gun is drawn through a wider lens than the room, which lets it sit low and to the right in a three-quarter view; it turns so that its bore, as drawn, runs through the sight, and BBs leave from the point in the room that lies where its muzzle is drawn. The slide, hammer, cylinder, lever and magazines move.
- Sounds are made in the browser with Web Audio; there are no sound files.

## Keeping the two versions the same

The `<script>` in the two files is identical, with every word of the game in both languages; each page takes its language from its own `<html lang>`. The HTML differs only in its language: the `lang` attribute, title, description, the words written into the page before the script fills them in, and the link to the other version. When you change the game, make the same change in both files, then check that the scripts still match:

```bash
diff <(sed -n '/<script>/,$p' GA-bbgun-en.html) <(sed -n '/<script>/,$p' GA-bbgun-th.html) && echo same
```

## Font

The sign and the heading use **Chomsky** by Fredrick R. Brennan, under the SIL Open Font License 1.1 (`Chomsky-LICENSE.txt`, which must stay with the game). The page embeds the same Latin-only WOFF2 subset of `Chomsky.otf` as `Darts/GA-darts.html`; see `Darts/README.md` for how to rebuild it.
