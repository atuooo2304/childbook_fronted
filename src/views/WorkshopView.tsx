/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Story, StoryPage } from '../types.ts';
import { Sparkles, X, Brush, BookOpen, Palette, Pen } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface Props {
  storyTopic?: string;
  onBack: () => void;
  onComplete: (story: Story) => void;
}

export default function WorkshopView({ onBack, onComplete, storyTopic }: Props) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('正在酝酿神奇的灵感...');
  const [isGenerating, setIsGenerating] = useState(false);
  const generationStarted = useRef(false);

  useEffect(() => {
    if (!generationStarted.current) {
        generationStarted.current = true;
        startGeneration();
    }
  }, []);

  const startGeneration = async () => {
    setIsGenerating(true);
    setProgress(10);
    setStatus('故事精灵正在构思情节...');

    try {
      // 1. Initialize Gemini
      const apiKey = (window as any).process?.env?.GEMINI_API_KEY || '';
      if (!apiKey) {
        throw new Error('Missing Gemini API Key');
      }
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      // 2. Generate Story Structure
      const storyPrompt = `
        你是一个专门为儿童写电子绘本的作家。
        请根据以下主题创作一个短小精悍的绘本故事：
        主题：${storyTopic || '神奇的森林冒险'}
        要求：
        1. 故事分为3-5个画面（页面）。
        2. 每个页面包含：
           - text: 简洁、充满童趣、适合朗诵的1-2句话。
           - imagePrompt: 为AI绘图工具提供的英文描述词。要求：蜡笔画风格(crayon illustration style), 质地柔软(soft texture), 暖色调(warm colors), 简洁构图(simple composition), 儿童视角(childlike perspective), 手绘感(hand-drawn feel)。
        
        请以JSON数组格式返回：[{"text": "...", "imagePrompt": "..."}, ...]
      `;

      setProgress(30);
      setStatus('正在挥毫泼墨，完善细节...');
      
      const result = await model.generateContent(storyPrompt);
      const text = result.response.text();
      
      // Basic JSON cleanup
      const jsonMatch = text.match(/\[.*\]/s);
      if (!jsonMatch) throw new Error('Failed to generate story structure');
      const pages: StoryPage[] = JSON.parse(jsonMatch[0]);

      setProgress(60);
      setStatus('故事精灵正在为你铺满色彩...');

      // 3. For each page, we would normally generate an image.
      // Since image generation is a separate tool/cost, we will use placeholders for now
      // but ideally we'd use get_image_url or similar if implemented in backend.
      // For this demo, let's use high-quality Unsplash placeholders with descriptors.
      
      const storyPages: StoryPage[] = pages.map((p, idx) => ({
        ...p,
        imageUrl: `https://loremflickr.com/800/600/illustration,crayon,child?lock=${Math.floor(Math.random() * 1000) + idx}`
      }));

      setProgress(90);
      setStatus('正在装订你的专属绘本...');

      const newStory: Story = {
        id: Math.random().toString(36).substr(2, 9),
        title: pages[0].text.substring(0, 10) + '...',
        pages: storyPages,
        coverUrl: storyPages[0].imageUrl,
        createdAt: Date.now(),
        theme: storyTopic || '自由创作'
      };

      // Save to library
      const saved = localStorage.getItem('story_pals_library');
      const library = saved ? JSON.parse(saved) : [];
      localStorage.setItem('story_pals_library', JSON.stringify([newStory, ...library]));

      setTimeout(() => {
        setProgress(100);
        onComplete(newStory);
      }, 1000);

    } catch (error) {
      console.error('Generation failed:', error);
      setStatus('哎呀，灵感魔法好像断开了，请重试一下。');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-background crayon-texture min-h-screen flex flex-col items-center select-none overflow-hidden relative">
      {/* Header */}
      <header className="w-full bg-[#fffcf5] border-b-4 border-stone-200/50 border-dashed shadow-sm flex justify-between items-center px-6 py-4 fixed top-0 z-50">
        <div className="text-2xl font-black text-amber-500 italic font-headline">
          故事工坊
        </div>
        <button 
          onClick={onBack}
          className="hover:scale-105 transition-transform duration-200 active:scale-90 text-stone-400"
        >
          <X className="w-8 h-8" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-8 flex flex-col items-center justify-center pt-24 pb-12 gap-12">
        {/* Illustration Canvas Area */}
        <div className="relative w-full aspect-square md:max-w-md bg-white crayon-border scribble-shadow p-2 flex items-center justify-center rotate-[-1deg]">
          <div className="absolute inset-4 overflow-hidden rounded-lg flex items-center justify-center bg-surface-container-low">
             <motion.div
               animate={{ rotate: [0, 5, -5, 0] }}
               transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
             >
                <Sparkles size={80} className="text-primary opacity-20" />
             </motion.div>
          </div>
          
          {/* Floating Stickers */}
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-tertiary-container rounded-full flex items-center justify-center crayon-border rotate-12 shadow-sm">
            <Brush className="text-on-tertiary-container w-10 h-10" />
          </div>
          <div className="absolute -bottom-6 -left-2 w-16 h-16 bg-secondary-container rounded-lg flex items-center justify-center crayon-border -rotate-6 shadow-sm">
            <BookOpen className="text-on-secondary-container w-8 h-8" />
          </div>
        </div>

        {/* Status Message */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl text-on-surface font-black font-headline tracking-tight">
            {status}
          </h1>
          <p className="text-lg text-on-surface-variant font-body opacity-70">
            故事精灵正在为你铺满色彩，请稍候片刻
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-lg space-y-4">
          <div className="relative h-10 w-full bg-surface-container-highest crayon-border overflow-hidden">
            <motion.div 
              className="absolute left-0 top-0 bottom-0 bg-primary-container border-r-4 border-dashed border-primary"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="flex justify-between items-center px-2">
            <span className="font-bold text-primary font-label">{progress}% 已完成</span>
            <div className="flex gap-2">
               {[0, 1, 2].map(i => (
                 <motion.span 
                   key={i}
                   animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                   transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                   className="w-2 h-2 rounded-full bg-primary"
                 />
               ))}
            </div>
          </div>
        </div>
      </main>

      {/* Decorative Assets */}
      <div className="fixed bottom-10 right-10 pointer-events-none hidden lg:block opacity-30">
        <div className="w-32 h-32 bg-primary-fixed-dim rounded-full flex items-center justify-center crayon-border rotate-12 animate-float">
          <Palette size={60} className="text-primary" />
        </div>
      </div>
      <div className="fixed bottom-20 left-10 pointer-events-none hidden lg:block opacity-30">
        <div className="w-24 h-24 bg-tertiary-fixed-dim rounded-lg flex items-center justify-center crayon-border -rotate-12 animate-float">
          <Pen size={40} className="text-tertiary" />
        </div>
      </div>
    </div>
  );
}
