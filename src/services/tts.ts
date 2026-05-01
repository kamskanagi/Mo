// src/services/tts.ts
//
// Text-to-speech wrapper using expo-speech.
// Handles voice selection, queueing, and rate control.

import * as Speech from 'expo-speech';

export type TtsLocale = 'zh-TW' | 'zh-CN';

interface SpeakOptions {
  locale?: TtsLocale;
  rate?: number;          // 0.5 = slow, 1.0 = normal, 1.5 = fast
  onStart?: () => void;
  onDone?: () => void;
  onError?: (error: any) => void;
}

/**
 * Speak Chinese text using the device's TTS engine.
 *
 * @param text - Chinese text to speak
 * @param options - Voice locale, rate, and callbacks
 *
 * @example
 *   speak('你好', { locale: 'zh-TW', rate: 0.8 });
 */
export async function speak(text: string, options: SpeakOptions = {}): Promise<void> {
  const {
    locale = 'zh-TW',
    rate = 0.85,
    onStart,
    onDone,
    onError,
  } = options;

  // Stop any currently playing speech
  await stop();

  Speech.speak(text, {
    language: locale,
    rate,
    pitch: 1.0,
    onStart,
    onDone,
    onError: (err) => {
      console.warn('TTS error:', err);
      onError?.(err);
    },
  });
}

/**
 * Speak a sequence of texts with pauses between each.
 * Useful for reading conversation lines one by one.
 *
 * @param texts - Array of Chinese text strings
 * @param options - Voice locale, rate, and callbacks
 * @param pauseMs - Milliseconds to pause between items (default 500)
 *
 * @example
 *   speakSequence(
 *     ['你好！', '我是小明。', '你是學生嗎？'],
 *     { locale: 'zh-TW' },
 *     600
 *   );
 */
export async function speakSequence(
  texts: string[],
  options: SpeakOptions = {},
  pauseMs: number = 500
): Promise<void> {
  for (let i = 0; i < texts.length; i++) {
    await new Promise<void>((resolve, reject) => {
      speak(texts[i], {
        ...options,
        onDone: resolve,
        onError: reject,
      });
    });

    // Pause between items (not after the last one)
    if (i < texts.length - 1) {
      await new Promise((r) => setTimeout(r, pauseMs));
    }
  }
}

/**
 * Stop any currently playing speech.
 */
export async function stop(): Promise<void> {
  await Speech.stop();
}

/**
 * Check if the TTS engine is currently speaking.
 */
export async function isSpeaking(): Promise<boolean> {
  return Speech.isSpeakingAsync();
}

/**
 * Get available voices for Chinese.
 * Useful for letting users pick their preferred voice.
 */
export async function getChineseVoices(): Promise<Speech.Voice[]> {
  const voices = await Speech.getAvailableVoicesAsync();
  return voices.filter(
    (v) => v.language.startsWith('zh-TW') || v.language.startsWith('zh-CN')
  );
}
