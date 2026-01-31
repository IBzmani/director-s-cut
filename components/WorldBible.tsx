
import React from 'react';
import { VisualManifest } from '../types';

interface WorldBibleProps {
  manifest: VisualManifest;
}

const WorldBible: React.FC<WorldBibleProps> = ({ manifest }) => {
  return (
    <aside className="w-72 border-l border-accent-dark bg-panel-dark flex flex-col">
      <div className="p-4 border-b border-accent-dark bg-black/10 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-lg">auto_awesome_motion</span>
          <span className="font-bold text-xs uppercase tracking-[0.2em] text-gray-500">Visual Manifest</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-8">
        {/* Characters */}
        <section>
          <h4 className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-4 flex items-center justify-between">
            CAST & PORTRAITS
            <span className="text-[8px] bg-white/5 px-1.5 py-0.5 rounded">AUTO-SCAN</span>
          </h4>
          <div className="grid gap-3">
            {manifest.characters.map(char => (
              <div key={char.id} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg border border-white/5 group hover:border-primary/30 cursor-pointer transition-all">
                <img src={char.image} className="size-10 rounded object-cover shadow-lg" alt="" />
                <div className="overflow-hidden">
                  <p className="text-[11px] font-bold text-white truncate">{char.name}</p>
                  <p className="text-[9px] text-gray-500 truncate uppercase tracking-tighter">{char.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Motifs */}
        <section>
          <h4 className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-4">KEY MOTIFS</h4>
          <div className="grid grid-cols-2 gap-2">
            {manifest.motifs.map(motif => (
              <div key={motif.id} className="p-3 bg-primary/5 rounded-xl border border-primary/10 flex flex-col items-center text-center group hover:bg-primary/10 transition-all cursor-pointer">
                <span className="material-symbols-outlined text-primary mb-2 group-hover:scale-110 transition-transform">{motif.icon || 'star'}</span>
                <p className="text-[10px] font-black text-white uppercase">{motif.label}</p>
                <p className="text-[8px] text-gray-500 mt-1 leading-tight">{motif.description.substring(0, 30)}...</p>
              </div>
            ))}
          </div>
        </section>

        {/* Environments */}
        <section>
          <h4 className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-4">LOCATION PLATES</h4>
          <div className="space-y-4">
            {manifest.environments.map(env => (
              <div key={env.id} className="relative rounded-lg overflow-hidden h-24 border border-white/5 group">
                <img src={env.image} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                <div className="absolute bottom-2 left-3 right-3">
                  <p className="text-[10px] font-bold text-white truncate">{env.name}</p>
                  <div className="flex gap-1 mt-1">
                    {env.colors.map((c, i) => <div key={i} className="h-1 flex-1 rounded-full" style={{ backgroundColor: c }}></div>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </aside>
  );
};

export default WorldBible;
