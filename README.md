# dhalps.com — v6

A portfolio that is one continuous take. The page does not scroll: every scroll
gesture is one **beat** of the film, which plays forward from where it stopped
to the end of that beat and parks there. Scrolling up rewinds the same beat.

## How it is put together

The take carries its own interface. The HUD, the eleven project cards, the
`COLLECTED 00 / 11` tick row and the closing profile panel are rendered into the
footage, not drawn in HTML. Three things follow from that:

- **The frame is never cropped.** Crop a pixel and you cut somebody's button in
  half, so the 16:9 frame is letterboxed whole. The bands either side are
  plain colour, but not one fixed colour: each is the median floor colour at its
  own edge of the frame (machine, cards, toys and court lines thrown out),
  re-read a few times a second and eased in, so it follows the floor as it
  shifts from amber to deep orange without ever showing a pattern.
- **What is clickable is a transparent anchor** laid over the pixels that are
  supposed to be pressed — the two pills in the HUD, the button on each card,
  the links on the closing panel, and all eleven numbers in the tick row (tap a
  number and the page cuts straight to that project's beat, with a short
  crossfade — nothing in between is played, forwards or back). They
  are placed in the footage's own 1920×1080 coordinates, written as percentages,
  so they track the picture at any size. Only the ones on the current beat are
  live; they show a ring on hover and keyboard focus.
- **The words are repeated in the markup**, in a visually hidden block. A
  picture of a sentence is not a sentence — search engines, screen readers and
  link previews need the real thing.

## The beats

Eight marks, six scrolls. The first one is not scrolled to — the take opens
itself, playing 0 → 8s the moment the loader lifts, so the page arrives already
in motion.

    0 → 8*   19   35   63   75   87   105
    * played automatically

The run from 87 to 105 steps over 96–97 (`SKIPS`), a second where nothing moves
that reads as the page freezing mid-run; the rewind steps back over it too. The
marks live in `BEATS` at the top of `app.js`, in seconds; the two earlier
timing sets are kept in `backup/` with notes on how they differed.

**One gesture, one beat.** A trackpad swipe keeps firing wheel events for a
second or two after the finger lifts. A gesture is the whole stream up to the
first 240ms pause (`GAP`), and it moves the take exactly one beat however hard
it was. A held arrow key counts once.

**The scroll cue.** When the take has parked and nobody has moved for 1.4s, a
small pill rises at the bottom centre, under the tick row — a mouse with its
wheel rolling, or "Swipe up" with climbing chevrons on touch screens (icon only
on a small frame). It goes the instant anyone does anything, and never shows on
the last beat.

**After a tick.** A click leaves no focus on the tick, the arrow and Page keys
drive the take even with a link focused, and a scroll that lands during the
crossfade is held and run the moment the cut finishes.

## The video

`video.mp4` — 1920×1080, 30fps, 105.4s, no audio, 21.9MB. Re-encoded from
`Ritz_1.mp4` with a keyframe every two seconds (`-g 60 -crf 25`, SSIM 0.992 to
the source): the source carried 12 keyframes in the whole take, which makes a
rewind or a tick-jump crawl. Playback runs at `RATE 1.5` — 45 frames a second,
which does not divide 60Hz evenly, so there is a faint judder; that is the trade
for the slower pace.

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
