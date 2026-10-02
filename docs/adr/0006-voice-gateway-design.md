# ADR-0006: Voice Gateway Design

## Status
Accepted

## Context
Samadhan's core differentiator is voice-first interaction. The phone channel requires real-time streaming: telephony providers send bidirectional audio over WebSocket, and we must process it with low latency (target p95 response ≤ 1.5s after the user stops speaking).

The voice gateway must handle:
- Bidirectional WebSocket audio streams from telephony providers (Exotel, Plivo, Twilio-style)
- Voice Activity Detection (VAD) for endpointing
- Streaming Speech-to-Text (STT)
- LLM inference for structured slot extraction
- Streaming Text-to-Speech (TTS) for response
- Barge-in (user interrupts TTS playback)
- DTMF detection (press 0 for human)
- Agent transfer (SIP) or callback task creation
- Call recording and storage
- Per-call and per-tenant limits

## Decision
We build the **voice-gateway** as a separate Node.js WebSocket service (`apps/voice-gateway`), deployed as its own container, sharing the same codebase and `packages/domain` logic.

Architecture:
1. Telephony provider connects via WebSocket with bidirectional audio frames.
2. VAD detects speech end → audio buffer sent to streaming STT.
3. Transcript sent to LLM with tenant catalogue (sub-types, nodes, keywords) for structured slot extraction (strict JSON schema).
4. Response text sent to streaming TTS → audio frames sent back to the WebSocket.
5. Barge-in: incoming audio during TTS playback cancels the current TTS stream.
6. Session state held in Redis for live calls; durable turns persisted to Postgres.
7. All audio stored to S3/MinIO per retention policy.

The same intake engine logic (slots, guardrails, confirmation) is shared with app voice and WhatsApp voice note paths. The difference is the transport: gateway uses streaming; app/WhatsApp use upload-then-process.

## Consequences
- **Separate process:** the voice gateway runs independently and scales based on concurrent call count (target: 50 concurrent calls per replica). It does not share the API's request lifecycle.
- **Latency-critical:** every millisecond matters. Provider adapter selection (fastest STT/TTS) and prompt engineering (shortest effective prompts) directly affect user experience.
- **Provider dependency:** real-time performance depends on STT/TTS/LLM provider latency. Circuit breakers fall back to an agent queue when providers are slow or down.
- **Testing:** load testing with simulated concurrent calls is essential. The AI evaluation harness tests accuracy; k6 tests throughput and latency.
