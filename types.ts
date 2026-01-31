
export interface Character {
  id: string;
  name: string;
  role: string;
  image: string;
  opacity?: number;
}

export interface Environment {
  id: string;
  name: string;
  image: string;
  colors: string[];
}

export interface Frame {
  id: string;
  title: string;
  timeRange: string;
  image: string;
  prompt: string;
  isGenerating?: boolean;
}

export interface SceneState {
  title: string;
  location: string;
  script: string;
  frames: Frame[];
  characters: Character[];
  environments: Environment[];
  sentimentData: { time: string; value: number }[];
}
