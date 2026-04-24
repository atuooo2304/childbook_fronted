/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Story } from '../types.ts';
import { ChevronLeft, ChevronRight, Volume2, BookOpen, Settings, Stars } from 'lucide-react';

interface Props {
  story: Story;
  onBack: () => void;
  onComplete: () => void;
}

export default function ReaderView({ story, onBack, onComplete }: Props) {
  const [selectedBranch, setSelectedBranch] = useState<'A' | 'B' | null>(null);
  const [currentSpreadIndex, setCurrentSpreadIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const branchConfig = story.branching;
  const renderedPages =
    branchConfig && selectedBranch
      ? [...story.pages, ...(branchConfig.paths[selectedBranch] || [])]
      : story.pages;
  const totalSpreads = Math.ceil(renderedPages.length / 2);

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const speakPage = (page?: { text?: string; ttsText?: string }) => {
    if (!page) return;
    if (!('speechSynthesis' in window)) return;
    const text = page.ttsText || page.text || '';
    if (!text.trim()) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.92;
    utterance.pitch = 1.08;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const nextPage = () => {
    stopSpeaking();
    if (currentSpreadIndex < totalSpreads - 1) {
      setCurrentSpreadIndex(currentSpreadIndex + 1);
    } else {
      onComplete();
    }
  };

  const prevPage = () => {
    stopSpeaking();
    if (currentSpreadIndex > 0) {
      setCurrentSpreadIndex(currentSpreadIndex - 1);
    }
  };

  const leftPageIndex = currentSpreadIndex * 2;
  const rightPageIndex = leftPageIndex + 1;

  const leftPage = renderedPages[leftPageIndex];
  const rightPage = renderedPages[rightPageIndex];
  const isOnBranchChoiceSpread =
    !!branchConfig &&
    selectedBranch === null &&
    leftPageIndex <= branchConfig.branchPageIndex &&
    branchConfig.branchPageIndex <= rightPageIndex;

  const PageContent = ({ page, index, isLeft }: { page?: any, index: number, isLeft: boolean }) => {
    const layout =
      page?.layoutHint ||
      page?.layout ||
      (index % 3 === 0 ? 'bottom' : index % 3 === 1 ? 'top-left' : 'top-right');
    
    const layoutClasses = {
      'bottom': 'inset-x-0 bottom-0',
      'top-left': 'top-6 left-6 max-w-[80%]',
      'top-right': 'top-6 right-6 max-w-[80%]',
      'centered': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-[90%]'
    }[layout as string] || 'inset-x-0 bottom-0';

    return (
      <div className={`relative flex-1 p-1 md:p-2 flex flex-col items-center justify-center bg-white ${isLeft ? 'border-r-2 border-primary/5' : ''}`}>
        <AnimatePresence mode="wait">
          {page ? (
            <motion.div 
              key={`page-${index}`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="relative w-full h-full rounded-2xl md:rounded-[2.5rem] overflow-hidden group shadow-sm"
            >
              <img
                src={page.imageUrl}
                alt={`Page ${index + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* Simplified Text Overlay */}
              <div className={`absolute ${layoutClasses} z-20 p-8 md:p-14 pointer-events-none`}>
                <p className="text-base md:text-lg lg:text-xl leading-snug font-body font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                  {page.text}
                </p>
              </div>

              {!isLeft && (
                <div className="absolute bottom-8 right-8 z-30">
                   <button
                      onClick={() => (isSpeaking ? stopSpeaking() : speakPage(page))}
                      className="w-14 h-14 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 transition-all shadow-xl active:scale-90"
                   >
                      <Volume2 size={28} />
                   </button>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="w-full h-full bg-surface-container-low rounded-[2.5rem] border-4 border-dashed border-outline-variant flex items-center justify-center opacity-20">
              <BookOpen size={64} className="text-outline-variant" />
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col paper-texture overflow-hidden">
      {/* Top Bar */}
      <header className="bg-[#FFF9E6] text-yellow-800 font-bold rounded-b-[32px] border-b-2 border-yellow-700/10 shadow-sm flex justify-between items-center w-full px-8 py-3 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <span className="text-xl font-black italic font-headline">{story.title}</span>
          <div className="hidden md:flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full">
            <Stars className="text-primary w-4 h-4" />
            <span className="text-xs font-bold text-primary tracking-wide font-label uppercase">In Reading</span>
          </div>
        </div>
        <button className="p-2 rounded-full bg-primary-container/30 border-2 border-primary/10">
          <Settings className="w-5 h-5 text-primary" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-10 mb-24 overflow-hidden">
        <div className="relative w-full max-w-7xl aspect-[1.6/1] md:aspect-[1.8/1]">
          {/* Book Background Shadow */}
          <div className="absolute inset-0 bg-primary/5 rounded-[2.5rem] transform translate-y-3 scale-[1.01] blur-lg"></div>
          
          {/* The Book Structure */}
          <div className="relative w-full h-full bg-surface-container-lowest rounded-[2.5rem] border-[1px] border-primary/5 shadow-2xl overflow-hidden flex">
            <PageContent page={leftPage} index={leftPageIndex} isLeft={true} />
            <PageContent page={rightPage} index={rightPageIndex} isLeft={false} />
          </div>

          {isOnBranchChoiceSpread && branchConfig && (
            <div className="absolute inset-x-10 bottom-8 bg-black/45 backdrop-blur-md rounded-3xl p-4 md:p-6 border border-white/20">
              <p className="text-white font-bold mb-3 md:mb-4">接下来想怎么发展？</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {branchConfig.choices.map((choice) => (
                  <button
                    key={choice.id}
                    onClick={() => setSelectedBranch(choice.id)}
                    className="text-left bg-white/85 hover:bg-white rounded-2xl px-4 py-3 text-stone-800 font-semibold transition"
                  >
                    {choice.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-between items-center px-6 md:px-10 py-4 bg-[#FFF9E6]/95 backdrop-blur-md rounded-t-[40px] border-t-2 border-yellow-700/10 shadow-lg">
        <button
          onClick={() => {
            stopSpeaking();
            onBack();
          }}
          className="flex items-center gap-3 text-yellow-800/60 p-3 hover:text-yellow-900 transition-all group"
        >
          <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-surface-container-high rounded-2xl border border-yellow-900/5 group-hover:bg-yellow-100/50">
            <ChevronLeft className="w-6 h-6" />
          </div>
          <span className="hidden md:inline font-black uppercase tracking-wider text-sm font-label">返回书架</span>
        </button>

        <div className="flex items-center gap-4 px-6 md:px-8 py-2 md:py-3 bg-[#FFEDAD] rounded-full border-2 border-primary/20 shadow-inner">
          <BookOpen className="text-primary w-5 h-5 md:w-6 md:h-6" />
          <span className="text-primary font-black text-base md:text-lg tracking-widest font-label uppercase">
            {currentSpreadIndex + 1} / {totalSpreads} 跨页
          </span>
        </div>

        <div className="flex gap-2 md:gap-4">
           <button
            onClick={prevPage}
            disabled={currentSpreadIndex === 0}
            className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-surface-container-high rounded-2xl border border-yellow-900/5 disabled:opacity-30 group"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextPage}
            disabled={isOnBranchChoiceSpread}
            className="flex items-center gap-2 md:gap-3 p-3 group transition-all"
          >
            <span className="hidden md:inline font-black text-yellow-600 uppercase tracking-wide text-sm font-label">
              {currentSpreadIndex === totalSpreads - 1 ? '搞定' : '翻页'}
            </span>
            <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-primary-container rounded-2xl border border-primary/10 shadow-sm group-hover:bg-primary-container/80 transition-all">
              <ChevronRight className="w-6 h-6 text-primary" />
            </div>
          </button>
        </div>
      </nav>
    </div>
  );
}
