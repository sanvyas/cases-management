# ADR-0005: Expo (React Native) for Mobile Apps

## Status
Accepted

## Context
Samadhan needs mobile apps for two audiences:
1. **Staff** (officers, field workers, vendors): task management, approvals, camera-based ATR with GPS watermark, offline-first operation, live location sharing, push notifications.
2. **Citizens**: complaint registration (voice and photo), tracking, feedback, QR scanning.

Both need Android (primary market) and iOS. The web team uses React and TypeScript.

Options considered:
1. **Native Android (Kotlin) + iOS (Swift)** — best performance, highest cost, two codebases.
2. **Flutter** — good performance, Dart language (team doesn't know it), separate UI toolkit from the web.
3. **React Native (bare)** — shared language with web, large ecosystem, but complex native build setup.
4. **Expo (React Native)** — managed workflow simplifies builds, OTA updates, native module access via Expo modules, EAS for CI/CD.

## Decision
We use **Expo** with expo-router for navigation, building two app variants (`staff` and `citizen`) from one codebase using app config variants.

Key libraries:
- **Offline storage:** op-sqlite or WatermelonDB for local DB, with a sync queue that validates against server state on reconnect.
- **Camera:** expo-camera with GPS and timestamp watermark overlay.
- **Location:** expo-location for GPS and background location (workforce opt-in).
- **Push:** FCM via expo-notifications.
- **Builds:** EAS Build for CI/CD, EAS Update for OTA patches.

## Consequences
- **Shared language:** TypeScript across web and mobile reduces context switching. `packages/domain` and `packages/contracts` are shared.
- **Expo limitations:** some native features may require custom native modules or ejecting to bare workflow. Current requirements are well within Expo's managed capabilities.
- **App size:** Expo apps tend to be larger than native. Acceptable for the target audience (staff with assigned devices, citizens with mid-range Android phones).
- **Offline complexity:** the sync queue with conflict resolution (server wins, user gets a clear message) is the hardest part to get right. Thorough testing with airplane-mode scenarios is essential.
