import React, { useEffect, useState, useMemo } from 'react';
import { useLocalAI } from './useLocalAI';
import { AdBanner } from './components/AdBanner';
import { SEO } from './components/SEO';
import { HelmetProvider } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles, Cpu, Zap, Copy, Check, Film, Download } from 'lucide-react';
import { parseScenes } from './utils/parseScenes';
import { SceneCard } from './components/SceneCard';
import { stitchVideoClips } from './services/videoApi';

function AppContent() {
  const { isSupported, loading: engineLoading, progress, statusText, error, engine, init, generateCinematicPrompt } = useLocalAI();
  const [inputText, setInputText] = useState('');
  const [output, setOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [sceneClips, setSceneClips] = useState({});
  const [isStitching, setIsStitching] = useState(false);
  const [stitchedVideoUrl, setStitchedVideoUrl] = useState(null);
  const [stitchError, setStitchError] = useState(null);

  const scenes = useMemo(() => parseScenes(output), [output]);

  useEffect(() => {
    setSceneClips({});
    setStitchedVideoUrl(null);
    setStitchError(null);
  }, [output]);

  useEffect(() => {
    init();
  }, [init]);

  const handleVideoGenerated = (index, clipId) => {
    setSceneClips(prev => ({ ...prev, [index]: clipId }));
  };

  const handleStitch = async () => {
    const clipIds = Object.keys(sceneClips)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(key => sceneClips[key]);

    if (clipIds.length < 2) return;

    setIsStitching(true);
    setStitchError(null);
    try {
      const videoBlobUrl = await stitchVideoClips(clipIds);
      setStitchedVideoUrl(videoBlobUrl);
    } catch (err) {
      console.error(err);
      setStitchError(err.message || "Failed to stitch video.");
    } finally {
      setIsStitching(false);
    }
  };

  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    setIsGenerating(true);
    try {
      const result = await generateCinematicPrompt(inputText);
      setOutput(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-slate-900/50 border border-slate-800 p-8 rounded backdrop-blur text-slate-100">
          <Cpu className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">WebGPU Unsupported</h2>
          <p className="text-sm text-slate-400">{error || "Your browser does not support WebGPU."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30 overflow-hidden">
      <SEO />
      <AnimatePresence mode="wait">
        {engineLoading || !engine ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 p-6"
          >
            <div className="w-full max-w-md text-center">
              <h2 className="text-2xl font-bold mb-4 text-cyan-400">Loading AI Engine</h2>
              <p className="text-slate-400 text-sm mb-6">{statusText || "Initializing..."}</p>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                <motion.div 
                  className="bg-cyan-500 h-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "linear", duration: 0.2 }}
                />
              </div>
              <div className="mt-2 text-cyan-500 font-mono text-sm">{progress}%</div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-4xl mx-auto px-4 py-12"
          >
            <header className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  PromptVerse
                </h1>
                <p className="text-slate-400">Cinematic Director AI</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
                <Zap className="w-4 h-4" />
                100% Local GPU
              </div>
            </header>

            <AdBanner />

            <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-6 mb-8 mt-8 focus-within:border-cyan-500/50 transition-colors shadow-2xl">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Describe your cinematic concept..."
                className="w-full bg-transparent outline-none resize-none text-lg placeholder:text-slate-600 mb-4 h-24"
              />
              <div className="flex justify-between items-center border-t border-slate-800 pt-4">
                <span className="text-xs font-mono text-slate-500">{inputText.length} chars</span>
                <button
                  onClick={handleGenerate}
                  disabled={!inputText.trim() || isGenerating}
                  className="flex items-center gap-2 px-6 py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold disabled:opacity-50 hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all"
                >
                  {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  {isGenerating ? "Directing..." : "Generate Cinematic Prompt"}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {scenes.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {scenes.map((scene, idx) => (
                      <SceneCard 
                        key={scene.id || idx} 
                        scene={scene} 
                        sceneIndex={idx + 1} 
                        onVideoGenerated={handleVideoGenerated}
                      />
                    ))}
                  </div>

                  <div className="bg-slate-900/50 backdrop-blur border border-purple-500/30 rounded-2xl p-6 shadow-2xl">
                    <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-4">
                      <h2 className="text-xl font-bold text-purple-400 flex items-center gap-2">
                        <Film className="w-6 h-6" />
                        Master Movie Studio Control Bar
                      </h2>
                      <span className="text-sm text-slate-400">
                        {Object.keys(sceneClips).length} / {scenes.length} Clips Ready
                      </span>
                    </div>

                    {!stitchedVideoUrl ? (
                      <div className="flex flex-col items-center py-6">
                        <button
                          onClick={handleStitch}
                          disabled={Object.keys(sceneClips).length < 2 || isStitching}
                          className="flex items-center gap-2 px-8 py-4 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(147,51,234,0.5)] transition-all"
                        >
                          {isStitching ? (
                            <>
                              <Loader2 className="w-6 h-6 animate-spin" />
                              Stitching clips locally using FFmpeg...
                            </>
                          ) : (
                            <>
                              🎬 Stitch All Scenes Into Master Movie
                            </>
                          )}
                        </button>
                        {stitchError && (
                          <div className="mt-4 text-red-400 bg-red-400/10 px-4 py-2 rounded">
                            {stitchError}
                          </div>
                        )}
                        <p className="text-slate-500 text-sm mt-4">
                          Requires at least 2 generated clips to stitch.
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <video 
                          src={stitchedVideoUrl} 
                          controls 
                          autoPlay 
                          className="w-full max-w-3xl rounded-xl border-2 border-purple-500/50 bg-black mb-6 shadow-2xl" 
                        />
                        <a
                          href={stitchedVideoUrl}
                          download="master_movie.mp4"
                          className="flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all"
                        >
                          <Download className="w-5 h-5" />
                          Download Final Movie (.mp4)
                        </a>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AdBanner />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function App() {
  return (
    <HelmetProvider>
      <AppContent />
    </HelmetProvider>
  );
}

export default App;
