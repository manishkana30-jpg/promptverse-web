import { useState, useCallback } from 'react';
import { CreateWebWorkerMLCEngine } from '@mlc-ai/web-llm';

export function useLocalAI() {
  const [isSupported, setIsSupported] = useState(true);
  const [engine, setEngine] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [error, setError] = useState(null);

  const init = useCallback(async () => {
    // Check if WebGPU is available in the browser
    if (!navigator.gpu) {
      setIsSupported(false);
      setError("WebGPU is not supported by your browser or device.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Create Web Worker for the MLC engine
      const worker = new Worker(
        new URL('./worker.js', import.meta.url),
        { type: 'module' }
      );

      // Callback to track download and loading progress (0% to 100%)
      const initProgressCallback = (initProgress) => {
        const percentage = Math.round(initProgress.progress * 100);
        setProgress(percentage);
        setStatusText(initProgress.text);
      };

      const selectedModel = "Llama-3.2-1B-Instruct-q4f16_1-MLC";
      
      // Initialize the Web Worker Engine
      const newEngine = await CreateWebWorkerMLCEngine(
        worker,
        selectedModel,
        { initProgressCallback }
      );
      
      setEngine(newEngine);
    } catch (err) {
      console.error("Failed to initialize AI Engine:", err);
      setError(err.message || "Failed to initialize AI engine.");
    } finally {
      setLoading(false);
    }
  }, []);

  const generateCinematicPrompt = useCallback(async (userInput) => {
    if (!engine) {
      throw new Error("AI Engine not initialized yet.");
    }

    const systemPrompt = `You are a professional Hollywood cinematographer and director. Your job is to take raw user ideas and expand them into highly detailed cinematic scene directions. Include specifics about:
- Lighting (e.g., chiaroscuro, neon, volumetric, golden hour)
- Camera lenses and angles (e.g., 35mm, wide-angle, close-up, tracking shot)
- Scene movement and pacing
- Color grading and atmosphere

Respond only with the expanded cinematic prompt. Do not add any conversational filler or meta-commentary.`;

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userInput }
    ];

    try {
      const reply = await engine.chat.completions.create({
        messages,
      });
      return reply.choices[0].message.content;
    } catch (err) {
      console.error("Error generating cinematic prompt:", err);
      throw err;
    }
  }, [engine]);

  return {
    isSupported,
    loading,
    progress,
    statusText,
    error,
    engine,
    init,
    generateCinematicPrompt
  };
}
