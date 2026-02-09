
export interface Character {
  id: string;
  name: string;
  role: string;
  image: string;
  description?: string;
}

export interface Environment {
  id: string;
  name: string;
  image: string;
  colors: string[];
  mood?: string;
}

export interface Motif {
  id: string;
  label: string;
  icon: string;
  description: string;
  frequency?: string;
}

export interface DirectorsBrief {
  emotionalArc: string;
  lightingScheme: string;
  cameraLogic: string;
  pacing: string;
}

export type Genre = 'Drama' | 'Comedy' | 'Horror' | 'Action' | 'Sci-Fi' | 'Noir';

export interface Frame {
  id: string;
  title: string;
  timeRange: string;
  image: string;
  prompt: string;
  scriptSegment?: string;
  directorsBrief?: DirectorsBrief;
  isGenerating?: boolean;
  audioData?: string; 
  isGeneratingAudio?: boolean;
  shotType?: string;
}

export interface VisualManifest {
  characters: Character[];
  environments: Environment[];
  motifs: Motif[];
}

export interface SceneState {
  title: string;
  location: string;
  script: string;
  genre: Genre;
  frames: Frame[];
  manifest: VisualManifest;
  sentimentData: { time: string; value: number; suspense: number }[];
}

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}
