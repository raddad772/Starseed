# Starseed Infinite

Procedural star systems you can play in the browser: planets formed from a disk, worlds you can walk on,
fly across and fall into, and big ships you can dock with and explore in flight. Every system grows from
a seed.

**Play:** https://raddad772.github.io/Starseed/ (try `?seed=FSPB-8DTW`)

- Keyboard and mouse or an Xbox-style controller; press H (or R3) in game for the controls.
- Runs best in Chrome or another Chromium browser; needs WebGL 2.

## Run locally

No build step: plain ES modules with Three.js r186 vendored in `vendor/`.

```bash
python3 tools/serve.py 8765
```

Then open http://localhost:8765/?seed=FSPB-8DTW.
