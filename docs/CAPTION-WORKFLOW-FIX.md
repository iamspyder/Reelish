# Caption style application fix — 1.6.1

The reported screenshot showed **0 caption lines** while the app displayed “Captik Shadow applied.” Earlier tests styled existing captions and did not cover selecting a template immediately after importing a video. The success message was misleading: there was no caption text for the style to render.

## Changes

- Selecting a template with zero captions saves the style and explains the missing text. It offers real subtitle import or typed caption entry; it never invents a transcript or pretends generation succeeded.
- A persistent notice identifies the zero-caption state after importing a video.
- Importing subtitles retains the chosen style and seeks a real caption for a paused preview.
- Applying a template to **All captions** replaces older per-line style overrides. **Selected line** requires a selected caption instead of silently changing the whole project.
- The speech dialog disables unavailable online/paid speech actions. It no longer offers “Save choices” as a substitute for generating captions. The included engine runs only after explicit selection; no local fallback is selected automatically. Personal OpenRouter text AI does not transcribe audio.

## Verification

Focused tests start from an actual video import with zero captions, choose Captik Shadow, verify the explanation instead of false success, import an SRT through the actual dialog, verify styled words in the preview, test both application scopes, and decode the exported MP4 to prove caption pixels are present. Test captions are synthetic; the user's project is not replaced with sample words.

This fixes the reported application workflow. It does not enable previously disabled online speech, and is not a claim that every feature or codec is error-free.
