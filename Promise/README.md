# Chandler’s Promise (สัญญาของแชนด์เลอร์) – story game

A story game that takes the player through every Siam Times game in one night and the day after, in Thai and in English. In December 1865 John Hassett Chandler stopped the press of The Siam Times and hoped to come back; he never did. Tonight, the night before the Return Edition goes to press, the new night-shift apprentice finds his teak type case in the basement, with twelve empty compartments for the masthead: T H E S I A M T I M E S. The sorts are scattered through the building, and each one has to be won back by playing a game, in story order. The last one is not in the building at all: it is at an old bookshop by Victory Monument, and has to be fetched by road before the evening edition.

**Version 1.1.** There is a Thai version and an English version, each a whole page in one HTML file. There is no build step: open either file in a browser. They link to each other and share the same progress. The game is not linked from the front page of the site yet.

| Version | File | On the site |
|---|---|---|
| Start here (picks Thai, or English for a browser set to another language) | `index.html` | https://thesiamtimes.com/Promise/ |
| Thai (ภาษาไทย) | `GA-promise-th.html` | https://thesiamtimes.com/Promise/GA-promise-th.html |
| English | `GA-promise-en.html` | https://thesiamtimes.com/Promise/GA-promise-en.html |

## One folder, whole game

Everything the story needs is inside this folder, so the folder can be copied anywhere (another site, a USB stick, a laptop) and played as it is:

```
Promise/
├── index.html              opens the story in Thai or English
├── GA-promise-th.html      the story, in Thai
├── GA-promise-en.html      the story, in English
├── Chomsky-LICENSE.txt
├── README.md
└── games/                  the twelve games of the story
    ├── Fav48.png
    ├── Parking/  Wastebasket/  Darts/  Slingshot/  BBGun/  OldMoney/
    ├── Checkers/  Makruk/  Snooker/  Petanque/  PaperPlane/
    └── Delivery/           Paper Run, the driving game made for chapter 12
```

Eleven of the games in `games/` are copies of the site's games with two changes each: a `storyDone` call where a game ends (see *How the games report back*) and the no-zoom guard (see *No zooming*); and, in Old Money, the logo links to this folder's `index.html` instead of the site's front page. The games on the rest of the site are not changed and do not report anything. `Delivery/` (Paper Run) exists only here; it has its own README. Only the Newsreader and Sarabun text fonts come from Google Fonts; without a connection the pages fall back to system fonts. Open the pages from a web server, or straight from disk in a browser that allows a page to show the files next to it in a frame (Chrome, Edge, Firefox and Safari all do).

**When a game is updated on the site**, copy its new file(s) over the one in `games/<Game>/` and put the `storyDone` function and call back in, in the places listed in the table below, and the no-zoom viewport and script (and, for Old Money, the logo link). Until then the story keeps playing the older copy.

## How it plays

- **Title**: the building on the Chao Phraya in the rain (at sunrise, once the story is finished). *Begin the story* plays the prologue; afterwards the button reads *Open the map*.
- **Game map** (แผนที่): the hub of the story. The Siam Times building is drawn cut open like a doll's house, floor by floor: the archive and the snooker room in the basement; the car park and the press hall on the ground floor; the back room and the canteen on the 1st floor; the Editor's office and the teak table room on the 2nd; the style desk on the 3rd; the top-floor window on the roof. The pétanque court is out at the back and the landing stage on the river. Every chapter is a numbered badge in its room, showing its sort (lead, brass, or an outline still to win; a padlock while locked). A path joins the badges in story order through the stairwell; the part already walked is brass. A room lights up, with a glimpse of what is in it, once its chapter opens. The apprentice, with a lantern, stands at the next chapter, and after each chapter walks there along the path, with footsteps. The sky follows the night: rain, then dawn for the last two chapters, then sunrise. Tap a badge for its card: chapter, time, place, game and goal, with *Play this chapter*, or *Play the game again* and *Watch* once it is done; the card says which chapter to finish first for a locked one. The bar at the top shows the time of the next chapter, the composing stick in small, and links to the contents page and the title. On a narrow screen the map scrolls sideways and the card sits under it.
- **Cut scenes**: painted scenes, 1864–65 in sepia like an engraving and tonight in the dark blues and lamp light of the games, with a slow camera move, rain, steam, swinging lamps and so on. The words type themselves out under the picture with the speaker's name and a dateline (time and place). Tap the caption (or press Space, Enter or →) to show the whole line, tap again to go on; *Skip* (or Escape) ends the scene. Each chapter opens with a title card that shows its sort.
- **A game**: the game opens in a frame under a bar with the chapter, the goal and *← Map*. When the game reports that a game has ended, the sort is won: a card shows it, and *Continue* plays the chapter's closing scene and returns to the map, where the apprentice walks on to the next room. *Stay in this game* keeps playing; leaving with *← Map* then plays the closing scene. After the last chapter the ending follows at once.
- **Contents**: a newsprint front page with the masthead, the composing stick with the sorts won so far, the button for the next chapter, and every chapter with its time, place and game, with the same play, replay and watch buttons. It links back to the map.

