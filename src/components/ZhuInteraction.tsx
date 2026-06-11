import React, { useState, useEffect } from 'react';
import { DialogueNode, BajieExpression } from '../types';
import { DIALOGUE_TREE } from '../data/dialogues';
import { Heart, Stars, ChevronRight, MessageSquareHeart, Sparkles } from 'lucide-react';

interface ZhuInteractionProps {
  nodeId: string;
  affectionScore: number;
  onModifyAffection: (bonus: number) => void;
  onFinishDialogue: (action?: string) => void;
}

export default function ZhuInteraction({
  nodeId,
  affectionScore,
  onModifyAffection,
  onFinishDialogue
}: ZhuInteractionProps) {
  const currentNode = DIALOGUE_TREE[nodeId] || DIALOGUE_TREE['intro'];
  const [typedText, setTypedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState<number | null>(null);
  const [showReplyMessage, setShowReplyMessage] = useState<string | null>(null);
  const [activeChoiceBonus, setActiveChoiceBonus] = useState<number>(0);
  const [starBurstTrigger, setStarBurstTrigger] = useState(false);
  const [highScore, setHighScore] = useState<number>(0);

  // Load high score from local storage on mount/view
  useEffect(() => {
    try {
      const saved = localStorage.getItem('xin_zhuang_high_score');
      if (saved) {
        setHighScore(parseInt(saved, 10));
      }
    } catch {}
  }, [nodeId]);

  // Ranking calculation according to final affection score
  const getEndingRank = (score: number) => {
    if (score >= 285) {
      return {
        title: "👑 三生有幸 ‧ 終身金石契",
        sub: "Destined Eternal Soulmates",
        desc: "你與八戒的默契契合已然超越了凡俗時空。在淡水河畔溫暖夕陽與斜陽清亮晚風的見證下，你們的心結成了千金不換的真摯誓約，將不離不棄，歲歲年年，永浴在最溫馨福順的香氣之中。❤️",
        badge: "👑 終焉‧天賜誓約良緣"
      };
    } else if (score >= 220) {
      return {
        title: "💖 浪漫升溫 ‧ 兩情相悅",
        sub: "Blushing Hearts & Sweet Aroma",
        desc: "帶有心形打孔的金黃鹹光餅，在八戒的心頭化成了最甜蜜的甘霖。你與他在古雅老街堤防上十指緊扣，傾聽著彼此面紅耳赤的噗通心跳，眼神滿是悠閒和深情眷戀。✨",
        badge: "💖 終焉‧心意相通良緣"
      };
    } else if (score >= 150) {
      return {
        title: "🐷 臭味相投 ‧ 歡樂冤家",
        sub: "Baking Companions & Cozy Foodies",
        desc: "一路上笑料百出、互相在鼻尖輕抹白生粉。雖然他是一隻只知道填飽肚子、搖大耳的貪嘴胖豬，但他對你毫無保留，把全部的港埠風雲古蹟神話搜括起來滔滔細數，是最溫暖甜蜜的美味旅伴。🍿",
        badge: "🐷 終焉‧笑淚相伴羈絆"
      };
    } else {
      return {
        title: "🏮 老街漫步 ‧ 萍水紅緣",
        sub: "Wandering Temple Street Admirers",
        desc: "在三百四十年慈祐宮斜陽薰黑的正殿白玉古銅鼎旁，你們一齊敬上清香合十默禱。儘管情緣剛剛起錨漫步，這古老廟街的縷縷輕煙，已在彼此心中烙印了不可磨滅的初識之緣。🌾",
        badge: "🏮 終焉‧萍水相逢初情"
      };
    }
  };

  // Typewriter effect
  useEffect(() => {
    setTypedText('');
    setIsTypingComplete(false);
    setSelectedChoiceIndex(null);
    setShowReplyMessage(null);
    
    let index = 0;
    const cleanText = currentNode.text;
    const interval = setInterval(() => {
      if (index < cleanText.length) {
        setTypedText((prev) => prev + cleanText.charAt(index));
        index++;
      } else {
        setIsTypingComplete(true);
        clearInterval(interval);
      }
    }, 28); // Nice typewriter speed

    return () => clearInterval(interval);
  }, [nodeId, currentNode.text]);

  const handleChoiceClick = (index: number) => {
    if (selectedChoiceIndex !== null) return; // Prevent double clicks
    
    setSelectedChoiceIndex(index);
    const choice = currentNode.choices[index];
    
    // Modify high level affection state in parent (which saves to local storage)
    onModifyAffection(choice.affectionBonus);
    setActiveChoiceBonus(choice.affectionBonus);
    setStarBurstTrigger(true);
    setTimeout(() => setStarBurstTrigger(false), 1200);

    if (choice.reply) {
      setShowReplyMessage(choice.reply);
    }
  };

  const handleNextAction = () => {
    if (selectedChoiceIndex === null) return;
    const choice = currentNode.choices[selectedChoiceIndex];
    
    // Check if the current node triggers a game action
    if (currentNode.action) {
      onFinishDialogue(currentNode.action);
    } else if (choice.nextId === 'play_game') {
      onFinishDialogue('START_GAME');
    } else {
      // Navigate to the next dialog node
      onFinishDialogue(undefined);
      // We trigger prop updates
      window.dispatchEvent(new CustomEvent('change_dialogue_node', { detail: choice.nextId }));
    }
  };

  const skipTypewriter = () => {
    if (!isTypingComplete) {
      setTypedText(currentNode.text);
      setIsTypingComplete(true);
    }
  };

  // Render Zhu Bajie's Vector Expressions using CSS + Inline SVGs
  const renderZhuAvatar = (expr: BajieExpression) => {
    return (
      <div className="relative w-48 h-48 sm:w-56 sm:h-56 filter drop-shadow-[0_10px_20px_rgba(251,113,133,0.15)] mx-auto select-none">
        
        {/* Ambient Halo behind Bajie matching emotion */}
        <div className={`absolute inset-4 rounded-full filter blur-2xl opacity-40 transition-all duration-700 ${
          expr === 'STARRY' && 'bg-yellow-400 scale-125 animate-pulse' ||
          expr === 'CRY' && 'bg-blue-600 scale-95' ||
          expr === 'SHY' && 'bg-rose-500 scale-110 animate-pulse' ||
          'bg-amber-500 scale-100'
        }`} />

        <svg viewBox="0 0 200 200" className="w-full h-full relative z-10 overflow-visible">
          {/* Definitions for gradients */}
          <defs>
            <radialGradient id="pigSkin" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffd1dc" />
              <stop offset="85%" stopColor="#ffb3c1" />
              <stop offset="100%" stopColor="#eb8fa0" />
            </radialGradient>
            <radialGradient id="snoutGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff0f4" />
              <stop offset="100%" stopColor="#ffccd5" />
            </radialGradient>
            <linearGradient id="blushGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff4d6d" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#ff758f" stopOpacity="0" />
            </linearGradient>
            <filter id="shadow">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* Sweating back curls / tail decoration visible */}
          <path d="M 40,110 Q 20,105 15,120 Q 25,130 35,122" fill="none" stroke="#eb8fa0" strokeWidth="4" strokeLinecap="round" />

          {/* Floppy Left Ear */}
          <g className={`transition-transform duration-500 origin-bottom-right ${
            expr === 'CRY' ? 'rotate-12 translate-y-2' : 
            expr === 'STARRY' ? '-rotate-12 -translate-y-1' : ''
          }`} style={{ transformOrigin: '80px 75px' }}>
            <path d="M 80,75 C 60,35 25,50 35,85 C 40,95 65,95 80,75 Z" fill="url(#pigSkin)" stroke="#eb8fa0" strokeWidth="2.5" />
            <path d="M 72,71 C 58,45 35,58 42,80 C 46,87 63,85 72,71 Z" fill="#ffccd5" />
          </g>

          {/* Floppy Right Ear */}
          <g className={`transition-transform duration-500 origin-bottom-left ${
            expr === 'CRY' ? '-rotate-12 translate-y-2' : 
            expr === 'STARRY' ? 'rotate-12 -translate-y-1' : ''
          }`} style={{ transformOrigin: '120px 75px' }}>
            <path d="M 120,75 C 140,35 175,50 165,85 C 160,95 135,95 120,75 Z" fill="url(#pigSkin)" stroke="#eb8fa0" strokeWidth="2.5" />
            <path d="M 128,71 C 142,45 165,58 158,80 C 154,87 137,85 128,71 Z" fill="#ffccd5" />
          </g>

          {/* Main Fat Chubby Head */}
          <ellipse cx="100" cy="110" rx="62" ry="52" fill="url(#pigSkin)" stroke="#eb8fa0" strokeWidth="3" filter="url(#shadow)" />

          {/* Shy Blushing cheeks */}
          {(expr === 'SHY' || expr === 'WINK') && (
            <g className="opacity-90">
              {/* Left blush block */}
              <ellipse cx="62" cy="120" rx="14" ry="8" fill="url(#blushGrad)" transform="rotate(-10 62 120)" />
              <line x1="56" y1="116" x2="64" y2="124" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="62" y1="116" x2="70" y2="124" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
              
              {/* Right blush block */}
              <ellipse cx="138" cy="120" rx="14" ry="8" fill="url(#blushGrad)" transform="rotate(10 138 120)" />
              <line x1="132" y1="116" x2="140" y2="124" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="138" y1="116" x2="146" y2="124" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
            </g>
          )}

          {/* Cutey eyes based on emotional expression */}
          <g className="transition-all duration-300">
            {expr === 'SMILE' && (
              <>
                {/* Laughing curved arches (^^) */}
                <path d="M 58,102 Q 68,90 78,102" fill="none" stroke="#2c1a1d" strokeWidth="4.5" strokeLinecap="round" />
                <path d="M 122,102 Q 132,90 142,102" fill="none" stroke="#2c1a1d" strokeWidth="4.5" strokeLinecap="round" />
              </>
            )}

            {expr === 'SHY' && (
              <>
                {/* Embarrassed closed bashful eyes */}
                <path d="M 55,103 Q 68,108 80,103" fill="none" stroke="#2c1a1d" strokeWidth="4.5" strokeLinecap="round" />
                <path d="M 120,103 Q 132,108 145,103" fill="none" stroke="#2c1a1d" strokeWidth="4.5" strokeLinecap="round" />
              </>
            )}

            {expr === 'WINK' && (
              <>
                {/* Left side wink, right side sparkling wide */}
                {/* Left: Wink line */}
                <path d="M 55,106 Q 66,98 77,106" fill="none" stroke="#2c1a1d" strokeWidth="4.5" strokeLinecap="round" />
                <path d="M 58,100 L 74,108" stroke="#ff4d6d" strokeWidth="3" strokeLinecap="round" />
                
                {/* Right: Round sparkling eye */}
                <circle cx="132" cy="100" r="10" fill="#2c1a1d" />
                <circle cx="129" cy="97" r="3.5" fill="#ffffff" />
                <circle cx="135" cy="103" r="1.5" fill="#ffffff" />
              </>
            )}

            {expr === 'CRY' && (
              <>
                {/* Sad downturned arcs with massive animation tears */}
                <path d="M 58,98 Q 68,110 78,98" fill="none" stroke="#2c1a1d" strokeWidth="4.5" strokeLinecap="round" />
                <path d="M 122,98 Q 132,110 142,98" fill="none" stroke="#2c1a1d" strokeWidth="4.5" strokeLinecap="round" />
                
                {/* Sad cute eyebrows */}
                <path d="M 55,84 Q 65,90 75,84" fill="none" stroke="#2c1a1d" strokeWidth="3" strokeLinecap="round" />
                <path d="M 125,84 Q 135,90 145,84" fill="none" stroke="#2c1a1d" strokeWidth="3" strokeLinecap="round" />

                {/* Sparkling blue teardrops dripping down */}
                <path d="M 64,103 Q 60,118 64,124 Q 68,118 64,103 Z" fill="#64b5f6" opacity="0.9" className="animate-bounce" />
                <path d="M 136,103 Q 140,118 136,124 Q 132,118 136,103 Z" fill="#64b5f6" opacity="0.9" className="animate-bounce" />
              </>
            )}

            {expr === 'STARRY' && (
              <>
                {/* Giant custom glowing yellow four-point star eyes */}
                {/* Left Star Eye */}
                <path d="M 68,85 Q 68,98 55,98 Q 68,98 68,111 Q 68,98 81,98 Q 68,98 68,85 Z" fill="#fbc02d" className="animate-pulse" />
                <circle cx="68" cy="98" r="3" fill="#ffffff" />

                {/* Right Star Eye */}
                <path d="M 132,85 Q 132,98 119,98 Q 132,98 132,111 Q 132,98 145,98 Q 132,98 132,85 Z" fill="#fbc02d" className="animate-pulse" />
                <circle cx="132" cy="98" r="3" fill="#ffffff" />
              </>
            )}

            {expr === 'HUNGRY' && (
              <>
                {/* Huge wet anime shiny eyes looking forward */}
                <circle cx="68" cy="100" r="11" fill="#2c1a1d" />
                <circle cx="65" cy="96" r="4" fill="#ffffff" />
                <circle cx="71" cy="104" r="2" fill="#ffffff" />
                
                <circle cx="132" cy="100" r="11" fill="#2c1a1d" />
                <circle cx="129" cy="96" r="4" fill="#ffffff" />
                <circle cx="135" cy="104" r="2" fill="#ffffff" />
              </>
            )}
          </g>

          {/* Chubby Pig Snout (Nose) */}
          <g id="pig-snout">
            <ellipse cx="100" cy="122" rx="20" ry="14" fill="url(#snoutGrad)" stroke="#eb778b" strokeWidth="2" />
            {/* Heart shaped or double-oval pig nostrils */}
            <ellipse cx="92" cy="122" rx="4" ry="5" fill="#7d132a" />
            <ellipse cx="108" cy="122" rx="4" ry="5" fill="#7d132a" />
          </g>

          {/* Cute Mouth & Drool details if hungry */}
          <g>
            {expr === 'CRY' && (
              /* Sad squiggly mouth */
              <path d="M 94,142 Q 100,137 106,142" fill="none" stroke="#2c1a1d" strokeWidth="3" strokeLinecap="round" />
            )}

            {expr === 'HUNGRY' && (
              <>
                {/* Open happy drool mouth */}
                <path d="M 91,137 Q 100,152 109,137 Z" fill="#b01d32" stroke="#2c1a1d" strokeWidth="2" />
                <path d="M 94,141 Q 100,147 106,141" fill="#ffa2b0" />
                {/* Dripping cyan drool drop */}
                <path d="M 107,139 Q 109,152 111,148 Q 112,152 107,139 Z" fill="#b3e5fc" className="animate-bounce" />
              </>
            )}

            {expr === 'SMILE' && (
              /* Happy open cheeky smile mouth */
              <path d="M 90,135 Q 100,154 110,135 Z" fill="#b01d32" stroke="#2c1a1d" strokeWidth="2.5" />
            )}

            {expr === 'SHY' && (
              /* Cute sheepish wavy lines mouth */
              <path d="M 92,138 Q 96,142 100,138 Q 104,134 108,138" fill="none" stroke="#2c1a1d" strokeWidth="3.5" strokeLinecap="round" />
            )}

            {expr === 'WINK' && (
              /* Cheeky cat-mouth smirk */
              <path d="M 91,138 Q 100,146 109,136" fill="none" stroke="#2c1a1d" strokeWidth="3.5" strokeLinecap="round" />
            )}

            {expr === 'STARRY' && (
              /* Amazed round gasp ('o' mouth) */
              <circle cx="100" cy="140" r="6" fill="#b01d32" stroke="#2c1a1d" strokeWidth="2" />
            )}
          </g>

          {/* Piggy Hand wave decoration */}
          <g className="animate-bounce" style={{ animationDuration: '2.5s' }}>
            <circle cx="42" cy="138" r="8" fill="#ffb3c1" stroke="#eb8fa0" strokeWidth="2" />
            <path d="M 42,134 L 42,142" stroke="#eb8fa0" strokeWidth="1.5" />
          </g>
        </svg>

        {/* Small flying golden hearts or magic stars when Affection bursts */}
        {starBurstTrigger && (
          <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center animate-fade-in">
            <span className="text-5xl animate-ping absolute text-rose-500">💖</span>
            <span className="text-4xl absolute -top-4 -left-4 animate-bounce text-yellow-500">✨</span>
            <span className="text-4xl absolute bottom-0 -right-4 animate-bounce text-yellow-500" style={{ animationDelay: '200ms' }}>✨</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`w-full max-w-2xl border rounded-2xl shadow-2xl p-6 relative overflow-hidden transition-all duration-1000 ${
      nodeId.startsWith('waterfront') || nodeId === 'gameover_high_affection'
        ? 'bg-gradient-to-b from-indigo-950 via-rose-950/90 to-amber-900/90 border-amber-600/30'
        : 'bg-stone-900 border-stone-850 backdrop-blur'
    }`} id="otome-zhu-interaction">
      
      {/* Seaside atmospheric background components */}
      {(nodeId.startsWith('waterfront') || nodeId === 'gameover_high_affection') && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0 opacity-40">
          {/* Glowing sunset sun */}
          <div className="absolute bottom-[-100px] left-1/2 -translate-x-1/2 w-96 h-96 bg-yellow-500/10 rounded-full filter blur-xl animate-pulse" style={{ background: 'radial-gradient(circle, rgba(234,179,8,0.25) 0%, rgba(239,68,68,0) 70%)' }} />
          {/* Wave ripple lines */}
          <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-cyan-900/20 to-transparent border-b border-yellow-500/10 animate-pulse" />
        </div>
      )}

      {/* Cozy story atmosphere subtitle */}
      <div className={`flex justify-center items-center p-3 rounded-xl border mb-5 relative z-10 shadow-inner ${
        (nodeId.startsWith('waterfront') || nodeId === 'gameover_high_affection')
          ? 'bg-black/40 border-amber-500/20'
          : 'bg-stone-950/40 border-stone-850/50'
      }`}>
        <p className="text-[11px] font-medium tracking-wider flex items-center gap-1.5 text-center select-none text-stone-300">
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-current animate-pulse" />
          <span>
            {nodeId.startsWith('waterfront') || nodeId === 'gameover_high_affection'
              ? '🌅 淡水河畔，夕陽微風拂面，與八戒在溫柔夜色中互訴心曲...'
              : '新莊廟街微風輕拂，八戒溫柔地守候在你身側 🏮'}
          </span>
        </p>
      </div>

      {/* Main Avatar Showcase */}
      <div className="mb-4 text-center">
        {renderZhuAvatar(currentNode.expression)}
      </div>

      {/* Cute dialog name tag */}
      <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-rose-600/90 to-amber-600/90 border border-rose-500/30 text-stone-100 rounded-tl-xl rounded-br-xl text-xs font-black tracking-wider shadow ml-1 select-none">
        <MessageSquareHeart className="w-3.5 h-3.5 fill-current text-white" />
        <span>🐷 豬八戒 Zhu Bajie</span>
      </div>

      {/* Dialogue Typewriter Box */}
      <div 
        onClick={skipTypewriter}
        className="bg-stone-950/85 border-2 border-stone-850 rounded-xl p-5 min-h-[105px] font-sans text-stone-100 text-sm tracking-wide leading-relaxed shadow-inner hover:border-stone-800 cursor-pointer transition-all relative mt-1"
      >
        <p className="font-medium">
          {typedText}
          {!isTypingComplete && <span className="inline-block w-2.5 h-4 bg-amber-400 animate-blink ml-1" />}
        </p>
        
        {isTypingComplete && (
          <div className="absolute right-3 bottom-2 text-stone-600 text-[10px] uppercase font-bold tracking-widest animate-pulse flex items-center gap-1 select-none">
            <span>點擊跳過</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        )}
      </div>

      {/* Reply Message Box and Actions */}
      {showReplyMessage ? (
        <div className="mt-5 space-y-4 animate-fade-in relative z-25">
          <div className="bg-stone-900/95 border border-stone-800 p-4 rounded-xl shadow-md text-stone-200 text-xs leading-relaxed">
            <span className="text-yellow-500 font-extrabold block mb-1">✨ 八戒的心聲 Reply:</span>
            {showReplyMessage}
          </div>
          
          <button
            onClick={handleNextAction}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-amber-950 font-black text-base py-3 px-6 rounded-xl shadow-lg hover:shadow-yellow-500/10 active:scale-95 transition-all outline-none cursor-pointer"
            id="zhu-dialogue-continue-btn"
          >
            <span>
              {currentNode.action === 'START_WORSHIP'
                ? '（牽右手與八戒並肩）開啟慈祐宮三殿祈福 🏮'
                : currentNode.id === 'temple_pray_intro'
                ? '（虔誠閉眼祈禱）與八戒一同祈請好運福順 🕯️'
                : currentNode.id === 'temple_pray_wish_ok' || currentNode.id === 'temple_pray_wish_teach'
                ? '（雙手捧好香火）將第一炷香穩穩奉插入爐 🏺'
                : currentNode.id.startsWith('waterfront')
                ? '（牽手漫步長堤）繼續聆聽老街風雲 🌅'
                : currentNode.action === 'START_GAME' || (selectedChoiceIndex !== null && currentNode.choices[selectedChoiceIndex].nextId === 'play_game')
                ? '（牽起八戒的手）美味大出發 🥯'
                : '（與八戒並肩前行）繼續逛廟街 👣'}
            </span>
            <ChevronRight className="w-4 h-4 text-amber-950 stroke-[3]" />
          </button>
        </div>
      ) : (
        /* Dialogue Choices (reveal only when typewriter is finished) */
        isTypingComplete && (
          nodeId === 'waterfront_final' ? (
            <div className="mt-5 space-y-4 animate-fade-in relative z-20 w-full text-stone-200">
              {/* Grand Ending Certificate Frame */}
              <div className="bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-amber-500/15 border-2 border-dashed border-amber-500/50 p-5 rounded-2xl relative overflow-hidden shadow-2xl backdrop-blur-md">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
                
                <div className="text-center mb-5">
                  <span className="bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-450 text-stone-950 text-[10px] sm:text-xs uppercase font-extrabold px-3.5 py-1 rounded-full border border-yellow-300/30 shadow-lg tracking-widest select-none">
                    🏆 旅程通關 ‧ 廟街大團圓 🏆
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-amber-350 font-serif mt-3 tracking-wide drop-shadow-md">
                    新莊廟街情緣成就碑
                  </h3>
                  <div className="text-[10px] text-stone-400 font-mono tracking-widest mt-1 uppercase">
                    Retro Romance & Heritage Experience
                  </div>
                </div>

                {/* Rank & Evaluation Block */}
                <div className="bg-stone-950/95 border-2 border-stone-850 rounded-xl p-4 sm:p-5 mb-4 shadow-inner relative overflow-hidden text-center">
                  <div className="absolute top-2 right-2 text-[9px] font-mono font-bold bg-rose-500/15 text-rose-400 px-2 py-0.5 rounded border border-rose-500/20 select-none">
                    {getEndingRank(affectionScore).badge}
                  </div>
                  
                  <div className="text-[10px] font-black tracking-widest uppercase text-rose-400 mb-1">
                    💖 終焉結成緣分 💖
                  </div>
                  <div className="text-lg sm:text-xl font-black text-yellow-450 font-serif tracking-wide drop-shadow mb-1 animate-pulse">
                    {getEndingRank(affectionScore).title}
                  </div>
                  <p className="text-[10px] text-stone-500 font-mono mb-3.5 uppercase tracking-wider leading-none">
                    {getEndingRank(affectionScore).sub}
                  </p>
                  
                  <div className="border-t border-stone-850/60 pt-3 text-xs text-stone-300 font-serif leading-relaxed text-left pl-2 relative border-l-2 border-l-rose-500/40">
                    <span className="text-emerald-500/80 font-bold block mb-1 text-[10px] not-italic uppercase font-sans tracking-wider">評定箋 Summary</span>
                    「 {getEndingRank(affectionScore).desc} 」
                  </div>
                </div>

                {/* Score & Stamp Achievements */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-stone-950/80 p-3 rounded-xl border border-stone-850 text-center flex flex-col justify-center shadow-lg">
                    <span className="text-[9px] font-bold text-stone-500 uppercase tracking-wider">❤️ 終點累計好感</span>
                    <span className="text-lg font-extrabold text-pink-400 mt-0.5 font-mono">{affectionScore} 點</span>
                    <span className="text-[8px] text-stone-600 font-mono mt-0.5">Affection Score</span>
                  </div>
                  <div className="bg-stone-950/80 p-3 rounded-xl border border-stone-850 text-center flex flex-col justify-center shadow-lg">
                    <span className="text-[9px] font-bold text-stone-500 uppercase tracking-wider">🥯 烤包最高得分</span>
                    <span className="text-lg font-extrabold text-yellow-400 mt-0.5 font-mono">{highScore} 分</span>
                    <span className="text-[8px] text-stone-600 font-mono mt-0.5">High Score Record</span>
                  </div>
                </div>

                {/* Adventure Milestones Timeline Stamps */}
                <div className="bg-stone-950/60 border border-stone-850 p-3 rounded-xl mb-4 shadow-inner">
                  <div className="text-[9px] font-bold text-stone-500 uppercase tracking-widest pl-1 mb-2">
                    🎯 新莊廟會三大功德印記
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-stone-900/60 p-2 rounded-lg border border-emerald-900/30 text-center">
                      <div className="text-base">🥯</div>
                      <div className="text-[9px] font-bold text-emerald-400 mt-1 leading-none">1. 手作金光餅</div>
                      <div className="text-[8px] text-stone-600 mt-0.5 font-mono">100% SUCCESS</div>
                    </div>
                    <div className="bg-stone-900/60 p-2 rounded-lg border border-emerald-900/30 text-center">
                      <div className="text-base">🏮</div>
                      <div className="text-[9px] font-bold text-emerald-400 mt-1 leading-none">2. 慈祐宮三殿</div>
                      <div className="text-[8px] text-stone-600 mt-0.5 font-mono">100% PRAYER</div>
                    </div>
                    <div className="bg-stone-900/60 p-2 rounded-lg border border-emerald-900/30 text-center">
                      <div className="text-base">🌸</div>
                      <div className="text-[9px] font-bold text-emerald-400 mt-1 leading-none">3. 平安收涎禮</div>
                      <div className="text-[8px] text-stone-600 mt-0.5 font-mono">100% CLEANED</div>
                    </div>
                  </div>
                </div>

                {/* Heartfelt dialogue from Bajie */}
                <div className="bg-rose-955/20 bg-opacity-40 p-4 rounded-xl border border-rose-500/20 text-xs text-rose-200/95 leading-relaxed font-serif relative mb-5 shadow overflow-hidden">
                  <div className="absolute top-1 right-2 opacity-5 pointer-events-none select-none text-4xl">🐷</div>
                  <p className="pl-6 italic relative">
                    <span className="absolute left-0 top-0 text-xl text-rose-400">“</span>
                    能遇到施主，真是我老豬這輩子最福順的緣分。取不取經成仙做佛，全都不及此時此刻與施主在此老堤防共攜手、共享剛出爐的甜蜜平安餅... 願歲歲年年，與子偕老，永遠不分開！
                    <span className="text-xl text-rose-400">”</span>
                  </p>
                </div>

                {/* Ultimate choices rendered inside the certificate card */}
                <div className="space-y-2.5">
                  <div className="text-[9px] font-black text-amber-500/80 text-center tracking-widest uppercase select-none">
                    🔮 請選擇您與八戒的最終歸宿 🔮
                  </div>
                  {currentNode.choices.map((choice, index) => (
                    <button
                      key={index}
                      onClick={() => handleChoiceClick(index)}
                      className="w-full text-left p-3.5 bg-stone-950 hover:bg-rose-500/15 active:bg-rose-500/25 text-stone-200 hover:text-stone-100 rounded-xl border border-amber-500/25 hover:border-rose-400 text-xs font-black leading-relaxed transition-all duration-250 outline-none flex justify-between items-center hover:-translate-y-0.5 cursor-pointer shadow-md"
                    >
                      <span>{choice.text}</span>
                      <span className="text-rose-400 font-bold select-none text-xs">✨</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-5 space-y-2.5 relative z-20">
              {currentNode.choices.map((choice, index) => (
                <button
                  key={index}
                  onClick={() => handleChoiceClick(index)}
                  className="w-full text-left p-3.5 bg-stone-950/30 hover:bg-rose-500/10 active:bg-rose-500/20 text-stone-200 hover:text-stone-100 rounded-xl border border-stone-850 hover:border-rose-500/30 text-xs font-semibold leading-relaxed transition-all duration-250 outline-none flex justify-between items-center hover:translate-x-1 cursor-pointer"
                >
                  <span>{choice.text}</span>
                  <span className="text-rose-400/80 text-xs select-none">💖</span>
                </button>
              ))}
            </div>
          )
        )
      )}

      {/* Tiny decorative border lanterns */}
      <div className="absolute top-2 right-2 text-xl opacity-20 pointer-events-none select-none">
        🏮
      </div>
      <div className="absolute bottom-2 left-2 text-xl opacity-20 pointer-events-none select-none">
        🏮
      </div>

    </div>
  );
}
