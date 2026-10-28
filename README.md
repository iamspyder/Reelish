<div align="center">

<img src="docs/banner.svg" alt="Reelish — Your words. Your style. No subscription." width="100%">

# Your words. Your style. Your next reel.

**A desktop caption and video studio for creators.**

136 caption looks · 44 font families · Editable word timings · Up to 4K export

[![Download Windows](https://img.shields.io/badge/Download_Windows-v1.6.3-ffb800?style=for-the-badge&labelColor=18181b)](https://github.com/iamspyder/Reelish/releases/latest/download/Reelish-Windows-x64-Setup.exe)
[![Build](https://github.com/iamspyder/Reelish/actions/workflows/release.yml/badge.svg)](https://github.com/iamspyder/Reelish/actions/workflows/release.yml)
[![MIT](https://img.shields.io/badge/Code-MIT-blue.svg)](LICENSE)

[Download](#download) · [Features](#make-every-word-yours) · [Get started](#from-raw-take-to-ready-to-post) · [AI and privacy](#ai-your-key-your-choice) · [Build](#for-builders)

</div>

## Make every word yours

Import your take, add captions, choose a look and make it your own. Correct a word, drag the caption into position, resize it on the preview and export a clean video with **no Reelish watermark**.

![The Reelish editor with captions, styles and a timeline](docs/product.png)

### Captions you can actually edit

- **Click to edit.** Select a transcript or timeline caption to open its text and customization controls.
- **Move and resize directly.** Drag the caption in the preview or use its corner handle. Size and position sliders update live.
- **Keep it readable.** Fix fast fragments with readable phrase grouping, preserving existing word timestamps and real pauses. Undo restores your previous grouping.
- **Fine-tune each word.** Double-click to adjust spelling, timing and emphasis. Apply a style to one caption or all captions.

### Find your signature look

Explore **136 presets**, including 106 reference-inspired looks and 30 Reelish originals. Choose bold, clean, handwritten, editorial, glass, spatial and behind-person compositions. Pair **44 bundled font families**, import your own fonts, save presets and favorite the looks you use most.

Detailed looks retain separate support and hero typography, scaled stacks, impact layers, chips, ink effects and timed motion. Compositions are independently implemented; Reelish is not a verified pixel-for-pixel Captik replica. Some commercial font names use disclosed open-font substitutes.

### Build the whole edit

- Trim, split, duplicate and reorder clips; change speed, reverse a short clip or insert a freeze frame.
- Add timed image/video overlays with resize, crop, audio controls and motion keyframes.
- Mix music, record voiceover or choose from **112 original/licensed sound effects**.
- Add **44 text/graphic designs** across 20 families, with caption autofill and color matching.
- Adjust color, crop, RGB curves and vignette; use person masking for behind-speaker captions.
- Resize the transcript, preview, styles panel and timeline to fit your workflow.

### Export for your next post

Export **MP4 at 720p, 1080p or 4K**, in **9:16, 16:9, 1:1 or 4:5**. Save separate **SRT, WebVTT or ASS** subtitles and editable projects. Autosave recovery and undo/redo help protect your work.

## Download

**Latest release: 1.6.3 — Windows, Apple Silicon, Intel Mac and Linux x64.** Packages include video tools, fonts and the optional local speech model/runtime. No separate Python or model installation is required.

| Platform | Available download |
| --- | --- |
| Windows 10/11, x64 | **[Download Reelish 1.6.3 installer](https://github.com/iamspyder/Reelish/releases/download/v1.6.3/Reelish-Windows-x64-Setup.exe)** · [SHA-256](https://github.com/iamspyder/Reelish/releases/download/v1.6.3/Reelish-Windows-x64-Setup.exe.sha256) |
| macOS, Apple Silicon | [1.6.3 DMG](https://github.com/iamspyder/Reelish/releases/download/v1.6.3/Reelish-macOS-arm64.dmg) · [ZIP](https://github.com/iamspyder/Reelish/releases/download/v1.6.3/Reelish-macOS-arm64.zip) |
| macOS, Intel | [1.6.3 DMG](https://github.com/iamspyder/Reelish/releases/download/v1.6.3/Reelish-macOS-x64.dmg) · [ZIP](https://github.com/iamspyder/Reelish/releases/download/v1.6.3/Reelish-macOS-x64.zip) |
| Linux, x64 | [1.6.3 AppImage](https://github.com/iamspyder/Reelish/releases/download/v1.6.3/Reelish-Linux-x86_64.AppImage) · [DEB](https://github.com/iamspyder/Reelish/releases/download/v1.6.3/Reelish-Linux-amd64.deb) |

All four native platform builds passed packaged captioning and video export checks. [All release files and SHA-256 checksums](https://github.com/iamspyder/Reelish/releases/tag/v1.6.3) · [Verified build run](https://github.com/iamspyder/Reelish/actions/runs/40742414569).

Windows: run the installer. macOS: open the DMG and drag Reelish into Applications. Linux: mark the AppImage executable, or install the DEB on a compatible distribution. AppImages may need your distribution's FUSE compatibility package. Builds are not publisher-signed or Apple-notarized. Mobile, Windows ARM and Linux ARM packages are not provided.

## From raw take to ready to post

1. **Import your video.** Keep the original media in place so saved projects can find it.
2. **Add captions.** Import SRT/VTT, type text, or explicitly choose a caption-generation source.
3. **Choose a look.** Apply a preset, then click your captions to edit, move and resize them.
4. **Set the pace.** Use **Fix fast captions · readable phrases** if groups change too quickly. Review recognition and word timings.
5. **Finish the edit.** Add graphics, overlays, color and audio; export your MP4.

Existing Clipora `.clipora` projects and Reelish `.reelish` projects are supported.

## AI: your key, your choice

**Text AI:** Open **AI tools → AI connection & key**, save your own OpenRouter key and use **Test connection**. Hinglish conversion, translation, hooks and edit plans use free text models with zero-price routing and no paid fallback. Model availability and provider quotas apply. Text tools send caption text/timing when invoked. AI results are reviewed before applying.

**Online audio:** Auto captions includes an explicit OpenRouter free-audio option. Choosing it sends clip audio to OpenRouter and its model provider. Returned timing is **AI-estimated**, not measured word alignment. Review and adjust it before export.

**Important access limit:** In the 1.6.3 live test, NVIDIA's zero-price audio route required **at least $0.50 in account balance**; Inkling's free routes restricted access to approved apps. A zero catalog price does not guarantee zero-balance access. Online transcription is **not verified working on that tested account**. The app does not purchase credit, impersonate an approved app or fall back to paid models.

**Optional local captions:** The included multilingual Whisper Base engine runs only when explicitly selected. It needs no API key or service quota; audio stays on the device. It is available as an alternative, not a silent fallback.

Keys are stored using system encryption and are **not included in the installer or repository**. Each user supplies their own optional provider key. The publisher-hosted service remains private and is not connected to shared installers.

## What changed in 1.6.3?

Live size/position controls, click-to-edit, preview dragging/resizing, readable phrase grouping, stable emphasis during speech gaps, a real AI connection test, visible regeneration and honest provider errors. **105 automated tests passed**, plus packaged Windows editing, caption-source and failure-preservation checks. [Full verification and limits](docs/CAPTION-EDITING-1.6.3.md).

Person-mask edges can be imperfect. Speech and translations require review. Not every codec, long project or feature combination is covered by the checks. Generative B-roll, editor plugins, mobile apps and exact Captik parity are not provided.

## For builders

Use Node.js 22+, Git and the platform's native build tools. Preparing the optional bundled speech engine also requires the tools described in [prepare-speech.cjs](scripts/prepare-speech.cjs).

```bash
npm ci
npm run prepare:speech
npm test
npm start
```

```bash
npm run dist          # Windows x64 installer
npm run dist:mac      # macOS, native architecture
npm run dist:linux    # Linux x64 AppImage + DEB
```

The [release workflow](.github/workflows/release.yml) builds native packages, runs platform checks and uploads successful artifacts with SHA-256 files. Windows caption editing and free-audio integration have additional packaged tests; provider fixtures do not establish live speech accuracy.

App source is MIT licensed. Bundled dependencies, sounds, models and fonts retain their own licenses; see [third-party notices](THIRD-PARTY-NOTICES.md).

[Report a bug or suggest a feature](https://github.com/iamspyder/Reelish/issues/new). Include your OS, version and reproduction steps. Do not post private recordings or credentials.

<div align="center"><strong>Your words. Your style. Your next reel.</strong></div>
