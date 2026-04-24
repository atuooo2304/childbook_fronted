/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { UserProfile } from '../types.ts';
import { ArrowLeft, Save, LogOut, Trash2 } from 'lucide-react';

interface Props {
  profile: UserProfile;
  onBack: () => void;
  onUpdateProfile: (profile: UserProfile) => void;
}

export default function SettingsView({ profile, onBack, onUpdateProfile }: Props) {
  const [name, setName] = useState(profile.name);
  const [age, setAge] = useState(profile.age);

  const handleSave = () => {
    onUpdateProfile({ ...profile, name, age });
    onBack();
  };

  const handleReset = () => {
    if (confirm('确定要清除所有数据并重新开始吗？这将删除所有保存的故事。')) {
      localStorage.clear();
      window.location.reload();
    }
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
        <span className="text-primary font-black text-2xl italic font-headline">设置</span>
        <button 
          onClick={handleSave}
          className="bg-primary text-on-primary px-4 py-2 rounded-full font-bold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-sm font-label text-sm"
        >
          <Save size={18} />
          保存
        </button>
      </header>

      <main className="pt-24 pb-12 px-6 max-w-xl mx-auto w-full space-y-12">
        {/* Profile Card */}
        <div className="flex flex-col items-center gap-4">
           <div className="w-32 h-32 rounded-full border-4 border-primary p-2 bg-primary-container scribble-shadow rotate-3">
              <img src={profile.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
           </div>
           <div className="text-center">
             <h3 className="text-2xl font-black text-primary font-headline">{profile.name}</h3>
             <p className="text-on-surface-variant font-body">快快乐乐的 {profile.age} 岁小读者</p>
           </div>
        </div>

        {/* Inputs */}
        <div className="space-y-6">
           <div className="space-y-2">
              <label className="text-sm font-black text-primary uppercase tracking-widest font-label ml-2">修改名字</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border-2 border-outline-variant rounded-xl p-4 focus:border-primary outline-none font-body text-lg shadow-inner"
              />
           </div>

           <div className="space-y-2">
              <label className="text-sm font-black text-primary uppercase tracking-widest font-label ml-2">修改年龄</label>
              <div className="flex gap-3 flex-wrap">
                 {[3, 4, 5, 6, 7, 8].map(n => (
                   <button 
                     key={n}
                     onClick={() => setAge(n)}
                     className={`w-12 h-12 rounded-full font-black font-headline text-lg transition-all ${
                       age === n ? 'bg-primary text-on-primary scale-110' : 'bg-surface-container text-primary opacity-50'
                     }`}
                   >
                     {n}
                   </button>
                 ))}
              </div>
           </div>
        </div>

        {/* Danger Zone */}
        <div className="pt-12 space-y-4">
           <p className="text-xs font-black text-error uppercase tracking-widest font-label ml-2">危险区域</p>
           <button 
             onClick={handleReset}
             className="w-full bg-white border-2 border-error text-error p-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-error hover:text-white transition-all font-headline"
           >
              <Trash2 size={20} />
              重置应用与所有数据
           </button>
           <button 
             onClick={() => window.location.reload()}
             className="w-full bg-white border-4 border-dashed border-outline-variant text-outline-variant p-4 rounded-xl font-bold flex items-center justify-center gap-3 font-headline"
           >
              <LogOut size={20} />
              退出登录状态
           </button>
        </div>
      </main>
    </div>
  );
}
