# CS4680 AI Assistant Project: PolyGlot

**Student:** Hung Anh Ho  
**Project:** PolyGlot, a live AI translator  
**Repository:** https://github.com/jimmyhanh/PolyGlot  
**Report date:** October 23, 2026  
**Due date:** See Canvas. No date was supplied in the assignment.

## 1. Problem and market need

People communicating in an unfamiliar language need more than a word-by-word substitution. An idiom can become confusing when translated literally. A casual request can sound inappropriate in a work email. Names, times, amounts and negations must remain accurate.

PolyGlot targets students, travelers and people having everyday multilingual conversations. A concrete use case is an English-speaking student writing a polite Vietnamese message or a formal German scheduling email. The MVP makes tone and context explicit, shows the translation, and lets the user ask for a review of that draft.

This is a product hypothesis based on the use case, not a claim backed by customer interviews or market-size research. A future validation step is to observe bilingual users completing common tasks and compare effort, clarity and meaning preservation with their current workflow.

## 2. Application design

The web UI provides source text, source/target languages, context and tone. The user can enter text or use browser speech recognition, translate, inspect the output and notes, then refine or copy the translation. History restores both the text and its language/tone/context settings.

The default history is temporary. Device persistence requires an explicit opt-in. Errors remain visible beside the interaction, and optional speech features do not block typed translation. Keyboard focus, semantic labels, live status updates and responsive layout support accessibility.

The LLM performs translation, source-language identification and short explanatory notes in one request. The refinement action performs a new request using both the source and the previous draft. Browser services perform speech recognition and synthesis; those features are not implemented by the text LLM.

## 3. Implemented MVP

The app uses HTML, CSS and modular JavaScript, with a Node.js local server as the recommended demo setup. The server reads an OpenAI key from `.env` and calls Chat Completions using a configurable model, defaulting to `gpt-4.1-mini`. It validates input, requests structured JSON, checks the output and returns it to the UI.

GitHub Pages remains a static personal-demo option. It uses the same prompt builder with a key held in page memory. The local server keeps the provider key outside browser code. Neither mode includes a fake offline translation path.

Each request contains source text, selected languages, tone, context and an optional previous draft. When a user edits the input or clears the page, the app aborts and invalidates the old request. A late response cannot overwrite newer input. History uses text nodes rather than treating source/model text as HTML.

## 4. Prompt engineering patterns

| Pattern              | Implementation                                                                                                             | Intended improvement                                                              | Demonstration                                                 |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Persona              | `buildMessages()` in `js/prompts.js` assigns a professional multilingual interpreter role and preservation rules.          | Focuses generation on translation while preserving meaning and facts.             | Translate a work message and inspect names, numbers and tone. |
| Few-shot             | Three user/assistant examples show an idiom, a formal request with date/currency, and instruction text translated as data. | Gives concrete demonstrations of desired behavior and the JSON response contract. | Translate an unseen idiom such as “break the ice.”            |
| Iterative refinement | Refine translation sends the original text and previous draft with a review instruction.                                   | Offers a second pass for omissions, mistranslations and tone.                     | Compare the previous draft with the refined output and notes. |

These are implemented patterns, not only explanations in the report. Their benefit is an evaluation hypothesis until measured. A refinement may retain an already appropriate translation and is not guaranteed to improve every result.

### Prompt excerpts

Persona: “You are PolyGlot, a professional multilingual interpreter.” The full prompt asks it to preserve names, numbers, dates, negation and meaning, and to translate idioms by meaning.

Few-shot example: “Could you give me a hand?” becomes “Bạn có thể giúp tôi một tay không?” with a short note explaining the idiom. An additional example preserves a Friday deadline and a $250 budget. A third translates an embedded instruction instead of following it.

Refinement: “Review the previous draft against the original text for omissions, mistranslations, tone and idioms.” The original text stays available so the model has a reference beyond its own draft.

All source/draft text resides in the user JSON as untrusted content. The server also validates language, context and tone choices. This reduces accidental instruction mixing but does not prove immunity to prompt injection.

## 5. Value, limitations and future applications

The intended value is faster access to context-appropriate translations and a clearer opportunity to review wording. Notes and draft comparison give users information to assess the output. Potential extensions include a two-person conversation view, saved user glossaries, human quality ratings and a dedicated streaming audio pipeline.

No human evaluation or accuracy improvement percentage is claimed. Risks include mistranslated idioms, unsupported cultural assumptions, speech-recognition errors, model latency and provider costs. The UI asks users to review important details. The product is not certified interpretation for consequential decisions.

A future hosted service would need account-based access, persistent quota enforcement, privacy controls and monitored spend. Any revenue model remains a hypothesis, such as an optional paid plan for glossary and conversation features after user validation.

## 6. Testing and presentation readiness

Automated tests cover request validation, prompt composition, refinement payloads, response parsing, stale-request cancellation, history failures, server credential isolation, access controls, rate limits and provider failures. Provider responses in these tests are mocked. Browser test scenarios cover desktop/mobile flows and safe history rendering. The initial automated browser run could not start because the environment lacked Chromium and its download returned an invalid archive. This limitation is separate from the passing unit/HTTP suite. A subsequent check of the public Pages interface caught cached legacy JavaScript loading with the new HTML. Versioned asset URLs now keep the HTML, entry point and imported modules aligned during upgrades.

A real account/device rehearsal remains required: valid API credentials, a live translation, a refinement, microphone permissions and target-language playback. See `EVALUATION.md` for test cases and `PRESENTATION.md` for the rehearsal and live demonstration sequence. Do not label mocked checks as a successful live-model demo.

## 7. Rubric map

| Criterion                            | Weight / points | Evidence in this update                                                     | Remaining responsibility                              |
| ------------------------------------ | --------------- | --------------------------------------------------------------------------- | ----------------------------------------------------- |
| Problem identification and relevance | 10% / 5         | Sections 1 and 5; concrete everyday-language use cases                      | Explain the problem during presentation.              |
| Design and implementation            | 30% / 15        | Working UI and API integration; source code and setup guide                 | Supply credentials and complete the device rehearsal. |
| Prompt engineering                   | 20% / 10        | Persona, few-shot and refinement in shared prompt code                      | Demonstrate and discuss observed outputs.             |
| UI/UX                                | 10% / 5         | Responsive UI, labels, tone/context inputs, output notes and failure states | Verify on the presentation browser/device.            |
| Presentation and live demo           | 30% / 15        | Slide deck, speaker script and live-demo runbook                            | Deliver the live presentation.                        |

This table maps deliverables to the rubric; it does not predict or award a grade.

## 8. Submission checklist

- Submit the repository URL: https://github.com/jimmyhanh/PolyGlot
- Confirm the due date in Canvas.
- Run the app with a valid API account before presenting.
- Present the problem, live app, prompt patterns and future use cases.
- The short demo video is deliberately excluded at the user's request. The assignment still lists it as a submission requirement unless the instructor grants an exception.

## GenAI use statement

AI assistance supported code review, implementation changes, test creation and drafting of project documentation/presentation materials. Hung Anh Ho should review the implementation, verify live outputs and be prepared to explain the prompts and design choices. The application itself uses OpenAI-generated translations, which can contain errors.
