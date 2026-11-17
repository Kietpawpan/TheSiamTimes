# Paper Run (รถส่งหนังสือพิมพ์) – driving game

A driving game, in Thai and in English, made for chapter 12 of *Chandler’s Promise* and playable on its own. From the driver’s seat of The Siam Times’ right-hand-drive manual pickup, take the Return Edition from the building on the Thonburi bank of the Chao Phraya over Taksin Bridge to the bookshops at Victory Monument, collect the last piece of type, the S, and drive back the same way before the office closes at 17:30, before dark. Drive by the rules of the road: every ticket costs time.

| Version | File |
|---|---|
| Thai (ภาษาไทย) | `GA-delivery-th.html` |
| English | `GA-delivery-en.html` |

Each is a whole game in one HTML file, with no build step; they link to each other and share the same settings. Only the Newsreader and Sarabun text fonts come from Google Fonts (the pages fall back to system fonts, with a Thai font for the Thai signs). It plays best with the screen sideways.

## The cab

You look through the windscreen of a right-hand-drive pickup (Thailand drives on the left): the wheel in front of you, the instruments behind it, the rear-view mirror left of centre, a phone with the map clipped to the glass on the left.

- **Wheel** (bottom centre): drag round the rim to turn it, one way or the other, up to 270°; it comes back to the middle by itself when you let go and drive on. Tap the middle for the horn.
- **Pedals** (bottom right): clutch, brake, accelerator. Hold them; several at once work (multi-touch).
- **Gear lever** (bottom left, an H gate): 1 3 5 above, 2 4 R below, N between. Press the clutch before changing gear, or the box crunches and refuses. Reverse only when the truck has stopped.
- **Indicators** ◀ ▶ either side of the instruments; **Start / Engine off**, **Headlights** and **Wipers** above the pedals.
- **Instruments**: speedometer, rev counter (red from 5,400), fuel gauge and warning light, indicator arrows, engine and headlight lights, and a small screen with the gear, the clock and the distance.
- **Mirror**: the road behind, with whatever is following you; you will need it when reversing.
- **Phone**: the map of the route with your position, and the next instruction (“In 120 m: turn left into Witthayu Road”).
- Keyboard: ↑ or W accelerator, ↓ or S brake, ← → or A D steer, Shift or C clutch, 1–5 R N gears, Q E indicators, H headlights, V wipers, K start or stop the engine, F fuel cap, G fill (hold), Space horn, M map, P or Esc pause.

**Driving a manual.** Start the engine (in neutral, or with the clutch down). Clutch down, first gear, then let the clutch come up while you press a little accelerator: the clutch slips through its biting point and the truck moves off. Change up through the gears with the clutch; let the clutch up in gear with the truck almost stopped and no accelerator and the engine stalls (press the clutch and Start again). **Automatic clutch** on the start card works the clutch for you: change gear with the gear lever alone, no stalling.

## The route

The real roads, shortened to about 2.5 km each way:

| Road | Length | Limit | On the way |
|---|---|---|---|
| Charoen Nakhon Road | 240 m | 50, 30 by the school | Start outside The Siam Times; school zone and a zebra with schoolchildren; a bus stop. Turn **right** at the lights. |
| Krung Thon Buri Road → Taksin Bridge → Sathorn Road | 760 m | 60, 80 on the bridge | Up and over the Chao Phraya with boats below; the BTS viaduct over Sathorn; lights at Surasak; rain on Sathorn (slippery, the wipers help); nails in the left lane and a tyre shop just after; a zebra. Turn **left** at the lights (left on red allowed). |
| Witthayu Road | 380 m | 60 | Lumphini Park on the left, embassies on the right. The fuel warning comes here, then the petrol station on the left. A zebra. Turn **left** at the lights (left on red allowed). |
| Phloen Chit Road | 260 m | 50 | Malls under the Skytrain, which rumbles overhead. A zebra. At Ratchaprasong turn **right**: straight on is a bus-only road. |
| Ratchadamri → Ratchaprarop Road | 420 m | 60 | A flooded stretch at Pratunam; lights at Pratunam. Turn **left** (no lights). |
| Rang Nam Road | 200 m | 40 | Narrow, street food, tuk-tuks parked; a zebra. Turn **right** at the lights. |
| Phaya Thai Road | 230 m | 50 | Victory Monument ahead; the bookshops on the left. Stop in the yellow box to deliver. |

The way back is the same roads in reverse, with the turns the other way (left on red allowed at the last junction, back onto Charoen Nakhon). Stop in the box outside the building to finish. Big blue signs over the road before each junction show where each way goes, in Thai and English; road-name plates, speed-limit signs and the other signs are along the kerb.

