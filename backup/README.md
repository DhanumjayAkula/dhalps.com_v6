# v1 — the first cut of the timings

Kept so we can go back. `app.v1.js`, `index.v1.html` and `style.v1.css` are the
files as they stood before the second timing pass.

What v1 did differently:

- **Eighteen beats, seventeen scrolls.** The marks were taken from the footage
  itself — motion energy per frame, then a park wherever the picture settled for
  more than a beat. Faithful to the edit, but it made the viewer scroll through
  several holds that carry nothing new.
- **Streamed, not preloaded.** The page opened on a few seconds of buffer and
  pulled the rest forward. Lighter to open, but a beat could outrun the network.
- **No intro.** The first beat waited for a scroll like every other one.

## v1 beat marks (seconds)

    0.00   7.07  10.67  15.00  20.03  24.00
   26.27  27.97  31.20  36.20  39.97  58.20
   64.33  70.80  76.50  83.40  95.27 100.60

Cards were up at 15.00 (01), 31.20 (02), 58.20 (03–05), 70.80 (06–08),
83.40 (09–11) and 100.60 (the closing panel).

To restore: copy these three files back over the ones in the folder above.
