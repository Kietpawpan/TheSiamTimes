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
- **Cruise** (ครูซ) holds the speed you are doing, from 20 km/h; the throttle adds to it, the brake cancels it. Useful for sightseeing with one thumb.
- **Horn** (แตร), for as long as you hold it.
- **Top right:** camera, time of day, sound on/off, pause.
- **Tilt the iPad** (in the pause menu) steers by turning the iPad like handlebars. Safari asks for permission to use the motion sensor; tap the handlebar pad to re-centre it.
- Keyboard: arrows or WASD, Space brake, H horn, X cruise, C camera, T time of day, M sound, P or Esc pause, Enter starts from the title.

The gearbox is automatic and shifts like a relaxed rider: early and at low revs when you ride gently, late when you hold the throttle wide open. Bumping a kerb or a car slows you down and shakes the camera; nothing breaks and you never fall off. Vehicles that you hold up will sound their horns.

**Cameras:** *Chase* (behind and above), *Low* (by the rear wheel), *Rider* (from the helmet, with the bars and mirrors in view) and *Broadcast*, which cuts between roadside cameras ahead of you that zoom to follow the bike.

**Time of day:** day, golden hour, dusk and night. Shop windows, signs, neon, street lamps, the lanterns on Yaowarat, the Skytrain windows, the lit prang of Wat Arun and the bridge cables come on as it gets dark, and the headlight lights the road.

**On the start screen** choose the paint (gloss black, candy red, midnight blue, Siam gold, pearl white), the time of day, the exhaust (stock or loud pipes) and the graphics level, then **Start the engine** (ติดเครื่อง).

## The city

Six by six blocks, roads 100 m apart, with the river to the west. Traffic keeps left, as in Thailand, and stops at red lights. The road under you is shown on a blue Bangkok street sign, in Thai and English, and the district's name appears as you enter it.

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

Each place has a faint golden beam over it until you have been there, and a dot on the map. The roads are named after real Bangkok roads and the districts are in roughly the right relation to each other, but the city is a condensed sketch, not a map.

## The bike

The **Chandler 1864** is a made-up cruiser (named after John Hassett Chandler, who founded The Siam Times in 1864): a 1,868 cc air-cooled V-twin with finned cylinders, chrome rocker covers, a round air cleaner, staggered twin mufflers, a teardrop tank, laced wheels, wide pull-back bars and a solo seat, with a Thai number plate. It is not a model of any real motorcycle and carries no maker's name or badge.

## How it works

- **Graphics:** three.js with physically based materials, a clear-coat paint shader and chrome that reflects an environment map made from the sky (and, at night, from a ring of lit panels standing in for the city). The sky is a scattering model by day and at golden hour, and a gradient dome with stars and the moon at dusk and at night. Bloom, a colour grade and a vignette are applied after rendering. The sun casts shadows in a box that follows the bike.
- **The city** is generated at load time from a fixed seed, so it is the same on every visit. All textures are drawn on canvases at start-up (asphalt, paving, red-and-white kerbs, four styles of shophouse front with their lit windows, glass and concrete towers, mall fronts, 32 Thai shop signs, Chinese neon, the plate, the tank lettering); there are no image files. The buildings are merged into one mesh per material, and trees, lamps, poles, food carts, tents, lanterns, traffic lights and vehicles are instanced, which keeps it to about 150 draw calls a frame.
- **Physics:** an arcade model with real-world numbers. Six gears (top speeds 45, 75, 105, 135, 160 and 185 km/h at a 5,800 rpm red line), a torque curve that peaks low, aerodynamic drag, engine braking and an automatic box. Lean grows with speed up to 41°; the yaw rate is g·tan(lean)/v, which gives a turning radius of about 10 m at 27 km/h. Buildings and kerbs are boxes, pillars are circles, and vehicles are oriented boxes.
- **Traffic:** about forty-five cars, taxis, tuk-tuks, buses, pick-ups and scooters drive on lanes between crossings, keep left, choose a way at each crossing, follow the vehicle in front and stop for red. Each crossing cycles 11 s green, 2 s amber for one road, then the other.
- **Sound,** all made in the browser with Web Audio; there are no sound files. The engine is a 45° V-twin on one crank pin, so its two cylinders fire 315° and then 405° of crank rotation apart; that uneven gap is the loping beat. Every firing is a short exhaust pulse (a falling low thump, a pipe resonance and a bark), scheduled ahead on the audio clock, then a soft clipper, EQ that keeps most of the energy between 150 and 600 Hz so it carries on small speakers, and a low-pass filter that opens with the throttle and the revs. Off the throttle at speed it burbles and pops; it bounces off the rev limiter; it idles unevenly. The loud pipes are brighter, louder and pop more. Around it: intake roar, gear whine, wind and tyre noise that grow with speed, passing traffic and tuk-tuk two-strokes panned to where they are, the Skytrain's rumble and brake squeal, the river, temple bells near the temple, birds by day and crickets by night in the park, horns in the distance, and a street-canyon echo that changes from district to district.
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
