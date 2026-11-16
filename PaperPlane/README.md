# Siam Times Paper Plane (จรวดกระดาษ) – web game

A paper plane game, in English and in Thai. You fold a plane from the morning paper, choosing its nose, body, wings and tail, then lean out of a window of The Siam Times building and throw it over the pavement, the street, a riverside park and the Chao Phraya. The distance is measured straight out from the front of the building to where the plane first touches the ground or the water. Whoever flies furthest wins.

There is an English version and a Thai version, each a whole game in one HTML file. There is no build step: open either file in a browser. Each has a link to the other in its control rail, and both share the same settings, players, planes and records.

| Version | File | On the site |
|---|---|---|
| English | `GA-paperplane-en.html` | https://thesiamtimes.com/PaperPlane/GA-paperplane-en.html |
| Thai (ภาษาไทย) | `GA-paperplane-th.html` | https://thesiamtimes.com/PaperPlane/GA-paperplane-th.html |

They work offline; only the Newsreader and Sarabun text fonts come from Google Fonts, and the pages fall back to system fonts without them.

## Folding the plane

The folding table shows the plane from above, with its centre of gravity (yellow and black) and its neutral point (blue) on the centre line, a side view, its size and weight, a verdict, and four meters: glide, gliding speed, steadiness and weight. The verdict and meters come from a test glide of that exact plane in still air.

| Part | Choices | What it changes |
|---|---|---|
| Nose (หัว) | Pointed, Blunt, Locked, Paper clip | Nose weight and drag. The locked nose holds the wings so they flutter later; the clip is the heaviest. |
| Body (ลำตัว) | Short 21.5 cm, Standard 25.5 cm, Long 29.5 cm, Deep keel | How far ahead of the wings the nose sits (and so the centre of gravity), pitch damping, how much it rocks in gusts. |
| Wings (ปีก) | Dart, Glider, Delta, Winglets | Area, span and aspect ratio (lift, drag, glide), where the lift acts, the stall angle, how well the wings come back level, and the speed at which they flutter. |
| Tail (หาง) | Flat, Slight up (4 mm), Strong up (9 mm), Twin fins | How much the bent-up trailing edge lifts the nose (trim); the fins add damping and roll stability. |

A plane glides well when the centre of gravity sits a little ahead of the neutral point and the tail is bent up just enough to match. With a flat tail it dives; with too much tail it climbs, stalls and swoops; with the weight behind the neutral point it rears up and flips. No single plane wins every day: the wide glider goes furthest in calm air and a tailwind but is blown back by a headwind, where a heavy locked delta or a clipped nose does better.

## Throwing

- **Angle** (มุมปา, −30° to +45°) and **throw speed** (แรงปา, 2 to 14 m/s). Drag on the scene from the thrower's hand to set both (the arrow points the way and its length is the speed), or use the sliders. Press **Throw** (ปาเลย).
- Throw at about 1.5 to 2 times the plane's gliding speed. Much harder and it loops back into the building; a glider's wings flutter, and well past their limit they crease for good (more drag, and it pulls to one side). Too soft and it dives to pick up speed.
- **Wind**: a mean wind with a direction, a little stronger higher up, plus gusts that come and go. The windsock on the roof and the compass at top left show the wind at that moment; it is exactly the wind the plane gets, so you can wait for a good gust.
- **Steadiness** (ความนิ่งของมือ): on Easy every throw goes exactly as set; on Normal the angle can be out by about a degree and the speed by a few percent; on Pro by more, and the wings can be tilted as you let go.
- During the flight the scoreline and the panel at top right show the distance, height and speed; a panel at bottom left shows the track from above. Flights speed up after the first second (**Fast**, up to 6×, 8× for the newsroom) and slow down again for the landing; **Skip to landing** jumps to the end.
- Keyboard: ↑ ↓ angle, ← → throw speed (Shift for bigger steps), Space throws (or goes on), B opens the folding table, F turns fast forward on or off.

