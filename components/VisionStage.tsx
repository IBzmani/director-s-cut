
import React from 'react';
import { Frame } from '../types';

interface VisionStageProps {
  frames: Frame[];
}

const VisionStage: React.FC<VisionStageProps> = ({ frames }) => {
  return (
    <section className="flex-1 flex flex-col bg-background-dark relative">
      <div className="p-4 flex justify-between items-center glass-panel z-10 sticky top-0">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">movie_filter</span>
            The Vision
          </h3>
          <div className="flex bg-accent-dark rounded-md p-0.5">
            <button className="px-3 py-1 text-xs font-bold bg-background-dark rounded shadow-sm">Sequence</button>
            <button className="px-3 py-1 text-xs font-medium text-gray-500">Spatial</button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 bg-accent-dark hover:bg-white/10 px-3 py-1.5 rounded text-xs font-medium transition-all">
            <span className="material-symbols-outlined text-sm">share</span> Share Preview
          </button>
          <button className="flex items-center gap-1.5 bg-accent-dark hover:bg-white/10 px-3 py-1.5 rounded text-xs font-medium transition-all">
            <span className="material-symbols-outlined text-sm">download</span> Export
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-8 content-start">
        {frames.map((frame) => (
          <div key={frame.id} className="group relative space-y-3">
            <div className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all cursor-crosshair bg-accent-dark shadow-xl ${frame.isGenerating ? 'border-primary animate-pulse' : 'border-transparent hover:border-primary/50'}`}>
              <img 
                src={frame.image} 
                alt={frame.prompt}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${frame.isGenerating ? 'opacity-30' : 'opacity-100'}`}
              />
              
              {frame.isGenerating && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg flex items-center gap-3">
                    <span className="material-symbols-outlined animate-spin text-primary">autorenew</span>
                    <span className="text-xs font-bold text-white uppercase tracking-widest">Painting Frame...</span>
                  </div>
                </div>
              )}

              {/* Spatial Control Overlays */}
              {!frame.isGenerating && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="border border-primary/50 w-3/4 h-3/4 flex items-center justify-center pointer-events-none">
                    <span className="bg-primary/20 backdrop-blur-md px-2 py-1 text-[10px] text-primary border border-primary/30 rounded">CINEMATIC SHOT</span>
                  </div>
                </div>
              )}

              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold tracking-widest uppercase z-10">
                {frame.title}
              </div>
            </div>
            
            <div className="flex justify-between items-center px-1">
              <span className="text-xs text-gray-400">{frame.timeRange}</span>
              <div className="flex gap-2">
                <span className="material-symbols-outlined text-sm text-gray-500 hover:text-primary cursor-pointer transition-colors">refresh</span>
                <span className="material-symbols-outlined text-sm text-gray-500 hover:text-primary cursor-pointer transition-colors">tune</span>
              </div>
            </div>
          </div>
        ))}

        {/* Add Frame Slot */}
        <div className="aspect-video rounded-xl border-2 border-dashed border-accent-dark flex flex-col items-center justify-center hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group">
          <span className="material-symbols-outlined text-3xl text-gray-600 mb-2 group-hover:text-primary transition-colors">add_photo_alternate</span>
          <span className="text-xs text-gray-500 font-medium group-hover:text-gray-300">Add Frame</span>
        </div>
      </div>
    </section>
  );
};

export default VisionStage;
