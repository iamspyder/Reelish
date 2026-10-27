# Free-only AI policy

Reelish's publisher has selected free models only. This is enforced in source, not just a setting:

- Text requests use `openrouter/free` with provider prompt/completion price ceilings of zero. Environment model overrides cannot enable paid models. There is no paid fallback.
- `/v1/transcribe` always returns HTTP 403 before reading the audio or contacting a provider. The desktop also blocks online speech before extracting or uploading media. The older personal paid speech option is disabled too.
- Fresh settings select the disabled online speech mode, showing a clear explanation. No local engine is silently selected as a fallback. Existing explicitly selected bundled/local engines remain optional.
- Opening hooks, translation, edit suggestions and Hindi-to-Hinglish conversion operate on existing captions. Import an SRT or enter captions manually. Text AI requires activation of the shared hosted service.
- Hinglish preserves line boundaries. Existing word times are retained when metadata matches the input tokens; otherwise new word timing is estimated within each caption line. It does not align new speech.
- Free model availability and provider quotas apply. A quota failure stays a failure; no paid request is substituted. Free does not mean unlimited.

No provider key belongs in the EXE, source, or Git repository. Runtime secrets remain on the hosted server. Do not publish a private Sites access token as part of the desktop configuration.
