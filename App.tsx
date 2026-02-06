
import React, { useState } from 'react';
import { INITIAL_SCENE } from './constants';
import { SceneState, Character, Environment } from './types';
import Header from './components/Header';
import SidebarScript from './components/SidebarScript';
import VisionStage from './components/VisionStage';
import WorldBible from './components/WorldBible';
import TimelineFooter from './components/TimelineFooter';
import { analyzeManuscriptDeep, generateSceneWithBrief, generateNanoBananaImage, generateEmotionalAudio, generateBibleAsset } from './services/geminiService';
import { exportCinemaMovie } from './services/exportService';

const App: React.FC = () => {
  const [scene, setScene] = useState<SceneState>(INITIAL_SCENE);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [selectedFrameId, setSelectedFrameId] = useState<string | null>(scene.frames[0]?.id || null);

  const addCharacter = async (name: string, description: string) => {
    const id = `c-${Date.now()}`;
    const newChar: Character = { id, name, role: "Principal", description, image: 'loading://character' };
    
    setScene(prev => {
      const filteredCharacters = prev.manifest.characters.filter(c => c.id !== 'c1');
      return {
        ...prev,
        manifest: { 
          ...prev.manifest, 
          characters: [...filteredCharacters, newChar] 
        }
      };
    });

    try {
      const img = await generateBibleAsset(name, description, 'character');
      if (img) {
        setScene(prev => ({
          ...prev,
          manifest: { 
            ...prev.manifest, 
            characters: prev.manifest.characters.map(c => c.id === id ? { ...c, image: img } : c) 
          }
        }));
      }
    } catch (err) {
      console.error("Failed to generate character xplate:", err);
      setScene(prev => ({
        ...prev,
        manifest: { 
          ...prev.manifest, 
          characters: prev.manifest.characters.filter(c => c.id !== id) 
        }
      }));
    }
  };

  const addEnvironment = async (name: string, description: string) => {
    const id = `e-${Date.now()}`;
    const newEnv: Environment = { id, name, mood: "Concept", colors: ['#555'], image: 'loading://environment' };
    
    setScene(prev => {
      const filteredEnvironments = prev.manifest.environments.filter(e => e.id !== 'e1');
      return {
        ...prev,
        manifest: { 
          ...prev.manifest, 
          environments: [...filteredEnvironments, newEnv] 
        }
      };
    });

    try {
      const img = await generateBibleAsset(name, description, 'environment');
      if (img) {
        setScene(prev => ({
          ...prev,
          manifest: { 
            ...prev.manifest, 
            environments: prev.manifest.environments.map(e => e.id === id ? { ...e, image: img } : e) 
          }
        }));
      }
    } catch (err) {
      console.error("Failed to generate location plate:", err);
      setScene(prev => ({
        ...prev,
        manifest: { 
          ...prev.manifest, 
          environments: prev.manifest.environments.filter(e => e.id !== id) 
        }
      }));
    }
  };

  const handleManuscriptUpload = async (text: string) => {
    setIsGenerating(true);
    try {
      const analysis = await analyzeManuscriptDeep(text);
      const characters = (analysis.characters || []).map((c: any, i: number) => ({ ...c, id: `c-auto-${i}`, image: 'loading://character' }));
      const environments = (analysis.environments || []).map((e: any, i: number) => ({ ...e, id: `e-auto-${i}`, image: 'loading://environment' }));
      
      setScene(prev => ({ 
        ...prev, 
        script: text, 
        manifest: { 
          ...prev.manifest, 
          characters, 
          environments 
        } 
      }));

      characters.forEach(async (char: any) => {
        try {
          const img = await generateBibleAsset(char.name, char.description, 'character');
          if (img) setScene(prev => ({ ...prev, manifest: { ...prev.manifest, characters: prev.manifest.characters.map(c => c.id === char.id ? { ...c, image: img } : c) } }));
        } catch (e) { console.warn("Failed auto-character xplate gen:", e); }
      });

      environments.forEach(async (env: any) => {
        try {
          const img = await generateBibleAsset(env.name, env.mood, 'environment');
          if (img) setScene(prev => ({ ...prev, manifest: { ...prev.manifest, environments: prev.manifest.environments.map(e => e.id === env.id ? { ...e, image: img } : e) } }));
        } catch (e) { console.warn("Failed auto-environment gen:", e); }
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateStoryboard = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const data = await generateSceneWithBrief(scene.script, scene.manifest);
      const newFrames = data.frames.map((f: any, i: number) => ({
        ...f,
        id: `f-${i}-${Date.now()}`,
        timeRange: `00:0${i*5} - 00:0${(i+1)*5}`,
        image: 'https://placehold.co/1280x720/1a1a1a/ecb613?text=Composing+Shot...',
        isGenerating: true
      }));

      setScene(prev => ({ ...prev, frames: newFrames }));
      if (newFrames.length > 0) setSelectedFrameId(newFrames[0].id);

      for (let frame of newFrames) {
        try {
          const url = await generateNanoBananaImage(
            frame.prompt, 
            scene.manifest, 
            { 
              charId: frame.characterId, 
              envId: frame.environmentId, 
              shotType: frame.shotType,
              emotion: frame.directorsBrief?.emotionalArc 
            }
          );
          if (url) {
            setScene(prev => ({
              ...prev,
              frames: prev.frames.map(f => f.id === frame.id ? { ...f, image: url, isGenerating: false } : f)
            }));
          }
        } catch (err) {
          console.error("Frame generation failed after retries:", err);
          setScene(prev => ({
            ...prev,
            frames: prev.frames.map(f => f.id === frame.id ? { ...f, isGenerating: false, image: 'https://placehold.co/1280x720/333/fff?text=Generation+Timeout' } : f)
          }));
        }
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportMovie = async () => {
    if (isExporting) return;
    setIsExporting(true);
    setExportProgress(0);
    try {
      const videoUrl = await exportCinemaMovie(scene.frames, (p) => setExportProgress(p));
      // Fix: Access document through window with any cast
      const a = (window as any).document.createElement('a');
      a.href = videoUrl;
      a.download = `${scene.title || 'Director_Cut_Export'}.mp4`;
      a.click();
    } catch (err) {
      console.error("Movie export failed:", err);
      // Fix: Access alert through window with any cast
      (window as any).alert("Failed to export movie. Ensure frames have both visuals and audio synthesized.");
    } finally {
      setIsExporting(false);
    }
  };

  const handlePaintToEdit = async (frameId: string, instruction: string, coord?: { x: number, y: number }) => {
    const target = scene.frames.find(f => f.id === frameId);
    if (!target) return;
    setScene(prev => ({ ...prev, frames: prev.frames.map(f => f.id === frameId ? { ...f, isGenerating: true } : f) }));
    try {
      const editedUrl = await generateNanoBananaImage(
        instruction, 
        scene.manifest, 
        { 
          charId: (target as any).characterId, 
          envId: (target as any).environmentId,
          shotType: (target as any).shotType,
          emotion: (target as any).directorsBrief?.emotionalArc
        }, 
        target.image, 
        coord
      );
      if (editedUrl) setScene(prev => ({ ...prev, frames: prev.frames.map(f => f.id === frameId ? { ...f, image: editedUrl, isGenerating: false } : f) }));
    } catch (err) {
      console.error("Edit failed:", err);
      setScene(prev => ({ ...prev, frames: prev.frames.map(f => f.id === frameId ? { ...f, isGenerating: false } : f) }));
    }
  };

  const handleSynthesizeAudio = async (frameId: string) => {
    const frame = scene.frames.find(f => f.id === frameId);
    if (!frame?.scriptSegment) return;
    setScene(prev => ({ ...prev, frames: prev.frames.map(f => f.id === frameId ? { ...f, isGeneratingAudio: true } : f) }));
    try {
      const audio = await generateEmotionalAudio(frame.scriptSegment, frame.directorsBrief?.emotionalArc || "Cinematic Performance");
      if (audio) {
        setScene(prev => ({ ...prev, frames: prev.frames.map(f => f.id === frameId ? { ...f, audioData: audio, isGeneratingAudio: false } : f) }));
        playAudio(audio);
      }
    } catch (err) {
      console.error("Audio synthesis failed:", err);
      setScene(prev => ({ ...prev, frames: prev.frames.map(f => f.id === frameId ? { ...f, isGeneratingAudio: false } : f) }));
    }
  };

  const playAudio = async (base64: string) => {
    // Fix: Access AudioContext through window with casting to avoid missing type errors
    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass({ sampleRate: 24000 });
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const dataInt16 = new Int16Array(bytes.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start();
  };

  const selectedFrame = scene.frames.find(f => f.id === selectedFrameId);

  return (
    <div className="flex flex-col h-screen bg-background-dark text-white font-display overflow-hidden relative">
      <Header 
        onGenerate={handleGenerateStoryboard} 
        onExport={handleExportMovie} 
        isGenerating={isGenerating} 
        isExporting={isExporting} 
      />
      <main className="flex flex-1 overflow-hidden">
        <SidebarScript script={scene.script} onScriptChange={(s) => setScene(prev => ({ ...prev, script: s }))} location={scene.location} title={scene.title} highlightText={selectedFrame?.scriptSegment} onUpload={handleManuscriptUpload} />
        <VisionStage frames={scene.frames} selectedFrameId={selectedFrameId} onSelectFrame={setSelectedFrameId} onRefine={handlePaintToEdit} onPlayAudio={handleSynthesizeAudio} />
        <WorldBible manifest={scene.manifest} onAddChar={addCharacter} onAddEnv={addEnvironment} />
      </main>
      <TimelineFooter sentimentData={scene.sentimentData} currentBrief={selectedFrame?.directorsBrief} shotType={(selectedFrame as any)?.shotType} />

      {/* Export Progress Overlay */}
      {isExporting && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl z-[100] flex flex-col items-center justify-center">
          <div className="w-[500px] flex flex-col items-center">
            <div className="size-20 border-4 border-primary border-t-transparent rounded-full animate-spin mb-8 shadow-[0_0_30px_rgba(236,182,19,0.2)]"></div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">Rendering Cinema Movie</h2>
            <p className="text-gray-500 text-sm uppercase tracking-widest font-bold mb-10">Stitching Vision & Voice: {exportProgress}%</p>
            
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden border border-white/5 mb-4">
              <div 
                className="h-full bg-primary shadow-[0_0_20px_rgba(236,182,19,0.5)] progress-bar-fill"
                style={{ width: `${exportProgress}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between w-full">
              <span className="text-[10px] text-gray-600 font-mono">ENCODING_H264_AAC</span>
              <span className="text-[10px] text-gray-600 font-mono tracking-widest uppercase">Direct-to-Disk Buffer</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;