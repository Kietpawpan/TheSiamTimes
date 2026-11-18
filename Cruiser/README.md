# Bangkok Cruiser (ล่องกรุง) – web game

A 3D motorcycle game, in Thai and in English, made to be played on an iPad. Ride a big V-twin cruiser through a compact Bangkok at your own pace: Rattanakosin and the Giant Swing, Yaowarat under its lanterns and neon, the Chao Phraya with Wat Arun across the water, under the Skytrain on Rama I and Sukhumvit, past Lumphini Park and out to Silom, Sathon and a night market. Eight places hand you a postcard when you ride up to them. There is no clock and no score: it is for cruising, listening to the engine and looking at the city at four times of day.

There is a Thai version and an English version, each a whole game in one HTML file. There is no build step: open either file in a browser. Each links to the other on its start screen, and both share the same settings and postcards.

| Version | File | On the site |
|---|---|---|
| Thai (ภาษาไทย) | `GA-cruiser-th.html` | https://thesiamtimes.com/Cruiser/GA-cruiser-th.html |
| English | `GA-cruiser-en.html` | https://thesiamtimes.com/Cruiser/GA-cruiser-en.html |

Unlike the 2D games on the site, this one needs a connection: it loads **three.js r160** from jsDelivr (`cdn.jsdelivr.net/npm/three@0.160.0`), and the Chonburi, Kanit, Sarabun and Newsreader fonts from Google Fonts. If three.js cannot be fetched, the loading screen says so after 20 seconds.

## Playing on an iPad

Open the page in Safari, turn the iPad sideways and turn the sound up (on an iPad with a side switch, make sure it is not muted). For a full-screen app with no address bar, use Share → **Add to Home Screen**; the page is set up to open that way.

- **Left thumb, the handlebar pad:** touch anywhere in the lower left and slide left or right. Let go and the bars come back to the middle. The bike leans into the turn; the faster you go, the wider it turns, so slow down for corners (about 30 km/h takes a 90° turn at a crossing).
- **Right thumb:** **Throttle** (เร่ง) opens over about a third of a second, so a short press is a gentle one. **Brake** (เบรก) stops in about 45 m from 100 km/h. Stopped, hold the brake and press the throttle to rev the engine; hold the brake alone to walk the bike backwards.
- **Gear buttons ▲ ▼** (เกียร์ขึ้น, เกียร์ลง), above the handlebar pad on the left, when the gearbox is set to *Manual*. The bike will not shift down into a gear that would over-rev the engine, and in a gear that is too high it pulls weakly. The speedometer shows **M** or **A**, and a red shift light blinks near the red line.
- **Cruise** (ครูซ) holds the speed you are doing, from 20 km/h; the throttle adds to it, the brake cancels it. Useful for sightseeing with one thumb.
- **Auto** (ออโต้, top right): steering assist. The bike steers itself along the left lane, turns at the crossings towards the nearest postcard you do not have yet (it says where it is heading), slows for bends, waits behind slow traffic or overtakes it in the other lane, and waits at a crossing for traffic crossing in front. You only work the throttle (and the gears, on Manual). It comes on by itself in the *Broadcast* camera and goes off when you leave it. Touching the handlebar pad takes over for as long as your thumb is on it.
- **Horn** (แตร), for as long as you hold it.
- **Top right:** camera, time of day, sound on/off, pause.
- **Tilt the iPad** (in the pause menu) steers by turning the iPad like handlebars. Safari asks for permission to use the motion sensor; tap the handlebar pad to re-centre it.
- Keyboard: arrows or WASD, Space brake, E / Q shift up / down, G steering assist, H horn, X cruise, C camera, T time of day, M sound, P or Esc pause, Enter starts from the title.

The *Automatic* gearbox shifts like a relaxed rider: early and at low revs when you ride gently, late when you hold the throttle wide open. Bumping a kerb or a car slows you down and shakes the camera; nothing breaks and you never fall off. Vehicles that you hold up will sound their horns.

**Cameras:** *Chase* (behind and above), *Low* (by the rear wheel), *Rider* (from the helmet, with the bars and mirrors in view) and *Broadcast*, which cuts between roadside cameras ahead of you that zoom to follow the bike.

**Time of day:** day, golden hour, dusk and night. Shop windows, signs, neon, street lamps, the lanterns on Yaowarat, the Skytrain windows, the lit prang of Wat Arun and the bridge cables come on as it gets dark, and the headlight lights the road.

