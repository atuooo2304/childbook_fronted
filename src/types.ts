/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserProfile {
  name: string;
  age: number;
  avatar: string;
}

export interface StoryPage {
  text: string;
  imageUrl: string;
  imagePrompt: string;
  layout?: 'bottom' | 'top-left' | 'top-right' | 'centered';
  layoutHint?: 'bottom' | 'top-left' | 'top-right' | 'centered';
  ttsText?: string;
}

export interface BranchChoiceOption {
  id: 'A' | 'B';
  label: string;
}

export interface StoryBranching {
  branchPageIndex: number;
  choices: BranchChoiceOption[];
  paths: {
    A: StoryPage[];
    B: StoryPage[];
  };
}

export interface Story {
  id: string;
  title: string;
  pages: StoryPage[];
  coverUrl: string;
  createdAt: number;
  theme: string;
  isFavorite?: boolean;
  outline?: unknown;
  generationMeta?: unknown;
  branching?: StoryBranching;
}

export type AppView = 'onboarding' | 'home' | 'workshop' | 'reader' | 'library' | 'settings' | 'completion';
