import { create } from "zustand";

interface SpeechState {
  readonly isSupported: boolean;
  isSpeaking: boolean;
  voices: SpeechSynthesisVoice[];
  voiceMap: Map<string, SpeechSynthesisVoice> | null;
  selectedVoice: string | null;
  speak: (text: string) => void;
  stop: () => void;
  setVoice: (voiceId: string | null) => void;
  refreshVoices: () => void;
}

const synth = typeof window !== "undefined" ? window.speechSynthesis : undefined;

const readVoices = (): SpeechSynthesisVoice[] => (synth ? synth.getVoices() : []);

const createVoiceMap = (voices: SpeechSynthesisVoice[]): Map<string, SpeechSynthesisVoice> => {
  const map = new Map<string, SpeechSynthesisVoice>();
  voices.forEach(voice => {
    map.set(voice.voiceURI, voice);
  });
  return map;
};

export const useSpeechStore = create<SpeechState>((set, get) => ({
  isSupported: Boolean(synth),
  isSpeaking: false,
  voices: readVoices(),
  voiceMap: null,
  selectedVoice: null,
  speak: (text) => {
    if (!text.trim()) return;
    if (!synth) return;

    const utterance = new SpeechSynthesisUtterance(text);
    const { voiceMap, selectedVoice } = get();
    if (selectedVoice && voiceMap) {
      const voice = voiceMap.get(selectedVoice);
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
  refreshVoices: () => {
    const voices = readVoices();
    const voiceMap = createVoiceMap(voices);
    set({ voices, voiceMap });
  },
}));

export const initializeSpeech = () => {
  if (!synth) return;

  const updateVoices = () => {
    const voices = readVoices();
    const voiceMap = createVoiceMap(voices);
    useSpeechStore.setState((state) => ({
      voices,
      voiceMap,
      selectedVoice:
        state.selectedVoice && voiceMap.has(state.selectedVoice)
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
