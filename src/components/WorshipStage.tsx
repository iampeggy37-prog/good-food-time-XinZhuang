import React, { useState, useEffect } from 'react';
import { Sparkles, MapPin, Flame, CheckCircle, Info, ChevronRight } from 'lucide-react';
import { playJumpSound, playCollectSound } from '../utils/audio';

interface WorshipStageProps {
  onComplete: () => void;
}

interface StepDetails {
  id: number;
  title: string;
  subTitle: string;
  godName: string;
  intro: string;
  censerName: string;
  censerIcon: string;
  bgGradient: string;
  borderColor: string;
  glowColor: string;
  blessingOptions: string[];
}

const STEPS_DATA: StepDetails[] = [
  {
    id: 1,
    title: "第一步：朝外朝天拜天公",
    subTitle: "天公爐（玉皇大帝）",
    godName: "玉皇大帝",
    intro: "手持三炷香，面朝廟外天空，誠心向天公（玉皇大帝）稟報姓名、生日、住址，祈求風調雨順、闔家平安，隨後將第一炷香插入天公爐。",
    censerName: "古銅九龍天公爐",
    censerIcon: "🏺",
    bgGradient: "from-sky-950 via-slate-900 to-stone-900",
    borderColor: "border-sky-500/50",
    glowColor: "shadow-sky-500/30",
    blessingOptions: ["風調雨順", "闔家平安", "身體健康", "萬事大吉"]
  },
  {
    id: 2,
    title: "第二步：正殿瞻仰媽祖聖容",
    subTitle: "正殿（天上聖母 / 媽祖）",
    godName: "天上聖母 媽祖娘娘",
    intro: "步入正殿，瞻仰新莊慈祐宮三百年金身媽祖。誠心合十，稟報今日與八戒的廟街巡禮、祈願闔家安康、福蔭萬民，隨後將第二炷香插入正殿主爐。",
    censerName: "金輝雙龍大香爐",
    censerIcon: "🔱",
    bgGradient: "from-amber-950 via-stone-900 to-stone-950",
    borderColor: "border-amber-500/50",
    glowColor: "shadow-amber-500/30",
    blessingOptions: ["消災解厄", "庇佑萬民", "八戒乖巧", "福氣滿門"]
  },
  {
    id: 3,
    title: "第三步：後殿參拜觀音與眾神",
    subTitle: "後殿（觀音佛祖）",
    godName: "觀音佛祖",
    intro: "穿過典雅的天井來到幽靜的後殿。誠心禮拜觀音佛祖、文昌帝君及註生娘娘，祈求智慧開通、慈悲大愛、事事圓滿，並將最後一炷香插入後殿香爐。",
    censerName: "翠玉如意祥雲爐",
    censerIcon: "💎",
    bgGradient: "from-rose-950 via-neutral-900 to-neutral-950",
    borderColor: "border-rose-500/50",
    glowColor: "shadow-rose-500/30",
    blessingOptions: ["增廣智慧", "慈悲圓滿", "口水收乾", "平安長大"]
  }
];

