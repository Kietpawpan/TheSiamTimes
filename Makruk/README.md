# Siam Times Makruk (หมากรุกไทย) – web game

Makruk (Thai chess), in English and in Thai. The board sits on a dark teak table pushed against the same blue tongue-and-groove wall as Siam Times Darts, under a cream sign that reads **The Siam Times** in Chomsky, the masthead font of thesiamtimes.com (over *Newsroom Makruk Club*, ชมรมหมากรุกห้องข่าว), with a folded copy of the paper and a cup of tea on the table.

There is an English version and a Thai version, each a whole game in one HTML file. There is no build step: open either file in a browser. Each has a link to the other at the top of its control rail, and both share the same saved game, record against The Editor and settings, so a game started in one language carries on in the other.

| Version | File | On the site |
|---|---|---|
| English | `GA-makruk.html` | https://thesiamtimes.com/Makruk/GA-makruk.html |
| Thai (ภาษาไทย) | `GA-makruk-th.html` | https://thesiamtimes.com/Makruk/GA-makruk-th.html |

They work offline; only the Newsreader and Sarabun text fonts come from Google Fonts, and the pages fall back to system fonts without them.

In Thai the pieces are ขุน, เม็ด, โคน, ม้า, เรือ, เบี้ย and เบี้ยหงาย, the sides ฝ่ายขาว and ฝ่ายดำ, the levels ง่าย, ปกติ and เซียน, and the counts นับศักดิ์กระดาน and นับศักดิ์หมาก. The Thai board and move list name the files ก ข ค ง จ ฉ ช ญ, as Thai score sheets do, where the English ones use a to h (so e3–e4 in English is จ3–จ4 in Thai); a checkmate is marked `#` in English and `++` in Thai.

## Playing

