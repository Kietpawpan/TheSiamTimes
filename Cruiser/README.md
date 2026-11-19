# Bangkok Cruiser (ล่องกรุง) – web game

A 3D motorcycle game, in Thai and in English, made to be played on an iPad. Ride a big V-twin cruiser through a compact Bangkok at your own pace: Rattanakosin and the Giant Swing, Yaowarat under its lanterns and neon, the Chao Phraya with Wat Arun across the water, under the Skytrain on Rama I and Sukhumvit, past Lumphini Park and out to Silom, Sathon and a night market. Ride over Memorial Bridge to the Thonburi bank, back through a glass tunnel under the river with fish swimming round you, and up a ramp onto the roof of a car park, with a narrow bridge to come down by. Sixteen places hand you a postcard when you ride up to them. There is a mission, if you want one: find the three green VERDANT watch shops and buy a dress watch, the 1864, without running too many red lights. Or choose free ride: no clock and no score, just cruising, listening to the engine and looking at the city at four times of day.

There is a Thai version and an English version, each a whole game in one HTML file. There is no build step: open either file in a browser. Each links to the other on its start screen, and both share the same settings and postcards.

| Version | File | On the site |
|---|---|---|
| Thai (ภาษาไทย) | `GA-cruiser-th.html` | https://thesiamtimes.com/Cruiser/GA-cruiser-th.html |
| English | `GA-cruiser-en.html` | https://thesiamtimes.com/Cruiser/GA-cruiser-en.html |

Unlike the 2D games on the site, this one needs a connection: it loads **three.js r160** from jsDelivr (`cdn.jsdelivr.net/npm/three@0.160.0`), and the Chonburi, Kanit, Sarabun and Newsreader fonts from Google Fonts. If three.js cannot be fetched, the loading screen says so after 20 seconds.

## Playing on an iPad

Open the page in Safari, turn the iPad sideways and turn the sound up (on an iPad with a side switch, make sure it is not muted). For a full-screen app with no address bar, use Share → **Add to Home Screen**; the page is set up to open that way.

- **Left thumb, the handlebar pad:** touch anywhere in the lower left and slide left or right. Let go and the bars come back to the middle. At walking pace the bars turn a long way, so the bike can turn round on a radius of about 2 m (a U-turn in a soi, or round a food cart); it leans more and turns wider as you speed up: a radius of about 3 m at 15 km/h, 6 m at 27 km/h and 10 m at 45 km/h. Slow down for tight corners.
- **Right thumb:** **Throttle** (เร่ง) opens over about a third of a second, so a short press is a gentle one. **Brake** (เบรก) stops in about 45 m from 100 km/h. Stopped, hold the brake and press the throttle to rev the engine; hold the brake alone to walk the bike backwards.
- **Neutral and D.** When the bike has stood still for a moment with the throttle closed, the gearbox drops into neutral: the speedometer shows a green **N** and the throttle just revs the engine, as much as you like. To ride off, tap **D** (above the handlebar pad on the left; it pulses while you are in neutral), and from there the automatic box shifts by itself. Stopped in drive, tap D again for neutral. The ride starts in neutral. Holding the throttle while you wait (at a red light with steering assist, say) keeps it in drive.
- **Gear buttons ▲ ▼** (เกียร์ขึ้น, เกียร์ลง), in place of D when the gearbox is set to *Manual*: ▲ from neutral puts it in first, ▼ in first when stopped goes back to neutral. The bike will not shift down into a gear that would over-rev the engine, and in a gear that is too high it pulls weakly. The speedometer shows **M** or **A**, and a red shift light blinks near the red line.
- **Cruise** (ครูซ) holds the speed you are doing, from 20 km/h; the throttle adds to it, the brake cancels it. Useful for sightseeing with one thumb.
- **Auto** (ออโต้, top right): steering assist. The bike steers itself along the left lane, turns at the crossings towards the nearest postcard you do not have yet (it says where it is heading), slows for bends, waits behind slow traffic or overtakes it in the other lane, and waits at a crossing for traffic crossing in front. You only work the throttle (and the gears, on Manual). It works on the city streets; on the bridge, in the tunnel, on Arun Amarin Road and on the car park it lets you steer, and says so. It comes on by itself in the *Broadcast* camera and goes off when you leave it. Touching the handlebar pad takes over for as long as your thumb is on it.
- **Horn** (แตร), for as long as you hold it.
- **Lights** (ไฟหน้า, top right): the headlight on full beam, day or night (it comes on dim by itself at dusk and night).
- **Top right:** camera, time of day, sound on/off, pause.
- **Tilt the iPad** (in the pause menu) steers by turning the iPad like handlebars. Safari asks for permission to use the motion sensor; tap the handlebar pad to re-centre it.
- **Horn twice** near another rider: she waves back (and, in the mission, gives you a tip).
- Keyboard: arrows or WASD, Space brake, E / Q shift up / down (E is also D, Q neutral when stopped), G steering assist, H horn, L headlight, X cruise, C camera, T time of day, M sound, P or Esc pause, Enter starts from the title.

