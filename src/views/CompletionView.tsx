/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Story, UserProfile } from '../types.ts';
import { Heart, Share2, BookOpen, Settings, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

interface Props {
  story: Story;
  profile: UserProfile;
  onBack: () => void;
  onNewStory: () => void;
  toggleFavorite: (id: string) => void;
}

export default function CompletionView({ story, profile, onBack, onNewStory, toggleFavorite }: Props) {
  const [isFavorited, setIsFavorited] = useState(story.isFavorite || false);

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    toggleFavorite(story.id);
  };

  return (
    <div className="min-h-screen bg-surface paper-texture flex flex-col items-center">
      {/* Header */}
      <header className="w-full px-6 py-4 flex justify-between items-center fixed top-0 z-50">
        <button onClick={onBack} className="flex items-center gap-2 text-on-surface-variant font-bold">
          <ArrowLeft size={20} />
          <span>返回绘本</span>
        </button>
        <span className="font-headline font-black text-primary text-xl">故事绘本</span>
        <button className="text-on-surface-variant">
          <Settings size={24} />
        </button>
      </header>

      <main className="pt-24 pb-32 px-6 max-w-2xl w-full flex flex-col items-center gap-12">
        {/* Title Section */}
        <section className="text-center space-y-2">
          <h1 className="text-4xl font-black text-primary font-headline">
            这是{profile.name}的故事 🌙
          </h1>
          <p className="text-on-surface-variant font-body">
            精彩的冒险，明天再继续吧
          </p>
        </section>

        {/* Cover Preview */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative group cursor-pointer"
        >
          <div className="absolute inset-0 bg-blue-400/20 rounded-3xl translate-x-3 translate-y-3 -z-10" />
          <div className="w-64 aspect-[3/4] bg-white rounded-3xl overflow-hidden scribble-shadow border-4 border-white">
            <img 
              src={story.coverUrl} 
              alt="Story Cover" 
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>

        {/* Moments Review */}
        <section className="w-full space-y-6">
          <h3 className="text-lg font-black text-primary font-headline ml-2">回顾瞬间</h3>
          <div className="flex justify-center gap-4">
            {story.pages.slice(0, 4).map((page, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.1, rotate: index % 2 === 0 ? 5 : -5 }}
                className="w-16 h-16 rounded-full border-4 border-outline-variant bg-surface-container overflow-hidden scribble-shadow"
              >
                <img 
                  src={page.imageUrl} 
                  alt={`Moment ${index + 1}`} 
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Actions */}
        <section className="w-full flex flex-col gap-4">
          <div className="flex gap-4">
            <button 
              onClick={handleFavorite}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-full font-bold transition-all scribble-shadow ${
                isFavorited 
                  ? 'bg-secondary text-white ring-2 ring-secondary/50' 
                  : 'bg-white border-2 border-outline-variant text-on-surface-variant'
              }`}
            >
              <Heart className={isFavorited ? 'fill-current' : ''} size={20} />
              {isFavorited ? '已收藏' : '收藏这本故事'}
            </button>
            <button className="flex-1 bg-white border-2 border-outline-variant text-on-surface-variant flex items-center justify-center gap-2 py-4 rounded-full font-bold scribble-shadow">
              <Share2 size={20} />
              分享给朋友
            </button>
          </div>
          <button 
            onClick={onNewStory}
            className="w-full bg-primary-container text-on-primary-container flex items-center justify-center gap-3 py-5 rounded-full text-xl font-black scribble-shadow transition-all hover:scale-[1.02] active:scale-95"
          >
            <BookOpen size={24} />
            再讲一个
          </button>
        </section>
      </main>
    </div>
  );
}
