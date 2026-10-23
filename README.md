# PolyGlot · Live AI Translator

PolyGlot helps people communicate across languages when wording, tone and idioms matter. The CS4680 MVP combines typed or browser-transcribed speech with AI translation, context and tone controls, and a second-pass refinement action.

- **Code:** https://github.com/jimmyhanh/PolyGlot
- **GitHub Pages:** https://jimmyhanh.github.io/PolyGlot/
- **Project report and rubric map:** [docs/CS4680_PROJECT_REPORT.md](docs/CS4680_PROJECT_REPORT.md)
- **Presentation script and live-demo runbook:** [docs/PRESENTATION.md](docs/PRESENTATION.md)
- **Evaluation cases:** [docs/EVALUATION.md](docs/EVALUATION.md)

## Recommended class setup

Install **Node.js 22 or newer**, then:

```bash
git clone https://github.com/jimmyhanh/PolyGlot.git
cd PolyGlot
npm ci
```

Copy `.env.example` to `.env` using your editor, or:

```bash
# macOS / Linux
cp .env.example .env
# Windows PowerShell
Copy-Item .env.example .env
```

Edit `.env` locally:

```dotenv
OPENAI_API_KEY=your_actual_api_key
OPENAI_MODEL=gpt-4.1-mini
HOST=127.0.0.1
PORT=3000
```

Run `npm start` and open **http://127.0.0.1:3000**. The connection panel should say **Server ready**. A successful translation verifies provider access; health status only confirms configuration. Keep `.env` out of commits. API usage requires provider access and credits independently of a ChatGPT subscription.

## GitHub Pages option

Pages serves static files and cannot read `.env` or run the Node server. Open Connection settings and enter **your own** OpenAI API key for a personal demo. The app keeps it in page memory only, clears the input after submission, and sends it directly to OpenAI. Refresh or **Forget** removes it. Browser scripts can still access a key during use, so use local-server mode for the classroom presentation and never put a shared production key in the page. The old `openai-api-key` localStorage entry is removed on startup.

The old cache-first service worker is retired by `sw.js`. If a previous installation still shows the old UI, reload online or clear this site's service worker/cache in browser settings.

## Features

- Eight selectable languages: English, Vietnamese, Japanese, German, Chinese, Spanish, French and Korean. Auto detection applies to typed text.
- Natural, formal or casual tone; everyday, travel, study or work context.
- **Persona + Few-shot examples** on every request. **Iterative refinement** when you click Refine translation, with the previous draft available for comparison.
- Structured translation, detected-language code and brief notes in one API call.
- Optional live translation after a one-second pause. This is request-based translation, not continuous audio streaming.
- Voice input where browser speech recognition is available. Select the spoken language before pressing Speak.
- Listen where a matching system voice is installed, copy output, swap languages, and load history with its original settings.
- Session-only history by default. Remember on this device is opt-in, holds up to 20 entries, and can be cleared.
- Responsive layout, visible keyboard focus, field labels, status/error announcements and system dark mode.

## Prompt implementation

`js/prompts.js` is the shared prompt source used by the server and Pages client. Its system persona directs faithful translation; three user/assistant examples demonstrate idioms, factual preservation and instruction-as-data behavior. Refinement adds the original source and previous draft, asking the model to check omissions and wording. Brief notes explain relevant choices without requesting hidden reasoning.

Structured JSON improves application parsing, **not proof of translation accuracy**. Runtime checks reject missing, empty, refused or truncated results. Context and tone are controlled choices, while source text stays in a JSON user message. Prompt-injection resistance is an intended behavior that still needs adversarial evaluation.

## Architecture

```text
index.html + css/app.css + main.js
  ApiManager -> local /api/translate OR direct personal-session API call
  TranslationEngine -> cancellation and latest-request handling
  HistoryManager -> session storage policy and optional localStorage
  prompts.js -> validation, persona, examples, refinement, JSON contract
server/app.js -> private API credentials, validation, rate limit, provider call
```

The earlier `script.js`, `styles.css`, files in `original/`, and unused older controller/CSS modules remain as historical reference. The current entry point is `main.js`; it imports only the four modules listed above. `MODULAR-STRUCTURE.md` and `OPTIMIZATION-SUMMARY.md` describe the earlier implementation, not the current runtime.

## Validation

```bash
npm test
npm run lint
npm run format:check
npm run build
```

`build` runs checks; no bundling is necessary. Unit and HTTP tests use mocked provider responses, make no paid API calls, and cannot establish linguistic quality. See the evaluation document for live translation and device rehearsal cases.

## Privacy and deployment limits

Text reaches OpenAI in both modes. Browser speech recognition may send audio to the browser vendor's service. Opting into history saves source text and translations on the device; avoid doing that on shared computers. No analytics or server conversation database is included.

The local server binds to loopback by default, serves only explicitly allowed assets, blocks cross-origin API requests, and limits each connected IP to 30 requests/minute. It times out provider calls and does not return raw provider errors. To bind a non-loopback `HOST`, set `POLYGLOT_ACCESS_TOKEN`, deploy behind HTTPS, and enter the token in the UI. The limiter is in-memory and uses the socket address, so it is not a substitute for user authentication, distributed limits or production abuse controls.

This is a class MVP. API access, latency, translation quality, microphone permissions and installed voices depend on the account/device/network. It offers no offline translation, certified interpretation, continuous simultaneous speech interpretation, user accounts or accuracy guarantee.

## Troubleshooting

| Symptom                             | Action                                                                                                                             |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Server needs OPENAI_API_KEY         | Set it in `.env` in the repository root and restart `npm start`.                                                                   |
| API access rejected                 | Check key validity and access to `OPENAI_MODEL`.                                                                                   |
| Quota/rate limit                    | Check provider billing or wait before retrying. Disable live mode to reduce requests.                                              |
| Pages asks for a key despite `.env` | Pages cannot run the server. Use local-server mode or your personal session key.                                                   |
| Speech input unavailable            | Use a browser with speech recognition support, allow microphone access, and use HTTPS or localhost. Typed input remains available. |
| No installed voice                  | Install a voice for the target language in device settings.                                                                        |
| Invalid/incomplete output           | Retry with a shorter passage. Partial output is deliberately rejected.                                                             |

## Documentation sources

- [OpenAI structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=chat)
- [GPT-4.1 mini model documentation](https://developers.openai.com/api/docs/models/gpt-4.1-mini)

The demo video is intentionally not included in this update. The supplied assignment still lists a video link as a submission item. Check Canvas for the deadline and any instructor-approved exception.
