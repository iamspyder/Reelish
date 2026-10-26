# Reelish OpenRouter service

One hosted service powers online captions, Hinglish, hook suggestions, translation and AI edit plans. Installed copies contain only its public URL. The publisher's **OpenRouter API key stays in server secret storage**.

## Activate

1. Sign into your Cloudflare account. If needed, create it at https://dash.cloudflare.com/sign-up and complete registration yourself.
2. From this directory run `npx wrangler login`, then `npx wrangler deploy`.
3. Store the key using `npx wrangler secret put OPENROUTER_API_KEY`, or the Worker's Settings → Variables and Secrets page. Enter it directly there, never in chat, GitHub or an installer.
4. Check `/health`: `ready: true` means the publisher secret is configured. It does not verify credits or model availability.
5. From the project root, run `node scripts/configure-caption-service.cjs https://YOUR-WORKER.workers.dev`. It verifies the expected health response and writes only the public URL into the app.
6. Run a real caption job and AI request with the deployed service. Then build the installer. Fresh installs choose online captions when its URL is configured; existing engine preferences remain respected.

The default text model is `openrouter/free`. The default speech model is `openai/whisper-large-v3`. The publisher can set `OPENROUTER_TEXT_MODEL` and `OPENROUTER_SPEECH_MODEL` as Worker variables. Speech transcription can require credits; free text models have limits and availability varies. No paid text-model fallback is configured. Usage is shared across installed copies; no unlimited-free claim is made.

## Features

- `/v1/transcribe`: accepts mono audio, forwards multipart audio to OpenRouter's timed transcription endpoint, requests word and segment timestamps. Native scripts are preserved.
- Hinglish uses the same speech endpoint and then romanizes Devanagari tokens through OpenRouter. Existing English words and all timestamps stay unchanged. Conversion validates count and token format; it fails explicitly on invalid output.
- `/v1/ai`: generates three hook suggestions, translates caption lines, or suggests a structured edit. IDs, output size, effect names and zoom bounds are validated. The editor previews results before applying them.
- Translation keeps each caption's start/end. Translated word timings are estimated inside the line, not claimed as forced alignment.

Audio extraction respects clip trims and ordering. Only audio is uploaded for captions; only caption text, IDs and timing are sent for text tools. The Worker does not persist uploads. OpenRouter/provider data handling applies. Requests have per-IP limits, bounded payloads and upstream timeouts. Rate limits are approximate per Cloudflare location, not a global spending cap. Configure publisher spending controls and account-based quotas before a broad commercial launch.

## Validation status

Contract tests use a fake upstream and actual FFmpeg audio extraction. Desktop tests exercise review/apply/undo, timing, layers and actual MP4 export. They do not establish live model quality, credits, production quota availability or Cloudflare runtime performance. No live deployment or publisher secret has been provisioned by committing these files.

Official documentation: [OpenRouter timed transcription](https://openrouter.ai/docs/guides/overview/multimodal/stt), [structured responses](https://openrouter.ai/docs/guides/features/structured-outputs), [usage limits](https://openrouter.ai/docs/api/reference/limits).