The *Automatic* gearbox shifts like a relaxed rider: early and at low revs when you ride gently, late when you hold the throttle wide open. Bumping a kerb or a car slows you down and shakes the camera; nothing breaks and you never fall off. Vehicles that you hold up will sound their horns.

**Cameras:** *Chase* (behind and above), *Low* (by the rear wheel), *Rider* (from the helmet, with the bars and mirrors in view) and *Broadcast*, which cuts between roadside cameras ahead of you that zoom to follow the bike.

**Time of day:** day, golden hour, dusk and night. Shop windows, signs, neon, street lamps, the lanterns on Yaowarat, the Skytrain windows, the lit prang of Wat Arun and the bridge cables come on as it gets dark, and the headlight lights the road.

**On the start screen** choose the paint (gloss black, candy red, midnight blue, Siam gold, pearl white), the rider's outfit, the engine sound, the volume (a slider, also in the pause menu; all the way left mutes), the gearbox (automatic or manual), the time of day and the graphics level, then **Start the engine** (ติดเครื่อง). The round **Rev it** (บิดเร่ง) button at the bottom right starts the engine if it is off and revs it for as long as you hold it, up to the rev limiter, with its rev counter round the edge; choosing another engine while it runs gives it a blip.

**Outfits:** black leather with a black helmet; vintage brown leather with a cream helmet; a denim jacket with a matt black helmet; the orange vest of a Bangkok motorbike taxi, numbered on the back, with a white helmet; and a flower-print shirt with a red helmet. Every helmet is a full-face one with a dark visor, so the rider's face is never seen; the women on scooters ride in full-face helmets with dark visors too. The rider sits on the bike on the start screen so you can see the outfit.

**The rider** is a person of ordinary build rather than a dummy:

- a chest wider than the waist, shoulders that blend into it, and arms and legs that thin towards the wrists and ankles;
- elbows and knees placed by two-bone reach, so the hands close round the grips (four fingers over the top and under, the thumb beneath) and the boots, with soles and heels, stand on the forward pegs;
- a full-face helmet with a dark visor, its pivots and a chin vent;
- a belt and buckle, a jacket collar and zip.

**Engines** (the sound and the rev counter; the bike rides the same): V-twin with stock or loud pipes, a big-inch V-twin with straight pipes and a hot cam (a lumpy idle with the odd soft firing, a raw bark, crackle off the throttle), a big single, a 270° parallel twin, an inline four that revs to 12,500, a big-block V8, and an electric motor.

## The mission: the 1864 watch

