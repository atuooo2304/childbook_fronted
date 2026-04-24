/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { UserProfile, AppView, Story } from './types.ts';

// Views (To be implemented in separate files)
import OnboardingView from './views/OnboardingView.tsx';
import HomeView from './views/HomeView.tsx';
import LibraryView from './views/LibraryView.tsx';
import ReaderView from './views/ReaderView.tsx';
import WorkshopView from './views/WorkshopView.tsx';
import SettingsView from './views/SettingsView.tsx';
import CompletionView from './views/CompletionView.tsx';

export default function App() {
  const [view, setView] = useState<AppView>('onboarding');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [currentTopic, setCurrentTopic] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState(true);

  // Load profile from local storage
  useEffect(() => {
    const savedProfile = localStorage.getItem('story_pals_profile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
      setView('home');
    }
    setIsInitializing(false);
  }, []);

  const handleProfileComplete = (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem('story_pals_profile', JSON.stringify(newProfile));
    setView('home');
  };

  const navigateToStory = (story: Story) => {
    setSelectedStory(story);
    setView('reader');
  };

  const toggleFavorite = (id: string) => {
    const saved = localStorage.getItem('story_pals_library');
    if (saved) {
      const library: Story[] = JSON.parse(saved);
      const updated = library.map(s => s.id === id ? { ...s, isFavorite: !s.isFavorite } : s);
      localStorage.setItem('story_pals_library', JSON.stringify(updated));
      
      if (selectedStory && selectedStory.id === id) {
        setSelectedStory({ ...selectedStory, isFavorite: !selectedStory.isFavorite });
      }
    }
  };

  if (isInitializing) {
    return <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="w-16 h-16 border-4 border-dashed border-primary animate-spin rounded-full"></div>
    </div>;
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden paper-texture">
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4 }}
          className="min-h-screen"
        >
          {view === 'onboarding' && (
            <OnboardingView onComplete={handleProfileComplete} />
          )}
          {view === 'home' && profile && (
            <HomeView 
              profile={profile} 
              onNavigate={setView}
              onStartWorkshop={(topic) => {
                setCurrentTopic(topic);
                setView('workshop');
              }}
            />
          )}
          {view === 'library' && (
            <LibraryView 
              onBack={() => setView('home')} 
              onSelectStory={navigateToStory} 
            />
          )}
          {view === 'reader' && selectedStory && (
            <ReaderView 
              story={selectedStory} 
              onBack={() => setView('library')} 
              onComplete={() => setView('completion')}
            />
          )}
          {view === 'completion' && selectedStory && profile && (
            <CompletionView 
              story={selectedStory}
              profile={profile}
              onBack={() => setView('reader')}
              onNewStory={() => setView('home')}
              toggleFavorite={toggleFavorite}
            />
          )}
          {view === 'workshop' && (
            <WorkshopView 
              storyTopic={currentTopic}
              onBack={() => setView('home')} 
              onComplete={navigateToStory}
            />
          )}
          {view === 'settings' && (
            <SettingsView 
              profile={profile} 
              onBack={() => setView('home')} 
              onUpdateProfile={handleProfileComplete}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
