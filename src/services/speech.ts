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
    utterance.rate = rate; // Eiken 3rd grade is somewhat slow (around 0.8 to 0.9)
    utterance.pitch = 1.0;

    // Filter to English voices
    const englishVoices = voices.filter((v) => v.lang.toLowerCase().startsWith('en'));

    let selectedVoice: SpeechSynthesisVoice | null = null;

    if (voiceGender === 'male') {
      // Look for typical male voices (Google US English male, David, etc.)
      selectedVoice =
        englishVoices.find(
          (v) =>
            v.name.toLowerCase().includes('male') ||
            v.name.toLowerCase().includes('david') ||
            v.name.toLowerCase().includes('microsoft david') ||
            v.name.toLowerCase().includes('google us english')
        ) || null;
    } else {
      // Look for typical female voices (Zira, Samantha, Google US English female, etc.)
      selectedVoice =
        englishVoices.find(
          (v) =>
            v.name.toLowerCase().includes('female') ||
            v.name.toLowerCase().includes('zira') ||
            v.name.toLowerCase().includes('samantha') ||
            v.name.toLowerCase().includes('google uk english female')
        ) || null;
    }

    // Fallback if specific gender not found: search en-US or any English
    if (!selectedVoice) {
      selectedVoice =
        englishVoices.find((v) => v.lang.toLowerCase() === 'en-us') ||
        englishVoices.find((v) => v.lang.toLowerCase() === 'en-gb') ||
        englishVoices[0] ||
        null;
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
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