## Games

| Game | Rules |
|---|---|
| Contest | Everyone throws three times from the same floor (4, 8, 12 or 16); each player's longest throw counts. Up to four people on one device, each with their own plane, and any of four rivals from the newsroom. The wind changes every round. |
| Practice | As many throws as you like, from any floor from 2 to 16, in calm air, a light wind or a strong wind. |

The newsroom rivals each fold their own kind of plane and work out a throw for the wind of the round, with errors that depend on how good they are:

| Rival | Plane | Hand |
|---|---|---|
| The Editor (บรรณาธิการ) | Locked delta; a long body with fins into a headwind | Very steady |
| The Photographer (ช่างภาพ) | Wide glider with a pointed nose; a clipped glider into a headwind | Steady |
| The Paperboy (เด็กส่งหนังสือพิมพ์) | Long-bodied locked dart with fins, always thrown hard | Fair |
| The Intern (เด็กฝึกงาน) | Something random every round | Wild |

Hitting the building, landing on the roof or blowing over and behind the building scores 0. The record for each floor (with the name of whoever set it), the players' names and planes, the steadiness, fast forward and sound are kept in the browser's local storage.

## How it works

- Real sizes: an A4 sheet folded into planes of 21.5 to 29.5 cm and about 3.4 to 6.6 g, with 146 to 265 cm² of wing. The building has 16 floors; the street-level floor is 4.6 m and the others 3.6 m, so the floor-16 window sill is 56 m up. The pavement ends at 4.5 m, the street at 16.5 m, the park at 60 m, and the river runs from 67 m to 440 m.
- Each plane is built from its parts: the masses and where they sit give the centre of gravity; the wing outline is integrated strip by strip for its area, span, mean chord, aerodynamic centre and paper; the static margin, lift slope (from the aspect ratio), drag (profile drag, the drag of the nose, body and tail, and induced drag), trim (from the bent-up trailing edge against the mean chord), pitch damping and inertia, roll stiffness and damping, gust sensitivity and flutter speed all follow from those.
- The flight is simulated at 400 steps a second: the plane flies in its own vertical plane, with lift and drag from the angle of attack (and a stall that turns the wing into a flat plate), a pitching moment from the static margin, the trim and the damping, and ground effect near the ground. On top of that it has a bank angle and a heading, so a plane that drops a wing turns away; gusts and the throw rock it, dihedral levels it and the keel damps it. A change in the wind changes the air speed (the plane's inertia keeps its ground speed).
- The wind is made of slow sine waves seeded per round, so the same moment always has the same wind.
- The folding table's verdict and meters come from a test glide of that plane, in still air, from 60 m. The newsroom rivals choose their throw by flying a grid of throws in the round's mean wind, a few each frame.
- The scene is drawn on a canvas in side view: the camera follows the plane and zooms out to keep the ground in view, then zooms in on the landing. The plane is drawn in 3D from the same outlines the flight model uses, turned by its pitch, bank and heading and seen from a little above, and never drawn smaller than about 35 px, so you can see it from far away.
- Sounds are made in the browser with Web Audio; there are no sound files.

## Keeping the two versions the same

The `<script>` in the two files is identical, with every word of the game in both languages; each page takes its language from its own `<html lang>`. The HTML differs only in its language: the `lang` attribute, title, description, the words written into the page before the script fills them in, and the link to the other version. When you change the game, make the same change in both files, then check that the scripts still match:

```bash
diff <(sed -n '/<script>/,$p' GA-paperplane-en.html) <(sed -n '/<script>/,$p' GA-paperplane-th.html) && echo same
```

## Font

The signs and the heading use **Chomsky** by Fredrick R. Brennan, under the SIL Open Font License 1.1 (`Chomsky-LICENSE.txt`, which must stay with the game). The page embeds the same Latin-only WOFF2 subset of `Chomsky.otf` as `Darts/GA-darts.html`; see `Darts/README.md` for how to rebuild it.
