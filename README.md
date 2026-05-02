# Mò — Learn Chinese Characters

A React Native app for learning Chinese characters (汉字), built with Expo.

## Features

- **Learn** — study new characters week by week (3,183 total)
- **Read** — read example sentences and conversations
- **Review** — spaced repetition (SRS) flashcard reviews
- **Write** — stroke-order writing practice with feedback
- **Profile** — progress tracking and daily stats

## Tech Stack

| Layer | Library |
|---|---|
| Framework | Expo 54 / React Native 0.81 |
| Navigation | Expo Router 6 (file-based) |
| Database | expo-sqlite 16 (WAL mode, local) |
| State | Zustand 5 |
| Auth | Local — bcrypt-style hash via expo-crypto, tokens in expo-secure-store |
| Animations | react-native-reanimated 4 + react-native-worklets |
| TTS | expo-speech |

## Project Structure

```
src/
  app/
    auth/         login & signup screens
    (tabs)/       learn, read, review, write, profile
    onboarding.tsx
  components/
    character/    CharacterCard, CharacterDetail, PinyinText, SpeakButton
    ui/           Button, Badge, Card, ProgressBar, IconButton
  db/             schema, queries, seed
  services/       auth, SRS algorithm, stroke matcher, TTS
  stores/         useAuthStore, useAppStore, useProgressStore, useSettingsStore
  hooks/          useCharacter, useProgress, useWeekChars, useSpeech
  data/           characters.json (3,183 entries), weeks, conversations
  theme/          colors, typography, spacing
  types/          character, progress, navigation, auth, settings
```

## Getting Started

```bash
npm install
npm start          # Expo Go / development build
npm run ios        # iOS simulator
npm run android    # Android emulator
npm test           # Jest test suite
npm run test:coverage
```

## Auth Flow

See `auth-flow.drawio` for the full diagram.

1. App launch checks for a stored session token
2. Unauthenticated → Login screen (or tap to Sign Up)
3. Credentials validated locally against the SQLite `users` table
4. On success → onboarding check → Main app (5 tabs)
5. New accounts are auto-logged-in after signup
