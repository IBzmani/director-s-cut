
import React from 'react';
import { Character, Environment } from '../types';

interface WorldBibleProps {
  characters: Character[];
  environments: Environment[];
}

const WorldBible: React.FC<WorldBibleProps> = ({ characters, environments }) => {
  return (
    <aside className="w-72 border-l border-accent-dark bg-panel-dark flex flex-col">
      <div className="p-4 border-b border-accent-dark flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-lg">auto_stories</span>
          <span className="font-bold text-sm uppercase tracking-widest text-gray-400">World Bible</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Character Section */}
        <section>
          <h4 className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-3 flex items-center justify-between">
            Characters
            <span className="material-symbols-outlined text-[14px] cursor-pointer hover:text-white transition-colors">add</span>
          </h4>
          <div className="space-y-3">
            {characters.map(char => (
              <div key={char.id} 
                className={`group p-2 rounded-lg bg-accent-dark hover:bg-accent-dark/80 border border-white/5 transition-all cursor-pointer ${char.opacity ? 'opacity-70' : ''}`}
                style={{ opacity: char.opacity }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="size-10 rounded bg-cover bg-center border border-white/5" 
                    style={{ backgroundImage: `url('${char.image}')` }}
                  ></div>
                  <div>
                    <p className="text-xs font-bold text-white">{char.name}</p>
                    <p className="text-[10px] text-gray-500">{char.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Environment Section */}
        <section>
          <h4 className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-3 flex items-center justify-between">
            Environments
            <span className="material-symbols-outlined text-[14px] cursor-pointer hover:text-white transition-colors">add</span>
          </h4>
          <div className="space-y-3">
            {environments.map(env => (
              <div key={env.id} className="rounded-lg overflow-hidden border border-white/5">
                <div 
                  className="h-20 bg-cover bg-center" 
                  style={{ backgroundImage: `url('${env.image}')` }}
                ></div>
                <div className="p-2 bg-accent-dark">
                  <p className="text-xs font-bold">{env.name}</p>
                  <div className="flex gap-1 mt-1">
                    {env.colors.map((color, i) => (
                      <div key={i} className="size-2 rounded-full" style={{ backgroundColor: color }}></div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Assets Section */}
        <section>
          <h4 className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-3">Recent Assets</h4>
          <div className="grid grid-cols-3 gap-2">
            {['medical_services', 'commute', 'flashlight_on'].map((icon, i) => (
              <div key={i} className="aspect-square bg-accent-dark rounded flex items-center justify-center hover:bg-primary/20 transition-all border border-white/5 cursor-pointer">
                <span className="material-symbols-outlined text-gray-600 text-lg">{icon}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </aside>
  );
};

export default WorldBible;