Chapters open strictly in order: a chapter's game has to be played to the end before the next one opens. Finishing earns a **lead** sort; winning, or playing well, earns a **brass** one.

## The chapters

| # | Sort | Time | Place | Game | Brass for |
|---|---|---|---|---|---|
| — | | 1864–65, then 18:40 | The press house on the river, Chandler's desk, the building, the basement archive | Prologue | |
| 1 | T | 19:00 | Ground-floor car park, with Uncle Choed the night watchman | Reverse Parking | 2 or 3 stars |
| 2 | H | 19:45 | The Editor's office | Wastebasket | clearing every level, on Normal (Easy, the wide basket, earns lead) |
| 3 | E | 20:30 | The back room | Darts | 400 points in Score Attack, or a leg in 40 darts or fewer |
| 4 | S | 21:15 | The back room, the far table | Slingshot (5 rounds) | 2,000 points |
| 5 | I | 22:00 | The back room, the range | BB Gun (7 rounds) | 3,500 points |
| 6 | A | 22:45 | The style desk, with Madame Lamduan | Old Money Atelier | 4 or 5 stars |
| 7 | M | 23:30 | The staff canteen, against the Editor | Checkers | a win |
| 8 | T | 00:15 | The Editor's teak table | Makruk | a win |
| 9 | I | 01:00 | The basement snooker room | Snooker | winning the frame |
| 10 | M | 02:00 | The pétanque court behind the building | Pétanque | a win |
| 11 | E | 05:15 | The top-floor window at first light, with Thongdee the pressman | Paper Plane | winning the contest |
| 12 | S | 15:00 | Outside the building, then the road to Victory Monument and back | Paper Run (`games/Delivery/`) | back by 17:30 with at most two tickets, in normal mode |
| — | | evening | The press hall, the landing stage at sunset | Epilogue | |

**Paper Run** (chapter 12) is a driving game in its own right, in `games/Delivery/` (see its README). From the driver's seat of the press's right-hand-drive manual pickup, with a wheel, clutch, brake, accelerator and gear lever, the player drives from the building on Charoen Nakhon over Taksin Bridge, along Sathorn, Witthayu, Phloen Chit, Ratchadamri, Ratchaprarop, Rang Nam and Phaya Thai to the bookshops at Victory Monument, and back the same way. The way is lined with lights, zebra crossings, speed limits, traffic, rain, a flood, nails, a fuel stop and a bus-only lane with the police at the end of it. Back by 17:30 with at most two tickets earns the brass S. Paper Run also has an easy mode (an empty road with only oncoming traffic, green lights all the way, no speed limits and no hazards); finishing in it earns the lead S, and the brass one needs normal mode.

## Version 1.1

- Chapter 12 is now Paper Run, the delivery game, instead of the hand press played in the page; its story is new (the morning run used a wooden S; the real one waits at a bookshop by Victory Monument), with two new painted scenes, the pickup outside the building and the monument at golden hour.
- The ending moves to the evening: the evening edition is printed with the whole masthead and goes out on the last boat of the day.
- The map shows an afternoon sky for chapter 12 and an evening one after the ending. Sorts already won, including an S won at the old hand press, are kept.

## No zooming

On a phone or tablet, a pinch or a double tap used to zoom the page, which left the game half off the screen with its buttons out of reach, and the game seemed stuck. Every page in this folder (the story, Paper Run and the eleven copies) now keeps itself at its own size:

- the viewport is `width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover`;
- a small script just before `</body>`, which starts `/* No zooming: a pinch`, cancels Safari's pinch (`gesturestart`/`gesturechange`/`gestureend`), a second finger landing and a move with two fingers or more, the double tap (`dblclick`), Ctrl + mouse wheel and Ctrl/⌘ with + − = 0, and sets `touch-action: manipulation` on the page.

