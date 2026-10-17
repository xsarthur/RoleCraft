# 本地语音面试分析边界

## whisper.cpp 本地转写

服务端支持通过本机 whisper.cpp CLI 进行中文转写；浏览器录音的 WebM/Ogg/MP4 会先由本机 ffmpeg 转为 16kHz 单声道 WAV。准备好 `whisper-cli`（或兼容命令）及中文 GGML/GGUF 模型后设置：

```sh
export ROLECRAFT_LOCAL_ASR_COMMAND=whisper-cli
export ROLECRAFT_LOCAL_ASR_MODEL=/absolute/path/to/ggml-large-v3-turbo.bin
```

可先请求 `GET /api/voice/readiness` 查看探测结果，再向 `POST /api/voice/transcribe` 发送 JSON：`{"audioBase64":"...","mimeType":"audio/wav","durationMs":12000,"language":"zh-CN"}`。需要本机安装 `ffmpeg`（或设置 `ROLECRAFT_FFMPEG_COMMAND`）；缺少 ffmpeg 时，非 WAV 输入返回受控不可用。服务不会下载模型或调用外部供应商。

`server/voice/index.mjs` 是面试语音流程的本地 AI 生成边界。当前工作区没有离线 ASR 运行时或语音模型：本机探查是否发现 `whisper-cli`、`whisper`、`whisper.cpp` 与 `ffmpeg` 以运行时结果为准；Python 也未安装 `faster_whisper`、`vosk`、`speech_recognition`、`torch` 或 `onnxruntime`。仓库里的 BGE ONNX 只做文本向量检索，不能被描述成 ASR。配置 `whisper.cpp`、中文模型和 `ffmpeg` 后，适配器只在内存中校验音频，将原始音频及转换后的 WAV 短暂写入本机隔离临时目录（目录显式 `0700`、文件 `0600`），在 `finally` 中递归清除；命令和模型不存在时不创建临时文件。

因此行为是明确的：

- `analyzeVoiceRequest({audioBase64, ...})` 先校验 WebM/Ogg/WAV/MP4 文件头、大小和可选时长；ASR 不可用时返回 `status: "unavailable"`、`error.code: "transcription_unavailable"`、`providerCalled: false`，不生成假转写或知识评分。
- `mode: "local_fixture"` 是显式的离线端到端 fixture 通道。调用者必须传入已由用户确认的文字转写，随后使用 `deterministic-rules-v1` 检查量规关键词、缺失证据、填充词和可执行重答动作。响应的 `asrMode` 是 `provided_transcript`，不能冒充 ASR。
- 本模块不写持久文件、账户、普通日志或教材索引，不上传音频，也不调用网络或付费供应商。配置本地 whisper.cpp 时只允许隔离临时 WAV（目录 `0700`、文件 `0600`，完成或失败均 `finally` 清理）；临时文件不是账户或普通日志数据。
- 教材引用默认 `none`；调用者传入分节时只标记 `partial`，因为本模块不能独立核验检索版本。检索服务复核后才能在更高层适配器将状态提升为 `bound`。

未来的 HTTP/任务适配器应在服务层完成真实题目和量规版本绑定，并把 `attemptId`、`providerCalled`、`contentVersion`、`indexVersion` 和失败码原样保存。不要把客户端 MIME、时长或题面当成可信事实。

自检：

```sh
node sites/rolecraft/server/voice/self-check.mjs
```

本自检使用合成文件头、文字 fixture 和源代码清理契约检查，不访问麦克风、不联网、不读取真实账户，不能证明 ASR 质量或真实语音识别已接入。它还覆盖“命令存在但模型路径缺失”时不进入本地执行。

浏览器可选的 `SpeechRecognition` 方案另有[边界交接](../../team/ai-generation-interview-voice-browser-speech-v01.md)。该 API 不能称为本地 ASR：浏览器/系统可能向外部语音服务处理语音，网络、供应商和保留期限对应用是未知的。若启用，结果必须标记 `asrMode: "browser_speech"`、`browserExternalProcessing: "unknown"`，仅把用户确认后的可编辑转写交给本地 `local_rules`，不能据此宣称 `providerCalled=false` 代表浏览器没有外发。

