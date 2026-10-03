# dhalps.com — v6

A portfolio that is one continuous take. The page does not scroll: every scroll
gesture is one **beat** of the film, which plays forward from where it stopped
to the end of that beat and parks there. Scrolling up rewinds the same beat.

## How it is put together

The take carries its own interface. The HUD, the eleven project cards, the
`COLLECTED 00 / 11` tick row and the closing profile panel are rendered into the
footage, not drawn in HTML. Three things follow from that:

- **The frame is never cropped.** Crop a pixel and you cut somebody's button in
  half, so the 16:9 frame is letterboxed whole and the bands are painted the
  take's own ground colour (`#d79e00`, sampled off the floor in the footage).
- **What is clickable is a transparent anchor** laid over the pixels that are
  supposed to be pressed — the two pills in the HUD, the button on each card,
  the links on the closing panel, and all eleven numbers in the tick row (tap a
  number and the take runs to the beat where that project is on screen). They
  are placed in the footage's own 1920×1080 coordinates, written as percentages,
  so they track the picture at any size. Only the ones on the current beat are
  live; they show a ring on hover and keyboard focus.
- **The words are repeated in the markup**, in a visually hidden block. A
  picture of a sentence is not a sentence — search engines, screen readers and
  link previews need the real thing.

## The beats

Eleven marks, nine scrolls. The first one is not scrolled to — the take opens
itself, playing 0 → 8s the moment the loader lifts, so the page arrives already
in motion. A scroll during the opening is not swallowed; it carries straight on.

    0 → 8*   19   24   35   41   63   75   87   96   105
    * played automatically

`105` opens on a cut: `from: 97`. The second between 96 and 97 is footage where
nothing moves, and holding on it reads as the page having frozen, so the beat
jumps the gap in both directions. The marks live in `BEATS` at the top of
`app.js`, in seconds; the first cut is kept in `backup/` with a note on how it
differed.

## The video

`video.mp4` — 1920×1080, 30fps, 105.4s, no audio, 55MB. Re-encoded from the
master with a keyframe every second (`-g 30`): the master carried 19 keyframes
in the whole take, which makes a rewind crawl. 30fps is also why the transport
runs at `RATE 2` — 30 × 2 presents 60 frames a second, one per refresh on a 60Hz
screen. An uneven multiple is what reads as judder.

It is **downloaded whole before the page opens**, then handed to the `<video>`
as a blob. An earlier cut streamed it and opened sooner, but a beat could outrun
the network mid-move — a plain `src` leaves the browser free to fetch in dribs,
and every beat that runs into a gap stalls. Once it is a blob there is no
network left in the loop: playback and the rewind seeks are all out of memory.
It costs a longer wait at the door and buys a take that never catches.

## Hosting

Nothing special is required — the file is fetched once, in full, so the server
does not need range requests. Do **not** put `video.mp4` in Git LFS if you are
serving from GitHub Pages: Pages does not resolve LFS pointers.

## Files

| file | what it is |
|---|---|
| `index.html` | the stage, the hit layer, the loader, the hidden copy |
| `style.css` | letterbox stage, hit layer, loader, portrait handling |
| `app.js` | beats, hit map, transport, loader, orientation |
| `video.mp4` | the take, web encode |
| `poster.jpg` | first frame, shown before the video is ready |

## Local run

Any static server that honours range requests:

```
python3 -m http.server 8000
```

Then open `http://localhost:8000`. Append `#selftest` to check the beat list,
the hit map and the tick row against the take in the console.

## Portrait phones

The interface is drawn inside a 16:9 frame, so letterboxed onto a tall phone it
is a strip. No layout can fix that from the outside, so portrait asks for the
other orientation and keeps asking until the phone is turned — the ask can be
tapped away.
