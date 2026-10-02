# Starseed Infinite

A procedural, browser-playable star-system game in the spirit of No Man's Sky: Three.js r186
(vendored), plain ES modules, no build step. Dave play-tests it and gives feedback in short bursts.

**Read `HANDOFF.md` first.** For world generation (the simulated-worlds work), `WORLDSIM.md` is the
plan to act on. It has the current state, everything Dave asked for and how it was done,
what is verified, and the queue.

- Dev server: launch config `starseed` (`.claude/launch.json`) or `python3 tools/serve.py 8765`.
  Game: http://localhost:8765/?seed=FSPB-8DTW (no-store headers; a reload picks up every change).
- Dave plays in his own browser. Never run scripts in his tab: test in your own in-app-browser tab with
  `?workers=2`, using `tools/testkit.js` and `tools/probe.js`. Message the "XBox Work on Mac" session
  (SendMessage) before and after browser test sessions; it runs real-time emulator measurements.
- If Dave rejects a tool call with "STOP", close your test tabs, say where things stand, and wait.
- Commit good checkpoints as work lands (each working, verified step); don't let work pile up
  uncommitted. Commit only your own files (other sessions may share the tree). Push only when Dave
  asks. End commit messages with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
