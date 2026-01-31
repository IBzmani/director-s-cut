
import { SceneState } from './types';

export const INITIAL_SCENE: SceneState = {
  title: "Scene 4: The Neon Encounter",
  location: "EXT. NEO-TOKYO - NIGHT",
  script: `The rain slicks the pavement, reflecting a kaleidoscope of holographic advertisements. Kaito pulls his collar up against the chill.

KAITO: "I thought you'd be taller."

SHADOW: "And I thought you'd be smarter than to show up unarmed."`,
  frames: [
    {
      id: "f1",
      title: "Frame 01",
      timeRange: "00:00 - 00:04",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCvTkIhVqEtIcTF3cp8P1DHSgi1gmVTW6smPIrLDrW3I3Bvj_XCxaPucU-kFnC00ZvRLXyvjj3gJVCZPVp-gVgHDwmLD28T6ii766TcfjvjQm4jP9ehO6uf6i7Dird23W-6Bs3ezT5TyJYUNRiDTqPA14EXj175z4SypIL9OhRHtIuGwYqJ0Rov3sCwEC6MTUHNLg1O7Pkcld9fVv9p7LsDL4KhEkkuxyxhluM0hGpGASdtb25q8uECDNFz3QbpVkpDaXeAPlEI-TY",
      prompt: "Establishing shot of neon city in rain, cyberpunk aesthetic",
      scriptSegment: "The rain slicks the pavement"
    },
    {
      id: "f2",
      title: "Frame 02",
      timeRange: "00:04 - 00:08",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAc3xrDK90mMPmx6oPZx8AHLVCVBq1WkcV3CCPd1-A7FbTztp1GrhhdZW4dKyz8hXCXcta_di3Awj_sZjqtmlQcLUmk8Dq92bzDh1kWgqbEPBsve8IA3lEJeHAeqa_55ziBPdAOFvZbYkX6m0XItqI56JWwkX8751jukWLckyrBE7smqRU7qg24aAQRcmz0jO54ZNnrrpLg3sUbgLx2-_B9Df-dutdZyG60kfmRw7UkQkE_fiuUU2PYB_17j5yMjkr2Xc5zYRZgBkw",
      prompt: "Close up of protagonist Kaito eyes, intense look",
      scriptSegment: "Kaito pulls his collar up"
    }
  ],
  manifest: {
    characters: [
      {
        id: "c1",
        name: "Kaito",
        role: "Protagonist",
        image: "https://picsum.photos/id/64/100/100",
        description: "Rugged mercenary with a cybernetic eye."
      }
    ],
    environments: [
      {
        id: "e1",
        name: "Neo-Tokyo District 9",
        image: "https://picsum.photos/id/122/400/200",
        mood: "Atmospheric, Noir",
        colors: ["#0a0f2c", "#ecb613", "#ff0055"]
      }
    ],
    motifs: [
      // Added missing description property to satisfy the Motif interface and fix compiler error
      { id: "m1", label: "Rain Refraction", icon: "water_drop", frequency: "High", description: "Visual distortions of neon light on wet asphalt." },
      { id: "m2", label: "Neon Contrast", icon: "flare", frequency: "Moderate", description: "High contrast between dark shadows and vibrant holographic light." }
    ]
  },
  sentimentData: [
    { time: '0:00', value: 40, suspense: 20 },
    { time: '0:10', value: 10, suspense: 50 },
    { time: '0:20', value: 50, suspense: 80 },
    { time: '0:30', value: 30, suspense: 60 },
  ]
};
