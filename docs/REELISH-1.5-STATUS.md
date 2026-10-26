# Reelish 1.5 — implementation and verification

## Implemented

- OpenRouter-only hosted AI: timed captions, Hinglish conversion, three opening-hook suggestions, translation and reviewed edit plans. No Groq dependency remains in the active service. Provider credentials stay server-side.
- AI plans can apply timed graphics, clip punch-in keyframes and available sound effects. Results require a user click to apply and can be undone. No footage is generated or downloaded by a plan.
- 36 graphic designs in 12 composition families: titles, quotes, statistics, checklists, calls to action, lower thirds, comparisons, progress, countdowns, chapters, badges and steps.
- Graphic layers have text, timing, position, scale, rotation, opacity, colour, animation, duplicate/delete, visibility and motion keyframes. They are saved in projects and rendered into MP4 using the shared preview renderer.
- Word/line timeline views, word dragging/resizing, global timing shift, clip mirror and rotation. Line dragging now also retimes its word metadata.
- Timed adjustment presets with editable start/end.
- Microphone voiceover controls; recorded audio is validated and stored on the device, then inserted as an audio event.
- Existing 136 caption looks, fonts, trimming, pause removal, captions, depth effects, audio and video export remain included.

## Verified

51 unit/integration tests pass. Provider contract tests use simulated responses and verify OpenRouter endpoints, server-only credentials, IDs, timestamps, quota/credit errors, payload limits and invalid AI output. Actual FFmpeg extraction is exercised.

Desktop checks run in source and the packaged Windows executable: graphic creation and editing, all 36 compositions, safe literal text rendering, word dragging, timing shifts, adjustment creation, reviewed AI hooks/translation/edit application, undo, saved-project roundtrip and real MP4 export. Decoded video pixels verify graphics are burned into the MP4. Panel resizing remains tested.

AI desktop responses are controlled test fixtures. These tests do not establish live OpenRouter model quality or service availability. Voiceover file validation uses synthetic audio; the user's microphone was not recorded. Other operating systems have not yet been retested for this version.

## Remaining differences from Captik

This is not a 100% equivalent implementation. Captik's observed Text panel reports 976 graphics; Reelish supplies 36 independent designs. Exact template appearance/animation parity, the full sound/music catalogue, video picture in picture, complete multi-track compositing, all crop/curve tools, freeze-frame workflows, generative B-roll/Recreate, every AI edit style and editor plugins are still incomplete or absent. A list of preset names is not proof of matching behavior.

## Live activation

The shared service has not been deployed. It requires the publisher's hosting login and `OPENROUTER_API_KEY` secret. The EXE contains no provider key. Text requests default to `openrouter/free`; speech transcription may require credits. See [activation instructions](../services/captions/README.md). No live paid requests were made during this implementation.
