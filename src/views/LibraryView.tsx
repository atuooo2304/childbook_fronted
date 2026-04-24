/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Story, StoryPage } from '../types.ts';
import { ArrowLeft, PlusCircle, BookOpen, Calendar, Trash2, Heart } from 'lucide-react';
import { SAMPLE_STORY } from '../constants.ts';

interface Props {
  onBack: () => void;
  onSelectStory: (story: Story) => void;
}

export default function LibraryView({ onBack, onSelectStory }: Props) {
  const [stories, setStories] = useState<Story[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('story_pals_library');
    let library: Story[] = saved ? JSON.parse(saved) : [];
    
    // Always ensure sample story is available if library is empty or it was deleted
    if (library.length === 0) {
      library = [SAMPLE_STORY];
    } else if (!library.find(s => s.id === SAMPLE_STORY.id)) {
      // Prepend sample story if it's not in the list
      library = [SAMPLE_STORY, ...library];
    }
    
    setStories(library);
  }, []);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = stories.map(s => s.id === id ? { ...s, isFavorite: !s.isFavorite } : s);
    setStories(updated);
    localStorage.setItem('story_pals_library', JSON.stringify(updated));
  };

  const deleteStory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = stories.filter(s => s.id !== id);
    setStories(updated);
    localStorage.setItem('story_pals_library', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-surface paper-texture flex flex-col">
       {/* Header */}
       <header className="bg-white/80 backdrop-blur-sm border-b-4 border-dashed border-amber-200/50 flex justify-between items-center w-full px-6 py-4 fixed top-0 z-50">
        <button 
          onClick={onBack}
          className="text-primary hover:scale-95 transition-transform active:scale-90 flex items-center gap-2 font-label font-bold"
        >
          <ArrowLeft className="w-6 h-6" />
          <span>返回</span>
        </button>
        <span className="text-primary font-black text-2xl italic font-headline">我的书架</span>
        <div className="w-10"></div>
      </header>

      <main className="pt-24 pb-12 px-6 max-w-4xl mx-auto w-full">
        {stories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
            <div className="w-40 h-40 bg-surface-container rounded-full flex items-center justify-center crayon-border border-dashed border-outline-variant">
              <PlusCircle size={64} className="text-outline-variant" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-primary font-headline">书架空空的</h3>
              <p className="text-on-surface-variant font-body">快去创作你的第一个神奇故事吧！</p>
            </div>
            <button 
              onClick={onBack}
              className="bg-primary text-on-primary px-8 py-4 rounded-full font-black text-xl scribble-shadow hover:scale-105 active:scale-95 transition-all font-headline"
            >
              去讲一个故事
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {stories.map((story) => (
              <motion.div
                key={story.id}
                whileHover={{ scale: 1.02, rotate: 1 }}
                onClick={() => onSelectStory(story)}
                className="group relative cursor-pointer"
              >
                {/* Book Cover Shadow Effect */}
                <div className="absolute inset-0 bg-primary/5 rounded-2xl transform translate-x-2 translate-y-2 -z-10 bg-secondary" />
                
                <div className="bg-white rounded-2xl overflow-hidden crayon-border border-on-surface-variant shadow-lg flex flex-col h-full bg-surface-container-low">
                   <div className="aspect-[3/4] relative overflow-hidden deckled-edge">
                      <img 
                        src={story.coverUrl} 
                        alt={story.title} 
                        className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                      />
                      <div className="absolute top-3 left-3">
                         <button 
                           onClick={(e) => toggleFavorite(story.id, e)}
                           className={`p-2 backdrop-blur-sm rounded-full transition-all shadow-sm ${
                             story.isFavorite ? 'bg-secondary text-white' : 'bg-white/80 text-secondary'
                           }`}
                         >
                            <Heart size={16} className={story.isFavorite ? 'fill-current' : ''} />
                         </button>
                      </div>
                      <div className="absolute top-3 right-3">
                         <button 
                           onClick={(e) => deleteStory(story.id, e)}
                           className="p-2 bg-white/80 backdrop-blur-sm rounded-full text-error hover:bg-error hover:text-white transition-all shadow-sm"
                         >
                            <Trash2 size={16} />
                         </button>
                      </div>
                   </div>
                   <div className="p-4 space-y-2 flex-grow">
                      <h4 className="text-lg font-black text-primary font-headline line-clamp-1">{story.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-on-surface-variant font-label">
                         <Calendar size={14} />
                         <span>{new Date(story.createdAt).toLocaleDateString()}</span>
                         <span className="mx-1">•</span>
                         <BookOpen size={14} />
                         <span>{story.pages.length} 页</span>
                      </div>
                      <div className="flex gap-2 pt-1 uppercase">
                         <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full text-[10px] font-bold">
                           {story.theme}
                         </span>
                      </div>
                   </div>
                </div>
              </motion.div>
            ))}
            
            {/* New Story Trigger */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={onBack}
              className="group relative h-full min-h-[300px]"
            >
               <div className="absolute inset-0 bg-primary/5 rounded-2xl transform translate-x-1 translate-y-1 -z-10" />
               <div className="h-full bg-surface-container-low/50 border-4 border-dashed border-outline-variant rounded-2xl flex flex-col items-center justify-center gap-4 text-outline-variant group-hover:bg-white group-hover:border-primary transition-all p-6">
                  <PlusCircle size={48} />
                  <div className="text-center">
                    <h5 className="text-xl font-black font-headline">新故事</h5>
                    <p className="text-sm font-body">开启一段新的冒险</p>
                  </div>
               </div>
            </motion.button>
          </div>
        )}
      </main>
    </div>
  );
}