export const WorshipStage: React.FC<WorshipStageProps> = ({ onComplete }) => {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [incenseLevel, setIncenseLevel] = useState<number>(3); // 3 sticks left initially
  const [isInserting, setIsInserting] = useState<boolean>(false);
  const [insertedSteps, setInsertedSteps] = useState<number[]>([]); // steps that completed insertion
  const [blessingText, setBlessingText] = useState<string>("");
  const [activeBlessing, setActiveBlessing] = useState<string>("");
  const [smokeParticles, setSmokeParticles] = useState<{ id: number; x: number; delay: number }[]>([]);
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; char: string }[]>([]);

  const currentStep = STEPS_DATA[currentStepIdx] || STEPS_DATA[STEPS_DATA.length - 1];
  const allCompleted = insertedSteps.length === STEPS_DATA.length;

  // Generate smoke particles for ambience
  useEffect(() => {
    const interval = setInterval(() => {
      setSmokeParticles(prev => [
        ...prev.slice(-15),
        {
          id: Date.now() + Math.random(),
          x: 40 + Math.random() * 20, // focus center around the censer
          delay: Math.random() * 2
        }
      ]);
    }, 600);

    return () => clearInterval(interval);
  }, []);

  // Handle worship/inserting incense action
  const handleWorshipClick = () => {
    if (isInserting || insertedSteps.includes(currentStep.id)) return;

    setIsInserting(true);
    playJumpSound();

    // Trigger floating sparkles representing prayer words
    const randomBlessings = currentStep.blessingOptions;
    const chosenBlessing = randomBlessings[Math.floor(Math.random() * randomBlessings.length)];
    setActiveBlessing(chosenBlessing);

    // Generate gold sparkles cascading
    const newSparkles = Array.from({ length: 8 }).map((_, i) => ({
      id: Date.now() + i,
      x: 30 + Math.random() * 40,
      y: 40 + Math.random() * 30,
      char: ['✨', '🔥', '🌸', '🏮', '🙏'][Math.floor(Math.random() * 5)]
    }));
    setSparkles(newSparkles);

    // Simulate incense inserting motion and smoke increase
    setTimeout(() => {
      setInsertedSteps(prev => [...prev, currentStep.id]);
      setIncenseLevel(prev => Math.max(0, prev - 1));
      setIsInserting(false);
      playCollectSound();

      setBlessingText(`🙏 已對【${currentStep.godName}】至誠祈求並敬上清香，心願「${chosenBlessing}」隨著輕煙裊裊升天！`);

      // Auto advance step after a brief delay if not the final step
      if (currentStepIdx < STEPS_DATA.length - 1) {
        const scheduledIdx = currentStepIdx;
        setTimeout(() => {
          setCurrentStepIdx(prev => {
            if (prev === scheduledIdx) {
              setBlessingText("");
              setActiveBlessing("");
              setSparkles([]);
              return prev + 1;
            }
            return prev;
          });
        }, 3200);
      }
    }, 1800);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-3 text-stone-100 font-sans">
      
      {/* Custom Scoped Animations for Temple Atmosphere */}
      <style>{`
        @keyframes driftUp {
          0% {
            transform: translateY(10px) scale(0.8);
            opacity: 0;
          }
          50% {
            opacity: 0.45;
          }
          100% {
            transform: translateY(-90px) scale(1.6);
            opacity: 0;
          }
        }
        @keyframes sparkleFloat {
          0% {
            transform: translate(0, 10px) scale(0.6);
            opacity: 0;
          }
          30% {
            opacity: 1;
          }
          100% {
            transform: translate(calc(var(--tw-x-offset, 20px)), -70px) scale(1.2);
            opacity: 0;
          }
        }
        @keyframes incenseDip {
          0% {
            transform: translateY(-80px) rotate(5deg);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
            filter: drop-shadow(0 0 8px rgba(251,191,36,0.8));
          }
          100% {
            transform: translateY(15px);
            opacity: 0.95;
          }
        }
        .smoke-whisper {
          animation: driftUp 3s infinite ease-out;
        }
        .sparkle-particle {
          animation: sparkleFloat 2s forwards ease-out;
        }
        .incense-animating {
          animation: incenseDip 1.8s forwards ease-in-out;
        }
      `}</style>

      <div className="w-full max-w-md bg-stone-900/95 border-2 border-amber-600/50 p-5 rounded-2xl shadow-2xl relative flex flex-col items-center animate-fade-in">
        
        {/* Ancient Temple Header Decor */}
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-red-700 via-amber-600 to-red-700 text-stone-950 font-black px-5 py-1.5 rounded-full text-xs tracking-widest border-2 border-yellow-400 uppercase shadow-xl flex items-center gap-1.5 whitespace-nowrap">
          <span>🏮</span> 三白年古蹟 ‧ 慈祐宮三殿虔誠大祭 <span>🏮</span>
        </div>

        {/* Worship Progress Route Map */}
        <div className="w-full mt-4 bg-black/40 border border-stone-850 p-2.5 rounded-xl flex items-center justify-between text-[11px] font-bold text-amber-500 mb-3 shadow-inner">
          {STEPS_DATA.map((step, idx) => {
            const isDone = insertedSteps.includes(step.id);
            const isCurrent = currentStepIdx === idx;
            return (
              <React.Fragment key={step.id}>
                <button
                  disabled={isInserting}
                  onClick={() => {
                    setCurrentStepIdx(idx);
                    setBlessingText("");
                    setActiveBlessing("");
                    setSparkles([]);
                  }}
                  className={`flex flex-col items-center gap-1.5 focus:outline-none transition-all cursor-pointer ${
                    isCurrent ? 'scale-110 text-yellow-400' : isDone ? 'text-emerald-500 hover:text-emerald-400' : 'text-stone-500 hover:text-stone-400'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full border flex items-center justify-center font-bold text-[10px] ${
                    isCurrent 
                      ? 'bg-yellow-500 text-stone-950 border-yellow-400 font-black animate-pulse shadow-[0_0_10px_rgba(234,179,8,0.5)]' 
                      : isDone 
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-500 shadow-inner' 
                        : 'bg-stone-950 text-stone-500 border-stone-800'
                  }`}>
                    {isDone ? '✓' : idx + 1}
                  </div>
                  <span className="font-serif select-none hidden sm:inline">
                    {idx === 0 ? "天公爐" : idx === 1 ? "正殿媽祖" : "後殿觀音"}
                  </span>
                </button>
                {idx < 2 && (
                  <div className={`flex-1 h-0.5 mx-1 border-t-2 border-dashed ${
                    idx < currentStepIdx ? 'border-emerald-500/50' : 'border-stone-800'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Current Hall Scene Visualization */}
        <div className={`relative w-full h-44 rounded-xl overflow-hidden border-2 border-stone-800 bg-gradient-to-b ${currentStep.bgGradient} flex flex-col items-center justify-between p-4 shadow-inner ${currentStep.glowColor} transition-all duration-500`}>
          
          {/* Ambient Temple Smoke particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {smokeParticles.map(p => (
              <div
                key={p.id}
                className="absolute smoke-whisper bg-stone-300/10 blur-[6px] rounded-full"
                style={{
                  left: `${p.x}%`,
                  bottom: '15px',
                  width: `${12 + Math.random() * 20}px`,
                  height: `${12 + Math.random() * 20}px`,
                  animationDelay: `${p.delay}s`
                }}
              />
            ))}

            {/* Sparkles of Devotion */}
            {sparkles.map(sp => (
              <div
                key={sp.id}
                className="absolute sparkle-particle text-sm select-none"
                style={{
                  left: `${sp.x}%`,
                  top: `${sp.y}%`,
                  '--tw-x-offset': `${(Math.random() - 0.5) * 60}px`
                } as React.CSSProperties}
              >
                {sp.char}
              </div>
            ))}
          </div>

          {/* Temple Hall Title Info */}
          <div className="z-10 flex flex-col items-center text-center">
            <span className="text-[10px] uppercase font-mono tracking-widest text-amber-500 select-none flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {currentStep.subTitle}
            </span>
            <h4 className="text-lg font-black text-stone-100 font-serif tracking-wider drop-shadow-md">
              {currentStep.godName}
            </h4>
          </div>

          {/* Large Interactive Censer representation */}
          <div className="relative flex flex-col items-center">
            
            {/* Animated Incense Stick going in */}
            {isInserting && (
              <div className="absolute -top-[50px] z-20 flex flex-col items-center incense-animating pointer-events-none">
                <div className="w-1 h-14 bg-amber-700 rounded-t shadow-inner relative">
                  {/* Burning Red tip with glow effects */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-amber-400 rounded-full" />
                </div>
              </div>
            )}

            {/* Already Inserted Incense Sticks in Censer */}
            <div className="absolute -top-10 flex justify-center items-end space-x-1.5 z-10 select-none pointer-events-none">
              {insertedSteps.map(stepId => {
                const s = STEPS_DATA.find(x => x.id === stepId);
                return (
                  <div key={stepId} className="flex flex-col items-center transform origin-bottom hover:scale-105 transition-transform">
                    {/* Tiny Smoke puff */}
                    <span className="text-[10px] animate-pulse">💨</span>
                    <div className="w-[3px] h-10 bg-amber-900 border-t border-amber-400 rounded-t shadow relative">
                      <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-600 rounded-full animate-pulse" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* The Actual Clickable Censer Button */}
            <button
              id={`censer-btn-step-${currentStep.id}`}
              disabled={isInserting || insertedSteps.includes(currentStep.id)}
              onClick={handleWorshipClick}
              className={`w-20 h-20 rounded-full bg-gradient-to-b from-amber-600 to-amber-950 border-4 ${
                insertedSteps.includes(currentStep.id)
                  ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                  : isInserting
                    ? 'border-yellow-400 scale-95 shadow-[0_0_20px_rgba(245,158,11,0.6)]'
                    : 'border-yellow-600 hover:border-yellow-500 hover:scale-105 shadow-lg active:scale-95 cursor-pointer animate-none'
              } flex flex-col items-center justify-center transition-all z-20 relative select-none`}
              title="點擊香爐插入祈福清香"
            >
              <span className="text-3xl select-none transform drop-shadow-md">{currentStep.censerIcon}</span>
              <span className="text-[8px] font-bold text-amber-200 mt-1 truncate max-w-[65px] font-serif">
                {insertedSteps.includes(currentStep.id) ? "香火鼎盛" : "敬捧清香"}
              </span>

              {/* Little interactive pulse */}
              {!insertedSteps.includes(currentStep.id) && !isInserting && (
                <span className="absolute -bottom-1 bg-yellow-500 text-stone-950 font-black text-[7px] px-1 rounded shadow animate-bounce">
                  點擊持香
                </span>
              )}
            </button>
          </div>

          {/* Floating blessing text overlay if active */}
          <div className="h-4 flex items-center justify-center w-full">
            {activeBlessing && (
              <span className="text-[10px] sm:text-xs font-black text-yellow-300 tracking-widest bg-black/60 px-3 py-0.5 rounded-full border border-yellow-500/30 animate-pulse">
                ✨ 祈求：{activeBlessing} ✨
              </span>
            )}
          </div>
        </div>

        {/* Incense Inventory / Spark Indicators */}
        <div className="w-full mt-3.5 flex justify-between items-center bg-black/30 px-3.5 py-2 rounded-xl border border-stone-850">
          <div className="flex items-center gap-1.5">
            <span className="text-amber-500 font-bold text-xs flex items-center gap-0.5">
              <Flame className="w-3.5 h-3.5 fill-current text-orange-500 animate-pulse" /> 虔誠清香：
            </span>
            <div className="flex space-x-1.5 text-sm select-none">
              {Array.from({ length: incenseLevel }).map((_, i) => (
                <span key={i} className="animate-pulse filter drop-shadow">🕯️</span>
              ))}
              {incenseLevel === 0 && <span className="text-emerald-500 text-[10px] font-bold">清香已誠心進奉完畢</span>}
            </div>
          </div>
          <div className="text-[10px] font-black text-amber-300 bg-amber-950/55 px-2 py-0.5 rounded border border-amber-800/40">
            {insertedSteps.length} / 3 殿完成
          </div>
        </div>

        {/* Narrative Box with Auto Guides / Explanations */}
        <div className="mt-3.5 w-full bg-stone-950 border border-stone-850 p-4 rounded-xl text-left shadow-inner flex flex-col justify-center min-h-[95px] relative overflow-hidden transition-all duration-300">
          
          <div className="absolute top-1 right-2 pointer-events-none select-none text-[32px] opacity-10">🏺</div>

          <div className="flex items-center gap-1 mb-1">
            <Info className="w-3 h-3 text-amber-500" />
            <p className="text-stone-400 text-[9px] uppercase font-bold tracking-widest text-amber-500 select-none">
              {isInserting ? "祈福對話香煙裊裊中..." : "殿堂指引與參拜要領："}
            </p>
          </div>

          <p className="text-stone-100 text-xs leading-relaxed font-serif font-medium whitespace-pre-line tracking-wide">
            {blessingText || currentStep.intro}
          </p>

          {/* Show Pig Octet dialogue / commentary context */}
          <div className="mt-3.5 pt-2 border-t border-stone-850/60 flex items-center space-x-2 text-[11px] text-rose-300 italic font-semibold">
            <span className="text-base select-none">🐷</span>
            <span>
              {insertedSteps.includes(currentStep.id)
                ? "「施主，我感到身上暖呼呼的！媽祖娘娘和眾神一定會保佑我們！」"
                : currentStep.id === 1
                  ? "「拜天公，要大聲說出自己的名字和地址喔，神明才聽得清楚！」"
                  : currentStep.id === 2
                    ? "「媽祖娘娘真慈祥，就像愛吃鹹光餅的鄰家大母娘，真溫馨啊！」"
                    : "「最後這裏是後殿，有慈悲的觀世音佛祖，保佑我們智慧大開口水乾！」"}
            </span>
          </div>
        </div>

        {/* Completed Overlay or Leave Button Area */}
        <div className="mt-5 w-full flex flex-col animate-fade-in">
          {allCompleted ? (
            <div className="space-y-3 w-full">
              <div className="rounded-xl bg-emerald-950/50 border border-emerald-500/30 p-3 text-center flex items-center justify-center gap-1.5 text-emerald-400 font-bold select-none animate-pulse">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-xs tracking-wide">三殿參拜大功告成！闔家平安，香火裊裊，福運當頭！</span>
              </div>
              <button
                onClick={() => {
                  playCollectSound();
                  onComplete();
                }}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:to-amber-500 text-stone-950 font-black text-sm py-3 px-6 rounded-xl shadow-lg border border-yellow-400/30 active:scale-95 transition-all outline-none cursor-pointer animate-bounce"
                id="leave-ciyou-btn"
              >
                <span>離開慈祐宮（參拜圓滿完成）👣</span>
                <ChevronRight className="w-4 h-4 stroke-[3px]" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2 w-full justify-center">
              {insertedSteps.includes(currentStep.id) && currentStepIdx < STEPS_DATA.length - 1 ? (
                <button
                  onClick={() => {
                    setCurrentStepIdx(prev => prev + 1);
                    setBlessingText("");
                    setActiveBlessing("");
                    setSparkles([]);
                  }}
                  className="w-full py-2.5 px-4 bg-amber-600/90 hover:bg-amber-500 text-stone-950 font-black text-xs sm:text-sm rounded-xl select-none transition-all cursor-pointer flex items-center justify-center gap-1 animate-pulse"
                >
                  <span>前往下一殿參拜</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <div className="w-full py-2.5 px-4 bg-stone-850/50 border border-stone-800 text-stone-500 text-xs font-bold rounded-xl select-none italic text-center">
                  🔒 請點擊並將清香插入對應殿堂香爐，獻上虔誠合十...
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
