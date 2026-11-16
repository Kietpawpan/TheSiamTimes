# Siam Times Reverse Parking (ถอยจอด) – web game

A reverse-parking game, in Thai and in English. Back five vehicles into their bays in and behind The Siam Times building, seen from above, with a rear-view mirror at the top of the screen: a tuk-tuk, a saloon car, a van, a ten-wheeler and, hardest of all, a truck and trailer. Touching the vehicles parked beside the bay costs points. It has the same dark look as Siam Times Slingshot and Darts: the scoreline across the top, a control rail on the right (under the scene on phones), the masthead in Chomsky, cream, brass and Siam Times blue.

There is a Thai version and an English version, each a whole game in one HTML file. There is no build step: open either file in a browser. Each has a link to the other in its control rail, and both share the same progress, stars and settings.

| Version | File | On the site |
|---|---|---|
| Thai (ภาษาไทย) | `GA-parking-th.html` | https://thesiamtimes.com/Parking/GA-parking-th.html |
| English | `GA-parking-en.html` | https://thesiamtimes.com/Parking/GA-parking-en.html |

They work offline; only the Newsreader and Sarabun text fonts come from Google Fonts, and the pages fall back to system fonts without them.

## Controls

- **Bottom left: D (เดินหน้า, forward) above R (ถอยหลัง, reverse).** Hold one to drive; let go and the vehicle brakes to a stop by itself. A short tap creeps it a few centimetres. Pressing the other button while moving brakes first, then changes direction. The pill above them shows the gear and the speed.
- **Bottom right: the steering wheel.** Put a finger (or the mouse) on it and turn it round in a circle, as you would a real wheel: one full turn each way is full lock. It stays where you leave it. **ตั้งตรง / Straighten** brings it back to the middle. Tap the middle of the wheel, or **แตร / Horn**, to sound the horn.
- Both thumbs work at once (multi-touch), so you can steer while you drive.
- Keyboard: ↑ or W forward, ↓ or S reverse, ← → steer (Shift turns faster), C straightens the wheel, H sounds the horn, Enter continues from a card.

## The rear-view mirror

A small 3D view from the back of the vehicle (the back of the trailer, on the last stage), looking back and a little down, flipped left to right as a mirror is, so the vehicle's left is on the left. Parked vehicles, pillars, walls, the paint on the floor and the bay itself are all in it. With **Guide lines** on, it also shows where the back corners will go with the wheel where it is now, red for the first 0.6 m, yellow to 1.6 m, then green; the same lines are drawn on the floor in the view from above (forward, when you last chose D). With **Parking sensor** on, the gap to the nearest thing behind (or ahead, in D) is shown in the mirror and beeps faster as it closes, continuously under 35 cm.

## Stages

Each stage opens once you have parked in the one before it.

| Stage | Vehicle | Where | The bay |
|---|---|---|---|
| 1 | Tuk-tuk (ตุ๊กตุ๊ก): 3.1 m, three wheels, 42° lock | Ground floor, by the newsroom door | G-06, 2.55 × 4.2 m, a tuk-tuk on one side and nothing on the other |
| 2 | Saloon car (รถเก๋ง): 4.6 m, 36° lock | Basement B1 | B1-07, 2.6 × 5.2 m, between two cars |
| 3 | Van (รถตู้): 5.4 m, 36° lock | Basement B2 | B2-P3, parallel against the wall, 8.2 × 2.7 m, between a saloon and a pickup |
| 4 | Ten-wheeler (รถสิบล้อ): 9.5 m, front axle and rear tandem 5.6 m apart, 40° lock | The paper yard behind the press hall, at night | D3, 4.2 × 12.5 m, at a dock door between two trucks |
| 5 | Truck and trailer (รถพ่วง): 7 m truck and an 8 m centre-axle trailer, 17.1 m in all | The paper yard | D3, 5.0 × 20 m, between two trucks with trailers |

A trailer turns the opposite way to the wheel when reversing: wheel right, trailer left. If the angle between the truck and the trailer passes 72° it **jackknifes**: the rig stops, it costs 50 points, and you pull forward to straighten it.

## Parking and scoring

The vehicle is parked when every corner of it (of the truck and the trailer, on stage 5) is inside the bay, it points within 10° of straight, nose out towards the lane, and it has stood still for 0.7 s with neither pedal pressed. Nose in does not count; the game says to reverse in.

| | Points |
|---|---|
| Parked | +1,000 |
| Straightness: half for the angle (0° to 10°), half for how close to the centre line | up to +500 |
| Time bonus: 6 points for each second under par (40, 50, 65, 85, 130 s) | |
| Each touch of a parked vehicle | −100 |
| Each touch of a pillar, wall, fence, paper roll or the guard's booth | −50 |
| Each jackknife | −50 |

The clock starts with the first press of a pedal. A touch costs points once; pushing on against the same car does not cost again until you have pulled at least 25 cm clear of it. A parked car you touch rocks and its alarm goes off, with its indicators flashing.

Stars: one for parking; two for at least 60 % straightness with no more than one touch; three for at least 80 % with no touches at all. The best score and stars of each stage, the total of the best scores, the camera and the aids are kept in the browser's local storage (`tst-parking-v1`).

**Camera** (มุมกล้อง): *Auto* keeps the vehicle and the bay in view; *Close* follows the vehicle alone, nearer; *Whole lot* shows the whole floor or yard. On Auto and Close the view keeps the vehicle clear of the mirror and of the controls in the bottom corners.

## How it works

- Low-speed kinematics with no tyre slip: the rear axle moves along the vehicle's heading, and the heading turns at v·tan(steer)/wheelbase. The trailer's axle is dragged, or pushed, along the line to its hitch, 1.9 m behind the truck's rear axle; that is the exact no-slip rule in the limit of small steps, and the steps are 2 cm or less.
- Every vehicle and obstacle is an oriented box; contacts are found with the separating-axis test. On a contact the vehicle stays where it was before the step and stops.
- The scene from above is drawn fresh every frame in metres, then multiplied by a light map: an ambient level plus the ceiling tubes or yard lamps, the headlights, the tail, brake and reversing lights, and the flashing indicators of an alarmed car.
- The mirror is a small painter's-algorithm 3D renderer: boxes for everything that can be touched, faces sorted far to near, clipped at a near plane, with fog.
- Sounds are made in the browser with Web Audio; there are no sound files. Each vehicle has its own engine: a firing-rate oscillator and a half-rate one through a soft clipper and a low-pass filter that opens with the revs, plus noise band-passed and chopped at the firing rate, for the rasp of the tuk-tuk's two-stroke or the clatter of a diesel, and a turbo whistle on the trucks. The van and the trucks beep while reversing and the trucks hiss their air brakes when they stop. Each vehicle has its own horn. Parked cars have alarms, the car park hums, and crickets sing in the yard.

## Keeping the two versions the same

The `<script>` in the two files is identical, with every word of the game in both languages; each page takes its language from its own `<html lang>`. The HTML differs only in its language: the `lang` attribute, the title, the description and the link to the other version. When you change the game, make the same change in both files, then check that the scripts still match:

```bash
diff <(sed -n '/<script>/,$p' GA-parking-th.html) <(sed -n '/<script>/,$p' GA-parking-en.html) && echo same
```

## Font

The masthead, the roof of the press hall and the sides of the trucks use **Chomsky** by Fredrick R. Brennan, under the SIL Open Font License 1.1 (`Chomsky-LICENSE.txt`, which must stay with the game). The page embeds the same Latin-only WOFF2 subset of `Chomsky.otf` as `Darts/GA-darts.html`; see `Darts/README.md` for how to rebuild it.