**On the start screen** choose the paint (gloss black, candy red, midnight blue, Siam gold, pearl white), the rider's outfit, the engine sound, the volume (a slider, also in the pause menu; all the way left mutes), the gearbox (automatic or manual), the time of day and the graphics level, then **Start the engine** (ติดเครื่อง). The round **Rev it** (บิดเร่ง) button at the bottom right starts the engine if it is off and revs it for as long as you hold it, up to the rev limiter, with its rev counter round the edge; choosing another engine while it runs gives it a blip.

**Outfits:** black leather with a full-face helmet; vintage brown leather with an open-face helmet and goggles; a denim jacket with a matt half helmet and sunglasses; the orange vest of a Bangkok motorbike taxi, numbered on the back; and a flower-print shirt with goggles. The rider sits on the bike on the start screen so you can see the outfit.

**Engines** (the sound and the rev counter; the bike rides the same): V-twin with stock or loud pipes, a big-inch V-twin with straight pipes and a hot cam (a lumpy idle with the odd soft firing, a raw bark, crackle off the throttle), a big single, a 270° parallel twin, an inline four that revs to 12,500, a big-block V8, and an electric motor.

## The city

Eleven blocks across and fourteen from north to south, roads 100 m apart, with the river along the west side: about 1.1 by 1.4 km. Traffic keeps left, as in Thailand, and stops at red lights. The road under you is shown on a blue Bangkok street sign, in Thai and English (in a soi, the soi's number), and the district's name appears as you enter it.

**Ride anywhere you fit.** Only solid things stop you: buildings, walls, fences, columns, lamp posts, trees, food carts, tents and the river railing. You can ride up the kerb onto the pavement (with a jolt, and a little speed lost), along the riverside promenade, through the sois that cut through most shophouse blocks from one road to the next, round the plazas between the towers, into the parks through their north and south gates, across Sanam Luang, into the temple courtyard by the Giant Swing and down the aisles of the night market. The pause menu has a map of the whole city with your position and the places still to visit.

North of Ratchadamnoen is the rest of the old town: the Grand Palace by the river, Sanam Luang beside it, Khao San Road with its English neon and festoon lights, and the Golden Mount on its wooded hill. Sukhumvit carries on east, with the Skytrain and four stations, Benchakitti Park and On Nut beyond. To the south are Rama III and a big wheel on the riverbank.

| Postcard | Where |
|---|---|
| Giant Swing (เสาชิงช้า) | Bamrung Mueang Road, in front of the temple with the golden chedi; the start point is just beside it |
| Wat Arun (วัดอรุณฯ) | Maha Rat Road on the river, looking across to the Thonburi bank |
| Chinatown Gate | The head of Yaowarat Road |
| The Skytrain | Under the second station on Sukhumvit |
| Lumphini Park | The north gate, on Phetchaburi Road |
| Chao Phraya Pier | Maha Rat Road, at the pier |
| Silom–Sathon Skyline | Si Lom Road, under the tallest tower |
| Night Market | Sathon Road, by the rows of coloured tents |
| The Grand Palace | Na Phra Lan Road, by its south gate |
| Sanam Luang | On the field, or riding past it on Na Phra Lan Road |
| Khao San Road | Khao San Road |
| The Golden Mount | Lan Luang Road, below the hill |
| Riverside Wheel | Charoen Rat Road, by the wheel |

Each place has a faint golden beam over it until you have been there, and a dot on both maps. The roads are named after real Bangkok roads and the districts are in roughly the right relation to each other, but the city is a condensed sketch, not a map.

## The bike

The **Chandler 1864** is a made-up cruiser (named after John Hassett Chandler, who founded The Siam Times in 1864): a 1,868 cc air-cooled V-twin with finned cylinders, chrome rocker covers, a round air cleaner, staggered twin mufflers, a teardrop tank, laced wheels, wide pull-back bars and a solo seat. It carries a Thai motorcycle plate (1กข · กรุงเทพมหานคร · 1864), tilted up a little towards the chase camera and lit at night by a plate lamp. It is not a model of any real motorcycle and carries no maker's name or badge.

## How it works

- **Graphics:** three.js with physically based materials, a clear-coat paint shader and chrome that reflects an environment map made from the sky (and, at night, from a ring of lit panels standing in for the city). The sky is a scattering model by day and at golden hour, and a gradient dome with stars and the moon at dusk and at night. Bloom, a colour grade and a vignette are applied after rendering. The sun casts shadows in a box that follows the bike.
- **The city** is generated at load time from a fixed seed, so it is the same on every visit. All textures are drawn on canvases at start-up (asphalt, paving, red-and-white kerbs, four styles of shophouse front with their lit windows, glass and concrete towers, mall fronts, 32 Thai shop signs, Chinese neon, the plate, the tank lettering); there are no image files. The city is cut into 300 m chunks; in each, the buildings, street furniture and lamps are merged into one mesh per material, and only the chunks within about 500 m of the camera are drawn (640 m on High, 380 m on Saver). Each chunk casts its shadow from one merged, position-only stand-in, switched on only while the shadow map is drawn; so do the bike and rider. Vehicles, traffic-light lamps, the landmark beams and the wheel's cabins are instanced. That keeps it to roughly 170 to 190 draw calls a frame.
- **Collisions:** every solid thing is a box, a circle or (the lakes) an ellipse, filed in a grid of 16 m cells so the bike only tests what is near it. The ground is a kerb higher wherever there is pavement.
- **Physics:** an arcade model with real-world numbers. Six gears (top speeds 45, 75, 105, 135, 160 and 185 km/h at a 5,800 rpm red line), a torque curve that peaks low, aerodynamic drag, engine braking and an automatic box. Lean grows with speed up to 41°; the yaw rate is g·tan(lean)/v, which gives a turning radius of about 10 m at 27 km/h. Buildings and kerbs are boxes, pillars are circles, and vehicles are oriented boxes.
- **Traffic:** about sixty cars, taxis, tuk-tuks, buses, pick-ups and scooters drive on lanes between crossings, keep left, choose a way at each crossing, follow the vehicle in front and stop for red. Any that fall more than about 420 m behind come back on a road 160 to 360 m from you, out of sight, so the streets round you stay busy. Each crossing cycles 11 s green, 2 s amber for one road, then the other.
- **Steering assist:** the route is a list of points along the left lane to the next crossing, a curve through it (moving out towards the middle of the road first when turning, so the arc clears both kerbs) and on along the next road; the bike follows it by pure pursuit, turning the curvature it needs into a lean and then into bar input. It picks each turn by the shortest way round the grid to the nearest postcard still to collect, brakes for the tightest bend ahead (about 3 m/s² sideways) and keeps its distance from vehicles in front. In a simulated three minutes with the throttle held open it rides about 2 km and collects five postcards.
- **Sound,** all made in the browser with Web Audio; there are no sound files. Each engine is a firing pattern over one 720° cycle. The 45° V-twin on one crank pin fires 315° and then 405° of crank rotation apart; that uneven gap is the loping beat. The single fires once every 720°, the parallel twin 270° then 450°, the inline four every 180°, and the V8 every 90° with its two banks firing in the cross-plane order, panned left and right. Every firing is a short exhaust pulse (a falling low thump, a pipe resonance and a bark), scheduled ahead on the audio clock, then a soft clipper, EQ that keeps most of the energy between 150 and 600 Hz so it carries on small speakers, and a low-pass filter that opens with the throttle and the revs. Off the throttle at speed it burbles and pops; it bounces off the rev limiter; it idles unevenly. Each engine has its own pulse shape, filters, idle and red line; the loud pipes are brighter, louder and pop more, and the straight pipes rawer still, with weak firings mixed in at idle. The electric motor is a motor tone with its harmonics and an inverter whine, rising with the revs. Around it: intake roar, gear whine, wind and tyre noise that grow with speed, passing traffic and tuk-tuk two-strokes panned to where they are, the Skytrain's rumble and brake squeal, the river, temple bells near the temple, birds by day and crickets by night in the park, horns in the distance, and a street-canyon echo that changes from district to district.
- **Graphics level:** *Auto* starts at Medium and drops to Saver if the game runs below about 36 frames a second (or rises to High on a fast iPad). High uses soft 2048 px shadows and up to 1.75× pixel density; Medium 1024 px shadows at 1.3×; Saver turns off shadows and bloom and draws at 1×.
- Settings, the postcards collected, the distance ridden and the top speed are kept in the browser's local storage under `tst-cruiser-v1`.

Adding `?debug` to the address exposes the game's state as `window.__cruiser`, for testing.

## Keeping the two versions the same

The `<script type="module">` in the two files is identical, with every word of the game in both languages; each page takes its language from `data-lang` on `#game`. The HTML differs only in its language: the `lang` attributes, the title, the description and the link to the other version. When you change the game, make the same change in both files, then check that the scripts still match:

```bash
diff <(sed -n '/<script type="module">/,$p' GA-cruiser-th.html) <(sed -n '/<script type="module">/,$p' GA-cruiser-en.html) && echo same
```

## Font

The masthead, the speedometer and the tank lettering use **Chomsky** by Fredrick R. Brennan, under the SIL Open Font License 1.1 (`Chomsky-LICENSE.txt`, which must stay with the game). The page embeds the same Latin-only WOFF2 subset of `Chomsky.otf` as `Darts/GA-darts.html`; see `Darts/README.md` for how to rebuild it.
