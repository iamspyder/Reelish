# Reelish cloud captions

This service lets installed copies of Reelish transcribe online without asking end users for API keys or local models. The publisher needs a Cloudflare account and a Groq account. Groq's free tier has shared quotas; this is not unlimited free transcription.

The publisher first creates [Cloudflare](https://dash.cloudflare.com/sign-up) and [Groq](https://console.groq.com/) accounts. Account registration and acceptance of their terms are done by the publisher. Choose free plans if paid usage is not wanted.

From this directory, sign in with `npx wrangler login`, deploy with `npx wrangler deploy`, then add the provider key through `npx wrangler secret put GROQ_API_KEY`. Enter the key into the CLI prompt, or directly in Cloudflare's Worker Settings > Variables and Secrets. Never put it in chat, desktop source, GitHub, or an installer. Verify `/health` returns `ready: true`.

Run `node scripts/configure-caption-service.cjs https://YOUR-WORKER.workers.dev` from the project root. This verifies the health endpoint before writing only the public URL into the app. Then build the Windows installer. Fresh installs with this URL configured choose online captions by default. People installing the resulting EXE need only an internet connection for captions. Existing saved engine preferences remain respected. No silent fallback to local speech recognition occurs when online mode fails.

The desktop extracts only audio from the trimmed clips, concatenates it into a mono 16 kHz FLAC file and uploads it. Video frames, graphics, music and provider credentials are not included in that request. The response preserves word timestamps for captions. Local exports still use the desktop renderer.

The worker limits requests by IP, bounds uploads to 24 MB, pins the upstream provider and model, and returns caption data only. Audio is forwarded to Groq and is not stored by this worker. Provider data handling still applies. Rate limits are approximate per Cloudflare location, not a hard global spending cap. Keep the provider account on its free plan if paid usage is not wanted. Public endpoints can consume the shared free quota; add account-based quotas before a broad commercial launch.

No service has been deployed or account created by preparing these files. Contract tests use an in-process fake provider and actual FFmpeg audio extraction. They do not establish live Groq availability, production quotas, or Cloudflare runtime performance.

Official docs: https://console.groq.com/docs/speech-to-text and https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/

