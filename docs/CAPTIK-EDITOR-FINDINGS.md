# Captik editor observations — 26 October 2026

Inspected the signed-in browser editor with the user's permission, using the public CC0 interview sample already used for Reelish's demo. Created a test project and generated English captions. No purchases or exports were requested. No account credentials or session tokens were copied into Reelish.

REA parsed 20 public editor JavaScript chunks (1,355,250 bytes, no parse failures). Retained evidence is local in the ignored `evidence/` directory. Root artifact digest: `b6a70bec5d9d040506859a443dd81c06abfecdba3196d479be02977257d06558`. REA's graph is partial, with explicit semantic limits; these files do not reveal the server implementation. Authenticated UI observations below were collected through browser controls because this browser exposes no loopback CDP endpoint for REA.

## Directly observed

| Area | Captik controls observed |
|---|---|
| Dashboard | Device-local recent projects, upload, new project, help guide |
| Preparation | Language detection and selection, native script / Romanised / English translation, subtitle import instead of transcription |
| Captions | Word editing, merge up/down, per-caption behind-speaker toggle, regeneration labelled Sarvam, one/two lines |
| Timeline | Words/Lines modes, shift all timings, snapping, zoom/fit, split, cut before/after, freeze, mirror, rotate, duplicate, keyframes |
| Preview | Zoom, grid, safe areas, behind-speaker control, fix cutout, aspect ratio, fullscreen, direct manipulation |
| Caption customization | Separate entrance/exit/word motion, active-word colour/box/underline/grow/glow, future-word show/dim/hide, opacity, tilt, grouping and position |
| Templates | Dynamic, behind subject, songs, popular, property, spatial, AI edits, static; presets; colour variants. New styles labelled Scribble and Archives |
| Media | Import, voiceover, main track insertion, picture in picture insertion, audio extraction |
| Audio | Searchable named effects, category filters, automatic sound placement/intensity, music picker and level |
| Text | UI reports 976 graphics in Everything and 478 Titles, with category filters, auto-fill from speech and caption-colour matching |
| Adjustment | Adjustment layer across clips; Brighten, Punchy, Warm, Cool, Soft, Moody, Matte, Vivid, B&W, Teal/orange, Film, Night |
| AI tools | Hook-writing action, described as suggesting opening line, screen words and shots |
| Export | Quality, settings, SRT, preview aspect ratio, account minute meters, paid watermark removal |

These observations establish visible controls, not verified quality or successful behavior for every tool. The sample transcription completed; paid export, generative editing, voice recording and every graphic were not exercised. The browser reported an inability to play the sample during preparation, and the editor preview showed a black picture with watermark while timeline thumbnails were visible. Video playback and final original-app rendering therefore remain unverified in this browser. Visible template counts and marketing claims do not establish complete parity.

## Reelish implications

Reelish's existing 136 looks, font library, resizing, motion, cutout and export tools cover part of the workflow. The full graphics library, independent layer system, online hook generation, voiceover, picture in picture, translation and all original styling behaviors are not complete equivalents. More presets alone do not close those gaps.

Online captions now have an independent publisher-hosted client and service implementation in this repository. This does not use Captik's authenticated endpoints. A publisher must deploy the service and store its provider key server-side before end users can use online captions. No live service has been provisioned. Free upstream and hosting tiers have shared quotas; unlimited free online transcription is not promised.
