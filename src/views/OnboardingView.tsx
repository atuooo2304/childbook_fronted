/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { UserProfile } from '../types.ts';
import { Edit2, Sparkles, CheckCircle2, Plus } from 'lucide-react';

const DEFAULT_AVATARS = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAn4Y6mR6F_V-q6J6K1qP_X5m0f-zR-z9-7mR-L-o0n-G-t-S-u-m-e-P-a-L-e-t-t-e-1',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAn4Y6mR6F_V-q6J6K1qP_X5m0f-zR-z9-7mR-L-o0n-G-t-S-u-m-e-P-a-L-e-t-t-e-2'
];

interface Props {
  onComplete: (profile: UserProfile) => void;
}

export default function OnboardingView({ onComplete }: Props) {
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(5);
  const [avatar, setAvatar] = useState(DEFAULT_AVATARS[1]);

  const handleFinish = () => {
    if (!name.trim()) return;
    onComplete({ name, age, avatar });
  };

  return (
    <div className="flex flex-col items-center justify-start px-6 py-12 max-w-2xl mx-auto w-full">
      <section className="w-full text-center mb-8">
        <h2 className="text-4xl font-black text-primary mb-2 font-headline italic tracking-tight">
          创建档案
        </h2>
        <p className="text-lg text-on-surface-variant font-body">
          让我们为小读者打造一个专属空间！
        </p>
      </section>

      <div className="w-full space-y-8">
        {/* Child's Name */}
        <div className="relative group">
          <label className="block text-lg font-bold text-primary mb-3 ml-2 font-label">
            孩子名字
          </label>
          <div className="relative">
            <input
              className="w-full bg-surface-container-low border-4 border-outline-variant rounded-lg px-6 py-4 text-xl focus:ring-0 focus:border-primary placeholder:text-outline-variant transition-all scribble-shadow outline-none font-body"
              placeholder="例如：小可爱"
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
            />
            <Edit2 className="absolute right-4 top-1/2 -translate-y-1/2 text-primary opacity-50 w-6 h-6" />
          </div>
        </div>

        {/* Age Picker */}
        <div className="w-full">
          <label className="block text-lg font-bold text-primary mb-3 ml-2 font-label">
            几岁啦？
          </label>
          <div className="relative py-6 px-4 bg-surface-container-lowest border-4 border-dashed border-outline-variant rounded-lg scribble-shadow">
            <div className="flex justify-center flex-wrap gap-4 items-center">
              {[3, 4, 5, 6, 7, 8].map((num) => (
                <button
                  key={num}
                  onClick={() => setAge(num)}
                  className={`flex flex-col items-center justify-center shrink-0 transition-all duration-300 ${
                    age === num
                      ? 'w-20 h-20 bg-primary-container border-4 border-primary text-on-primary-container shadow-xl rotate-3 scale-110'
                      : 'w-16 h-16 bg-surface-container border-2 border-outline-variant text-primary/40'
                  } rounded-full font-headline text-2xl font-black`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Avatar Selection */}
        <div>
          <label className="block text-lg font-bold text-primary mb-3 ml-2 font-label">
            选择头像
          </label>
          <div className="flex justify-center gap-6 flex-wrap">
            {DEFAULT_AVATARS.map((url, i) => (
              <button
                key={i}
                onClick={() => setAvatar(url)}
                className={`relative group w-32 h-32 rounded-full p-2 border-4 transition-all hover:scale-105 duration-300 ${
                  avatar === url
                    ? 'border-primary bg-primary-container -rotate-2 scale-110 scribble-shadow'
                    : 'border-outline-variant bg-white'
                }`}
              >
                <img
                  src={url}
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              </button>
            ))}
            <button className="relative group w-32 h-32 flex items-center justify-center rounded-full border-4 border-dashed border-outline-variant bg-surface-container-low transition-all hover:scale-105 scribble-shadow">
              <Plus className="w-10 h-10 text-outline leading-none" />
            </button>
          </div>
        </div>

        <div className="pt-8">
          <button
            onClick={handleFinish}
            disabled={!name.trim()}
            className="w-full bg-primary hover:bg-primary/90 text-on-primary py-5 rounded-2xl text-2xl font-black scribble-shadow transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed font-headline"
          >
            完成
            <CheckCircle2 className="w-8 h-8" />
          </button>
        </div>
      </div>
      
      {/* Background Decor */}
      <div className="fixed top-20 left-4 opacity-10 pointer-events-none -rotate-12">
        <Sparkles size={80} />
      </div>
      <div className="fixed bottom-20 right-4 opacity-10 pointer-events-none rotate-12">
        <Edit2 size={90} />
      </div>
    </div>
  );
}
