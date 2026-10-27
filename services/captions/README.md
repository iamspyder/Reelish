# Reelish free-only OpenRouter service

The publisher has selected **free models only**. Read the [policy](../../docs/FREE-ONLY.md).

The shared service supports opening hooks, translation, reviewed edit plans, and Hindi-to-Hinglish conversion of existing timed captions. Every text call is pinned to `openrouter/free` and zero prompt/completion price limits. Model environment overrides are ignored. Provider quotas and availability apply; there is no paid fallback.

`/v1/transcribe` is disabled (HTTP 403), including requests from older installers. No audio is read or forwarded. Import SRT captions or add captions manually for text tools. Translation keeps line times and estimates word times; Hinglish preserves matching original word times.

## Hosting

The current deployment is private at https://reelish-ai-iamspyder.kindhawk66.chatgpt.site, per the publisher's explicit choice. Health, blocked speech, and one real free Hinglish conversion were verified. The desktop service URL remains unconfigured because shared installers cannot anonymously access a private service. No private access token is shipped. The following Cloudflare steps remain an alternative hosting guide.

The Cloudflare Worker can be deployed with `npx wrangler deploy` from this directory. Store `OPENROUTER_API_KEY` in runtime secret storage using `npx wrangler secret put OPENROUTER_API_KEY`. Never put it in source, chat, or the EXE. The included rate limiter is required. Hosted service activation remains separate from source implementation.

Check `/health`: `ready` indicates a configured secret, while `freeOnly: true` and `speechEnabled: false` state the policy. This does not verify provider availability. Configure only a verified public HTTPS origin in `src/caption-service.json`, then rebuild. No private access token belongs in that file.

Only caption text, IDs, and timing are sent for text tools. OpenRouter/provider data handling applies. Payload limits, server validation, review/apply and undo are included. Provider tests use simulated responses; live model quality is a separate check.

Official references: [free router](https://openrouter.ai/openrouter/free), [provider price limits](https://openrouter.ai/docs/guides/routing/provider-selection), [usage limits](https://openrouter.ai/docs/api/reference/limits).
