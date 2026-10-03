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

Eighteen marks, seventeen scrolls, measured off the frames: the camera moves,
the picture settles, and the settle is where a scroll parks. They live in
`BEATS` at the top of `app.js`, in seconds.

## The video

`video.mp4` — 1920×1080, 30fps, 105.4s, no audio, 55MB. Re-encoded from the
master with a keyframe every second (`-g 30`): the master carried 19 keyframes
in the whole take, which makes a rewind crawl. 30fps is also why the transport
runs at `RATE 2` — 30 × 2 presents 60 frames a second, one per refresh on a 60Hz
screen. An uneven multiple is what reads as judder.

It is **streamed, not preloaded**: 55MB is too much to hold the page on. The
loader opens the page once there are a few seconds in hand and playback pulls
the rest forward.

## Hosting — one requirement

**The server must support HTTP range requests** (`Accept-Ranges: bytes`).
Rewinding is a run of seeks, and a server that answers `200` to a `Range` header
makes the browser treat the file as unseekable — every seek then lands at zero.
GitHub Pages, Netlify, Vercel, S3/CloudFront, nginx and Apache all do this out
of the box. Do **not** put `video.mp4` in Git LFS if you are serving from GitHub
Pages: Pages does not resolve LFS pointers.

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
