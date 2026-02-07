
import React, { useState, useRef, useEffect } from 'react';
import { VisualManifest } from '../types';

interface WorldBibleProps {
  manifest: VisualManifest;
  onAddChar: (name: string, desc: string, imageUrl?: string) => void;
  onRemoveChar: (id: string) => void;
  onAddEnv: (name: string, desc: string, imageUrl?: string) => void;
  onRemoveEnv: (id: string) => void;
  onSelectAsset: (id: string, type: 'char' | 'env') => void;
  selectedFrameAssets: { charId?: string; envId?: string };
}

type MenuState = 'char' | 'env' | null;

const WorldBible: React.FC<WorldBibleProps> = ({ 
  manifest, onAddChar, onRemoveChar, onAddEnv, onRemoveEnv, onSelectAsset, selectedFrameAssets 
}) => {
  const [openMenu, setOpenMenu] = useState<MenuState>(null);
  const [activeForm, setActiveForm] = useState<MenuState>(null);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  
  const charInputRef = useRef<HTMLInputElement>(null);
  const envInputRef = useRef<HTMLInputElement>(null);

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
        if (type === 'char') onAddChar(name || file.name.split('.')[0], desc, dataUrl);
        else onAddEnv(name || file.name.split('.')[0], desc, dataUrl);
        resetForm();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = (imageUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${filename.replace(/\s+/g, '_')}_plate.png`;
    link.click();
  };

  const resetForm = () => {
    setName('');
    setDesc('');
    setOpenMenu(null);
    setActiveForm(null);
  };

  const renderAssetImage = (imageUrl: string, alt: string, id: string, type: 'char' | 'env') => {
    const isLoading = imageUrl.startsWith('loading://');
    const isLinked = (type === 'char' && selectedFrameAssets.charId === id) || (type === 'env' && selectedFrameAssets.envId === id);
    
    if (isLoading) {
      return (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
          <div className="size-6 border-2 border-primary/40 border-t-primary rounded-full animate-spin mb-2"></div>
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-primary/80 animate-pulse">Synthesis...</span>
        </div>
      );
    }

    return (
      <>
        <img 
          src={imageUrl} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          alt={alt} 
        />
        {isLinked && (
          <div className="absolute top-2 left-2 bg-primary text-black text-[7px] font-black uppercase px-1.5 py-0.5 rounded shadow-xl z-20 animate-in zoom-in-50">
            Linked to Frame
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <button 
            onClick={(e) => { e.stopPropagation(); handleDownload(imageUrl, alt); }}
            className="size-7 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-primary hover:text-black transition-all border border-white/10"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); type === 'char' ? onRemoveChar(id) : onRemoveEnv(id); }}
            className="size-7 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-all border border-white/10"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
          </button>
        </div>
      </>
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
              <input className="w-full bg-black/40 border-white/10 rounded text-xs text-white" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
              <textarea className="w-full bg-black/40 border-white/10 rounded text-xs text-white h-20 resize-none" placeholder="Brief..." value={desc} onChange={e => setDesc(e.target.value)} />
              <div className="flex gap-2">
                <button onClick={resetForm} className="flex-1 text-[10px] font-bold uppercase text-gray-500">Cancel</button>
                <button onClick={() => { onAddChar(name, desc); resetForm(); }} className="flex-[2] bg-primary text-black py-2 rounded text-[10px] font-black uppercase">Synthesize</button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {manifest.characters.map(char => (
              <div key={char.id} className="group relative cursor-pointer" onClick={() => onSelectAsset(char.id, 'char')}>
                <div className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all group-hover:border-primary/40 ${selectedFrameAssets.charId === char.id ? 'border-primary ring-4 ring-primary/5' : 'border-white/5'}`}>
                  {renderAssetImage(char.image, char.name, char.id, 'char')}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none"></div>
                  <div className="absolute bottom-3 left-3 right-3 pointer-events-none">
                    <p className="text-[11px] font-black text-white uppercase tracking-wider">{char.name}</p>
                    <p className="text-[8px] text-primary font-bold uppercase tracking-widest mt-0.5">{char.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

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
              <input className="w-full bg-black/40 border-white/10 rounded text-xs text-white" placeholder="Location Name" value={name} onChange={e => setName(e.target.value)} />
              <textarea className="w-full bg-black/40 border-white/10 rounded text-xs text-white h-20 resize-none" placeholder="Brief..." value={desc} onChange={e => setDesc(e.target.value)} />
              <div className="flex gap-2">
                <button onClick={resetForm} className="flex-1 text-[10px] font-bold uppercase text-gray-500">Cancel</button>
                <button onClick={() => { onAddEnv(name, desc); resetForm(); }} className="flex-[2] bg-primary text-black py-2 rounded text-[10px] font-black uppercase">Synthesize</button>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {manifest.environments.map(env => (
              <div key={env.id} className="group relative cursor-pointer" onClick={() => onSelectAsset(env.id, 'env')}>
                <div className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all group-hover:border-primary/40 ${selectedFrameAssets.envId === env.id ? 'border-primary ring-4 ring-primary/5' : 'border-white/5'}`}>
                  {renderAssetImage(env.image, env.name, env.id, 'env')}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none"></div>
                  <div className="absolute bottom-3 left-3 right-3 pointer-events-none">
                    <p className="text-[10px] font-black text-white uppercase tracking-wider">{env.name}</p>
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
