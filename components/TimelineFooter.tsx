
import React from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { DirectorsBrief } from '../types';

interface TimelineFooterProps {
  sentimentData: { time: string; value: number; suspense: number }[];
  currentBrief?: DirectorsBrief;
}

const TimelineFooter: React.FC<TimelineFooterProps> = ({ sentimentData, currentBrief }) => {
  return (
    <footer className="h-56 border-t border-accent-dark bg-panel-dark flex flex-col z-30">
      <div className="px-6 py-2 border-b border-white/5 flex justify-between items-center bg-black/20">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-sm">psychology_alt</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Director’s Brief Panel</span>
          </div>
          {currentBrief && (
            <div className="flex gap-4">
              <span className="text-[9px] text-primary/70 font-bold uppercase border-l border-white/10 pl-4">Frame Reasoning: Active</span>
            </div>
          )}
        </div>
        <div className="text-[9px] text-gray-500 font-mono tracking-widest">TIMECODE: 00:12:04:15</div>
      </div>
      
      <div className="flex-1 flex">
        {/* Reasoning Display */}
        <div className="w-80 border-r border-white/5 p-4 flex flex-col justify-between bg-black/10">
          {currentBrief ? (
            <div className="space-y-3">
              <div className="flex flex-col">
                <span className="text-[8px] text-gray-500 font-black uppercase mb-1">Emotional Arc</span>
                <p className="text-[10px] text-white leading-tight font-medium">{currentBrief.emotionalArc}</p>
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] text-gray-500 font-black uppercase mb-1">Lighting Theory</span>
                <p className="text-[10px] text-primary/80 leading-tight font-medium">{currentBrief.lightingScheme}</p>
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] text-gray-500 font-black uppercase mb-1">Camera Logic</span>
                <p className="text-[10px] text-gray-300 leading-tight font-medium italic">"{currentBrief.cameraLogic}"</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center opacity-30">
              <span className="material-symbols-outlined text-3xl mb-2">analytics</span>
              <p className="text-[9px] font-bold uppercase tracking-widest">Select Frame for Brief</p>
            </div>
          )}
        </div>

        {/* Graph Area */}
        <div className="flex-1 flex flex-col relative">
          <div className="flex-1 relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sentimentData}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ecb613" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ecb613" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="value" stroke="#ecb613" strokeWidth={2} fillOpacity={1} fill="url(#colorVal)" />
                <Area type="monotone" dataKey="suspense" stroke="#3b82f6" strokeWidth={1} fillOpacity={0} strokeDasharray="3 3" />
              </AreaChart>
            </ResponsiveContainer>
            
            {/* Markers */}
            <div className="absolute top-0 bottom-0 left-1/4 w-px bg-white/10"></div>
            <div className="absolute top-0 bottom-0 left-2/4 w-px bg-white/10"></div>
            <div className="absolute top-0 bottom-0 left-3/4 w-px bg-white/10"></div>
          </div>

          <div className="h-12 border-t border-white/5 flex items-center px-6 gap-12 bg-black/20">
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Key Cues</span>
              <div className="h-4 w-px bg-white/10"></div>
            </div>
            {['Sound: Distant Rain', 'VFX: Hologram Flicker', 'Score: Industrial Low'].map((cue, i) => (
              <div key={i} className="flex items-center gap-2 group cursor-pointer hover:text-primary transition-all">
                <div className="size-2 rounded-full border border-primary/50 group-hover:bg-primary shadow-lg transition-all"></div>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{cue}</span>
              </div>
            ))}
          </div>

          <div className="h-4 flex justify-between px-6 text-[8px] text-gray-600 bg-background-dark font-mono border-t border-white/5">
            <span>00:00</span><span>00:10</span><span>00:20</span><span>00:30</span><span>00:40</span><span>00:50</span><span>01:00</span>
          </div>

          {/* Scrubber */}
          <div className="absolute top-0 bottom-0 left-[200px] w-px bg-primary z-20 pointer-events-none shadow-[0_0_15px_rgba(236,182,19,0.5)]">
            <div className="absolute -top-1 -left-1.5 size-3 bg-primary rounded-sm rotate-45 shadow-xl"></div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default TimelineFooter;