Safari on iPhone and iPad lets people zoom whatever a page asks, so the pages also cope when it happens anyway. While the page is zoomed in (the visual viewport's scale is above 1), the script blocks nothing, so it can be pinched back out, and a red note in the middle of the screen says how. A game in the story's frame looks at the story page's zoom, and only the story page shows the note.

The games still get every finger: the driving game's wheel and pedals are held with two or three at once, and those touches reach the game as pointer events as before. A browser's own zoom setting (in its menu or accessibility settings) still works; a page cannot and should not override that.

Progress (the sort won in each chapter, whether the prologue and ending have been seen, where the apprentice stands on the map, the sound setting) is kept in the browser's local storage under `tst-promise-v1`. *Start over* on the contents page clears it.

## How the games report back

Each game in `games/`, when it is running in a frame, posts one message to the page around it when a game ends:

```js
window.parent.postMessage({ tst: 'story', game: 'darts', won: true, score: 512, text: '512 points' }, '*');
```

It is sent by a small function, `storyDone`, defined just above the function that ends a game, and does nothing when the game is opened on its own. The story page accepts the message only from its own frame and only for the chapter being played.

| Game | Reported from | Fields |
|---|---|---|
| Reverse Parking | `finish` (a vehicle parked) | `won`, `score`, `stars`, `stage` |
| Wastebasket | `finishGame` | `won` (all levels cleared), `score`, `easy` (the wide basket: never brass) |
| Darts | the end of Score Attack, and a checkout in 501 | `won`, `score`, `text` (`… points` or `… darts`) |
| Slingshot | `endRound`, after the fifth round | `won`, `score` |
| BB Gun | `endRound`, after the seventh round | `won`, `score` |
| Old Money Atelier | `showResult` (a look scored) | `won`, `score`, `stars` |
| Checkers | `endGame` | `won`, `draw` |
| Makruk | `gameOver` | `won`, `draw`, `text` |
| Snooker | `frameOver` | `won`, `score` |
| Pétanque | `finishEnd`, when a side reaches 13 | `won`, `score` |
| Paper Plane | `finishContest` | `won`, `score` (your best distance) |
| Paper Run | `finish` (back at the building) | `won` (on time, at most two tickets), `score` (minutes to spare), `text` (arrival time), `onTime`, `violations`, `easy` (easy mode: never brass) |

When you change one of the copies, keep the `storyDone(…)` call where the game ends. The `storyDone` function itself is three lines, defined just above the function named in the table, with the game's key (`'parking'`, `'darts'` and so on) written in it.

## How it works

- The map is painted on a canvas on the same 1600 × 1000 picture, scaled to fit (or to a readable height, scrolling sideways, on a phone); the badges are buttons laid over it, so they can be reached by keyboard and read by screen readers.
- The scenes are painted on a canvas every frame, on a 1600 × 900 picture scaled to cover the screen and moved by a camera that drifts towards each line's point of interest. The archive scene shows the sorts already won in Chandler's case.
- Sounds are made with Web Audio; there are no sound files: rain on the windows, the river with birds, crickets in the courtyard, room hum, a ticking clock, the canteen fridge, thunder with the lightning over the building, type ticks as the words appear, a clink for each sort (higher for brass), the thump of the press, and a soft pentatonic theme on a mallet voice for the title and contents.
- The cut-scene words come from the `STR` table, line for line with the `CH`, `PROLOGUE` and `EPILOGUE` scripts, which give each line its scene, speaker and camera.

## Keeping the two versions the same

The `<script>` in the two files is identical, with every word in both languages; each page takes its language from its own `<html lang>`. The HTML differs only in its language: the `lang` attribute, the title, the description and the links to the other version. When you change the story, make the same change in both files, then check that the scripts still match:

```bash
diff <(sed -n '/<script>/,$p' GA-promise-th.html) <(sed -n '/<script>/,$p' GA-promise-en.html) && echo same
```

## Font

The masthead, the signs and the sorts use **Chomsky** by Fredrick R. Brennan, under the SIL Open Font License 1.1 (`Chomsky-LICENSE.txt`, which must stay with the game). The page embeds the same Latin-only WOFF2 subset of `Chomsky.otf` as `Darts/GA-darts.html`; see `Darts/README.md` for how to rebuild it.
