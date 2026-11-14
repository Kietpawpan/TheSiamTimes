# Siam Times Makruk – web game

Makruk (หมากรุกไทย, Thai chess) in one HTML file. The board sits on a dark teak table pushed against the same blue tongue-and-groove wall as Siam Times Darts, under a cream sign that reads **The Siam Times** in Chomsky, the masthead font of thesiamtimes.com, with a folded copy of the paper and a cup of tea on the table. The game is in English and Thai: the **ภาษาไทย / English** button switches between them, and the first visit follows the browser's language.

Everything is in `GA-makruk.html`. There is no build step: open the file in a browser. On the site it is at https://thesiamtimes.com/Makruk/GA-makruk.html. It works offline; only the Newsreader and Noto Thai text fonts come from Google Fonts, and the page falls back to Georgia and the system's Thai font without them.

## Playing

- **Tap a piece** to see where it can go (blue dots, or a blue ring round a piece you can take), then tap a square. You can also drag the piece. The last move is tinted brass, and a Khun in check glows red.
- Keyboard: click the board, then the arrow keys move a cursor, **Enter** picks up and puts down, **Esc** puts back. **U** takes back, **H** asks for a hint, **F** flips the board.
- **vs The Editor**: play White or Black against the computer. **Two players**: two people on one device.
- **Level** (Easy, Normal, Pro) sets how far The Editor looks ahead and how often it slips. Pro thinks for up to two seconds a move.
- **Take back** undoes your last move (and The Editor's reply). **Hint** shows a suggested move with a brass arrow.

Your record against The Editor at each level, the game in progress and your settings are kept in the browser's local storage, so a game carries on after a reload.

## Rules

| Piece | Thai | Moves |
|---|---|---|
| Khun (king) | ขุน | One square any way. |
| Met | เม็ด | One square diagonally. |
| Khon | โคน | One square diagonally, or one straight ahead. |
| Ma (horse) | ม้า | As a chess knight. |
| Ruea (boat) | เรือ | Any distance along a row or a column. |
| Bia (shell) | เบี้ย | One square ahead; takes one square diagonally ahead. |
| Bia Ngai | เบี้ยหงาย | A Bia that reached the sixth row (where the other side's Bia started) is turned over and moves like a Met. |

White's Khun starts on e1 with the Met on d1; Black's Khun is on d8 with the Met on e8. The Bia start on the third and sixth rows. There is no castling and no double step for the Bia.

- Checkmate wins. A side that is not in check but has no legal move is stalemated, which is a draw. Two bare Khun is a draw, and so is the same position three times.
- **Counting** (นับศักดิ์): once no face-down Bia are left, the weaker side counts its own moves and the game is drawn when the count reaches 64 (board's honour). When one side is down to a bare Khun the count starts again from the number of pieces on the board plus one, and the limit is set by the other side's pieces: 8 with two Ruea, 16 with one, 22 with two Khon, 32 with two Ma, 44 with one Khon, and 64 otherwise (pieces' honour). The count is kept automatically and shown in the scoreline. When material is level the side to move next does the counting, and if the counting side gets ahead the count passes to the other side.

## How it works

- **Rules and The Editor** are one self-contained function, `makrukEngine`, that the page uses for legal moves and also runs in a Web Worker so the room stays smooth while it thinks. Move generation checks out against the published Makruk perft counts (23, 529, 12,012 and 273,026 moves at depths 1 to 4). The search is alpha-beta with iterative deepening, a transposition table, quiescence search, null-move pruning, late-move reductions, killer and history move ordering and a check extension. The evaluation counts material (Bia 1, Met and Bia Ngai 2.1, Khon 2.7, Ma 3.1, Ruea 5), centralises the short-range pieces, pushes Bia, keeps the Khun home in the middle game, and in the ending drives a lone Khun to the edge. Easy and Normal add a little noise to the evaluation so they make human-looking mistakes.
- **The room** is a canvas drawn with real measurements: 46 mm squares, a 24 mm board on a table against the wall, seen from a seat about a metre away at 54° above the table. The wall, sign, table, props and board are drawn once per resize: the panelling and the table planks as lines in perspective, and the sign, the newspaper and the board's top as flat pictures laid onto their planes one thin row at a time.
- **The pieces** are turned shapes painted slice by slice from the bottom up, each slice an ellipse with its own light and shade, so they look carved out of ivory and ebony. The Ruea is a square block and the Ma is a carved horse's head on a turned base. They are drawn once per size and scaled with distance.
- Sounds are made in the browser with Web Audio; there are no sound files.

## Font

The sign and the heading use **Chomsky** by Fredrick R. Brennan, under the SIL Open Font License 1.1 (`Chomsky-LICENSE.txt`, which must stay with the game). The page embeds the same Latin-only WOFF2 subset of `Chomsky.otf` as `Darts/GA-darts.html`; see `Darts/README.md` for how to rebuild it.
