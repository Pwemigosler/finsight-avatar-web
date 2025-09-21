import { create } from "zustand";

interface SpeechState {
  readonly isSupported: boolean;
  isSpeaking: boolean;
  voices: SpeechSynthesisVoice[];
  selectedVoice: string | null;
  speak: (text: string) => void;
  stop: () => void;
  setVoice: (voiceId: string | null) => void;
  refreshVoices: () => void;
}

const synth = typeof window !== "undefined" ? window.speechSynthesis : undefined;

const readVoices = (): SpeechSynthesisVoice[] => (synth ? synth.getVoices() : []);

export const useSpeechStore = create<SpeechState>((set, get) => ({
  isSupported: Boolean(synth),
  isSpeaking: false,
  voices: readVoices(),
  selectedVoice: null,
  speak: (text) => {
    if (!text.trim()) return;
    if (!synth) return;

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = get().voices;
    const voiceId = get().selectedVoice;
    if (voiceId) {
      const voice = voices.find((entry) => entry.voiceURI === voiceId);
      if (voice) {
        utterance.voice = voice;
      }
    }

    utterance.onstart = () => set({ isSpeaking: true });
    const markFinished = () => set({ isSpeaking: false });
    utterance.onend = markFinished;
    utterance.onerror = markFinished;

    synth.cancel();
    synth.speak(utterance);
  },
  stop: () => {
    if (!synth) return;
    synth.cancel();
    set({ isSpeaking: false });
  },
  setVoice: (voiceId) => set({ selectedVoice: voiceId }),
  refreshVoices: () => set({ voices: readVoices() }),
}));

export const initializeSpeech = () => {
  if (!synth) return;

  const updateVoices = () => {
    const voices = readVoices();
    useSpeechStore.setState((state) => ({
      voices,
      selectedVoice:
        state.selectedVoice && voices.some((voice) => voice.voiceURI === state.selectedVoice)
          ? state.selectedVoice
          : voices[0]?.voiceURI ?? null,
    }));
  };

  updateVoices();

  if (typeof synth.onvoiceschanged === "function") {
    const previous = synth.onvoiceschanged;
    synth.onvoiceschanged = (event: Event) => {
      previous.call(synth, event);
      updateVoices();
    };
  } else {
    synth.onvoiceschanged = updateVoices;
  }
};
