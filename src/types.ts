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
}

export interface Story {
  id: string;
  title: string;
  pages: StoryPage[];
  coverUrl: string;
  createdAt: number;
  theme: string;
  isFavorite?: boolean;
}

export type AppView = 'onboarding' | 'home' | 'workshop' | 'reader' | 'library' | 'settings' | 'completion';