**Missed turn**: drive on to the U-turn 150 m past the junction (below 30 km/h) and you come back 100 m before it. **Wrong turn**: the side street has a U-turn 120 m on. **Bus-only road** (straight on at Ratchaprasong, under a sign that promises a short cut to Victory Monument): the police stop you, you get a ticket, and a barrier blocks the way. Select reverse, back up to the junction with the mirror, then first gear and turn right.

## Rules and tickets

Each ticket adds minutes to the clock. A ticket slides in at the side; a speed camera or a red-light camera flashes, the police whistle for the rest.

| Ticket | When | Minutes |
|---|---|---|
| Running a red light | Crossing the stop line on red (left on red only where signed, with the left indicator on) | +10 |
| Speeding | More than 8 km/h over the limit for 2 s | +5 |
| Not stopping at a zebra crossing | Crossing it while someone is on the road | +10 |
| Driving on the wrong side | Over the double yellow line for 1.5 s | +5 |
| Turning without signalling | Turning without the indicator on that way | +2 |
| Driving in a bus-only lane | Into the bus road at Ratchaprasong | +15 |
| Hitting another vehicle | Running into the one in front, or head on | +10 |
| No headlights after dark | Once it is dark, for 12 s | +3 |

## What happens on the road

| Event | What to do | Time |
|---|---|---|
| **Nails** in the left lane on Sathorn (on the way there) and on Ratchaprarop (on the way back) | Change lanes to miss them. If you run over them: a puncture, the truck pulls to the left and slows; stop and the tyre man patches it | +20 min |
| **Low fuel** on Witthayu: you start with 30 %, and the warning comes on halfway there | Keep left and slow below 30 km/h, steer onto the forecourt of the station on the left, stop in the box by the pump, switch the engine off, open the fuel cap, hold Fill until it is full, close the cap, start and drive out | — |
| **Out of fuel** (if you miss the station) | Wait for someone to bring a can (25 %) | +30 min |
| **Flood** at Pratunam | Drive through below 20 km/h. Faster than 25 km/h for a second and the engine floods and stalls | +15 min |
| **Rain** on Sathorn | Less grip: brake earlier, steer gently, wipers on | — |
| **Delivery** at the bookshops | Stop in the yellow box; the bundles come off and you are handed the S | +10 min |

**The clock** starts at 15:00 and runs at eleven times real time; a clean run takes about ten minutes. The light turns golden from about 16:45 and dusky after 17:20; after about 17:50 it is night, the street lights are dim and flicker, and without headlights you can hardly see. Back by 17:30 is on time; on time with no more than two tickets is a model drive (and in the story, the brass S). The finish card lists the tickets and the time lost. Your best on-time arrival, the clutch setting and the sound setting are kept in local storage (`tst-delivery-v1`).

## Traffic

Taxis in Bangkok colours (pink, green and yellow, orange, blue) with their roof signs, cars, tuk-tuks, ten-wheelers with painted backs, BMTA buses (which stop at the bus stops, and take the bus-only road), and motorcycle taxis that weave between lanes. They keep their distance, stop at red and amber lights and for people on the zebras, change lanes to pass, and sound their horns if you sit at a green light. Oncoming traffic uses the lanes on the right. People cross the zebras, and schoolchildren cross by the school.

## How it works

- The road is a list of 5 m segments with bends and hills, projected at both ends and drawn far to near (the classic segment-road method); the mirror is the same drawing looking backwards. Buildings, signs, vehicles and people are pictures drawn once into small canvases at start-up and scaled into place, with darker copies for dusk and night and a layer of lit windows and lamps.
- The truck: engine torque, five gears and reverse, final drive, a clutch with a biting point, engine braking, and grip that falls in the rain and the flood; on bends the truck drifts outwards unless you steer.
- Sounds are made with Web Audio: the diesel following the revs, tyres, wind, rain, the skid, the water, gear changes and crunches, the starter and a stall, indicator ticks, wiper thumps, horns of every kind, the Thai traffic police whistle, the camera shutter, the BTS overhead, the fuel pump.
- When the page runs in a frame inside *Chandler’s Promise*, it tells the story when you finish: `{ tst: 'story', game: 'delivery', won, score, text, onTime, violations }`.

## Keeping the two versions the same

The `<script>` in the two files is identical, with every word in both languages; each page takes its language from its own `<html lang>`. When you change the game, make the same change in both files, then check:

```bash
diff <(sed -n '/<script>/,$p' GA-delivery-th.html) <(sed -n '/<script>/,$p' GA-delivery-en.html) && echo same
```

## Font

The sign on the building, the masthead and the wheel use **Chomsky** by Fredrick R. Brennan, under the SIL Open Font License 1.1 (`Chomsky-LICENSE.txt`, which must stay with the game).
