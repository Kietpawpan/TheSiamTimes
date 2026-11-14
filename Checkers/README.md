# Siam Times Checkers (หมากฮอส) – web game

Thai checkers played with beer bottle caps, seen from straight above. Green and red crown caps stand on a maple-and-walnut board with a rosewood frame, and the board lies on a teak table. **The Siam Times** is inlaid in gold, in Chomsky, along the top rail of the frame. The game is in Thai, with an English switch (EN / ไทย) in the header.

Everything is in `GA-checkers.html`. There is no build step: open the file in a browser. On the site it is at https://thesiamtimes.com/Checkers/GA-checkers.html. It works offline; the text fonts (IBM Plex Sans Thai, Trirong, Newsreader) come from Google Fonts, and the page falls back to system fonts without them.

## Playing

- Tap one of your caps, then tap a dot to move there, or drag the cap. When a capture is open, the caps that can capture pulse with a gold ring and the landing squares show a ring.
- In a multi-jump, tap each landing square in turn. When only one way on is left, the cap carries on by itself.
- Captured caps are tossed onto the table beside the player who took them.
- **Undo** takes back your last move (against the computer it also takes back the computer's reply). It also cancels a capture you have started.
- **New game**: play The Editor (the computer) at Easy, Normal or Hard, choosing green or red caps, or play a friend on the same device.
- Keyboard: arrow keys move between the dark squares, Enter or Space picks up and puts down, U undoes, N opens New game, Esc puts a cap back down.

## Rules (กติกาหมากฮอสไทย)

| Rule | |
|---|---|
| Board | 8 × 8, dark squares only. 8 caps each, on the first two rows of each side. Green moves first. |
| Men (ฝาคว่ำ, a cap top up) | Move one square diagonally forward. Capture forward only, by jumping an adjacent enemy cap onto the empty square beyond. |
| Capturing | Compulsory. You choose which capture to make (no rule to take the most), but once you start you must keep capturing while you can. A captured cap leaves the board as soon as it is jumped. |
| Promotion | A man reaching the far row becomes a king (ฮอส) and is turned face up (ฝาหงาย), showing the liner and its crown. The move ends there. |
| Kings | Move any distance diagonally. A king may capture from a distance but must land on the square immediately behind the captured cap, and may capture again from there in any direction. |
| End | You win when the other side has no caps or no legal move. A draw after 30 moves each with no capture and no man moved, or when a position comes up three times. |

The state of the game, the settings, the language and your record against The Editor at each level are kept in the browser's local storage, so a reload carries on where you left off.

## How it works

- **Engine.** The rules and the computer player are one plain script (`#engine-src`) with no DOM. The page runs it directly, and also starts it in a Web Worker made from the same source, so the computer thinks without freezing the page. If a worker cannot start, it runs on the page instead.
- **The Editor** searches with negamax and alpha-beta pruning, iterative deepening, history-move ordering and a capture extension (forced captures are searched to the end). The evaluation counts men as 100 and kings as 310, rewards men for advancing and for guarding the home row, rewards kings on the long diagonals, and favours trading down when ahead. Easy searches 3 plies with noise and the odd random move; Normal searches 5 plies with a little noise; Hard deepens for about 1.3 s.
- **Wood** is generated in the browser: growth rings bent by value noise, with pores streaked along the grain. The board's maple squares run their grain across and the walnut squares run it down; the four frame rails are mitred with the grain along each rail. The table is teak planks with butt joints, under a pool of lamp light.
- **Caps** are drawn once per cap on canvas at 224 px: a crimped skirt with 21 flutes lit from the top left, a dent where the opener caught it, paint chips, a rounded shoulder and a domed top printed with a ring of text (THE SIAM TIMES • BANGKOK • EST. 1864) and a Chomsky T. The inside face (the king) has a pale gold lining, a coloured liner and an embossed crown. Each cap gets its own seed, so no two look exactly alike. Promotion flips the cap over in 3D.
- All caps live in one layer over the table, so the same element can slide from a square to the pile and back on Undo.
- Sounds (the cap on wood, a capture, a flip, the result) are made with Web Audio; there are no sound files.

## Font

The masthead on the frame, the T on the caps and the masthead on the dialogs use **Chomsky** by Fredrick R. Brennan, under the SIL Open Font License 1.1 (`Chomsky-LICENSE.txt`, which must stay with the game). The page embeds the same Latin-only WOFF2 subset as `Darts/GA-darts.html`; see `Darts/README.md` for how to rebuild it.
