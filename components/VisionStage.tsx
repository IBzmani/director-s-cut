
import React, { useState } from 'react';
import { Frame } from '../types';

interface VisionStageProps {
  frames: Frame[];
  selectedFrameId: string | null;
  onSelectFrame: (id: string) => void;
  onRefine: (id: string, prompt: string, coord?: { x: number, y: number }) => void;
  onPlayAudio: (id: string) => void;
}

const VisionStage: React.FC<VisionStageProps> = ({ frames, selectedFrameId, onSelectFrame, onRefine, onPlayAudio }) => {
  const [instruction, setInstruction] = useState("");
  const [clickCoord, setClickCoord] = useState<{ x: number, y: number } | null>(null);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>, frameId: string) => {
    if (selectedFrameId !== frameId) {
      onSelectFrame(frameId);
      return;
    }
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setClickCoord({ x, y });
  };

  const handleRepaint = () => {
    if (selectedFrameId && instruction) {
      onRefine(selectedFrameId, instruction, clickCoord || undefined);
      setInstruction("");
      setClickCoord(null);
    }
  };

  return (
    <section className="flex-1 flex flex-col bg-background-dark overflow-hidden">
      <div className="p-4 border-b border-white/5 flex justify-between items-center glass-panel z-20">
        <div className="flex items-center gap-4">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">movie_edit</span>
            Storyboard Ribbon
          </h3>
          <div className="h-4 w-px bg-white/10"></div>
          <p className="text-[10px] text-gray-500 font-medium">Mapped to Sequence Arc</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-[10px] font-bold text-gray-500 hover:text-white uppercase tracking-widest transition-all">Spatial View</button>
          <button className="bg-primary text-black px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest">Master Preview</button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden flex items-center px-12 gap-12 scroll-smooth">
        {frames.map((frame) => (
          <div 
            key={frame.id} 
            className={`flex-shrink-0 group relative transition-all duration-500 ${selectedFrameId === frame.id ? 'w-[640px] z-10' : 'w-80 grayscale-[0.8] hover:grayscale-0 opacity-60 hover:opacity-100'}`}
          >
            <div 
              onClick={(e) => handleImageClick(e, frame.id)}
              className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all cursor-pointer shadow-2xl ${selectedFrameId === frame.id ? 'border-primary ring-8 ring-primary/5' : 'border-white/5'}`}
            >
              <img src={frame.image} alt={frame.prompt} className={`absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ${selectedFrameId === frame.id ? 'scale-100' : 'scale-110'}`} />
              
              {/* Click Marker */}
              {selectedFrameId === frame.id && clickCoord && (
                <div 
                  className="absolute size-6 border-2 border-primary rounded-full -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-30"
                  style={{ left: `${clickCoord.x}%`, top: `${clickCoord.y}%` }}
                >
                  <div className="size-1 bg-primary rounded-full animate-ping"></div>
                </div>
              )}

              {(frame.isGenerating || frame.isGeneratingAudio) && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center z-40">
                  <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
                  <span className="text-[9px] font-bold text-primary uppercase tracking-[0.2em]">
                    {frame.isGeneratingAudio ? 'Synthesizing Performance...' : 'Processing Nano Banana...'}
                  </span>
                </div>
              )}

              {selectedFrameId === frame.id && !frame.isGenerating && (
                <>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onPlayAudio(frame.id); }}
                    className="absolute top-4 right-4 size-10 bg-primary/90 text-black rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform active:scale-95 z-40"
                  >
                    <span className="material-symbols-outlined font-bold">play_arrow</span>
                  </button>

                  <div className="absolute bottom-6 left-6 right-6 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 z-40">
                    <div className="flex items-center gap-2 bg-black/80 backdrop-blur-xl p-2 rounded-xl border border-white/10 shadow-2xl" onClick={e => e.stopPropagation()}>
                      <span className="material-symbols-outlined text-primary text-sm ml-2">draw</span>
                      <input 
                        autoFocus
                        className="flex-1 bg-transparent border-none focus:ring-0 text-[11px] placeholder:text-gray-500 text-white" 
                        placeholder={clickCoord ? `Editing target area [${clickCoord.x}, ${clickCoord.y}]...` : "Localized Paint-to-Edit: Click image to target region"} 
                        value={instruction}
                        onChange={(e) => setInstruction(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRepaint();
                        }}
                      />
                      <button 
                        onClick={handleRepaint}
                        className="bg-primary text-black px-3 py-1.5 rounded-lg text-[9px] font-black uppercase"
                      >
                        REPAINT
                      </button>
                    </div>
                  </div>
                </>
              )}

              <div className="absolute top-4 left-4 flex gap-2 z-30">
                <div className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-bold border border-white/10">{frame.title}</div>
                <div className="bg-primary text-black px-2 py-0.5 rounded text-[9px] font-bold uppercase">{frame.timeRange}</div>
              </div>
            </div>
            
            <div className={`mt-4 px-1 transition-all ${selectedFrameId === frame.id ? 'opacity-100' : 'opacity-0'}`}>
              <p className="text-[11px] text-gray-400 font-medium italic border-l-2 border-primary/40 pl-3 py-1">
                "{frame.scriptSegment}"
              </p>
            </div>
          </div>
        ))}

        <div className="flex-shrink-0 w-80 aspect-video rounded-xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center hover:bg-white/5 transition-all cursor-pointer group">
          <span className="material-symbols-outlined text-gray-600 group-hover:text-primary transition-colors text-3xl">add_photo_alternate</span>
          <span className="text-[9px] font-bold text-gray-600 mt-2 uppercase tracking-widest">Append Sequence</span>
        </div>
      </div>
    </section>
  );
};

export default VisionStage;
