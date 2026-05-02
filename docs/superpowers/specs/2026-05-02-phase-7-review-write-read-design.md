# Phase 7 — Review, Write, Read Tabs

**Date:** 2026-05-02
**Status:** Approved

## Overview

Implement the three remaining stub tabs — Review (SRS flashcard review), Write (stroke-order practice), and Read (graded conversations). Built sequentially: Review → Write → Read.

---

## Review Tab

### Interaction model
Anki-style 4-button SRS. Card front shows the character; tap to flip and reveal pinyin, keyword, definition, and example words. Rate with **Again / Hard / Good / Easy** to advance.

### Architecture

| Unit | Responsibility |
|---|---|
| `useReviewQueue` hook | Queries SQLite for cards where `status != 'new' AND next_review <= now`. Manages current card + remaining count. |
| `FlipCard` | Reanimated 3D Y-axis flip (front → back). |
| `SRSRatingBar` | Again / Hard / Good / Easy buttons. On tap: calls `srs.ts`, writes updated interval + factor to `user_progress`, advances queue. |
| `ReviewScreen` | Orchestrates the above. Entry point for the tab. |
| `ReviewComplete` | Shown when queue is empty. Displays cards reviewed + again count. |

### SRS rating mapping (srs.ts)

| Button | Interval | Ease factor |
|---|---|---|
| Again | Reset to 1 day | −0.20 |
| Hard | × 1.2 | −0.15 |
| Good | × ease factor | no change |
| Easy | × ease factor × 1.3 | +0.15 |

### Data flow
1. Mount → `useReviewQueue` queries `user_progress` for due cards
2. Show card front (character, stroke count)
3. Tap → flip to back (pinyin, tone, keyword, definition, examples)
4. Tap rating → update DB → advance to next card
5. Queue empty → `ReviewComplete` screen

### Empty states
- **No studied cards yet** (all cards still `status = 'new'`): show "Nothing to review yet — study some characters in Learn first"
- **Cards exist but none due**: show "You're all caught up!" with the next scheduled review time (earliest `next_review` from `user_progress`)

---

## Write Tab

### Interaction model
Stroke-order practice using `react-native-hanzi-writer`. User draws each stroke on a canvas; HanziWriter validates against built-in stroke data. "Show me" triggers animated guide for the current stroke. "Skip" advances to next character.

### Dependency
Add `react-native-hanzi-writer`. Uses `react-native-svg` (already installed). Replaces `strokeMatcher.ts` for validation — HanziWriter's built-in checker handles stroke comparison. `strokeMatcher.ts` is kept but unused in this phase.

### Architecture

| Unit | Responsibility |
|---|---|
| `WriteScreen` | Orchestrates character queue for the current week. On character complete: writes `writing_mistakes` to `user_progress`. |
| `HanziPracticeCard` | Wraps `react-native-hanzi-writer`. Props: `character`, `onComplete(mistakes: number)`. Shows animated guide on "Show me" tap or first attempt failure. |
| `WritingProgress` | "Character 2 of 8" label + progress bar. |
| `WriteComplete` | Session summary (total characters, total mistakes). |

### Character selection
Practice characters from the user's current week (`useAppStore.currentWeek`). If no week is set, default to week 1.

### Data flow
1. Mount → load characters for current week from DB
2. Show `HanziPracticeCard` for first character
3. User draws strokes one at a time; HanziWriter validates each
4. Stroke correct → green flash, advance to next stroke
5. Stroke wrong → red flash, retry (mistake count++)
6. All strokes done → show character complete overlay → next character
7. All characters done → `WriteComplete` screen

### Controls
- **Show me** — triggers HanziWriter animated guide for current stroke
- **Skip** — advance to next character; counts all remaining strokes as wrong

---

## Read Tab

### Interaction model
Chat-bubble layout. Lines reveal one at a time on tap. Speaker A on left (dark bubble), Speaker B on right (blue bubble). Global toggles for pinyin and English. TTS button per line.

### Architecture

| Unit | Responsibility |
|---|---|
| `ReadScreen` | Lists all conversations with lock/unlock/done state. |
| `ConversationView` | Manages `revealedCount` (0 → lines.length). Tap increments. |
| `ChatBubble` | Renders one line: Chinese + pinyin (if toggle on) + English (if toggle on) + TTS button. Animates in with fade+slide (reanimated). |
| `ReadingControls` | Pinyin / EN toggle bar. Local state per session. |
| `ConversationComplete` | Shown at end. Options: read again, back to list. |

### Unlock logic
- Conversation for week N unlocks when `useAppStore.currentWeek >= N`
- Completed state stored in `useSettingsStore` (key-value, already wired to SQLite)
- Completion is not required to advance — reading is supplemental, not gated

### List item states
| State | Visual |
|---|---|
| Locked | Greyed out, lock icon |
| Available (unread) | Normal, "New" badge |
| Completed | Normal, "Done" badge |

### Data flow
1. `ReadScreen` mounts → reads `currentWeek` + completed keys from store
2. Tap unlocked conversation → `ConversationView` opens
3. Each tap reveals the next line with animation
4. TTS button → `useSpeech` hook speaks the Chinese text
5. All lines revealed → "Tap to complete" → writes completion to `useSettingsStore`
6. `ConversationComplete` screen shown

---

## Implementation sequence

1. **Review** — highest learning value, all services already exist
2. **Write** — install HanziWriter, build practice flow
3. **Read** — data exists, mostly UI

## Out of scope for this phase

- Editing or adding conversations
- Audio recording / pronunciation scoring
- Review session length limits (review all due cards)
- Write practice outside the current week
