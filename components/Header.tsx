
import React from 'react';

interface HeaderProps {
  onGenerate: () => void;
  isGenerating: boolean;
}

const Header: React.FC<HeaderProps> = ({ onGenerate, isGenerating }) => {
  return (
    <header className="flex items-center justify-between h-14 border-b border-accent-dark px-6 bg-panel-dark z-20">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="size-6 text-primary">
            <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z"></path>
            </svg>
          </div>
          <h2 className="text-white text-lg font-bold tracking-tight">Director’s Cut</h2>
        </div>
        <div className="h-6 w-px bg-accent-dark"></div>
        <nav className="flex items-center gap-6">
          <a className="text-primary text-sm font-medium border-b-2 border-primary pb-4 pt-4" href="#">Workspace</a>
          <a className="text-gray-400 text-sm font-medium hover:text-white transition-colors" href="#">Library</a>
          <a className="text-gray-400 text-sm font-medium hover:text-white transition-colors" href="#">Collaborators</a>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center bg-accent-dark rounded-lg px-3 py-1.5 gap-2 border border-white/5">
          <span className="material-symbols-outlined text-gray-400 text-sm">search</span>
          <input 
            className="bg-transparent border-none focus:ring-0 text-sm w-48 placeholder:text-gray-500 text-white" 
            placeholder="Search project..." 
            type="text"
          />
        </div>
        <button 
          onClick={onGenerate}
          disabled={isGenerating}
          className={`flex items-center gap-2 bg-primary text-background-dark px-4 py-1.5 rounded-lg font-bold text-sm shadow-[0_0_15px_rgba(236,182,19,0.3)] hover:brightness-110 transition-all ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span className={`material-symbols-outlined text-[18px] ${isGenerating ? 'animate-spin' : ''}`}>
            {isGenerating ? 'autorenew' : 'bolt'}
          </span>
          <span>{isGenerating ? 'Generating...' : 'Generate Scene'}</span>
        </button>
        <div className="flex gap-1">
          <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
            <span className="material-symbols-outlined">settings</span>
          </button>
          <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border border-panel-dark"></span>
          </button>
        </div>
        <div 
          className="size-8 rounded-full bg-cover bg-center border border-accent-dark cursor-pointer" 
          style={{ backgroundImage: "url('https://picsum.photos/id/64/100/100')" }}
        ></div>
      </div>
    </header>
  );
};

export default Header;
