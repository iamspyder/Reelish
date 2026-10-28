# Reelish 1.6.3 — caption editing, pacing and AI connection

## Reported failures

The user could not reliably adjust caption size or position, clicking a caption did not present a usable edit state, short groups changed too quickly, and the provided OpenRouter key was not connected in the desktop installation.

The rebuilt Customize controls had lost their live input listeners. Some impact layers used an absolute position calculation that canceled out the user's position change. Selecting at the exact first animation frame could also hide the selected text. Fixed word-count grouping and additional small template pages caused rapid phrase changes; during a measured gap the scene compositor could choose a future word as the hero.

## Changes

- Live size/position/color controls, scoped to the selected caption or all captions. Each slider gesture has one undo checkpoint.
- Click a transcript or timeline caption to expose editable text and Customize controls. Double-click a word for text/timing/emphasis. The preview supports dragging and corner resizing.
- Impact and support layers move together. Custom size, line height, outline and emphasis scale apply.
- `Fix fast captions · readable phrases` groups short fragments using a reading-time target and preserves existing word timestamps and pauses. Undo restores the old grouping. Readable pages retain a short phrase instead of repeatedly replacing two or three words; Exact word pages remains selectable. This does not slow or retime the recorded speech.
- Free text AI has a real Test connection action, bounded JSON-mode fallback, fenced JSON handling and specific authentication/quota/access messages. Hinglish uses the shared parser.
- The supplied key was saved via the installed app's credential API, using its Windows encryption profile. No key is in the repository, installer, renderer status responses or this report.
- Explicit free OpenRouter audio source: checks current catalog prices before upload, uses only verified zero-price `:free` audio models, bounded chunks, no paid fallback, and clearly labels every returned timing as AI-estimated. A persistent notice prevents these timings from being presented as measured word alignment. Failure preserves existing captions.

## Live provider result, 28 October 2026

The saved key passed a minimal live free-text connection request. With the user's specific approval, eight seconds of the public demo interview were sent to OpenRouter for an audio test. All three current zero-price candidates refused this account:

- NVIDIA Nemotron Nano Omni free: HTTP 402, `This request requires at least $0.50 in balance for audio`.
- Inkling Small free and Inkling free: HTTP 403, restricted to approved agentic harnesses/apps.

The app did not purchase credit, impersonate an approved app, enable paid models, use a private-service bypass or switch to local AI. Free audio caption generation is therefore **not live-verified as working on this account**. Catalog price zero does not establish zero-balance access. If the account meets a provider's access requirements later, the same source can be retried; timing remains estimated.

## Verification and comparison boundary

Actual Electron tests use pointer movement before mouse release, selected/all scope, Undo, text edits, word editing, preview drag/resize, timeline selection, whole-composition movement and readable regroup. Audio UI integration uses actual FFmpeg extraction with clearly identified provider fixtures; fixtures do not establish live transcription accuracy. The live provider test establishes the refusal described above, not successful speech recognition.

Captik's signed-in dashboard and existing demo project were reachable at the start of this pass; subsequent browser calls were interrupted before dispatch, so no fresh complete interaction comparison was obtained. Existing REA catalog/editor evidence remains the reference; these fixes are verified Reelish behavior, not a new claim of exact Captik equivalence.