- **View**: **Side on** (the default) shows the two armies facing each other left and right, seen from the end of the table under the sign, with your side (or White, with two players) on the left. **From above** looks straight down at the board, with the pieces drawn from a little off the vertical so that a Khun still looks taller than a Met. **Your side** is the view from your own chair, with your pieces nearest you. **Flip board** swaps the two sides.
- **Tap a piece** to see where it can go (blue dots, or a blue ring round a piece you can take), then tap a square. You can also drag the piece. The last move is tinted brass, and a Khun in check glows red.
- Keyboard: click the board, then the arrow keys move a cursor, **Enter** picks up and puts down, **Esc** puts back. **U** takes back, **H** asks for a hint, **F** flips the board, **V** changes the view. The arrow keys follow the screen, whichever way the board is turned.
- **vs The Editor**: play White or Black against the computer. **Two players**: two people on one device.
- **Level** (Easy, Normal, Pro) sets how far The Editor looks ahead and how often it slips. Pro thinks for up to two seconds a move.
- **Take back** undoes your last move (and The Editor's reply). **Hint** shows a suggested move with a brass arrow.

Your record against The Editor at each level, the game in progress and your settings are kept in the browser's local storage under `siamTimesMakruk.v1`, the same key for both languages, so a game carries on after a reload or a switch of language.

## Rules

| Piece | Moves |
|---|---|
| Khun (king) | One square any way. |
| Met | One square diagonally. |
| Khon | One square diagonally, or one straight ahead. |
| Ma (horse) | As a chess knight. |
| Ruea (boat) | Any distance along a row or a column. |
| Bia (shell) | One square ahead; takes one square diagonally ahead. Set with its straight side toward its own player and its rounded side toward the other. |
| Bia Ngai | A Bia that reached the sixth row (where the other side's Bia started) is turned over and moves like a Met. |

White's Khun starts on d1 (ง1) with the Met on e1 (จ1); Black's Khun is on e8 (จ8) with the Met on d8 (ง8): each Met stands on its own Khun's right, so the two Khun are not face to face (as on Thai boards, Wikipedia and chessvariants.org). The Bia start on the third and sixth rows. There is no castling and no double step for the Bia.

- Checkmate wins. A side that is not in check but has no legal move is stalemated, which is a draw. Two bare Khun is a draw, and so is the same position three times.
- **Counting**: once no face-down Bia are left, the weaker side counts its own moves and the game is drawn when the count reaches 64 (board's honour). When one side is down to a bare Khun the count starts again from the number of pieces on the board plus one, and the limit is set by the other side's pieces: 8 with two Ruea, 16 with one, 22 with two Khon, 32 with two Ma, 44 with one Khon, and 64 otherwise (pieces' honour). The count is kept automatically and shown in the scoreline. When material is level the side to move next does the counting, and if the counting side gets ahead the count passes to the other side.

## How it works

- **Rules and The Editor** are one self-contained function, `makrukEngine`, that the page uses for legal moves and also runs in a Web Worker so the room stays smooth while it thinks. Move generation checks out against the published Makruk perft counts (23, 529, 12,012 and 273,026 moves at depths 1 to 4). The search is alpha-beta with iterative deepening, a transposition table, quiescence search, null-move pruning, late-move reductions, killer and history move ordering and a check extension. The evaluation counts material (Bia 1, Met and Bia Ngai 2.1, Khon 2.7, Ma 3.1, Ruea 5), centralises the short-range pieces, pushes Bia, keeps the Khun home in the middle game, and in the ending drives a lone Khun to the edge. Easy and Normal add a little noise to the evaluation so they make human-looking mistakes.
- **The room** is a canvas drawn with real measurements: 46 mm squares, a 24 mm board on a table against the wall, seen from a seat about a metre away at 54° above the table. The wall, sign, table, props and board are drawn once per resize: the panelling and the table planks as lines in perspective, and the sign, the newspaper and the board's top as flat pictures laid onto their planes one thin row at a time.
- **The pieces** are small 3D models. The turned pieces are stacks of scaled cross-sections: round for the Khun, Met and Khon, a rounded square for the Ruea's block, and a D shape for the Bia and Bia Ngai, rounded toward the other side and straight toward its own. The Ma's head is a slab cut from its outline, with rounded edges and carved mane, cheek, mouth and eye. A small renderer in the page (a depth buffer, smooth normals, lamp light with a highlight, 2×2 samples per pixel) draws each piece facing the right way for the current view, once per size, and the scene scales those pictures with distance. The cup of tea is drawn the same way.
- Sounds are made in the browser with Web Audio; there are no sound files.

## Keeping the two versions the same

The `<script>` in the two files is identical, with every word of the game in both languages in one table, `STR = { th: {...}, en: {...} }`; each page takes its language from its own `<html lang>`. That table also holds the words drawn on the canvas (the club's name on the sign and the letters of the files on the board) and the marks used in the move list. The HTML differs only in its language: the `lang` attribute, title, description, the words written into the page before the script fills them in, and the link to the other version. The styles are shared too: `html:lang(th)` rules set Thai in Sarabun, a little larger, without capitals or wide letter-spacing. When you change the game, make the same change in both files, then check that the scripts still match:

```bash
diff <(sed -n '/<script>/,$p' GA-makruk.html) <(sed -n '/<script>/,$p' GA-makruk-th.html) && echo same
```

Chandler's Promise runs a copy of each page from `Promise/games/Makruk/`. Those copies are these files plus three additions: a viewport that does not zoom, a `storyDone` function that tells the story how a game ended (called at the start of `gameOver`), and a `<script>` before `</body>` that stops pinch and double-tap zoom. After changing the game here, copy both files there and put those additions back; `diff GA-makruk.html ../Promise/games/Makruk/GA-makruk.html` should then show only them.

## Font

The sign and the heading use **Chomsky** by Fredrick R. Brennan, under the SIL Open Font License 1.1 (`Chomsky-LICENSE.txt`, which must stay with the game). The page embeds the same Latin-only WOFF2 subset of `Chomsky.otf` as `Darts/GA-darts.html`; see `Darts/README.md` for how to rebuild it.
