# Chandler’s Promise (สัญญาของแชนด์เลอร์) – story game

A story game that takes the player through every Siam Times game in one night, in Thai and in English. In December 1865 John Hassett Chandler stopped the press of The Siam Times and hoped to come back; he never did. Tonight, the night before the Return Edition goes to press, the new night-shift apprentice finds his teak type case in the basement, with twelve empty compartments for the masthead: T H E S I A M T I M E S. The sorts are scattered through the building, and each one has to be won back by playing a game, in story order, before the presses roll at six.

There is a Thai version and an English version, each a whole page in one HTML file. There is no build step: open either file in a browser. They link to each other and share the same progress.

| Version | File | On the site |
|---|---|---|
| Thai (ภาษาไทย) | `GA-promise-th.html` | https://thesiamtimes.com/Promise/GA-promise-th.html |
| English | `GA-promise-en.html` | https://thesiamtimes.com/Promise/GA-promise-en.html |

Only the Newsreader and Sarabun text fonts come from Google Fonts. The games are loaded from their own folders on the site (`../Darts/GA-darts.html` and so on), so the story needs the whole site next to it, served or on disk.

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
| 2 | H | 19:45 | The Editor's office | Wastebasket | clearing every level |
| 3 | E | 20:30 | The back room | Darts | 400 points in Score Attack, or a leg in 40 darts or fewer |
| 4 | S | 21:15 | The back room, the far table | Slingshot (5 rounds) | 2,000 points |
| 5 | I | 22:00 | The back room, the range | BB Gun (7 rounds) | 3,500 points |
| 6 | A | 22:45 | The style desk, with Madame Lamduan | Old Money Atelier | 4 or 5 stars |
| 7 | M | 23:30 | The staff canteen, against the Editor | Checkers | a win |
| 8 | T | 00:15 | The Editor's teak table | Makruk | a win |
| 9 | I | 01:00 | The basement snooker room | Snooker | winning the frame |
| 10 | M | 02:00 | The pétanque court behind the building | Pétanque | a win |
| 11 | E | 05:15 | The top-floor window at first light, with Thongdee the pressman | Paper Plane | winning the contest |
| 12 | S | 05:45 | The press hall | Chandler's hand press (in this page) | inking right first time, at most one mistimed pull |
| — | | 06:00 | The press hall, the landing stage at sunrise | Epilogue | |

**The hand press** (chapter 12) is played in the story page itself. The sorts are set in the forme; hold *Hold to ink* (or Space) and let go while the needle is in the brass band (too little ink prints pale, too much smudges); then press *Pull the bar!* (or Space) while the swinging weight is in the brass band, the middle 28 % of its swing. Three good sheets finish it. The weight swings a little faster after each sheet.

Progress (the sort won in each chapter, whether the prologue and ending have been seen, where the apprentice stands on the map, the sound setting) is kept in the browser's local storage under `tst-promise-v1`. *Start over* on the contents page clears it.

## How the games report back

Each game, when it is running in a frame, posts one message to the page around it when a game ends:

```js
window.parent.postMessage({ tst: 'story', game: 'darts', won: true, score: 512, text: '512 points' }, '*');
```

It is sent by a small function, `storyDone`, defined just above the function that ends a game, and does nothing when the game is opened on its own. The story page accepts the message only from its own frame and only for the chapter being played.

| Game | Reported from | Fields |
|---|---|---|
| Reverse Parking | `finish` (a vehicle parked) | `won`, `score`, `stars`, `stage` |
| Wastebasket | `finishGame` | `won` (all levels cleared), `score` |
| Darts | the end of Score Attack, and a checkout in 501 | `won`, `score`, `text` (`… points` or `… darts`) |
| Slingshot | `endRound`, after the fifth round | `won`, `score` |
| BB Gun | `endRound`, after the seventh round | `won`, `score` |
| Old Money Atelier | `showResult` (a look scored) | `won`, `score`, `stars` |
| Checkers | `endGame` | `won`, `draw` |
| Makruk | `gameOver` | `won`, `draw`, `text` |
| Snooker | `frameOver` | `won`, `score` |
| Pétanque | `finishEnd`, when a side reaches 13 | `won`, `score` |
| Paper Plane | `finishContest` | `won`, `score` (your best distance) |

When you change one of these games, keep the `storyDone(…)` call where the game ends.

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
