
import React from 'react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis } from 'recharts';

interface TimelineFooterProps {
  sentimentData: { time: string; value: number }[];
}

const TimelineFooter: React.FC<TimelineFooterProps> = ({ sentimentData }) => {
  return (
    <footer className="h-48 border-t border-accent-dark bg-panel-dark flex flex-col z-10">
      <div className="px-6 py-2 border-b border-accent-dark flex justify-between items-center bg-black/20">
        <div className="flex items-center gap-6">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Director’s Brief</span>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="size-1.5 rounded-full bg-primary"></div>
              <span className="text-[10px] text-gray-400">Suspense</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-1.5 rounded-full bg-blue-500"></div>
              <span className="text-[10px] text-gray-400">Atmosphere</span>
            </div>
          </div>
        </div>
        <div className="flex gap-4 text-gray-400">
          <span className="material-symbols-outlined text-sm cursor-pointer hover:text-white transition-colors">zoom_in</span>
          <span className="material-symbols-outlined text-sm cursor-pointer hover:text-white transition-colors">zoom_out</span>
        </div>
      </div>
      
      <div className="flex-1 flex overflow-hidden">
        {/* Labels Column */}
        <div className="w-32 border-r border-accent-dark flex flex-col justify-around py-4 pl-6 text-[10px] text-gray-500 font-bold uppercase">
          <span className="flex items-center gap-2">Sentiment</span>
          <span className="flex items-center gap-2">Lighting</span>
          <span className="flex items-center gap-2">Cues</span>
        </div>
        
        {/* Timeline Grid */}
        <div className="flex-1 relative overflow-x-auto">
          <div className="h-full min-w-[1200px] flex flex-col relative">
            
            {/* Sentiment Layer (Recharts) */}
            <div className="flex-1 border-b border-white/5 relative">
              <div className="absolute inset-0 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sentimentData}>
                    <defs>
                      <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ecb613" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ecb613" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#ecb613" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorVal)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Lighting Layer */}
            <div className="flex-1 border-b border-white/5 flex items-center px-4 gap-8">
              <div className="h-5 w-64 bg-gradient-to-r from-[#0a0f2c] via-[#1a1a1a] to-[#0a0f2c] rounded-full border border-white/10 flex items-center justify-center text-[8px] text-gray-400 font-bold uppercase tracking-widest shadow-inner">
                LOW KEY / NEON COOL
              </div>
              <div className="h-5 w-40 bg-gradient-to-r from-red-900/60 to-red-800/60 rounded-full border border-red-500/30 flex items-center justify-center text-[8px] text-red-200 font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                ALERT STROBE
              </div>
            </div>

            {/* Cues Layer */}
            <div className="flex-1 flex items-center px-4 gap-20">
              <div className="size-5 rounded-full bg-accent-dark border border-primary flex items-center justify-center shadow-[0_0_10px_rgba(236,182,19,0.2)] cursor-pointer hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[10px] text-primary">notifications_active</span>
              </div>
              <div className="size-5 rounded-full bg-accent-dark border border-blue-400 flex items-center justify-center shadow-[0_0_10px_rgba(96,165,250,0.2)] cursor-pointer hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[10px] text-blue-400">music_note</span>
              </div>
              <div className="size-5 rounded-full bg-accent-dark border border-purple-400 flex items-center justify-center shadow-[0_0_10px_rgba(192,132,252,0.2)] cursor-pointer hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[10px] text-purple-400">videocam</span>
              </div>
            </div>

            {/* Time Markers */}
            <div className="h-4 border-t border-accent-dark flex justify-between px-4 text-[8px] text-gray-600 bg-background-dark/50">
              {['0:00s', '0:10s', '0:20s', '0:30s', '0:40s', '0:50s', '1:00s', '1:10s', '1:20s'].map(time => (
                <span key={time}>{time}</span>
              ))}
            </div>

            {/* Playhead */}
            <div className="absolute top-0 bottom-0 left-[300px] w-px bg-primary z-20">
              <div className="absolute -top-1 -left-1.5 size-3 bg-primary rounded-sm rotate-45 shadow-[0_0_10px_rgba(236,182,19,0.5)]"></div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default TimelineFooter;
