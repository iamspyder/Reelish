# Third-party components

Reelish source is MIT licensed. Bundled components retain their licenses and notices.

- Electron: MIT, https://github.com/electron/electron
- whisper.cpp 1.9.2: MIT, pinned commit 306c88f4d1286aec1bf96e544632897886af5501, https://github.com/ggml-org/whisper.cpp
- Whisper Base multilingual model: MIT, GGML conversion from https://huggingface.co/ggerganov/whisper.cpp. SHA-256: 60ed5bc3dd14eea856493d334349b405782ddcaf0028d4b5df4088345fba2efe.
- FFmpeg and FFprobe: bundled static builds can include GPL components. Distribution, source and license links: https://github.com/eugeneware/ffmpeg-static and https://github.com/descriptinc/ffprobe-static. Reelish invokes these tools as separate processes. Refer to the pinned npm package versions for their binary source releases.
- MediaPipe Tasks Vision and segmentation assets: notices and provenance in src/assets/vision.
- Fonts and static export derivatives: per-family licenses in src/assets/fonts.
- Microsoft Visual C++ release runtime, Windows only: app-local redistributable components copied from installed Visual Studio Redist directories, subject to Microsoft's terms. https://learn.microsoft.com/en-us/cpp/windows/redistributing-visual-cpp-files

The test JFK speech sample comes from whisper.cpp's samples directory. User projects, test media and credentials are not app assets. Reelish is independent and is not affiliated with other caption products.
