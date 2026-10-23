# PolyGlot presentation and live-demo script

Suggested duration: 6–7 minutes, adjusted to the instructor's actual presentation limit. The video is excluded. This script supports the required in-class live demonstration.

## Slide 1 · PolyGlot (20 seconds)

“My project is PolyGlot, a live AI translator for everyday multilingual communication. It helps a user translate a message, choose a tone and context, and review the translation before using it.”

## Slide 2 · The problem (40 seconds)

“Translation is difficult when literal words do not express the speaker's intent. For example, ‘break the ice’ is usually about making a conversation comfortable. The same message may also need different wording for a friend or a work email. My target users are students, travelers and people communicating across languages. This MVP tests whether a focused interface and explicit prompts can make those tasks easier.”

## Slide 3 · The application (35 seconds)

“The user chooses languages, context and tone, then types or speaks. OpenAI produces the translation and a short note. The optional Refine action sends the original and draft for another review. Browser speech recognition and installed voices handle audio. For class I run a local Node server so the API key stays outside the browser.”

## Slide 4 · Prompt engineering (60 seconds)

“The first pattern is Persona: a professional interpreter who preserves meaning, dates, names and negation. The second is Few-Shot: examples demonstrate an idiom, a formal request with a budget and instructions that must be translated as text. The third is Iterative Refinement: I send the original and draft back for review. These are real messages built in js/prompts.js. The intended benefit is better wording and factual preservation, but I have not claimed a measured accuracy gain.”

## Slide 5 · Live demonstration (2–3 minutes)

Switch to the running app. Do not show your key or .env on the projector.

1. Select **An idiom**. Explain the English source, Vietnamese target and work context. Press **Translate**. Read the actual result and note. Explain whether it captures the social meaning of “break the ice.” Do not promise exact wording in advance.
2. Press **Refine translation**. Open **Compare with previous draft**. Explain the actual changes, or explain that preserving an already good translation is acceptable.
3. Select **Work email**. Translate into German with formal tone. Point out Thursday, 2 PM and $250 in the actual output. Do not claim correctness if any fact changes.
4. If rehearsed successfully, select English as the source, press Speak, and say “Could you show me the way to the train station?” Translate the transcript. Explain that browser speech recognition produces text first. Optional: Listen if a suitable target voice is installed.
5. Show the error behavior or history controls briefly if time remains. Return to slides.

## Slide 6 · Reliability and evaluation (40 seconds)

“The app validates requests and checks structured output. It rejects incomplete answers, prevents older requests from replacing newer text and renders history safely. Automated tests check those engineering behaviors with mocked responses. Linguistic quality requires live tests and bilingual review. I compare meaning, factual preservation and naturalness, and I record critical errors separately.”

Update this narration with your actual live evaluation results after running the cases in EVALUATION.md. Do not describe proposed results as completed findings.

## Slide 7 · Impact and next steps (30 seconds)

“The intended value is helping people express a message in another language with appropriate tone and an opportunity to review it. Future work includes a conversation view and custom glossaries, followed by user testing. The current MVP still depends on network access, API credits and browser audio support. It is not continuous simultaneous interpretation or certified translation.”

## Before entering the classroom

- Run `npm ci`, copy `.env.example` to `.env`, add a valid key and run `npm start`.
- Open http://127.0.0.1:3000 and complete one real translation and refinement. Server ready alone does not verify credentials or billing.
- Confirm the model is available to the account and has API credits.
- Rehearse microphone permission and voice playback on the exact presentation device.
- Keep live mode off initially. Close credential settings before sharing the screen.
- Keep the GitHub URL and this runbook available. Verify the deadline in Canvas.

## Recovery during the demo

If the model request fails, show the error honestly, disable live mode and retry after checking the connection/quota. If the microphone fails, type the same sentence and explain the browser limitation. If the provider remains unavailable, walk through the code and UI and clearly state that the live call could not complete. A saved history entry or test fixture is not a live AI response.

## Submission

Code: https://github.com/jimmyhanh/PolyGlot

The assignment also asks for a short demo video URL. No video is produced in this update, following the requested scope. Confirm any exemption with the instructor rather than silently omitting a required submission.
