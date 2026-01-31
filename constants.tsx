
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
      prompt: "Establishing shot of neon city in rain, cyberpunk aesthetic"
    },
    {
      id: "f2",
      title: "Frame 02",
      timeRange: "00:04 - 00:08",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAc3xrDK90mMPmx6oPZx8AHLVCVBq1WkcV3CCPd1-A7FbTztp1GrhhdZW4dKyz8hXCXcta_di3Awj_sZjqtmlQcLUmk8Dq92bzDh1kWgqbEPBsve8IA3lEJeHAeqa_55ziBPdAOFvZbYkX6m0XItqI56JWwkX8751jukWLckyrBE7smqRU7qg24aAQRcmz0jO54ZNnrrpLg3sUbgLx2-_B9Df-dutdZyG60kfmRw7UkQkE_fiuUU2PYB_17j5yMjkr2Xc5zYRZgBkw",
      prompt: "Close up of protagonist Kaito eyes, intense look"
    },
    {
      id: "f3",
      title: "Frame 03",
      timeRange: "00:08 - 00:12",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDoZ-sTnFXYPqj6QV1jED28h3SFxzIq2-pGQ6mFTAZ30NHPuHgOWKTMrqPKHyCGNzt0TAb_sS__XJ7yHIdXfo8QfvHBQsRRE1_n-R4B28DWKMj4SSeKrFyq3CtY230F-Om8O_oS1ec4DIVme80vrs6Op08Gdp0ESxA4jMYmECfVW-TcD6CS5cA8wHcz2OuPEGhFcSAlPzvMeqTAg-HfoIStgC93wJNJ7BHPfe8ABkwLotB8PIZVLnpUXu6olWczIVDab5uu_UqKKvk",
      prompt: "Shadowed figure silhouette standing near a glowing noodle stand"
    }
  ],
  characters: [
    {
      id: "c1",
      name: "Kaito",
      role: "Protagonist / Mercenary",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDv1SUmm0leGr8bIjpW8zt87GhcG5ZTOZgKn4h5w6hbHuKluCb_iXS6xZ5bDQLSxGQeAGnIgOpkrwT9_5326DfmiG8_p-TcceCrXtX0gYzNEdO1moI4i3uqwPuRBh9Qb50Qifxti1ZuoKmm8tyxWLZay1IsB9wBDXEzfl7zSIgei3DxXnPKXbRV4gh-2GAIErxjThN7Kcrm0s5BnZcBbUOWw5VhUdoCqTtYx0_OX9odZAXbfKHI-_wVUteR5xfPx-T7v9wS9uABHIU"
    },
    {
      id: "c2",
      name: "The Shadow",
      role: "Antagonist / Unknown",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBYIdNL_8X27S5h8S3VE1x_oNLEpFyMGvKxcUmi7fkcqXh3PwCkJctlmzUjK7qtQF7-aYWmfSarEl_aPYPew8mT-JnCoy6mKUzhPKnYGpoxUvRHPRnBp_rfpB_HGZ_e9NMbWG_sic-Rgvn9M8DvCGjPaf8u7gUse1JRRzxmrib8x1UvuBzQrR_AAPfEz4DdkoASjpChw903i-6l7sCyjSjljfnVtJQ_dOnPGpsrXvBdhoYDqx42IWSb3PaaEvmd7IWLgW9UAMer3xk",
      opacity: 0.7
    }
  ],
  environments: [
    {
      id: "e1",
      name: "Neo-Tokyo District 9",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAKnbswcxYnQc2fd8MZmCo7rhVOiy4ceprEiOLRW5oiqkW516fT3_OMLsr0M4HoSQsR7m8paZxPV-0yS6km89_u7yiMOsSiJhSGbMCfBwHLd7J4w9zLmvTf5zgRkUitjLoa1R25mqiLleU0bqpJsk8vLhIGZ5nL5s78ZIY4arkIfgPU3fvi3Pl2W2xjD7UjZQssVzNY3pjQWsGE9aUfDoEJfD13Uq5EBFfjWi_wYnhfOk4BF6emZJOpqZOjTGgSkt5ZfkBsXDcShmU",
      colors: ["#0a0f2c", "#ecb613", "#ff0055"]
    }
  ],
  sentimentData: [
    { time: '0:00', value: 40 },
    { time: '0:10', value: 10 },
    { time: '0:20', value: 50 },
    { time: '0:30', value: 30 },
    { time: '0:40', value: 60 },
    { time: '0:50', value: 20 },
  ]
};
