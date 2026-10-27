# Use your OpenRouter key

1. Open **AI tools → AI connection & key**.
2. Choose **My OpenRouter key**, enter your key in the password field, and save.
3. Import or type captions, then use Hinglish, Translate, Write opening hooks, or Plan an edit. Review the result before applying it.

Keys are encrypted using the operating system's credential storage and saved only in this installation's settings. The saved key is never returned to the editor, included in projects, or shipped in the installer. A blank save keeps the existing key. **Remove saved OpenRouter key** deletes it. If secure storage is unavailable, saving fails rather than writing plaintext.

Personal mode sends caption text and timing directly to the official OpenRouter chat-completions endpoint. It does not use the publisher's private hosted service. Requests refuse redirects, use `openrouter/free`, and enforce zero prompt/completion price ceilings. Provider quotas still apply; there is no paid fallback. Paid speech transcription remains disabled. Adding a key does not convert new audio into timed captions.

**Publisher service** remains a separate connection choice. It requires a publisher-configured endpoint and access to that service. The currently private deployment is not exposed or bypassed by adding personal-key support.

Verification covers real Windows credential encryption, UI save/blank-save/remove, preservation across speech-setting edits, secret redaction, and a controlled direct AI request in both source and packaged app. The test credential is synthetic; no personal key is supplied automatically.
