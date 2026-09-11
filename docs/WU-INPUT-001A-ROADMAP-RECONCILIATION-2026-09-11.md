# WU-INPUT-001A — Roadmap Reconciliation

**Date:** 2026-09-11  
**Parent:** `WU-INPUT-001`  
**Child:** `WU-INPUT-001A`  
**Decision source:** founder direction after the initial parent epic/backlog registration

## Decision

The detailed Slice 0 execution contract in `WU-INPUT-001A` supersedes the earlier exploratory wording in the `WU-INPUT-001` / P1.9 backlog registration **for Slice 0 only**.

The earlier registration mentioned Roman Urdu provider benchmarking as possible Slice 0 work. The founder has now explicitly decided:

> **Do not change or re-platform the current client-side editor/transliteration behavior in Slice 0. Prioritize capabilities Write Urdu does not yet have.**

Therefore Slice 0 now means:

1. Urdu↔English Voice Translator benchmark/architecture;
2. uploaded Audio/Voice Note→Text + optional translation benchmark;
3. shared bidirectional semantic Urdu↔English translation benchmark;
4. Word Meaning / Dictionary / verified Synonyms benchmark;
5. optional spoken translated output later.

## Protected work

Do not spend `WU-INPUT-001A` implementation effort on:

- replacing the current Roman Urdu provider;
- changing current transliteration candidates;
- changing homepage/editor input behavior;
- altering existing Voice controls inside current editors;
- changing `english to urdu typing` query ownership.

`WU-JOURNEY-001B` remains the owner of Roman Urdu resilience and may continue independently under its own evidence/priority rules. It is not a prerequisite for this child Slice 0.

## Relationship to the canonical backlog

`WU-INPUT-001` remains the P1.9 parent and remains behind the `WU-PLAT-002H` core-UI gate.

`WU-INPUT-001A` is benchmark/research work and is safe to execute now because it does not modify production UI/runtime behavior.

When the canonical backlog next receives a normal grooming edit, its P1.9 child bullets should be shortened to point to `WU-INPUT-001A` rather than restating the superseded Roman-provider task.

Until that grooming edit, agents must use this read order for Slice 0:

1. `specs/WU-INPUT-001-multimodal-urdu-input-conversion-platform.md`
2. **this reconciliation note**
3. `specs/WU-INPUT-001A-standalone-language-voice-capability-benchmark.md`
4. `docs/WU-INPUT-001A-CAPABILITY-RESEARCH-2026-09-11.md`
5. `skills/wu-input-001a/SKILL.md`

The child contract owns the detailed Slice 0 execution decision.
