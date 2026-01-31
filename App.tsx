
import React, { useState } from 'react';
import { INITIAL_SCENE } from './constants';
import { SceneState, Frame } from './types';
import Header from './components/Header';
import SidebarScript from './components/SidebarScript';
import VisionStage from './components/VisionStage';
import WorldBible from './components/WorldBible';
import TimelineFooter from './components/TimelineFooter';
import { analyzeManuscriptDeep, generateSceneWithBrief, generateNanoBananaImage, generateEmotionalAudio } from './services/geminiService';

const App: React.FC = () => {
  const [scene, setScene] = useState<SceneState>(INITIAL_SCENE);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFrameId, setSelectedFrameId] = useState<string | null>(scene.frames[0]?.id || null);

  const handleManuscriptUpload = async (text: string) => {
    setIsGenerating(true);
    try {
      const analysis = await analyzeManuscriptDeep(text);
      setScene(prev => ({
        ...prev,
        script: text,
        manifest: {
          characters: (analysis.characters || []).map((c: any, i: number) => ({ ...c, id: `c-${i}`, image: `https://picsum.photos/id/${100 + i}/200/200` })),
          environments: (analysis.environments || []).map((e: any, i: number) => ({ ...e, id: `e-${i}`, image: `https://picsum.photos/id/${200 + i}/400/225` })),
          motifs: (analysis.motifs || []).map((m: any, i: number) => ({ ...m, id: `m-${i}` }))
        }
      }));
    } catch (e) {
      console.error("Analysis failed", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateStoryboard = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      // Integration: Passing manifest to the suggester for consistency
      const data = await generateSceneWithBrief(scene.script, scene.manifest);
      const newFrames: Frame[] = (data.frames || []).map((f: any, i: number) => ({
        id: `frame-${i}-${Date.now()}`,
        title: f.title || `Frame ${i + 1}`,
        timeRange: `00:0${i*5}-00:0${(i+1)*5}`,
        prompt: f.prompt,
        scriptSegment: f.scriptSegment,
        directorsBrief: f.directorsBrief,
        image: 'https://placehold.co/1280x720/1a1a1a/ecb613?text=Painting+Sequence...',
        isGenerating: true
      }));

      setScene(prev => ({ ...prev, frames: newFrames }));
      if (newFrames.length > 0) setSelectedFrameId(newFrames[0].id);

      for (let i = 0; i < newFrames.length; i++) {
        const url = await generateNanoBananaImage(newFrames[i].prompt, scene.manifest);
        if (url) {
          setScene(prev => ({
            ...prev,
            frames: prev.frames.map(frame => frame.id === newFrames[i].id ? { ...frame, image: url, isGenerating: false } : frame)
          }));
        }
      }
    } catch (e) {
      console.error("Storyboard generation failed", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePaintToEdit = async (frameId: string, instruction: string, coord?: { x: number, y: number }) => {
    const target = scene.frames.find(f => f.id === frameId);
    if (!target) return;

    setScene(prev => ({
      ...prev,
      frames: prev.frames.map(f => f.id === frameId ? { ...f, isGenerating: true } : f)
    }));

    try {
      // Spatial Prompting: coordinates integrated
      const editedUrl = await generateNanoBananaImage(instruction, scene.manifest, target.image, coord);
      if (editedUrl) {
        setScene(prev => ({
          ...prev,
          frames: prev.frames.map(f => f.id === frameId ? { ...f, image: editedUrl, isGenerating: false, prompt: instruction } : f)
        }));
      }
    } catch (e) {
      console.error("Edit failed", e);
      setScene(prev => ({
        ...prev,
        frames: prev.frames.map(f => f.id === frameId ? { ...f, isGenerating: false } : f)
      }));
    }
  };

  const handleSynthesizeAudio = async (frameId: string) => {
    const frame = scene.frames.find(f => f.id === frameId);
    if (!frame || !frame.scriptSegment) return;

    setScene(prev => ({
      ...prev,
      frames: prev.frames.map(f => f.id === frameId ? { ...f, isGeneratingAudio: true } : f)
    }));

    try {
      const audioBase64 = await generateEmotionalAudio(frame.scriptSegment, frame.directorsBrief?.emotionalArc || "Cinematic performance");
      if (audioBase64) {
        setScene(prev => ({
          ...prev,
          frames: prev.frames.map(f => f.id === frameId ? { ...f, audioData: audioBase64, isGeneratingAudio: false } : f)
        }));
        playAudio(audioBase64);
      }
    } catch (e) {
      console.error("Audio synthesis failed", e);
      setScene(prev => ({
        ...prev,
        frames: prev.frames.map(f => f.id === frameId ? { ...f, isGeneratingAudio: false } : f)
      }));
    }
  };

  const playAudio = async (base64: string) => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
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
    <div className="flex flex-col h-screen bg-background-dark text-white font-display overflow-hidden">
      <Header onGenerate={handleGenerateStoryboard} isGenerating={isGenerating} />
      
      <main className="flex flex-1 overflow-hidden">
        <SidebarScript 
          script={scene.script} 
          onScriptChange={(s) => setScene(prev => ({ ...prev, script: s }))} 
          location={scene.location}
          title={scene.title}
          highlightText={selectedFrame?.scriptSegment}
          onUpload={handleManuscriptUpload}
        />
        
        <VisionStage 
          frames={scene.frames} 
          selectedFrameId={selectedFrameId}
          onSelectFrame={setSelectedFrameId}
          onRefine={handlePaintToEdit}
          onPlayAudio={handleSynthesizeAudio}
        />
        
        <WorldBible 
          manifest={scene.manifest}
        />
      </main>

      <TimelineFooter 
        sentimentData={scene.sentimentData} 
        currentBrief={selectedFrame?.directorsBrief}
      />
    </div>
  );
};

export default App;
