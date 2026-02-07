
import React, { useState, useRef, useEffect } from 'react';
import { VisualManifest } from '../types';

interface WorldBibleProps {
  manifest: VisualManifest;
  onAddChar: (name: string, desc: string, imageUrl?: string) => void;
  onAddEnv: (name: string, desc: string, imageUrl?: string) => void;
}

type MenuState = 'char' | 'env' | null;

const WorldBible: React.FC<WorldBibleProps> = ({ manifest, onAddChar, onAddEnv }) => {
  const [openMenu, setOpenMenu] = useState<MenuState>(null);
  const [activeForm, setActiveForm] = useState<MenuState>(null);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  
  const charInputRef = useRef<HTMLInputElement>(null);
  const envInputRef = useRef<HTMLInputElement>(null);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = () => setOpenMenu(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>, type: 'char' | 'env') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (type === 'char') {
          onAddChar(name || file.name.split('.')[0] || 'Imported Actor', desc, dataUrl);
        } else {
          onAddEnv(name || file.name.split('.')[0] || 'Imported Location', desc, dataUrl);
        }
        resetForm();
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setName('');
    setDesc('');
    setOpenMenu(null);
    setActiveForm(null);
  };

  const renderAssetImage = (imageUrl: string, alt: string) => {
    if (imageUrl.startsWith('loading://')) {
      return (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
          <div className="size-6 border-2 border-primary/40 border-t-primary rounded-full animate-spin mb-2"></div>
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-primary/80 animate-pulse">Synthesizing...</span>
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

  const ActionMenu = ({ type }: { type: 'char' | 'env' }) => (
    <div 
      className="absolute right-0 top-7 w-48 bg-panel-dark border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl py-1 animate-in fade-in zoom-in duration-200"
      onClick={e => e.stopPropagation()}
    >
      <button 
        onClick={() => { setActiveForm(type); setOpenMenu(null); }}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-gray-300 hover:bg-primary hover:text-black transition-all"
      >
        <span className="material-symbols-outlined text-sm">auto_fix_high</span>
        AI Synthesis
      </button>
      <button 
        onClick={() => { 
          if (type === 'char') charInputRef.current?.click();
          else envInputRef.current?.click();
          setOpenMenu(null);
        }}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-gray-300 hover:bg-primary hover:text-black transition-all"
      >
        <span className="material-symbols-outlined text-sm">upload_file</span>
        Import Local
      </button>
    </div>
  );

  return (
    <aside className="w-80 border-l border-accent-dark bg-panel-dark flex flex-col">
      <div className="p-4 border-b border-accent-dark bg-black/10 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-lg">menu_book</span>
          <span className="font-bold text-[10px] uppercase tracking-[0.2em] text-gray-500">Visual Source of Truth</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-10 custom-scrollbar pb-20">
        <input type="file" ref={charInputRef} className="hidden" accept="image/*" onChange={e => handleFileImport(e, 'char')} />
        <input type="file" ref={envInputRef} className="hidden" accept="image/*" onChange={e => handleFileImport(e, 'env')} />

        {/* Actor Portfolio Section */}
        <section>
          <div className="flex items-center justify-between mb-4 relative">
            <h4 className="text-[9px] text-gray-600 font-black uppercase tracking-[0.2em]">Actor Portfolio</h4>
            <div className="relative">
              <button 
                onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === 'char' ? null : 'char'); }}
                className={`size-6 rounded flex items-center justify-center transition-all ${openMenu === 'char' ? 'bg-primary text-black' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
              >
                <span className="material-symbols-outlined text-sm">{openMenu === 'char' ? 'close' : 'add'}</span>
              </button>
              {openMenu === 'char' && <ActionMenu type="char" />}
            </div>
          </div>

          {activeForm === 'char' && (
            <div className="mb-6 p-4 bg-black/40 rounded-xl border border-primary/20 space-y-3 animate-in slide-in-from-top-2 duration-300">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[8px] font-black uppercase tracking-widest text-primary">Synthesis Brief</span>
                <button onClick={resetForm} className="text-gray-500 hover:text-white"><span className="material-symbols-outlined text-xs">close</span></button>
              </div>
              <input className="w-full bg-black/40 border-white/10 rounded text-xs text-white placeholder:text-gray-700" placeholder="Character Name" value={name} onChange={e => setName(e.target.value)} />
              <textarea className="w-full bg-black/40 border-white/10 rounded text-xs text-white h-20 placeholder:text-gray-700 resize-none" placeholder="Physical description, age, wardrobe details..." value={desc} onChange={e => setDesc(e.target.value)} />
              <button 
                onClick={() => { onAddChar(name, desc); resetForm(); }}
                className="w-full bg-primary text-black py-2 rounded text-[10px] font-black uppercase shadow-[0_0_15px_rgba(236,182,19,0.3)] hover:scale-[1.02] transition-transform"
              >
                Synthesize Actor
              </button>
            </div>
          )}

          <div className="space-y-4">
            {manifest.characters.map(char => (
              <div key={char.id} className="group">
                <div className="relative aspect-square rounded-xl overflow-hidden border border-white/5 shadow-2xl transition-all group-hover:border-primary/40">
                  {renderAssetImage(char.image, char.name)}
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

        {/* Location Plates Section */}
        <section>
          <div className="flex items-center justify-between mb-4 relative">
            <h4 className="text-[9px] text-gray-600 font-black uppercase tracking-[0.2em]">Location Plates</h4>
            <div className="relative">
              <button 
                onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === 'env' ? null : 'env'); }}
                className={`size-6 rounded flex items-center justify-center transition-all ${openMenu === 'env' ? 'bg-primary text-black' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
              >
                <span className="material-symbols-outlined text-sm">{openMenu === 'env' ? 'close' : 'add'}</span>
              </button>
              {openMenu === 'env' && <ActionMenu type="env" />}
            </div>
          </div>

          {activeForm === 'env' && (
            <div className="mb-6 p-4 bg-black/40 rounded-xl border border-primary/20 space-y-3 animate-in slide-in-from-top-2 duration-300">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[8px] font-black uppercase tracking-widest text-primary">Location Brief</span>
                <button onClick={resetForm} className="text-gray-500 hover:text-white"><span className="material-symbols-outlined text-xs">close</span></button>
              </div>
              <input className="w-full bg-black/40 border-white/10 rounded text-xs text-white placeholder:text-gray-700" placeholder="Site Title" value={name} onChange={e => setName(e.target.value)} />
              <textarea className="w-full bg-black/40 border-white/10 rounded text-xs text-white h-20 placeholder:text-gray-700 resize-none" placeholder="Architecture, lighting, atmospheric mood..." value={desc} onChange={e => setDesc(e.target.value)} />
              <button 
                onClick={() => { onAddEnv(name, desc); resetForm(); }}
                className="w-full bg-primary text-black py-2 rounded text-[10px] font-black uppercase shadow-[0_0_15px_rgba(236,182,19,0.3)] hover:scale-[1.02] transition-transform"
              >
                Synthesize Location
              </button>
            </div>
          )}

          <div className="space-y-6">
            {manifest.environments.map(env => (
              <div key={env.id} className="group cursor-pointer">
                <div className="relative aspect-video rounded-xl overflow-hidden border border-white/5 shadow-2xl transition-all group-hover:border-primary/40">
                  {renderAssetImage(env.image, env.name)}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-[10px] font-black text-white uppercase tracking-wider">{env.name}</p>
                    <p className="text-[8px] text-primary font-bold uppercase tracking-widest mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">Visual Master Reference</p>
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
