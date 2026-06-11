import React, { useState, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import ZhuInteraction from './components/ZhuInteraction';
import { GameState } from './types';
import { Info, Volume2, VolumeX, BookOpen, Heart, Trophy, Sparkles, MessageSquareHeart } from 'lucide-react';

export default function App() {
  const [currentScore, setCurrentScore] = useState(0);
  const [currentSatiety, setCurrentSatiety] = useState(100);
  const [currentGameState, setCurrentGameState] = useState<GameState>('START');
  const [audioMuted, setAudioMuted] = useState(false);
  const [highScore, setHighScore] = useState(0);

  // Zhu Bajie Otome dialog states
  const [isDialogueActive, setIsDialogueActive] = useState(true);
  const [dialogueNodeId, setDialogueNodeId] = useState('intro');
  const [affectionScore, setAffectionScore] = useState(100);

  // Read high score & affection level on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('xin_zhuang_high_score');
      if (saved) {
        setHighScore(parseInt(saved, 10));
      }
    } catch {
      // ignore
    }

    try {
      const savedAffection = localStorage.getItem('xin_zhuang_affection_score');
      if (savedAffection) {
        setAffectionScore(parseInt(savedAffection, 10));
      }
    } catch {
      // ignore
    }

    // Custom event flow to transition dialogues inside React tree
    const handleNodeChange = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        setDialogueNodeId(customEvent.detail);
      }
    };
    
    const handleActivateDialogue = (e: Event) => {
      const customEvent = e as CustomEvent<{ nodeId: string }>;
      if (customEvent.detail && customEvent.detail.nodeId) {
        setDialogueNodeId(customEvent.detail.nodeId);
        setIsDialogueActive(true);
      }
    };

    window.addEventListener('change_dialogue_node', handleNodeChange);
    window.addEventListener('activate_dialogue', handleActivateDialogue as EventListener);
    
    return () => {
      window.removeEventListener('change_dialogue_node', handleNodeChange);
      window.removeEventListener('activate_dialogue', handleActivateDialogue as EventListener);
    };
  }, []);

  // Sync high score in real-time
  useEffect(() => {
    if (currentScore > highScore) {
      setHighScore(currentScore);
    }
  }, [currentScore, highScore]);

  // Adjust and persist affection levels
  const handleModifyAffection = (bonus: number) => {
    setAffectionScore(prev => {
      const newVal = prev + bonus;
      try {
        localStorage.setItem('xin_zhuang_affection_score', newVal.toString());
      } catch {}
      return newVal;
    });
  };

  // Complete Dialogue action handler
  const handleFinishDialogue = (action?: string) => {
    if (action === 'START_WORSHIP') {
      setIsDialogueActive(false);
      setCurrentGameState('WORSHIP');
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('start_worship_game'));
      }, 50);
    } else if (action === 'START_GAME') {
      setIsDialogueActive(false);
      setCurrentGameState('PLAYING');
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('start_arcade_game'));
      }, 50);
    } else if (action === 'START_COOKING') {
      setIsDialogueActive(false);
      setCurrentGameState('PLAYING');
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('start_cooking_game'));
      }, 50);
    } else if (action === 'RESET') {
      setIsDialogueActive(false);
      setCurrentGameState('START');
    }
  };

  const triggerDialogueConsult = () => {
    setDialogueNodeId('intro');
    setIsDialogueActive(true);
  };

  const getAffectionTitle = (score: number) => {
    if (score < 130) return '🏮 初入廟街 (Admirer)';
    if (score < 200) return '🐷 臭味相投 (Cute Companion)';
    if (score < 300) return '💖 浪漫升溫 (Blush Bond)';
    return '👑 三生有幸 (Destined Lovers)';
  };

  // Toggle local mute
  const handleToggleMute = () => {
    import('./utils/audio').then(mod => {
      const isMuted = mod.toggleMute();
      setAudioMuted(isMuted);
    });
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 flex flex-col justify-between font-sans selection:bg-amber-800 selection:text-amber-100 relative overflow-x-hidden">
      
      {/* Ambient background decoration - Soft cinnabar red glow simulating old temple lantern dust */}
      <div className="absolute top-0 left-1/3 w-[600px] h-[550px] bg-red-950/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[450px] h-[450px] bg-amber-950/10 blur-[110px] rounded-full pointer-events-none" />

      {/* Elegant Bento Header */}
      <header className="border-b border-stone-850 bg-stone-950/80 backdrop-blur-md py-5 px-6 relative z-10 sticky top-0 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-4">
          
          {/* Logo & Sub-header */}
          <div className="text-center md:text-left">
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-2.5">
              <span className="text-3xl filter drop-shadow animate-pulse">🏮</span>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-amber-500 font-serif">
                新莊廟街：美好食光
              </h1>
              <span className="bg-amber-500/10 text-amber-400 text-[10px] tracking-wide font-extrabold px-2 py-0.5 rounded border border-amber-500/20 shadow">
                ARCADE EDITION
              </span>
            </div>
            <p className="text-stone-500 text-xs uppercase tracking-[0.25em] mt-1.5 md:pl-10">
              Temple Street Gourmet Harvest • 2D Pixel Adventure
            </p>
          </div>

          {/* Connected stats inside Header */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 bg-stone-900/40 p-2 sm:p-3 rounded-2xl border border-stone-800/60 shadow-inner">
            
            {/* Zhu Dialogue Trigger */}
            <button
              onClick={() => {
                setDialogueNodeId('intro');
                setIsDialogueActive(true);
              }}
              className="flex items-center space-x-2.5 bg-rose-500/10 border border-rose-500/20 px-3.5 py-1 rounded-xl hover:bg-rose-500/20 transition-all cursor-pointer active:scale-95 text-left"
              title="點擊與八戒開啟新莊故事"
              id="header-affection-btn"
            >
              <Heart className="w-4 h-4 text-rose-500 fill-current animate-pulse" />
              <div>
                <div className="text-[9px] text-rose-450 uppercase font-black tracking-wider leading-none">與八戒同遊 COZY CHAT</div>
                <div className="text-[10px] font-bold text-stone-300 mt-0.5">
                  🏮 點擊開啟浪漫故事
                </div>
              </div>
            </button>

            {/* Live game state badge */}
            <div className="space-y-1 pl-1">
              <div className="text-stone-600 text-[9px] uppercase font-bold tracking-widest">狀況 STATUS</div>
              <div className="flex items-center space-x-2">
                <span className={`w-2.5 h-2.5 rounded-full ${currentGameState === 'PLAYING' ? 'bg-emerald-400 animate-ping' : currentGameState === 'WORSHIP' ? 'bg-rose-400 animate-pulse' : 'bg-stone-500'}`} />
                <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                  currentGameState === 'PLAYING' 
                    ? 'text-emerald-400 bg-emerald-400/10 border border-emerald-500/20' 
                    : currentGameState === 'WORSHIP'
                    ? 'text-rose-400 bg-rose-400/10 border border-rose-500/20'
                    : currentGameState === 'START'
                    ? 'text-amber-400 bg-amber-400/10 border border-amber-500/20'
                    : currentGameState === 'PAUSED'
                    ? 'text-cyan-400 bg-cyan-400/10 border border-cyan-500/20'
                    : 'text-red-400 bg-red-400/10 border border-red-500/20'
                }`}>
                  {currentGameState === 'START' && 'WAITING'}
                  {currentGameState === 'WORSHIP' && 'WORSHIP 🏮'}
                  {currentGameState === 'PLAYING' && 'ACTIVE'}
                  {currentGameState === 'PAUSED' && 'PAUSED'}
                  {currentGameState === 'GAMEOVER' && 'FAILED'}
                </span>
              </div>
            </div>

            {/* Satiety info */}
            <div className="space-y-1 border-l border-stone-800/80 pl-4 sm:pl-6 mr-3">
              <div className="text-stone-600 text-[9px] uppercase font-bold tracking-widest">八戒飽食度 FULLNESS</div>
              <div className="text-xl font-mono text-emerald-400 font-extrabold tracking-tight">{currentSatiety}%</div>
            </div>

            {/* Retro Audio action button */}
            <button
              onClick={handleToggleMute}
              className={`p-2 rounded-xl border transition-all active:scale-95 cursor-pointer flex items-center justify-center ${
                audioMuted 
                  ? 'bg-stone-950 border-red-950 text-red-400 hover:bg-stone-900' 
                  : 'bg-stone-950 border-stone-800 text-amber-500 hover:bg-stone-900 hover:text-amber-400'
              }`}
              title={audioMuted ? "點擊開啟聲音" : "點擊靜音"}
              id="global-sound-toggle-header"
            >
              {audioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

          </div>

        </div>
      </header>

      {/* Main Bento Layout Grid container */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 relative z-10 flex items-center justify-center">
        
        <div className="grid grid-cols-12 gap-6 w-full items-stretch" id="core-bento-grid">
          
          {/* ================= CENTER BENTO PANEL (Active Game Canvas - Full Cinematic Showcase) ================= */}
          <main className="col-span-12 lg:col-span-9 bg-stone-900 border border-stone-800 hover:border-stone-750 rounded-3xl overflow-hidden shadow-2xl relative ring-8 ring-stone-950 flex flex-col items-center justify-center p-4">
            
            {/* Embedded Game Stage Component */}
            <div className="w-full h-full flex flex-col justify-center items-center">
              {isDialogueActive ? (
                <ZhuInteraction
                  nodeId={dialogueNodeId}
                  affectionScore={affectionScore}
                  onModifyAffection={handleModifyAffection}
                  onFinishDialogue={handleFinishDialogue}
                />
              ) : (
                <GameCanvas
                  onScoreChange={setCurrentScore}
                  onSatietyChange={setCurrentSatiety}
                  onStateChange={(state) => {
                    setCurrentGameState(state);
                    // Automatically offer Otome custom dialogue depending on game results
                    if (state === 'GAMEOVER') {
                      setTimeout(() => {
                        setDialogueNodeId('gameover_low_affection');
                        setIsDialogueActive(true);
                      }, 1800);
                    }
                  }}
                />
              )}
            </div>

          </main>

          {/* ================= RIGHT BENTO PANELS (Control Keys & Item Book) ================= */}
          <aside className="col-span-12 lg:col-span-3 flex flex-col gap-5">
            
            {/* Bento Box 3: Quick Manual controls */}
            <div className="bg-stone-900/40 border border-stone-850 p-5 rounded-2xl flex-1 flex flex-col shadow-inner backdrop-blur-sm">
              <h3 className="text-xs font-bold text-stone-500 uppercase mb-4 tracking-wider flex items-center justify-between border-b border-stone-850 pb-2">
                <span>大師操作指南 MANUAL</span>
                <Info className="w-4 h-4 text-stone-400" />
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-stone-400 text-xs border-b border-stone-850/40 pb-2">
                  <span>向左前進 Left:</span>
                  <div className="flex gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-750 text-[10px] font-bold text-amber-500 font-mono">←</kbd>
                    <kbd className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-750 text-[10px] font-semibold text-stone-300 font-mono">A</kbd>
                  </div>
                </div>

                <div className="flex items-center justify-between text-stone-400 text-xs border-b border-stone-850/40 pb-2">
                  <span>向右前進 Right:</span>
                  <div className="flex gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-750 text-[10px] font-bold text-amber-500 font-mono">→</kbd>
                    <kbd className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-750 text-[10px] font-semibold text-stone-300 font-mono">D</kbd>
                  </div>
                </div>

                <div className="flex items-center justify-between text-stone-400 text-xs pb-1">
                  <span>美味跳躍 Jump:</span>
                  <div className="flex gap-1 flex-wrap justify-end">
                    <kbd className="px-1 pl-[3px] py-0.5 rounded bg-stone-800 border border-stone-750 text-[10px] font-bold text-amber-500 font-mono">↑</kbd>
                    <kbd className="px-1 pl-[3px] py-0.5 rounded bg-stone-800 border border-stone-750 text-[10px] font-semibold text-stone-300 font-mono">W</kbd>
                    <kbd className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-750 text-[10px] font-semibold text-stone-300 font-mono">Space</kbd>
                  </div>
                </div>
              </div>

              {/* Micro Map Note */}
              <div className="mt-auto pt-4 border-t border-stone-850/60 text-[11px] text-stone-500 leading-relaxed">
                <span className="text-amber-500 font-bold block mb-1">📍 慈祐宮殿前廣場牌樓</span>
                背景細緻復刻自建廟於西元1686年、擁有三百年神靈香火的新莊古剎，傳統大紅燈籠隨風搖曳。
              </div>
            </div>

            {/* Bento Box 4: Object Almanac Encyclopedia */}
            <div className="bg-stone-900/40 border border-stone-850 p-5 rounded-2xl flex flex-col shadow-inner backdrop-blur-sm">
              <h3 className="text-xs font-bold text-stone-500 uppercase mb-3 tracking-wider border-b border-stone-850 pb-2">
                <span>物件百科 ALMANAC</span>
              </h3>
              
              <div className="space-y-2.5">
                {/* Normal Baked Bread */}
                <div className="flex items-center gap-3 bg-stone-950/50 p-2 rounded-xl border border-stone-850/40">
                  <div className="w-8 h-8 rounded-full bg-amber-400 ring-2 ring-amber-800 flex-shrink-0 flex items-center justify-center text-xs font-black text-amber-950 shadow-sm animate-pulse">
                     餅
                  </div>
                  <div className="text-xs">
                    <div className="font-extrabold text-amber-100 flex items-center gap-1.5">
                      <span>普通 鹹光餅</span>
                      <span className="text-[9px] bg-amber-500/10 text-amber-400 px-1 rounded font-bold">常見</span>
                    </div>
                    <div className="text-stone-500 mt-0.5 text-[10px]">+15 飽食度 (Satiety)</div>
                  </div>
                </div>

                {/* Golden Blessed Bread */}
                <div className="flex items-center gap-3 bg-stone-950/50 p-2 rounded-xl border border-stone-850/40">
                  <div className="w-8 h-8 rounded-full bg-yellow-300 ring-2 ring-yellow-600 flex-shrink-0 flex items-center justify-center text-xs font-black text-amber-950 shadow-[0_0_10px_rgba(250,204,21,0.5)]">
                     金
                  </div>
                  <div className="text-xs">
                    <div className="font-extrabold text-yellow-400 flex items-center gap-1.5">
                      <span>黃金 祝福光餅</span>
                      <span className="text-[9px] bg-yellow-400/20 text-yellow-300 px-1 rounded font-bold">稀有</span>
                    </div>
                    <div className="text-stone-500 mt-0.5 text-[10px]">+25 飽食度 (Satiety)</div>
                  </div>
                </div>

                {/* Dark Burnt Bread */}
                <div className="flex items-center gap-3 bg-stone-950/50 p-2 rounded-xl border border-stone-850/40">
                  <div className="w-8 h-8 rounded-full bg-stone-700 ring-2 ring-stone-900 flex-shrink-0 flex items-center justify-center text-xs font-bold text-red-400">
                     霉
                  </div>
                  <div className="text-xs">
                    <div className="font-extrabold text-[#a29080] flex items-center gap-1.5">
                      <span>焦黑 炭燒霉餅</span>
                      <span className="text-[9px] bg-red-950/40 text-red-400 px-1 rounded font-bold border border-red-900/30">避開</span>
                    </div>
                    <div className="text-stone-500 mt-0.5 text-[10px]">-12 飽食度 (Satiety)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bento Box: Famous Local Heritage card */}
            <div className="bg-amber-600/5 hover:bg-amber-600/10 border border-amber-600/25 p-5 rounded-2xl text-amber-200 backdrop-blur-sm transition-all shadow-sm">
              <h3 className="text-xs font-black uppercase mb-2 tracking-wider text-amber-500 flex items-center space-x-1.5">
                <BookOpen className="w-4 h-4" />
                <span>新莊特產：鹹光餅</span>
              </h3>
              <p className="text-[11px] leading-relaxed text-amber-100/80 mb-1">
                <strong>鹹光餅</strong>（平安餅）是新莊大門樓和繞境活動必有的傳統祈福美食，烘烤得金黃酥脆沾滿芝麻，香氣甜中帶鹹，承載三百年老街歷史，寓意保佑平安與飽食。
              </p>
              <div className="text-[10px] text-amber-500/70 font-bold font-mono">
                # 新莊慈祐宮百年傳統廟會勝產
              </div>
            </div>

          </aside>

        </div>

      </main>

      {/* Styled Minimal Footer */}
      <footer className="border-t border-stone-900 bg-stone-950 py-5 text-center text-xs text-stone-600 tracking-[0.25em] uppercase w-full">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-3 font-mono">
          <p className="normal-case">© 2026 【新莊廟街：美好食光】· RETRO ARCHIVE EXPERIENCE</p>
          <p className="flex items-center gap-1.5 normal-case">
            <span>XINZHUANG TEMPLE HERITAGE PROJECT</span>
            <Heart className="w-3.5 h-3.5 text-red-650 fill-current animate-pulse text-red-500" />
          </p>
        </div>
      </footer>

    </div>
  );
}
