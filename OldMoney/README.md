# Old Money Atelier – web game

A dress-up game in the "old money" quiet-luxury style. Dress a model in cashmere, tweed, silk and pearls for six society invitations, and The Siam Times style desk scores the look. All text in the game is in English.

Everything is in `GA-oldmoney.html`. There is no build step: open the file in a browser. On the site it is at https://thesiamtimes.com/OldMoney/GA-oldmoney.html. It works offline; only the Newsreader text font comes from Google Fonts, and the page falls back to Georgia without it.

## Playing

- **Wardrobe tabs**: Model (skin tone, four hairstyles, hair colour, lipstick), Tops, Dresses, Bottoms, Outerwear, Shoes and Accessories. Tap a piece to put it on, and tap it again to take it off. The colour swatches above the grid recolour the selected piece.
- A dress replaces the top and bottom. Shirts and blouses are tucked in; knits and the Breton top sit over the waistband.
- **The Season**: six invitations: polo, regatta, country weekend, garden party, club tennis and the opera. Each has its own scene. **Present the look** gives one to five stars. Your best result for each invitation is saved.
- **Free styling**: choose any of seven scenes. **Ask the style desk** tells you which invitation your look suits best.
- **Valet's pick** dresses the model for the current occasion. **Save look** adds it to the **Lookbook** (up to 24 looks). **Download portrait** saves a PNG of the model in the scene.
- The **Quiet luxury** meter updates live as you dress.

## Scoring (out of 100)

| Part | Points | What counts |
|---|---|---|
| A complete outfit | 15 | A dress, or a top with a bottom (10), and shoes (5) |
| Right for the occasion | 40 | Each piece is tagged with the occasions it suits; accessories and hair count half. Club tennis needs whites, and the opera needs a gown and hair up |
| Quietness | 30 | Logo or trap pieces (hoodie, chunky trainers, logo belt bag, chain stack) cost heavily, as do more than three accessories, more than two accent colours, and loud colours |
| Palette | 15 | Share of neutral colours (navy, cream, camel, white, charcoal and similar) |

90 or more is five stars (Generational Wealth); 78 is four, 62 three and 45 two.

Saved looks, the current outfit, the mode and your best results are kept in the browser's local storage.

## How it works

- The model and every garment are inline SVG in a 400 × 820 box. Each garment is drawn from point lists that are smoothed into Bézier curves and mirrored for the two sides. Fabrics such as cable knit, herringbone tweed, quilting, corduroy, Breton stripes, florals and silk sheen are SVG patterns made for the chosen colour.
- Each piece has a layer number, so tucked shirts sit under trousers and boots sit over them.
- The scenes are drawn wider than the figure, so wide screens show more of them.
- The result chime uses Web Audio; there are no sound files.

## Font

The masthead uses **Chomsky** by Fredrick R. Brennan, under the SIL Open Font License 1.1 (`Chomsky-LICENSE.txt`, which must stay with the game). The page embeds the same Latin-only WOFF2 subset as `Darts/GA-darts.html`; see `Darts/README.md` for how to rebuild it.
