
import React from 'react';

interface SidebarScriptProps {
  script: string;
  onScriptChange: (val: string) => void;
  location: string;
  title: string;
}

const SidebarScript: React.FC<SidebarScriptProps> = ({ script, onScriptChange, location, title }) => {
  return (
    <aside className="w-80 border-r border-accent-dark bg-panel-dark flex flex-col">
      <div className="p-4 border-b border-accent-dark flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-lg">description</span>
          <span className="font-bold text-sm uppercase tracking-widest text-gray-400">The Script</span>
        </div>
        <span className="text-[10px] bg-accent-dark px-2 py-0.5 rounded text-gray-300">Markdown</span>
      </div>
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
        <h1 className="text-white text-xl font-bold">{title}</h1>
        <p className="text-gray-500 uppercase text-xs tracking-tighter">{location}</p>
        
        <textarea 
          className="flex-1 bg-transparent border-none focus:ring-0 text-gray-300 text-sm leading-relaxed resize-none p-0"
          value={script}
          onChange={(e) => onScriptChange(e.target.value)}
          placeholder="Enter your script here..."
        />

        <div className="bg-primary/5 border-l-2 border-primary p-3 rounded-r-lg">
          <p className="text-primary font-bold text-xs mb-1">ACTION</p>
          <p className="italic text-xs text-gray-400">
            AI is analyzing the script context to suggest visual frames.
          </p>
        </div>
      </div>
      
      {/* Waveform Visualizer */}
      <div className="p-4 border-t border-accent-dark bg-black/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-gray-500 uppercase tracking-widest">Voice Direction</span>
          <span className="text-[10px] text-primary">00:12.4</span>
        </div>
        <div className="flex items-end gap-[2px] h-8 w-full justify-center">
          {[2, 4, 6, 3, 7, 5, 8, 4, 6, 2, 4, 6, 3, 5, 2, 6, 4, 3].map((h, i) => (
            <div key={i} className="waveform-bar" style={{ height: `${h * 4}px` }}></div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default SidebarScript;
