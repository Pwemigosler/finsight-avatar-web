import { Suspense, useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls } from "@react-three/drei";
import FinAvatar from "./FinAvatar";
import { initializeSpeech, useSpeechStore } from "./speech";
import "./App.css";

type VoiceOption = {
  label: string;
  value: string;
};

function Scene() {
  const isSpeaking = useSpeechStore((state) => state.isSpeaking);

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[3, 5, 4]}
        intensity={1.15}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[-4, 2, -2]} intensity={0.4} />
      <FinAvatar speaking={isSpeaking} mood={isSpeaking ? 0.6 : 0.2} />
      <ContactShadows
        position={[0, -0.85, 0]}
        opacity={0.35}
        scale={4}
        blur={2.6}
        far={1.2}
      />
      <Environment preset="sunset" />
      <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={Math.PI / 2.8} maxPolarAngle={Math.PI / 2.1} />
    </>
  );
}

function VoiceSelector({ options }: { options: VoiceOption[] }) {
  const selectedVoice = useSpeechStore((state) => state.selectedVoice);
  const setVoice = useSpeechStore((state) => state.setVoice);

  if (!options.length) {
    return <p className="voice-empty">Loading available voices…</p>;
  }

  return (
    <label className="field">
      <span>Voice</span>
      <select value={selectedVoice ?? undefined} onChange={(event) => setVoice(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function App() {
  const [message, setMessage] = useState("Hello there! I'm Fin, your friendly financial guide.");
  const speak = useSpeechStore((state) => state.speak);
  const stop = useSpeechStore((state) => state.stop);
  const isSpeaking = useSpeechStore((state) => state.isSpeaking);
  const voices = useSpeechStore((state) => state.voices);
  const isSupported = useSpeechStore((state) => state.isSupported);

  useEffect(() => {
    initializeSpeech();
  }, []);

  const voiceOptions = useMemo<VoiceOption[]>(
    () =>
      voices.map((voice) => ({
        label: `${voice.name}${voice.lang ? ` (${voice.lang})` : ""}`,
        value: voice.voiceURI,
      })),
    [voices],
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    speak(message);
  };

  return (
    <div className="app-shell">
      <div className="hero">
        <div className="canvas-wrapper">
          <Suspense fallback={<div className="loading">Loading avatar…</div>}>
            <Canvas
              shadows
              camera={{ position: [0, 1.2, 3], fov: 45 }}
              style={{ width: "100%", height: "100%" }}
            >
              <Scene />
            </Canvas>
          </Suspense>
        </div>
        <div className="panel">
          <h1>Finsight Avatar</h1>
          <p className="lead">
            Experiment with a lightweight 3D guide that can speak friendly prompts using your browser&apos;s speech
            synthesis.
          </p>
          <form className="controls" onSubmit={handleSubmit}>
            <label className="field" htmlFor="message">
              <span>What should Fin say?</span>
              <textarea
                id="message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={4}
                placeholder="Type something encouraging…"
              />
            </label>
            <VoiceSelector options={voiceOptions} />
            <div className="actions">
              <button type="submit" className="primary" disabled={!isSupported || isSpeaking}>
                {isSpeaking ? "Speaking…" : "Speak"}
              </button>
              <button type="button" onClick={stop} disabled={!isSpeaking}>
                Stop
              </button>
            </div>
            {!isSupported && <p className="warning">Speech synthesis is not available in this browser.</p>}
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
