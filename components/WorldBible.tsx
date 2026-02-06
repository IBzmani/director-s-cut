
import React, { useState } from 'react';
import { VisualManifest } from '../types';

interface WorldBibleProps {
  manifest: VisualManifest;
  onAddChar: (name: string, desc: string) => void;
  onAddEnv: (name: string, desc: string) => void;
}

const WorldBible: React.FC<WorldBibleProps> = ({ manifest, onAddChar, onAddEnv }) => {
  const [showAddChar, setShowAddChar] = useState(false);
  const [showAddEnv, setShowAddEnv] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  const renderAssetImage = (imageUrl: string, alt: string, aspectRatio: 'square' | 'video') => {
    if (imageUrl.startsWith('loading://')) {
      return (
        <div className={`absolute inset-0 bg-black/80 flex flex-col items-center justify-center`}>
          <div className="size-6 border-2 border-primary/40 border-t-primary rounded-full animate-spin mb-2"></div>
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-primary/80 animate-pulse">Rendering...</span>
        </div>
      );
    }
    return (
      <img 
        src={imageUrl} 
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
        alt={alt} 
      />
    );
  };

  return (
    <aside className="w-80 border-l border-accent-dark bg-panel-dark flex flex-col">
      <div className="p-4 border-b border-accent-dark bg-black/10 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-lg">menu_book</span>
          <span className="font-bold text-[10px] uppercase tracking-[0.2em] text-gray-500">Visual Source of Truth</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-10 custom-scrollbar pb-20">
        {/* Characters */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[9px] text-gray-600 font-black uppercase tracking-[0.2em]">Actor Portfolio</h4>
            <button 
              onClick={() => setShowAddChar(!showAddChar)}
              className="size-5 rounded bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-all"
            >
              <span className="material-symbols-outlined text-sm">{showAddChar ? 'close' : 'add'}</span>
            </button>
          </div>

          {showAddChar && (
            <div className="mb-6 p-3 bg-white/5 rounded-xl border border-white/10 space-y-3">
              {/* Fix: Cast e.target to any to resolve property 'value' missing error on HTMLInputElement */}
              <input className="w-full bg-black/40 border-white/10 rounded text-xs text-white" placeholder="Name" value={name} onChange={e => setName((e.target as any).value)} />
              {/* Fix: Cast e.target to any to resolve property 'value' missing error on HTMLTextAreaElement */}
              <textarea className="w-full bg-black/40 border-white/10 rounded text-xs text-white h-16" placeholder="Description (Look, Traits)" value={desc} onChange={e => setDesc((e.target as any).value)} />
              <button 
                onClick={() => { onAddChar(name, desc); setName(''); setDesc(''); setShowAddChar(false); }}
                className="w-full bg-primary text-black py-1.5 rounded text-[10px] font-black uppercase"
              >Generate Master Plate</button>
            </div>
          )}

          <div className="space-y-4">
            {manifest.characters.map(char => (
              <div key={char.id} className="group">
                <div className="relative aspect-square rounded-xl overflow-hidden border border-white/5 shadow-2xl transition-all group-hover:border-primary/40">
                  {renderAssetImage(char.image, char.name, 'square')}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-[11px] font-black text-white uppercase tracking-wider">{char.name}</p>
                    <p className="text-[8px] text-primary font-bold uppercase tracking-widest mt-0.5">{char.role}</p>
                  </div>
                </div>
                <p className="mt-2 text-[9px] text-gray-500 leading-relaxed line-clamp-2 px-1">{char.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Environments */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[9px] text-gray-600 font-black uppercase tracking-[0.2em]">Location Plates</h4>
            <button 
              onClick={() => setShowAddEnv(!showAddEnv)}
              className="size-5 rounded bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-all"
            >
              <span className="material-symbols-outlined text-sm">{showAddEnv ? 'close' : 'add'}</span>
            </button>
          </div>

          {showAddEnv && (
            <div className="mb-6 p-3 bg-white/5 rounded-xl border border-white/10 space-y-3">
              {/* Fix: Cast e.target to any to resolve property 'value' missing error on HTMLInputElement */}
              <input className="w-full bg-black/40 border-white/10 rounded text-xs text-white" placeholder="Location Name" value={name} onChange={e => setName((e.target as any).value)} />
              {/* Fix: Cast e.target to any to resolve property 'value' missing error on HTMLTextAreaElement */}
              <textarea className="w-full bg-black/40 border-white/10 rounded text-xs text-white h-16" placeholder="Description (Mood, Architecture)" value={desc} onChange={e => setDesc((e.target as any).value)} />
              <button 
                onClick={() => { onAddEnv(name, desc); setName(''); setDesc(''); setShowAddEnv(false); }}
                className="w-full bg-primary text-black py-1.5 rounded text-[10px] font-black uppercase"
              >Generate World Plate</button>
            </div>
          )}

          <div className="space-y-6">
            {manifest.environments.map(env => (
              <div key={env.id} className="group cursor-pointer">
                <div className="relative aspect-video rounded-xl overflow-hidden border border-white/5 shadow-2xl transition-all group-hover:border-primary/40">
                  {renderAssetImage(env.image, env.name, 'video')}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-[10px] font-black text-white uppercase tracking-wider">{env.name}</p>
                    <p className="text-[8px] text-primary font-bold uppercase tracking-widest mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">Select As Reference</p>
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
