// src/hooks/useSpeech.ts

import { useCallback, useState } from 'react';
import { speak, stop, isSpeaking } from '../services/tts';
import type { TtsLocale } from '../services/tts';

/**
 * Hook for text-to-speech with loading/speaking state.
 *
 * @example
 *   const { speakText, speaking } = useSpeech('zh-TW');
 *   <SpeakButton onPress={() => speakText('你好')} speaking={speaking} />
 */
export function useSpeech(locale: TtsLocale = 'zh-TW') {
  const [speaking, setSpeaking] = useState(false);

  const speakText = useCallback(
    async (text: string, rate: number = 0.85) => {
      setSpeaking(true);
      await speak(text, {
        locale,
        rate,
        onDone: () => setSpeaking(false),
        onError: () => setSpeaking(false),
      });
    },
    [locale]
  );

  const stopSpeech = useCallback(async () => {
    await stop();
    setSpeaking(false);
  }, []);

  return { speakText, stopSpeech, speaking };
}
