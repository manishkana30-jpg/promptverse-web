import React, { useState } from 'react';
import { Copy, Check, Loader2, Play } from 'lucide-react';
import { generateSceneClip } from '../services/videoApi';

export function SceneCard({ scene, sceneIndex, onVideoGenerated }) {
  const [text, setText] = useState(scene.text);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [error, setError] = useState(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handleGenerateVideo = async () => {
    if (!text.trim()) return;
    setIsGenerating(true);
    setError(null);
    try {
      const result = await generateSceneClip(text);
      if (result && result.video_url) {
        setVideoUrl(result.video_url);
        if (onVideoGenerated && result.clip_id) {
          onVideoGenerated(sceneIndex, result.clip_id);
        }
      } else {
        throw new Error("No video URL returned");
      }
    } catch (err) {
      console.error("Video generation failed:", err);
      setError(err.message || "Failed to generate video.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col focus-within:border-cyan-500/50 transition-colors h-full">
      <div className="bg-slate-950/50 px-4 py-3 border-b border-slate-800 flex justify-between items-center">
        <span className="text-sm font-bold text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded">
          Scene {sceneIndex}
        </span>
        <button onClick={handleCopy} className="text-slate-400 hover:text-cyan-400" title="Copy Prompt">
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full bg-transparent outline-none resize-y text-slate-300 font-mono text-sm placeholder:text-slate-600 mb-4 flex-1 min-h-[100px]"
          placeholder="Scene prompt..."
        />
        
        {error && (
          <div className="text-red-400 text-xs mb-3 bg-red-400/10 p-2 rounded">
            {error}
          </div>
        )}

        {videoUrl ? (
          <video 
            src={videoUrl} 
            controls 
            autoPlay 
            className="w-full rounded-lg mt-2 mb-4 border border-slate-700 bg-slate-950" 
          />
        ) : (
          <button
            onClick={handleGenerateVideo}
            disabled={!text.trim() || isGenerating}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 mt-auto rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 font-semibold disabled:opacity-50 transition-colors"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Generate Scene Video (Local GPU)
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
