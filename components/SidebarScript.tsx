
import React, { useRef } from 'react';

interface SidebarScriptProps {
  script: string;
  onScriptChange: (val: string) => void;
  location: string;
  title: string;
  highlightText?: string;
  onUpload: (text: string) => void;
}

const SidebarScript: React.FC<SidebarScriptProps> = ({ script, onScriptChange, location, title, highlightText, onUpload }) => {
  // Fix: Use any to bypass missing HTMLInputElement type
  const fileInputRef = useRef<any>(null);

  // Fix: Use any for ChangeEvent generic to bypass missing HTMLInputElement type
  const handleFileChange = (e: React.ChangeEvent<any>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => onUpload(e.target?.result as string);
      reader.readAsText(file);
    }
  };

  const renderScript = () => {
    if (!highlightText) return script;
    const parts = script.split(new RegExp(`(${highlightText})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === highlightText.toLowerCase() ? 
      <span key={i} className="bg-primary/20 text-primary border-b border-primary/50 font-semibold px-0.5">{part}</span> : 
      part
    );
  };

  return (
    <aside className="w-80 border-r border-accent-dark bg-panel-dark flex flex-col">
      <div className="p-4 border-b border-accent-dark flex justify-between items-center bg-black/10">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-lg">description</span>
          <span className="font-bold text-xs uppercase tracking-[0.2em] text-gray-500">Manuscript</span>
        </div>
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[10px] font-bold text-gray-400 transition-all border border-white/5"
        >
          <span className="material-symbols-outlined text-xs">upload_file</span> IMPORT
        </button>
        <input type="file" ref={fileInputRef} className="hidden" accept=".txt,.md" onChange={handleFileChange} />
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
        <h1 className="text-white text-lg font-bold leading-tight">{title}</h1>
        <p className="text-gray-500 uppercase text-[9px] tracking-widest border-b border-white/5 pb-2">{location}</p>
        
        <div className="relative flex-1">
          <textarea 
            className="absolute inset-0 w-full h-full bg-transparent border-none focus:ring-0 text-transparent caret-white text-sm leading-relaxed resize-none p-0 z-10"
            value={script}
            // Fix: Cast e.target to any to resolve property 'value' missing error on HTMLTextAreaElement
            onChange={(e) => onScriptChange((e.target as any).value)}
          />
          <div className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap select-none z-0">
            {renderScript()}
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-accent-dark bg-black/20">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Atmosphere Scan</span>
          <div className="size-1.5 rounded-full bg-primary animate-pulse"></div>
        </div>
        <div className="flex items-end gap-[3px] h-10 w-full">
          {[2, 6, 8, 4, 10, 5, 12, 6, 8, 4, 3, 7, 5, 9, 2, 6, 4, 8, 3, 5, 7, 9, 4, 2].map((h, i) => (
            <div key={i} className="flex-1 bg-primary/40 rounded-t-sm" style={{ height: `${h * 2.5}px` }}></div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default SidebarScript;
