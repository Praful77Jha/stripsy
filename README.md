# stripsy 🎞️

> Upload an image. Watch it get sliced, shuffled, and sorted back — live, with bubble sort.

## What is this?

**stripsy** cuts your image into vertical strips, scrambles them, then sorts them back in real-time using **Bubble Sort** — while showing you exactly which line of code is running.

It's a sorting algorithm visualizer disguised as a guessing game.

---

## Features

- 🖼️ Upload any image (PNG, JPG, WEBP)
- ✂️ Slice into 7 / 11 / 15 / 20 strips
- 🔀 Auto shuffle on load
- 📊 Live bubble sort with smooth swap animation
- 🔊 Sound effects — compare, swap, and done
- 💻 Live code panel with line-by-line highlight
- ⚡ 4 speed modes — Slow, Normal, Fast, Insane

---

## How to Run

No install. No dependencies. Just open in browser.

```bash
git clone https://github.com/praful77jha/stripsy.git
cd stripsy
# Open index.html in Chrome/Firefox
```

Or just double-click `index.html`. That's it.

---

## File Structure

```
stripsy/
├── index.html       # Structure & layout
├── style.css        # Dark theme, fonts, animations
├── bubble_sort.js   # Sorting algorithm + sounds + code panel
└── app.js           # Main game logic + canvas + animation
```

---

## How it Works

1. Image is drawn onto an HTML5 Canvas
2. Cut into N equal vertical strips using offscreen canvases
3. Strips are shuffled randomly
4. Bubble sort runs step by step with a timer
5. Each swap triggers a smooth sliding animation + sound
6. Code panel highlights the currently executing line
7. When sorted — reveal sound plays ✓

---

## Tech Stack

| Thing | Used For |
|-------|----------|
| HTML5 Canvas | Image slicing & rendering |
| Web Audio API | Sound effects |
| Vanilla JS | Bubble sort + animation |
| CSS3 | Dark theme + transitions |
| Google Fonts | Syne + JetBrains Mono |

---

## Preview

```
[ 9 ][ 3 ][ 11 ][ 1 ][ 7 ][ 2 ]  ← shuffled
         ↓ bubble sort ↓
[ 1 ][ 2 ][ 3 ][ 7 ][ 9 ][ 11 ]  ← sorted ✓
```
