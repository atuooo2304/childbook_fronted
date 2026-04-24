/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { UserProfile, AppView } from '../types.ts';
import { Mic, Settings, Home, Library, User, Search, Plus } from 'lucide-react';

interface Props {
  profile: UserProfile;
  onNavigate: (view: AppView) => void;
  onStartWorkshop: (prompt: string) => void;
}

const THEMES = [
  { id: 'daily', title: '今日小事', desc: '关于我们共同度过的一天。', color: 'bg-secondary-container' },
  { id: 'bedtime', title: '睡前安抚', desc: '送给瞌睡虫们的宁静故事。', color: 'bg-tertiary-container' },
  { id: 'special', title: '特别日子', desc: '庆祝每一个神奇的时刻。', color: 'bg-primary-container' },
  { id: 'habit', title: '习惯引导', desc: '每天都在学习和快乐成长。', color: 'bg-surface-container-highest' },
];

const ROLES = [
  { id: 'bear', name: '小熊巴拿比', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBCY_N7n-h2KzvxP9Wv-6fH-G6Wv3vX_-Uu6mS_v7mY-X_YcZ-s-sR_i_i_X-X_YcZ-s-sR_i_i_X-X_YcZ-s-sR_i_i_X' }, // Placeholder, use the one in prompt if available or generic
  { id: 'fox', name: '小狐狸皮皮', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLl2QL1zl6JkIfXAeCKwUfYPbxh_F6PgX0qCEQIINmZFTGMm5oE8L_2Uh5HB9ZzGZRnOEh62ju28acdKN3H-C-_vUZLUhpoPhF9nPKoMOLAR_tPCO9EKLutKnfZgzGd0bk4yCOwb8vkVPqhL1pzyLKv9CfqdJaLoehwbWxKaA86abIudQkDCtLc8ZzFv94tDzLKXNm2_Ur-D7KrCApDPFM6IWfEdqIKypISJjsq6ZRaQTzzDYUjt_xCL_PS0wM7Q-p-5piDxCDIwPd' },
];

const STYLES = [
  { id: 'crayon', name: '蜡笔', emoji: '🖍️' },
  { id: 'watercolor', name: '水彩', emoji: '🎨' },
  { id: 'pencil', name: '彩铅', emoji: '✏️' },
];

export default function HomeView({ profile, onNavigate, onStartWorkshop }: Props) {
  const [prompt, setPrompt] = useState('');
  const [selectedRole, setSelectedRole] = useState(ROLES[0].id);
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0].id);

  const handleStart = (basePrompt: string) => {
    const role = ROLES.find(r => r.id === selectedRole)?.name || '主角';
    const style = STYLES.find(s => s.id === selectedStyle)?.name || '默认';
    const finalPrompt = `[主角:${role}] [画风:${style}] ${basePrompt}`;
    onStartWorkshop(finalPrompt);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b-4 border-dashed border-amber-200/50 flex justify-between items-center w-full px-6 py-4 fixed top-0 z-50">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate('settings')}
            className="w-10 h-10 rounded-full border-2 border-amber-400 overflow-hidden scale-95 transition-transform active:scale-90"
          >
            <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
          </button>
          <span className="text-primary font-black text-2xl italic tracking-tight font-headline">
            亲子故事家
          </span>
        </div>
        <button 
          onClick={() => onNavigate('settings')}
          className="text-primary hover:scale-95 transition-transform active:scale-90 duration-200"
        >
          <Settings className="w-8 h-8" />
        </button>
      </header>

      <main className="pt-24 pb-32 px-6 max-w-2xl mx-auto space-y-8 relative z-10 w-full">
        {/* Story Genie Input */}
        <section className="space-y-4">
          <div className="relative flex items-center">
            <input
              className="w-full bg-white/90 backdrop-blur-sm border-2 border-primary-container rounded-full px-8 py-5 text-xl text-primary placeholder:text-outline-variant focus:ring-4 focus:ring-primary-fixed outline-none scribble-shadow cursor-text transition-all pr-20 font-body"
              placeholder="你今天想听什么故事？"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && prompt && handleStart(prompt)}
            />
            <button 
              className="absolute right-3 w-12 h-12 bg-primary-container rounded-full flex items-center justify-center text-primary active:scale-95 transition-transform"
              onClick={() => prompt && handleStart(prompt)}
            >
              <Mic className="w-6 h-6 fill-current" />
            </button>
          </div>
        </section>

        {/* Character Selection */}
        <section className="space-y-4">
          <h3 className="text-lg text-yellow-800 px-2 font-black font-headline opacity-70">选择在这个故事里的英雄</h3>
          <div className="flex items-center gap-6 overflow-x-auto py-4 px-2 no-scrollbar">
            {ROLES.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`relative flex-shrink-0 transition-all duration-300 ${
                  selectedRole === role.id ? 'scale-110' : 'opacity-60 scale-90 grayscale'
                }`}
              >
                <div className={`w-20 h-20 rounded-full border-4 ${
                  selectedRole === role.id ? 'border-amber-500 scale-105' : 'border-white'
                } overflow-hidden shadow-lg transition-all`}>
                  <img src={role.avatar} alt={role.name} className="w-full h-full object-cover" />
                </div>
                {selectedRole === role.id && (
                  <div className="absolute inset-0 rounded-full border-2 border-amber-300 scale-[1.15] animate-pulse" />
                )}
                <span className={`block text-center mt-2 text-xs font-black transition-colors ${
                  selectedRole === role.id ? 'text-amber-800' : 'text-on-surface-variant'
                }`}>
                  {role.name}
                </span>
              </button>
            ))}
            <button className="flex-shrink-0 flex flex-col items-center group">
              <div className="w-20 h-20 rounded-full border-4 border-dashed border-outline-variant flex flex-col items-center justify-center text-outline-variant group-hover:border-primary group-hover:text-primary transition-all">
                <Plus size={24} />
              </div>
              <span className="mt-2 text-xs font-black text-on-surface-variant group-hover:text-primary">上传照片</span>
            </button>
          </div>
        </section>

        {/* Style Selection */}
        <section className="space-y-4 px-2">
          <h3 className="text-lg text-yellow-800 font-black font-headline opacity-70">故事画风</h3>
          <div className="flex gap-3">
            {STYLES.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-black transition-all scribble-shadow ${
                  selectedStyle === style.id 
                    ? 'bg-amber-400 text-amber-900 border-2 border-amber-500 scale-105' 
                    : 'bg-white text-on-surface-variant border-2 border-outline-variant/30 opacity-60'
                }`}
              >
                <span>{style.emoji}</span>
                <span className="text-sm">{style.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Themes Grid */}
        <section className="space-y-4">
          <h3 className="text-2xl text-primary px-2 font-black font-headline">选择一个主题</h3>
          <div className="grid grid-cols-2 gap-4">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleStart(theme.title)}
                className="bg-white border-2 border-outline-variant rounded-lg p-4 space-y-3 scribble-shadow transition-all hover:-translate-y-1 text-left"
              >
                <div className={`aspect-video rounded-md ${theme.color} overflow-hidden border border-outline-variant/30 flex items-center justify-center`}>
                   <Search size={32} className="opacity-20" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg text-primary font-black font-headline">{theme.title}</h4>
                  <p className="text-xs leading-tight text-on-surface-variant font-body">{theme.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-8 pt-4 bg-amber-50/90 backdrop-blur-md rounded-t-[40px] border-t-4 border-amber-200 shadow-[0_-8px_0px_0px_rgba(255,217,102,0.2)]">
        <button 
          onClick={() => onNavigate('home')}
          className="flex flex-col items-center justify-center bg-amber-200 text-amber-900 rounded-[24px] px-6 py-2 ring-2 ring-amber-400/50"
        >
          <Home className="w-6 h-6" />
          <span className="text-[10px] font-black uppercase tracking-widest mt-1 font-label">首页</span>
        </button>
        <button 
          onClick={() => onNavigate('library')}
          className="flex flex-col items-center justify-center text-amber-800/40 px-6 py-2"
        >
          <Library className="w-6 h-6" />
          <span className="text-[10px] font-black uppercase tracking-widest mt-1 font-label">书架</span>
        </button>
        <button 
          onClick={() => onNavigate('settings')}
          className="flex flex-col items-center justify-center text-amber-800/40 px-6 py-2"
        >
          <User className="w-6 h-6" />
          <span className="text-[10px] font-black uppercase tracking-widest mt-1 font-label">我的</span>
        </button>
      </nav>

      {/* Decor */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-black mix-blend-overlay"></div>
    </div>
  );
}
