// Speech Synthesis (TTS - Text to Speech)
let voicesLoaded = false;
let voices: SpeechSynthesisVoice[] = [];

const loadVoices = (): Promise<SpeechSynthesisVoice[]> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      resolve([]);
      return;
    }

    const getVoicesList = () => {
      let list = window.speechSynthesis.getVoices();
      // Chrome/Edge/Safari may lazy load voices
      if (list.length > 0) {
        voices = list;
        voicesLoaded = true;
        resolve(list);
      } else {
        setTimeout(getVoicesList, 100);
      }
    };

    getVoicesList();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = () => {
        voices = window.speechSynthesis.getVoices();
        voicesLoaded = true;
        resolve(voices);
      };
    }
  });
};

// Start loading voices early
loadVoices();

export const speak = async (
  text: string,
  voiceGender: 'male' | 'female' = 'female',
  rate: number = 0.85
): Promise<void> => {
  return new Promise(async (resolve) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn('Speech synthesis not supported in this browser.');
      resolve();
      return;
    }

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    if (!voicesLoaded || voices.length === 0) {
      await loadVoices();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US'; // Force English pronunciation to prevent Japanese voices reading English text
    utterance.rate = rate; // Eiken 3rd grade is somewhat slow (around 0.8 to 0.9)
    utterance.pitch = 1.0;

    // Filter to English voices
    const englishVoices = voices.filter((v) => {
      const l = v.lang.toLowerCase();
      return l.startsWith('en') || l.includes('en-');
    });

    let selectedVoice: SpeechSynthesisVoice | null = null;

    // Scoring function to select the best quality voice matching the desired gender
    const scoreVoice = (voice: SpeechSynthesisVoice, targetGender: 'male' | 'female'): number => {
      const nameLower = voice.name.toLowerCase();
      let score = 0;

      // Prefer en-US for Eiken standard, then en-GB
      if (voice.lang.toLowerCase() === 'en-us') score += 10;
      else if (voice.lang.toLowerCase() === 'en-gb') score += 5;
      else score += 2;

      // Edge/Chrome High-quality natural and online voices
      if (nameLower.includes('natural')) score += 30;
      if (nameLower.includes('online')) score += 20;
      if (nameLower.includes('google')) score += 15;

      // Gender specific weights
      if (targetGender === 'male') {
        if (
          nameLower.includes('david') ||
          nameLower.includes('guy') ||
          nameLower.includes('andrew') ||
          nameLower.includes('male') ||
          nameLower.includes('james') ||
          nameLower.includes('christopher')
        ) {
          score += 50;
        } else if (
          nameLower.includes('zira') ||
          nameLower.includes('samantha') ||
          nameLower.includes('female') ||
          nameLower.includes('aria') ||
          nameLower.includes('hazel')
        ) {
          // Explicitly female voices should be discouraged for male candidates
          score -= 50;
        }
      } else {
        if (
          nameLower.includes('zira') ||
          nameLower.includes('samantha') ||
          nameLower.includes('aria') ||
          nameLower.includes('female') ||
          nameLower.includes('natasha') ||
          nameLower.includes('hazel')
        ) {
          score += 50;
        } else if (
          nameLower.includes('david') ||
          nameLower.includes('guy') ||
          nameLower.includes('andrew') ||
          nameLower.includes('male')
        ) {
          // Explicitly male voices should be discouraged for female candidates
          score -= 50;
        }
      }

      return score;
    };

    if (englishVoices.length > 0) {
      // Sort english voices by quality score descending
      const sortedVoices = [...englishVoices].sort(
        (a, b) => scoreVoice(b, voiceGender) - scoreVoice(a, voiceGender)
      );
      selectedVoice = sortedVoices[0];
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      console.log(`Speech selected voice: ${selectedVoice.name} (${selectedVoice.lang})`);
    } else {
      console.warn('No English voice found, relying on utterance.lang fallback');
    }

    utterance.onend = () => {
      resolve();
    };

    utterance.onerror = (e) => {
      console.error('Speech synthesis error:', e);
      resolve();
    };

    window.speechSynthesis.speak(utterance);
  });
};

export const stopSpeaking = () => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};

// Speech Recognition (STT - Speech to Text)
let activeRecognition: any = null;

export const startListening = (
  onResult: (text: string, isFinal: boolean) => void,
  onError: (error: string) => void,
  onEnd: () => void
): void => {
  if (typeof window === 'undefined') {
    onError('Speech recognition not available on server.');
    return;
  }

  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    onError('ブラウザが音声認識に対応していません。Google ChromeまたはSafariをご利用ください。');
    return;
  }

  // Stop current listening if any
  stopListening();

  try {
    activeRecognition = new SpeechRecognition();
    activeRecognition.continuous = true;
    activeRecognition.interimResults = true;
    activeRecognition.lang = 'en-US'; // We want English recognition for Eiken

    activeRecognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const resultText = finalTranscript || interimTranscript;
      onResult(resultText, finalTranscript !== '');
    };

    activeRecognition.onerror = (event: any) => {
      console.error('Speech recognition error event:', event);
      if (event.error === 'no-speech') {
        // Safe to ignore or handle gracefully
        return;
      }
      onError(event.error);
    };

    activeRecognition.onend = () => {
      onEnd();
    };

    activeRecognition.start();
  } catch (error: any) {
    onError(error.message || '音声認識の起動に失敗しました。');
  }
};

export const stopListening = (): void => {
  if (activeRecognition) {
    try {
      activeRecognition.stop();
    } catch (e) {
      console.error('Error stopping recognition:', e);
    }
    activeRecognition = null;
  }
};
