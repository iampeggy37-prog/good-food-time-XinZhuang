import React, { useState, useRef, useEffect } from 'react';
import { ChefHat, Flame, ArrowRight, RefreshCw, Star, HelpCircle, Check, Info } from 'lucide-react';
import { playJumpSound, playCollectSound } from '../utils/audio';

interface BiscuitMakerProps {
  onComplete: () => void;
}

interface Ingredient {
  id: string;
  name: string;
  desc: string;
  icon: string;
  color: string;
  sound: () => void;
}

export const BiscuitMaker: React.FC<BiscuitMakerProps> = ({ onComplete }) => {
  const [ingredientsAdded, setIngredientsAdded] = useState<string[]>([]);
  const [bakingProgress, setBakingProgress] = useState<number>(0);
  const [isBaking, setIsBaking] = useState<boolean>(false);
  const [baked, setBaked] = useState<boolean>(false);

  // Dragging states
  const [activeDrag, setActiveDrag] = useState<string | null>(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [isHoveredOverMold, setIsHoveredOverMold] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const moldRef = useRef<HTMLDivElement>(null);

  const ingredients: Ingredient[] = [
    { id: 'dough', name: '平安麵團', desc: '新莊大麥磨製，勁道十足', icon: '🌾', color: 'from-amber-100 to-amber-200', sound: playJumpSound },
    { id: 'sesame', name: '金黃芝麻', desc: '香氣四溢，象徵福運播撒', icon: '🫘', color: 'from-yellow-600 to-amber-700', sound: playJumpSound },
    { id: 'stamp', name: '平安吉祥印', desc: '蓋上大吉字樣與愛心祝福', icon: '💮', color: 'from-red-500 to-rose-600', sound: playCollectSound },
  ];

  // Helper to trigger actions once added
  const addIngredient = (id: string) => {
    if (ingredientsAdded.includes(id)) return;
    setIngredientsAdded(prev => [...prev, id]);
    playCollectSound();
  };

  // Drag handlers
  const handleDragStart = (id: string, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (ingredientsAdded.includes(id)) return;
    setActiveDrag(id);
    playJumpSound();

    // Get position
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDragPos({
        x: clientX - rect.left,
        y: clientY - rect.top
      });
    }
  };

  const handleDragMove = (e: MouseEvent | TouchEvent) => {
    if (!activeDrag || !containerRef.current) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const containerRect = containerRef.current.getBoundingClientRect();
    const x = clientX - containerRect.left;
    const y = clientY - containerRect.top;
    setDragPos({ x, y });

    // Check collision with the central mold
    if (moldRef.current) {
      const moldRect = moldRef.current.getBoundingClientRect();
      const dist = Math.sqrt(
        Math.pow((clientX - (moldRect.left + moldRect.width / 2)), 2) +
        Math.pow((clientY - (moldRect.top + moldRect.height / 2)), 2)
      );
      // Hover within 100px of center
      setIsHoveredOverMold(dist < 90);
    }
  };

  const handleDragEnd = () => {
    if (!activeDrag) return;

    if (isHoveredOverMold) {
      addIngredient(activeDrag);
    }

    setActiveDrag(null);
    setIsHoveredOverMold(false);
  };

  useEffect(() => {
    if (activeDrag) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDragMove, { passive: false });
      window.addEventListener('touchend', handleDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [activeDrag, isHoveredOverMold]);

  // Handle baking timeline
  const startBaking = () => {
    if (ingredientsAdded.length < 3 || isBaking || baked) return;
    setIsBaking(true);
    playJumpSound();

    let prog = 0;
    const interval = setInterval(() => {
      prog += 4;
      setBakingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsBaking(false);
          setBaked(true);
          playCollectSound();
          return 100;
        }
        return prev + 4;
      });
    }, 120);
  };

  const resetMaker = () => {
    setIngredientsAdded([]);
    setBakingProgress(0);
    setIsBaking(false);
    setBaked(false);
    setActiveDrag(null);
    setIsHoveredOverMold(false);
    playJumpSound();
  };

  return (
    <div className="w-full max-w-md bg-stone-900/98 border-2 border-amber-600/50 p-5 rounded-2xl shadow-2xl relative flex flex-col items-center select-none" ref={containerRef}>
      
      {/* Decorative Traditional Label */}
      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-600 to-amber-700 text-stone-950 font-black px-4 py-1.5 rounded-full text-[10px] tracking-widest border border-yellow-400/80 uppercase shadow-md flex items-center gap-1">
        <span>👨‍🍳</span> 傳統手作 ‧ 開運有口皆碑 <span>🥖</span>
      </div>

      <div className="text-center mt-3">
        <h3 className="text-xl sm:text-2xl font-black text-yellow-500 font-serif tracking-wide">
          新莊手作鹹光餅 🥯
        </h3>
        <p className="text-stone-300 text-[11px] sm:text-slate-400 leading-relaxed mt-1.5 max-w-sm">
          依照古法，將<strong>平安麵團</strong>、<strong>香蔥芝麻</strong>進行調配，並蓋上<strong>吉祥字印</strong>，再送入百年古廟香火爐烘烤，為八戒開啟無病無災的一年！
        </p>
      </div>

      {/* Ingredient Shelf (Items to Drag / Click) */}
      <div className="w-full grid grid-cols-3 gap-2.5 mt-4">
        {ingredients.map(ing => {
          const isAdded = ingredientsAdded.includes(ing.id);
          return (
            <div
              key={ing.id}
              onTouchStart={(e) => handleDragStart(ing.id, e)}
              onMouseDown={(e) => handleDragStart(ing.id, e)}
              onClick={() => addIngredient(ing.id)} // Backup click interaction for instant fun!
              className={`relative bg-stone-950 rounded-xl border p-2 flex flex-col items-center justify-center transition-all ${
                isAdded
                  ? 'border-emerald-500/40 opacity-50 cursor-not-allowed scale-95'
                  : 'border-stone-850 hover:border-yellow-500/50 hover:bg-stone-900/50 cursor-grab active:cursor-grabbing'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-stone-900/80 border border-stone-800 flex items-center justify-center text-xl mb-1 filter drop-shadow">
                {ing.icon}
              </div>
              <span className="text-[11px] font-extrabold text-stone-200">{ing.name}</span>
              <span className="text-[8px] text-stone-500 text-center scale-90 leading-tight mt-0.5 max-h-[14px] overflow-hidden truncate">
                {isAdded ? "已調配完成" : "拖曳或點擊"}
              </span>

              {/* Added indicator */}
              {isAdded && (
                <div className="absolute inset-0 bg-stone-950/80 rounded-xl flex items-center justify-center text-emerald-400">
                  <Check className="w-5 h-5 stroke-[3px]" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Main Mold Interaction Zone */}
      <div 
        ref={moldRef}
        className={`relative w-48 h-48 rounded-full border-4 my-5 flex items-center justify-center transition-all ${
          isHoveredOverMold 
            ? 'bg-yellow-900/10 border-yellow-400 scale-105 shadow-[0_0_20px_rgba(234,179,8,0.3)]' 
            : ingredientsAdded.length === 3 
              ? 'bg-stone-950/60 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
              : 'bg-stone-950 border-stone-800 shadow-inner'
        }`}
      >
        {/* Dynamic Dough / Biscuit Visual state inside the mold */}
        <div className="relative w-36 h-36 rounded-full flex items-center justify-center">
          
          {/* Base Plate / Golden tray reflection */}
          <div className="absolute inset-2 rounded-full border-2 border-stone-850/40 bg-radial-gradient from-transparent to-black/30 pointer-events-none" />

          {/* Steaming active smoke during baking */}
          {isBaking && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
              <span className="text-3xl animate-bounce filter blur-[1px] opacity-40">💨</span>
              <span className="text-2xl animate-pulse filter blur-[2px] opacity-35 delay-300">💨</span>
            </div>
          )}

          {/* STEP 1: Dough rendering */}
          {ingredientsAdded.includes('dough') && (
            <div 
              className={`absolute w-32 h-32 rounded-full border-4 shadow-lg transition-all duration-700 flex items-center justify-center ${
                baked
                  ? 'bg-gradient-to-b from-amber-400 to-amber-600 border-amber-700'
                  : isBaking
                    ? 'bg-gradient-to-b from-amber-200 via-amber-300 to-amber-400 border-amber-500 animate-pulse'
                    : 'bg-gradient-to-b from-amber-50 to-amber-100 border-amber-200'
              }`}
            >
              {/* Central Bagel Hole */}
              <div className="w-10 h-10 rounded-full bg-stone-950 border-4 border-inherit flex items-center justify-center z-10 font-black text-[9px] text-stone-200 shadow-inner select-none pointer-events-none" />

              {/* STEP 2: Sesame rendering */}
              {ingredientsAdded.includes('sesame') && (
                <div className="absolute inset-0 rounded-full opacity-80 pointer-events-none z-15">
                  <div className="absolute top-[25px] left-[35px] w-1.5 h-1 bg-amber-900 rounded-full transform rotate-45" />
                  <div className="absolute top-[28px] right-[40px] w-1.5 h-1 bg-amber-950 rounded-full transform -rotate-12" />
                  <div className="absolute bottom-[35px] left-[30px] w-1.5 h-1 bg-amber-900 rounded-full transform rotate-[70deg]" />
                  <div className="absolute bottom-[28px] right-[35px] w-1.5 h-1 bg-amber-950 rounded-full transform rotate-12" />
                  <div className="absolute top-[50%] left-[16px] w-1.5 h-1 bg-amber-900 rounded-full transform -rotate-[30deg]" />
                  <div className="absolute top-[45%] right-[16px] w-1.5 h-1 bg-amber-950 rounded-full transform rotate-[60deg]" />
                </div>
              )}

              {/* STEP 3: Stamp rendering */}
              {ingredientsAdded.includes('stamp') && (
                <div className="absolute top-[18px] left-1/2 -translate-x-1/2 flex flex-col items-center justify-center pointer-events-none z-20">
                  <div className={`w-6 h-6 rounded-full border-2 border-red-600/70 flex items-center justify-center font-bold text-[8px] text-red-600/80 transform rotate-12 tracking-tighter ${baked ? 'shadow-inner' : 'animate-ping'}`}>
                    福
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty mold guide */}
          {ingredientsAdded.length === 0 && (
            <div className="text-center flex flex-col items-center">
              <ChefHat className="w-10 h-10 text-stone-700 animate-pulse mb-1" />
              <p className="text-[10px] text-stone-500 font-bold max-w-[130px]">
                請拖曳上方食材至此盤中製作 🥯
              </p>
            </div>
          )}

          {/* Sparkles on Completion */}
          {baked && (
            <div className="absolute top-2 right-2 text-yellow-400 text-xl animate-bounce select-none pointer-events-none z-30">
              ✨
            </div>
          )}
        </div>
      </div>

      {/* Interactive Helper/Tutorial Info in Drag style */}
      {activeDrag && (
        <div
          style={{
            position: 'absolute',
            left: `${dragPos.x}px`,
            top: `${dragPos.y}px`,
            pointerEvents: 'none',
            transform: 'translate(-50%, -50%)',
            zIndex: 9999
          }}
          className="bg-yellow-500/90 text-stone-900 font-extrabold text-[12px] px-2.5 py-1.5 rounded-lg shadow-2xl flex items-center gap-1.5 select-none filter drop-shadow animate-pulse"
        >
          <span>{ingredients.find(i => i.id === activeDrag)?.icon}</span>
          <span>放下製作</span>
        </div>
      )}

      {/* Progress display */}
      {ingredientsAdded.length === 3 && (
        <div className="w-full bg-stone-950 p-3 rounded-xl border border-stone-850 animate-fade-in">
          <div className="flex justify-between items-center text-[10px] font-bold text-amber-500 mb-1.5">
            <span className="flex items-center gap-1">
              <Flame className={`w-3.5 h-3.5 ${isBaking ? 'text-red-500 animate-ping' : 'text-neutral-500'}`} />
              廟街古法烘焙溫度：
            </span>
            <span className="font-mono">{bakingProgress}%</span>
          </div>

          <div className="w-full h-3.5 bg-stone-900 rounded-lg overflow-hidden border border-stone-850 shadow-inner relative flex items-center mb-2.5">
            <div 
              className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 rounded-lg shadow transition-all duration-100"
              style={{ width: `${bakingProgress}%` }}
            />
          </div>

          <div className="flex justify-center">
            {!baked ? (
              <button
                onClick={startBaking}
                disabled={isBaking}
                className={`w-full flex items-center justify-center space-x-1.5 text-stone-950 font-black text-xs py-2 px-5 rounded-lg border-b-2 shadow active:scale-95 transition-all outline-none cursor-pointer ${
                  isBaking 
                    ? 'bg-amber-600 border-amber-800 text-stone-200' 
                    : 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 border-amber-700'
                }`}
              >
                <span>{isBaking ? "🔥 爐火烘烤製作中..." : "👉 啟動古香爐烘培！"}</span>
              </button>
            ) : (
              <div className="w-full bg-emerald-950/40 border border-emerald-500/20 py-1.5 rounded text-emerald-400 font-bold text-[10px] sm:text-xs text-center flex items-center justify-center gap-1">
                <span>✨</span> 香氣四溢！鹹光餅製作大成功！ <span>✨</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pig Bajie commenting live on workflow */}
      <div className="mt-3.5 w-full bg-stone-950 border border-stone-850/60 p-3 rounded-xl text-left shadow-inner text-[11px] text-rose-300 italic font-semibold flex items-center gap-2">
        <span className="text-xl select-none">🐷</span>
        <span>
          {baked
            ? "「好香好香喔！這就是新莊老街著名的鹹光餅！吃了保平安，快出發！」"
            : isBaking
              ? "「呼呼！香火裊裊，熱氣騰騰！餅皮變得胖乎乎、黃澄澄的，好想吃啊！」"
              : ingredientsAdded.length === 3
                ? "「哇！配料湊齊了！快點擊按鈕，啟動爐火，香噴噴烘炙一盤吧！」"
                : ingredientsAdded.length === 0
                  ? "「施主，快用麵團、芝麻和吉祥印做出暖心的鹹光餅，幫八戒填飽肚子！」"
                  : "「下一步要把其餘兩樣也都放進去喔，好期待大功告成！」"}
        </span>
      </div>

      {/* Bottom Completion Unlocks */}
      <div className="mt-4 w-full flex gap-2">
        {baked ? (
          <button
            onClick={() => {
              playCollectSound();
              onComplete();
            }}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-stone-100 font-extrabold text-sm py-2.5 px-6 rounded-xl shadow-lg border border-emerald-400/25 active:scale-95 transition-all outline-none cursor-pointer animate-pulse"
          >
            <span>攜帶平安鹹光餅，通往新莊廟街挑戰 👣</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          ingredientsAdded.length > 0 && (
            <button
              onClick={resetMaker}
              className="w-full flex items-center justify-center space-x-1 border border-stone-800 text-stone-500 hover:text-stone-300 hover:bg-stone-900/30 font-bold text-[10px] py-2 px-3 rounded-lg transition-all"
            >
              <RefreshCw className="w-3 h-3" />
              <span>重新揉捏調配</span>
            </button>
          )
        )}
      </div>

    </div>
  );
};
