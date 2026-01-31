
import React, { useState, useCallback, useEffect } from 'react';
import { INITIAL_SCENE } from './constants';
import { SceneState, Frame } from './types';
import Header from './components/Header';
import SidebarScript from './components/SidebarScript';
import VisionStage from './components/VisionStage';
import WorldBible from './components/WorldBible';
import TimelineFooter from './components/TimelineFooter';
import { generateSceneLogic, generateFrameImage } from './services/geminiService';

const App: React.FC = () => {
  const [scene, setScene] = useState<SceneState>(INITIAL_SCENE);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateScene = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const data = await generateSceneLogic(scene.script);
      
      const newFrames: Frame[] = data.frames.map((f: any, index: number) => ({
        id: `gen-${index}`,
        title: f.title,
        timeRange: f.timeRange,
        prompt: f.prompt,
        image: 'https://picsum.photos/1280/720?grayscale&blur=2', // Placeholder while generating
        isGenerating: true
      }));

      setScene(prev => ({
        ...prev,
        script: data.refinedScript || prev.script,
        frames: newFrames
      }));

      // Generate images for each frame sequentially
      for (let i = 0; i < newFrames.length; i++) {
        const imageUrl = await generateFrameImage(newFrames[i].prompt);
        if (imageUrl) {
          setScene(prev => ({
            ...prev,
            frames: prev.frames.map((f, idx) => 
              idx === i ? { ...f, image: imageUrl, isGenerating: false } : f
            )
          }));
        }
      }

    } catch (error) {
      console.error("Failed to generate scene:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const updateScript = (val: string) => {
    setScene(prev => ({ ...prev, script: val }));
  };

  return (
    <div className="flex flex-col h-screen bg-background-dark text-white font-display overflow-hidden">
      <Header onGenerate={handleGenerateScene} isGenerating={isGenerating} />
      
      <main className="flex flex-1 overflow-hidden">
        <SidebarScript 
          script={scene.script} 
          onScriptChange={updateScript} 
          location={scene.location}
          title={scene.title}
        />
        
        <VisionStage 
          frames={scene.frames} 
        />
        
        <WorldBible 
          characters={scene.characters} 
          environments={scene.environments} 
        />
      </main>

      <TimelineFooter sentimentData={scene.sentimentData} />
    </div>
  );
};

export default App;