Choose **Mission** or **Free ride** at the top of the start screen. In the mission you are a reporter at The Siam Times who has wanted a **VERDANT 1864** dress watch for years. VERDANT is a made-up maker of fine watches with green-and-gold shops (no real brand's name or marks), and only its three Bangkok shops sell the 1864: in front of the Siam mall on Rama I Road, on Yaowarat Road and on Sukhumvit. They are green dots on both maps, each has a pulsing green ring on the pavement and a green beam over the one to go to next, and **Auto** takes you there and stops in the ring. **Navigation** shows the way (see below). Within about 12 m of a shop a button appears to go in; stopping in its ring goes in by itself. In free ride the shops still show their rings, and going in offers to start the mission.

- The shops are visited in any order. The **first** you go into has no 1864 and offers its **Want List**: sign it (a pen writes your name on the cream card and a green wax seal with your number comes down). The **second** will only sell you the 1864 if you first buy a Mariner 300 diving watch for ฿420,000. **Say no**: buying it spends all your savings and ends the mission. The **third** has one, but only for customers on the Want List, and it costs ฿186,400 when you have ฿175,000. They hold it for you.
- **Money.** Go back to **The Siam Times** building, on Bamrung Mueang Road by the Giant Swing (an S on the maps), and work for a month. A cut scene runs through thirty days of the calendar while you save ฿45,000. Or skip the office: the other motorcycle riders are women with long hair, and **two toots of the horn** close to one (within about 15 m) make her wave back and tip you ฿6,000 to ฿11,000. Each woman tips you once in a mission, and one tip is never quite enough (you are ฿11,400 short), so you need **at least two** of them.
- **Red lights.** Riding into a crossing on red counts (amber is fine). Three are allowed and each brings a whistle and a red flash. The **fourth** ends the mission. **The footpath is the way round:** riding on the pavement round a crossing never counts, and nor does dropping into a crossing straight off the pavement.
- With enough money, go back to the third shop and buy the watch. The manager opens a green velvet box: the lid lifts, a gleam crosses the dial, gold leaf drifts down, a slow chord sequence plays and the light warms. Then you **put it on**, and it is there on the rider's left wrist from then on: a strap that hugs the wrist between the sleeve and the glove, a gold case with its crown towards the hand, and the real dial.
- **The ride home.** A white **pigeon** flies a few metres ahead of you along the streets to The Siam Times, cooing now and then, and circles the building as you arrive. Red lights no longer count on this ride. While you wear the watch, the women riders wave as you ride past them, with no horn needed, and they keep doing it in free ride afterwards. At the office, your colleagues come out to applaud: the closing scene shows the watch, how many red lights you ran, the tips you collected and the months you worked.
- During the mission **Auto** stops for red lights (and for an amber it cannot clear), so it never costs you a red light. On the ride home it does not stop.
- The mission is saved in the browser. The pause menu shows how far you have got and can start it again. *Free ride* is the game as before, with the postcards.

## In Chandler's Promise: the final level

The story game *Chandler's Promise* (`../Promise/`) ends with this game. It keeps a copy in `Promise/games/Cruiser/` and opens it in a frame as `GA-cruiser-th.html?story` (or `-en`). With `?story` the game:

- keeps its own save, under `tst-cruiser-story-v1`, so a ride on the site's own page and the story never mix;
- always starts in the mission (a mission left half done is picked up again; a finished or failed one starts afresh);
- drops the language and *The Siam Times* links under the title, so nobody leaves the story by accident;
- when the watch is brought home to The Siam Times, about three seconds after the mission card opens, posts `{ tst: 'story', game: 'cruiser', won: true, score, reds, worked, tips, text }` to the page around it (`storyDone` in `07-mission.js`). The story gives a gold frame to a ride with no red lights.

Opened any other way, nothing of this happens. The copy in `Promise/games/Cruiser/` is the same build, with its *The Siam Times* link pointing two folders up.

## Navigation

The **Route** button (top right, a map pin) turns on navigation the way a phone map does it. In the mission it leads to the next shop, or to The Siam Times when you need money and on the ride home; in free ride it leads to the nearest postcard you do not have yet.

- A green banner in place of the road sign shows the next turn: an arrow, how far, and the road you turn onto (for example "150 m · Turn left onto Rama I Rd"), then where you are going, the distance left and the time.
- The route is a blue line on the minimap and the pause map, with a red pin at the end.
- Blue arrows on the road show the next 150 m or so, pulsing forwards.
- Where the device has a voice for the game's language (Thai on an iPad has one), it says the turns: "in 100 metres, turn left…", then "turn left…" at the corner, and "you have arrived". With the sound off it says nothing.
- The route is the shortest way along the streets (the crossings form the graph). It is worked out again every second and a half, and straight away if you leave it. The pigeon on the ride home follows the same route.

## The city

Eleven blocks across and fourteen from north to south, roads 100 m apart, with the river along the west side: about 1.1 by 1.4 km. Traffic keeps left, as in Thailand, and stops at red lights. The lights answer you, like lights with a detector in the road: ride up to a red, or wait at it, and it turns green in about three seconds (the other road gets its amber first); ride up to a green and it stays green, up to 12 s longer, until you are through. The tuk-tuks say THAILAND along both sides and across the back of the canopy, and the buses carry an advertisement down both sides: The Siam Times, its masthead in Chomsky, with its line *All the news that’s nice to post*.

**Now and then something comes through with its lights going**, about every one to two minutes, starting on your road a couple of hundred metres off and coming your way:

- a police car (ตำรวจ POLICE, a red and blue light bar, a quick yelping siren) leading a motorcade of three black VIP saloons with amber lights flashing on the roof and behind the grille;
- or an ambulance (รถพยาบาล AMBULANCE along the sides, AMBULANCE backwards across the front for mirrors, red and blue lights, a rising and falling wail), going fast.

They do not stop for a red: the lights ahead of them turn green for them, the cars in front pull over to the left and slow down, and a message tells you to give way. The siren gets louder as it comes and moves from ear to ear as it passes. The road under you is shown on a blue Bangkok street sign, in Thai and English (in a soi, the soi's number), and the district's name appears as you enter it.

**Ride anywhere you fit.** Only solid things stop you: buildings, walls, fences, columns, lamp posts, trees, food carts, tents and the river railing. You can ride up the kerb onto the pavement (with a jolt, and a little speed lost), along the riverside promenade, through the sois that cut through most shophouse blocks from one road to the next, round the plazas between the towers, into the parks through their north and south gates, across Sanam Luang, into the temple courtyard by the Giant Swing and down the aisles of the night market.

**Over the river, under it, and up on a roof.**
- **Memorial Bridge** (สะพานพระพุทธยอดฟ้า) carries Na Phra Lan Road over the Chao Phraya from Maha Rat Road: a 260 m arched deck that rises about 8 m over the middle of the river, with railings, lamps and green steel arches over the middle span. The river boats pass underneath.
- **Arun Amarin Road** runs along the Thonburi bank from the far end of the bridge, past the white wall and the prangs of Wat Arun, to the tunnel. Its ends are closed with barriers.
- **The river tunnel** starts on the promenade at the end of Rama III Road. A walled ramp goes down into the river, and then a 130 m glass tube runs along the river bed, 7 m under the water. Giant catfish, iridescent sharks, tilapia, shoals of silver barbs and a few orange fish swim round the glass, there are rocks and weed on the sand and light comes down from the surface. The engine echoes in it. Another ramp brings you up on the Thonburi bank.
- **The car park** (on the block between Phaya Thai Road and Lumphini) has a ramp up from Rama IV Road, about 12% steep, to a landing and the roof, 7 m up: parking bays, a few cars and parapets round the edge. From the south side of the roof a **narrow bridge**, two metres wide and with no railings, slopes down to the street. Ride off its side, or off anything else high, and the bike falls and lands with a thump (and some speed lost). Under the high end of the narrow bridge you can ride beneath it.
- On a ramp the bike slows going up and speeds up coming down, and with the brake off it rolls back down. If you somehow end up in the river, you are put back on the nearer bank.

**Grass and water.** On the grass of Sanam Luang and the two parks the tyres throw up clippings and earth (more with the throttle open or the bars turned) and leave dark tracks that stay behind you, so you can draw circles and figures of eight on the field. Grass slows the bike a little and the brakes bite less. The lakes in Lumphini and Benchakitti parks are shallow enough to ride through: the bike drops in with a splash, water sprays out to both sides of the wheels, a bow wave and ripples spread behind, the engine note is joined by the hiss and slosh of water, and it slows to a wade in the deep middle (about 15–20 km/h). Coming out, the tyres leave wet tracks for a few seconds. The pause menu has a map of the whole city with your position and the places still to visit.

North of Ratchadamnoen is the rest of the old town: the Grand Palace by the river, Sanam Luang beside it, Khao San Road with its English neon and festoon lights, and the Golden Mount on its wooded hill. Sukhumvit carries on east, with the Skytrain and four stations, Benchakitti Park and On Nut beyond. The Skytrain stands on frames, a column at each kerb and a beam across the road under the track, so nothing stands in the road and there is no median: cross Sukhumvit, or turn round, wherever you like. To the south are Rama III and a big wheel on the riverbank.

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
| Memorial Bridge | On the bridge, over the middle of the river |
| The River Tunnel | In the glass tube under the river |
| Rooftop Car Park | On the roof of the car park |

The postcard has a stamp with the S of The Siam Times in Chomsky. Each place has a faint golden beam over it until you have been there, and a dot on both maps. The roads are named after real Bangkok roads and the districts are in roughly the right relation to each other, but the city is a condensed sketch, not a map.

## The bike

The **Chandler 1864** is a made-up cruiser (named after John Hassett Chandler, who founded The Siam Times in 1864): a 1,868 cc air-cooled V-twin with finned cylinders, chrome rocker covers, a round air cleaner, staggered twin mufflers, a teardrop tank, laced wheels, wide pull-back bars and a solo seat. It carries a Thai motorcycle plate (3ขษ · กรุงเทพมหานคร · 988), tilted up a little towards the chase camera and lit at night by a plate lamp. It is not a model of any real motorcycle and carries no maker's name or badge.

## How it works

- **Graphics:** three.js with physically based materials, a clear-coat paint shader and chrome that reflects an environment map made from the sky (and, at night, from a ring of lit panels standing in for the city). The sky is a scattering model by day and at golden hour, and a gradient dome with stars and the moon at dusk and at night. Bloom, a colour grade and a vignette are applied after rendering. The sun casts shadows in a box that follows the bike.
- **The city** is generated at load time from a fixed seed, so it is the same on every visit. All textures are drawn on canvases at start-up (asphalt, paving, red-and-white kerbs, four styles of shophouse front with their lit windows, glass and concrete towers, mall fronts, 32 Thai shop signs, Chinese neon, the plate, the tank lettering); there are no image files. The city is cut into 300 m chunks; in each, the buildings, street furniture and lamps are merged into one mesh per material, and only the chunks within about 500 m of the camera are drawn (640 m on High, 380 m on Saver). Each chunk casts its shadow from one merged, position-only stand-in, switched on only while the shadow map is drawn; so do the bike and rider. Vehicles, traffic-light lamps, the landmark beams and the wheel's cabins are instanced. That keeps it to roughly 170 to 190 draw calls a frame.
- **Collisions:** every solid thing is a box or a circle, filed in a grid of 16 m cells so the bike only tests what is near it. A collider can have a height range, so a roof's parapet stops you on the roof but not in the street below, and the building under it stops you in the street but not on the roof.
- **Levels:** the bridge, the tunnel ramps and tube, the car-park ramp, landing and roof, and the narrow bridge are *decks*: strips or rectangles with a height (a function along the strip). The bike stands on the highest surface it can reach from its own height (a step up of at most 45 cm, so a kerb but not a wall), which is how you can ride under the high end of the narrow bridge but onto its low end. Off an edge it falls under gravity; the ground's slope under the two wheels gives the bike's pitch and a pull along the slope. The ground is a kerb higher wherever there is pavement, and the surface under the wheels (road, pavement, grass or water, with its depth) decides the grip, the drag, the sounds and the effects.
- **Physics:** an arcade model with real-world numbers. Six gears (top speeds 45, 75, 105, 135, 160 and 185 km/h at a 5,800 rpm red line), a torque curve that peaks low, aerodynamic drag, engine braking and an automatic box. Below about 3 km/h the turn comes from the steering geometry (a 1.62 m wheelbase and up to 40° of lock); from 3 to 9 km/h that blends into a lean model where the yaw rate is g·tan(lean)/v, and the lock tapers off as speed rises. Lean grows with speed up to 46°. Stopped, the box drops into neutral, where the throttle revs the engine freely (it spins up fast and dies away slowly) and drives nothing. Buildings and kerbs are boxes, pillars are circles, and vehicles are oriented boxes.
- **Traffic:** about sixty cars, taxis, tuk-tuks, buses, pick-ups and scooters drive on lanes between crossings, keep left, choose a way at each crossing, follow the vehicle in front and stop for red. Any that fall more than about 420 m behind come back on a road 160 to 360 m from you, out of sight, so the streets round you stay busy. Each crossing cycles 11 s green, 2 s amber for one road, then the other, except that the crossing ahead of you, within 55 m, answers you (`riderSignals`): a red skips on to the last second of the other road's green, and a green with less than 2.5 s left holds, for up to 12 s. The words on the tuk-tuks and buses are textured planes drawn as instances alongside the vehicles (`vehicleDecals`). The motorcade and the ambulance are in `05-y-emergency.js`: they join the traffic only while they are out; the saloons follow the police car's own track, laid down as it drives, so they take every turn it takes; the crossing ahead turns green for them (`forceGreen`); cars with one behind them pull over (`sirenBehind`); the sirens are Web Audio oscillators swept by a slow or fast LFO, with distance and stereo pan.
- **Steering assist:** the route is a list of points along the left lane to the next crossing, a curve through it (moving out towards the middle of the road first when turning, so the arc clears both kerbs) and on along the next road; the bike follows it by pure pursuit, turning the curvature it needs into a lean and then into bar input. It picks each turn by the shortest way round the grid to the nearest postcard still to collect, brakes for the tightest bend ahead (about 3 m/s² sideways) and keeps its distance from vehicles in front. In a simulated three minutes with the throttle held open it rides about 2 km and collects five postcards.
- **Sound,** all made in the browser with Web Audio; there are no sound files. Each engine is a firing pattern over one 720° cycle. The 45° V-twin on one crank pin fires 315° and then 405° of crank rotation apart; that uneven gap is the loping beat. The single fires once every 720°, the parallel twin 270° then 450°, the inline four every 180°, and the V8 every 90° with its two banks firing in the cross-plane order, panned left and right. Every firing is a short exhaust pulse (a falling low thump, a pipe resonance and a bark), scheduled ahead on the audio clock, then a soft clipper, EQ that keeps most of the energy between 150 and 600 Hz so it carries on small speakers, and a low-pass filter that opens with the throttle and the revs. Off the throttle at speed it burbles and pops; it bounces off the rev limiter; it idles unevenly. Each engine has its own pulse shape, filters, idle and red line; the loud pipes are brighter, louder and pop more, and the straight pipes rawer still, with weak firings mixed in at idle. The electric motor is a motor tone with its harmonics and an inverter whine, rising with the revs. Around it: intake roar, gear whine, wind and tyre noise that grow with speed, passing traffic and tuk-tuk two-strokes panned to where they are, the Skytrain's rumble and brake squeal, the river, temple bells near the temple, birds by day and crickets by night in the park, horns in the distance, and a street-canyon echo that changes from district to district (strongest under the Skytrain, and stronger still in the river tunnel).
- **Under the water:** the water round the tube is a box drawn from inside, shaded from light green at the top to dark at the bottom, which also hides the city beyond it. The fish, sand, rocks and weed fade into the colour of the water with distance (a few lines added to three.js's Lambert shader), and the fish are one instanced mesh whose tails wave in the vertex shader. The tube's road and ribs are unlit materials and a closed shadow box sits round the tube, so the sun never shines in, at any time of day or graphics level.
- **The mission** keeps its state in the saved settings. Which part a shop plays is decided by the order you find the shops in, so every route meets every situation. A red light is counted when the bike rides into a crossing from the road (not from the pavement, nor within a second of leaving it) along an axis whose light is red at that moment, using the same clock that drives the traffic lights. The other riders are an instanced mesh of their own (blouses in the instance colour, long hair), and the left arm of the rider who waves is swapped for a single animated arm. Cut scenes are HTML cards over a slow camera move, with letterbox bars.
- **Grass and water effects:** clippings and drops are point sprites (pools of 600 and 1,000) thrown from the tyres' contact patches with gravity and drag; drops vanish when they fall back into the water, clippings settle on the grass. Tyre tracks are a ring buffer of 1,600 thin quads laid every 30 cm under each wheel; ripples are fading rings; the bow wave is a foam texture that follows the bike in the water and grows with speed. All of it is tinted for the time of day.
- **Graphics level:** *Auto* starts at Medium and drops to Saver if the game runs below about 36 frames a second (or rises to High on a fast iPad). High uses soft 2048 px shadows and up to 1.75× pixel density; Medium 1024 px shadows at 1.3×; Saver turns off shadows and bloom and draws at 1×.
- Settings, the postcards collected, the distance ridden and the top speed are kept in the browser's local storage under `tst-cruiser-v1` (`tst-cruiser-story-v1` inside Chandler's Promise).

Adding `?debug` to the address exposes the game's state as `window.__cruiser`, for testing.

## Keeping the two versions the same

The `<script type="module">` in the two files is identical, with every word of the game in both languages; each page takes its language from `data-lang` on `#game`. The HTML differs only in its language: the `lang` attributes, the title, the description and the link to the other version. When you change the game, make the same change in both files, then check that the scripts still match:

```bash
diff <(sed -n '/<script type="module">/,$p' GA-cruiser-th.html) <(sed -n '/<script type="module">/,$p' GA-cruiser-en.html) && echo same
```

## Font

The masthead, the speedometer and the tank lettering use **Chomsky** by Fredrick R. Brennan, under the SIL Open Font License 1.1 (`Chomsky-LICENSE.txt`, which must stay with the game). The page embeds the same Latin-only WOFF2 subset of `Chomsky.otf` as `Darts/GA-darts.html`; see `Darts/README.md` for how to rebuild it.
