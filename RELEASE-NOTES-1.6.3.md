# Reelish 1.6.3 — Captions you can shape

This release fixes caption editing and rapid grouping, adds a real OpenRouter connection test, and makes failed regeneration preserve existing captions.

- Size and position controls update live, with one undo step per gesture.
- Click captions to edit text; drag and resize them in the preview.
- Word timing/emphasis editing, selected/all scope and whole-composition movement are verified.
- Fix fast captions with readable phrases while preserving existing word timestamps and pauses.
- Distinct caption layouts, 136 looks, 44 bundled font families and the video/audio editing tools remain included.
- Personal OpenRouter keys stay encrypted on the user's device. Every user supplies their own key; none is bundled.

## Downloads

The Windows x64 installer and checksum are available with this release. Native macOS and Linux assets are uploaded separately after successful platform checks; download only files actually listed below.

## AI availability

Free text AI connected successfully in the live test. The optional online audio route checks current zero-price models, never uses a paid fallback, and labels output timing as AI-estimated.

The tested account could not use the current free audio routes: NVIDIA required at least $0.50 account balance; Inkling restricted access to approved apps. This release does not claim successful live online transcription on that account. The included local speech engine remains optional and is used only when explicitly selected.

## Verification

105 automated tests passed. The packaged Windows app passed physical slider, caption text/timing, preview drag/resize, undoable regroup, settings and simulated-provider failure-preservation checks. Package source/font/license integrity was checked, and the installed app retained its encrypted key and passed a live free-text connection test.

See [the detailed repair report](https://github.com/iamspyder/Reelish/blob/main/docs/CAPTION-EDITING-1.6.3.md). Builds are unsigned; read the installation guidance and review generated captions before publishing.
