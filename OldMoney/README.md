# Old Money Atelier – web game

A dress-up game in the "old money" quiet-luxury style. Choose a lady or a gentleman, dress them in cashmere, tweed, silk and pearls for six society invitations, and The Siam Times style desk scores the look. All text in the game is in English.

Everything is in `GA-oldmoney.html`. There is no build step: open the file in a browser. On the site it is at https://thesiamtimes.com/OldMoney/GA-oldmoney.html. It works offline; only the Newsreader text font comes from Google Fonts, and the page falls back to Georgia without it.

## Playing

- **Lady / Gentleman** (top of the page) switches between the two models. Each keeps their own outfit, so you can switch back and forth.
- **Couple view** (on by default) shows the gentleman and the lady side by side, as in a country-house portrait. The one you are dressing stands in front with a brass ring at their feet; tap the other to dress them instead. **Valet's pick** dresses both, and **Present the look** judges the one you are dressing. Turn Couple view off to see one model, larger.
- **Wardrobe tabs**: Model (skin tone, hairstyles, hair colour including salt and pepper, eye colour, lipstick for the lady, and clean-shaven, stubble or a short beard for the gentleman), Tops, Dresses, Bottoms, Outerwear, Shoes and Accessories. Blazers and overcoats are named Brass-button blazer and Wool overcoat because they come in several colours. Country-house pieces include, for the gentleman, a tattersall shirt, a silk tie, a six-button waistcoat, chinos and flannels with turn-ups, Oxford brogues and a walking cane; and for the lady, a check hacking jacket, a tartan midi skirt, a tucked cashmere turtleneck, a gold brooch and a coiffed bob. The gentleman has no Dresses tab. His wardrobe includes black tie (evening shirt and bow tie, evening trousers, dinner jacket, patent oxfords), a repp tie, pocket square, signet ring, flat cap and Panama hat. Loafers, riding boots, boat shoes, plimsolls, sunglasses and the trap pieces are shared. Tap a piece to put it on, and tap it again to take it off. The colour swatches above the grid recolour the selected piece.
- A dress replaces the top and bottom. Shirts and blouses are tucked in; knits and the Breton top sit over the waistband.
- **The Season**: six invitations: polo, regatta, country weekend, garden party, club tennis and the opera. Each has its own scene. **Present the look** gives one to five stars. Your best result for each invitation is saved.
- **Free styling**: choose any of seven scenes. **Ask the style desk** tells you which invitation your look suits best.
- **Valet's pick** dresses the model for the current occasion. **Save look** adds it to the **Lookbook** (up to 24 looks). **Download portrait** saves a PNG of the model in the scene.
- **Watches** (in Accessories), one at a time; choosing another replaces the one you wear. Each wrist watch fits either model and is drawn on the right wrist:

| Watch | Colours | Right for |
|---|---|---|
| Round dress watch | gold, silver case on leather | any occasion; best at the garden party and the opera |
| Rectangular dress watch | gold, silver case on leather | any occasion; best at the polo, the garden party and the opera |
| Bracelet watch | gold, silver | polo, garden party, opera |
| Steel sports watch | navy, black, bottle-green dial | regatta, tennis, polo, country |
| Diver's watch | navy, black, bottle-green bezel | regatta |
| Field watch | olive, navy, chocolate canvas strap | country, polo |
| Pocket watch (gentleman) | gold, silver chain across the waistcoat | country, garden party, opera |
| Iced-out watch | gold, set with diamonds | nowhere: a trap that costs quietness points |

- The **Quiet luxury** meter updates live as you dress.
- **Style guide** (top of the page) is a stylist with three sections:
  - **For this look**: the few changes that would most improve the current look for the chosen invitation, each with its reason and the points it adds. **Apply** makes the change. The stylist tries every swap, colour change, accessory and hairstyle it could suggest and scores each one with the style desk's own rules, so its advice always raises the score. The same advice appears under **How to improve** on the style desk's verdict.
  - **Dress code**: the key pieces for the lady and the gentleman at each invitation, with a point of etiquette. Tap a piece to put it on in the colour that scores best.
  - **The rules**: ten rules of quiet luxury that also hold off the screen (fit, neutrals, cloth, no logos, three accessories, dressing for the place, care, buying less and better, grooming, ease).
- **Kingsmere Hall** (the country invitation) is an English country house in autumn: an old oak, ivy on red brick, a gravel sweep with fallen leaves and a vintage saloon on the forecourt.
- The stage has an oil-on-canvas finish: brush streaks, canvas weave and a soft vignette laid over the scene in soft-light, also carried into the downloaded portrait.
- Every scene has a **The Siam Times** sign in Chomsky beside the model: a hanging plaque in the atelier, a pitch-side board at the polo, a dock sign at the harbour, an oak estate sign in the country, a stone plaque on the quad, a club board on the tennis windscreen, and a gilt easel at the opera.

## Scoring (out of 100)

| Part | Points | What counts |
|---|---|---|
| A complete outfit | 15 | A dress, or a top with a bottom (10), and shoes (5) |
| Right for the occasion | 40 | Each piece is tagged with the occasions it suits; accessories and hair count half. Accessories that suit any occasion (a watch, pearl studs, a belt) never count against the occasion score. Club tennis needs whites. The opera needs a gown and hair up for the lady, and black tie for the gentleman |
| Quietness | 30 | Logo or trap pieces (hoodie, chunky trainers, logo belt bag, chain stack) cost heavily, as do more than three accessories, more than two accent colours, and loud colours |
| Palette | 15 | Share of neutral colours (navy, cream, camel, white, charcoal and similar) |

90 or more is five stars (Generational Wealth); 78 is four, 62 three and 45 two.

Saved looks, the current outfit, the mode and your best results are kept in the browser's local storage.

## How it works

- The two models and every garment are inline SVG in a 400 × 820 box. Each garment is drawn from point lists that are smoothed into Bézier curves and mirrored for the two sides. Fabrics such as cable knit, herringbone tweed, quilting, corduroy, Breton stripes, florals and silk sheen are SVG patterns made for the chosen colour.
- **Proportions** are close to life: the models stand about 7.5 heads tall, with shoulders about 1.75 head heights across for the lady and 1.9 for the gentleman. Every piece is drawn on a slim fashion-plate figure, and at render time one mapping scales the head (with hair, hats, glasses and earrings) evenly while another widens the body and everything worn on it, so all the clothes keep fitting. Buttons, pearls, watch faces, lettering and fabric patterns are counter-scaled so they stay round and undistorted, and feet and shoes are narrowed about each foot. The head is drawn above the clothes, so collars and roll necks tuck under the chin.
- For a more lifelike look, every skin and garment shape gets a rounded light-and-shade gradient, and every garment layer casts a soft drop shadow on the layers under it. Faces have shaded eyelids, irises with a catchlight, a shaded nose, two-tone lips and soft cheek contours. Hands have a thumb and fingers, legs have knees and ankles, and hair is shaded from crown to ends.
- Each piece is marked for the lady, the gentleman or both (`who`), and has a layer number, so tucked shirts sit under trousers and boots sit over them.
- The scenes are drawn wider than the figure, so wide screens show more of them.
- The result chime uses Web Audio; there are no sound files.

## Font

The masthead and the scene signs use **Chomsky** by Fredrick R. Brennan, under the SIL Open Font License 1.1 (`Chomsky-LICENSE.txt`, which must stay with the game). The page embeds the same Latin-only WOFF2 subset as `Darts/GA-darts.html`; see `Darts/README.md` for how to rebuild it. The downloaded portrait carries the same font inside its SVG, so the sign keeps its lettering in the PNG.
