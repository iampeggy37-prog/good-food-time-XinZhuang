import React, { useEffect, useRef, useState } from 'react';
import { GameState, Player, Food, Particle } from '../types';
import { playJumpSound, playCollectSound, playGameOverSound } from '../utils/audio';
import { Sparkles, Trophy, RotateCcw, Volume2, Play, Pause, Swords, RefreshCw, Smartphone } from 'lucide-react';
import { WorshipStage } from './WorshipStage';
import { BiscuitMaker } from './BiscuitMaker';

interface GameCanvasProps {
  onScoreChange?: (score: number) => void;
  onSatietyChange?: (satiety: number) => void;
  onStateChange?: (state: GameState) => void;
}

export default function GameCanvas({ onScoreChange, onSatietyChange, onStateChange }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Game states we expose to React UI for overlays
  const [gameState, setGameState] = useState<GameState>('START');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [satiety, setSatiety] = useState(100);
  
  // Character visual style tracker ('PIG' or 'RED_BLOCK')
  const [charStyle, setCharStyle] = useState<'PIG' | 'RED_BLOCK'>('PIG');
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  
  // Touch controls / Mobile layout helpers
  const [showTouchPrompt, setShowTouchPrompt] = useState(false);

  // --- FIVE-STAGE SCENE SYSTEM STATES (for narrative expansion) ---
  const [currentScene, setCurrentScene] = useState<string>('scene1');
  const [sceneOpacity, setSceneOpacity] = useState<number>(1);
  const [incenseCount, setIncenseCount] = useState<number>(3);
  const [worshipStep, setWorshipStep] = useState<number>(1); // 1: 天公爐, 2: 正殿, 3: 後殿, 4: 完成
  const [worshipText, setWorshipText] = useState<string>("來到廟埕外側。");

  const switchScene = (sceneId: string) => {
    setSceneOpacity(0);
    setTimeout(() => {
      setCurrentScene(sceneId);
      stateRef.current.currentScene = sceneId;
      
      // Automatically trigger game start when switching to scene2
      if (sceneId === 'scene2') {
        startGame();
      }
      setSceneOpacity(1);
    }, 400);
  };

  const handleWorshipSceneStep = () => {
    if (worshipStep === 1) {
      setIncenseCount(2);
      setWorshipStep(2);
      setWorshipText("天公爐參拜完成。裊裊輕煙升起，帶著你們的姓名與誠心直達天聽。\n隨後，進入正殿。");
      playJumpSound();
    } else if (worshipStep === 2) {
      setIncenseCount(1);
      setWorshipStep(3);
      setWorshipText("向主祀天上聖母稟報祈願完成。\n接著，穿過天井至後殿。");
      playJumpSound();
    } else if (worshipStep === 3) {
      setIncenseCount(0);
      setWorshipStep(4);
      setWorshipText("穿過天井至後殿，向觀音佛祖與眾神參拜。最後一炷香奉畢。\n參拜圓滿完成，心誠則靈！");
      playCollectSound();
    }
  };

  const resetWorshipSystem = () => {
    setIncenseCount(3);
    setWorshipStep(1);
    setWorshipText("來到廟埕外側。");
  };

  // --- DRUOL-CLEANSING SYSTEM FOR SCENE 3 ---
  interface DroolDrop {
    id: number;
    x: number; // percentage width
    y: number; // percentage height
    size: number;
    cleaned: boolean;
  }

  const [droolDrops, setDroolDrops] = useState<DroolDrop[]>([
    { id: 1, x: 38, y: 56, size: 22, cleaned: false },
    { id: 2, x: 44, y: 62, size: 28, cleaned: false },
    { id: 3, x: 50, y: 58, size: 30, cleaned: false },
    { id: 4, x: 56, y: 63, size: 24, cleaned: false },
    { id: 5, x: 62, y: 57, size: 20, cleaned: false },
    { id: 6, x: 48, y: 68, size: 26, cleaned: false },
    { id: 7, x: 32, y: 62, size: 18, cleaned: false },
    { id: 8, x: 68, y: 63, size: 18, cleaned: false },
  ]);

  const [droolProgress, setDroolProgress] = useState<number>(0);
  const [wiperX, setWiperX] = useState<number>(50);
  const [wiperY, setWiperY] = useState<number>(50);
  const [isWipingHover, setIsWipingHover] = useState<boolean>(false);
  const [shouXianBlessingText, setShouXianBlessingText] = useState<string>("請手持溫熱鹹光餅，在八戒嘴角周圍滑動或點擊以擦乾涎水...");

  const handleWipeDrool = (id: number) => {
    setDroolDrops(prev => {
      const updated = prev.map(drop => drop.id === id ? { ...drop, cleaned: true } : drop);
      const cleanedCount = updated.filter(d => d.cleaned).length;
      const totalCount = updated.length;
      const progress = Math.round((cleanedCount / totalCount) * 100);
      setDroolProgress(progress);
      
      if (progress === 0) {
        setShouXianBlessingText("請手持溫熱鹹光餅，在八戒嘴角周圍滑動或點擊以擦乾涎水...");
      } else if (progress <= 25) {
        setShouXianBlessingText("「收涎收灕灕，明年招小弟！」🌸");
      } else if (progress <= 50) {
        setShouXianBlessingText("「收涎收乾乾，嘸通流口水！」口水收乾乾，八戒真可愛！🌱");
      } else if (progress <= 75) {
        setShouXianBlessingText("「收涎收灕灕，大漢好脾氣！」事事如意少發脾氣！✨");
      } else if (progress < 100) {
        setShouXianBlessingText("「收涎收乾乾，大漢做好官！」聰明過人，一生大富貴！🎓");
      } else {
        setShouXianBlessingText("「收涎收乾乾，八戒平安健康萬事吉！」收涎大功告成！🌸✨💖");
        playCollectSound();
      }
      return updated;
    });
    playCollectSound();
  };

  const resetDroolSystem = () => {
    setDroolDrops([
      { id: 1, x: 38, y: 56, size: 22, cleaned: false },
      { id: 2, x: 44, y: 62, size: 28, cleaned: false },
      { id: 3, x: 50, y: 58, size: 30, cleaned: false },
      { id: 4, x: 56, y: 63, size: 24, cleaned: false },
      { id: 5, x: 62, y: 57, size: 20, cleaned: false },
      { id: 6, x: 48, y: 68, size: 26, cleaned: false },
      { id: 7, x: 32, y: 62, size: 18, cleaned: false },
      { id: 8, x: 68, y: 63, size: 18, cleaned: false },
    ]);
    setDroolProgress(0);
    setShouXianBlessingText("請手持溫熱鹹光餅，在八戒嘴角周圍滑動或點擊以擦乾涎水...");
  };

  // Ciyou Temple Worship Interactive States & Ritual References
  const [worshipProgress, setWorshipProgress] = useState(0);
  const [isActiveWorshipPressed, setIsActiveWorshipPressed] = useState(false);
  const [worshipTextList, setWorshipTextList] = useState<{ id: number; text: string; x: number; y: number }[]>([]);
  const nextFloatTextId = useRef(0);
  const floatTexts = [
    "消災解厄 🌸", 
    "闔家平安 🏮", 
    "大吉大利 🍊", 
    "八戒飽食 🐷", 
    "福氣滿滿 ✨", 
    "平安康泰 🍃", 
    "增祥納福 📿",
    "心想事成 💖",
    "神明保佑 🕯️",
    "美味大豐收 🌾"
  ];

  // Use refs for the animation loop to prevent lag and state-delay issues
  const stateRef = useRef<{
    gameState: GameState;
    currentScene: string;
    score: number;
    highScore: number;
    satiety: number;
    player: Player;
    foods: Food[];
    particles: Particle[];
    keys: { [key: string]: boolean };
    frameId: number;
    foodSpawnTimer: number;
    lanternOffset: number;
    screenShake: number;
    lastTime: number;
  }>({
    gameState: 'START',
    currentScene: 'scene1',
    score: 0,
    highScore: 0,
    satiety: 100,
    player: {
      x: 380, // centered
      y: 320,
      width: 40,
      height: 40,
      vx: 0,
      vy: 0,
      speed: 5,
      jumpPower: -15,
      isGrounded: false,
      facing: 'RIGHT',
      animFrame: 0,
      isMoving: false,
    },
    foods: [],
    particles: [],
    keys: {
      ArrowLeft: false,
      ArrowRight: false,
      ArrowUp: false,
      KeyA: false,
      KeyD: false,
      KeyW: false,
      Space: false,
    },
    frameId: 0,
    foodSpawnTimer: 0,
    lanternOffset: 0,
    screenShake: 0,
    lastTime: 0,
  });

  // Load High Score
  useEffect(() => {
    try {
      const savedHighScore = localStorage.getItem('xin_zhuang_high_score');
      if (savedHighScore) {
        const hsValue = parseInt(savedHighScore, 10);
        setHighScore(hsValue);
        stateRef.current.highScore = hsValue;
      }
    } catch (e) {
      console.warn('Could not read high score from local storage', e);
    }

    // Detect if touchscreen is available
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      setShowTouchPrompt(true);
    }
  }, []);

  // Sync state back to React hooks & Callbacks
  const updateReactState = (s: GameState, sc: number, sat: number) => {
    setGameState(s);
    setScore(sc);
    setSatiety(sat);
    
    if (onScoreChange) onScoreChange(sc);
    if (onSatietyChange) onSatietyChange(sat);
    if (onStateChange) onStateChange(s);
    
    if (sc > highScore) {
      setHighScore(sc);
      stateRef.current.highScore = sc;
      try {
        localStorage.setItem('xin_zhuang_high_score', sc.toString());
      } catch (err) {
        // ignore
      }
    }
  };

  // Main gameplay settings
  const gravity = 0.8;
  const friction = 0.82;
  const satietyDrainRate = 0; // Drains 0 satiety per second now! Purely additive based on food!

  // Trigger game start / reset
  const startGame = () => {
    const current = stateRef.current;
    current.gameState = 'PLAYING';
    current.score = 0;
    current.satiety = 20;
    current.foods = [];
    current.particles = [];
    current.foodSpawnTimer = 0;
    current.screenShake = 0;
    current.player = {
      x: 380,
      y: 320,
      width: 40,
      height: 40,
      vx: 0,
      vy: 0,
      speed: 5.5,
      jumpPower: -15,
      isGrounded: false,
      facing: 'RIGHT',
      animFrame: 0,
      isMoving: false,
    };
    
    setScore(0);
    setSatiety(20);
    setGameState('PLAYING');
    updateReactState('PLAYING', 0, 20);
  };

  // Main savory biscuit game challenge starts after the worship ritual completes at 100%
  const startMainGame = () => {
    const current = stateRef.current;
    current.gameState = 'PLAYING';
    current.score = 0;
    current.satiety = 20;
    current.foods = [];
    current.particles = [];
    current.foodSpawnTimer = 0;
    current.screenShake = 0;
    current.player = {
      x: 380,
      y: 320,
      width: 40,
      height: 40,
      vx: 0,
      vy: 0,
      speed: 5.5,
      jumpPower: -15,
      isGrounded: false,
      facing: 'RIGHT',
      animFrame: 0,
      isMoving: false,
    };
    
    updateReactState('PLAYING', 0, 20);
  };

  // Click on incense burner
  const handleWorshipInteraction = () => {
    const current = stateRef.current;
    if (current.gameState !== 'WORSHIP' || worshipProgress >= 100) return;

    setWorshipProgress(prev => {
      const next = prev + 6; // Click increments faster
      if (next >= 100) {
        playCollectSound();
        setTimeout(() => {
          startMainGame();
        }, 800);
        return 100;
      }
      return next;
    });

    // Spawn a floating text near burner
    const textStr = floatTexts[Math.floor(Math.random() * floatTexts.length)];
    const textObject = {
      id: nextFloatTextId.current++,
      text: textStr,
      x: (Math.random() - 0.5) * 160, // offset centering
      y: -50 + (Math.random() - 0.5) * 30,
    };
    
    setWorshipTextList(prev => [...prev.slice(-10), textObject]);
    
    // Play subtle jump sound as sound feedback
    playJumpSound();

    // Push sparkles to canvas
    for (let i = 0; i < 8; i++) {
      current.particles.push({
        x: 400 + (Math.random() - 0.5) * 80,
        y: 280 + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 4,
        vy: -1.5 - Math.random() * 3,
        radius: Math.random() * 3.5 + 1.5,
        color: ['#ffe853', '#f39c12', '#ffa2b0', '#ffffff'][Math.floor(Math.random() * 4)],
        alpha: 0.95,
        life: 0,
        maxLife: 25 + Math.random() * 15,
      });
    }
  };

  // Continuous long-press / hold effect
  useEffect(() => {
    const current = stateRef.current;
    if (!isActiveWorshipPressed || current.gameState !== 'WORSHIP' || worshipProgress >= 100) return;

    const interval = setInterval(() => {
      setWorshipProgress(prev => {
        const next = prev + 1.4; // smooth progression rate
        if (next >= 100) {
          playCollectSound();
          clearInterval(interval);
          setTimeout(() => {
            startMainGame();
          }, 800);
          return 100;
        }
        return next;
      });

      // Spawn a random prayer term occasionally while holding
      if (Math.random() < 0.15) {
        const textStr = floatTexts[Math.floor(Math.random() * floatTexts.length)];
        const textObject = {
          id: nextFloatTextId.current++,
          text: textStr,
          x: (Math.random() - 0.5) * 160,
          y: -50 + (Math.random() - 0.5) * 30,
        };
        setWorshipTextList(prev => [...prev.slice(-10), textObject]);
      }

      // Add incense smoke particles on the canvas in background
      if (Math.random() < 0.45) {
        current.particles.push({
          x: 400 + (Math.random() - 0.5) * 60,
          y: 280,
          vx: (Math.random() - 0.5) * 1.8,
          vy: -1.2 - Math.random() * 2.2,
          radius: Math.random() * 3 + 1,
          color: '#e2d3c5', // light incense grey-white smoke color
          alpha: 0.8,
          life: 0,
          maxLife: 40 + Math.random() * 20,
        });
      }
    }, 35);

    return () => clearInterval(interval);
  }, [isActiveWorshipPressed, worshipProgress]);

  // Toggle Pause
  const togglePause = () => {
    const current = stateRef.current;
    if (current.gameState === 'PLAYING') {
      current.gameState = 'PAUSED';
      updateReactState('PAUSED', current.score, current.satiety);
    } else if (current.gameState === 'PAUSED') {
      current.gameState = 'PLAYING';
      updateReactState('PLAYING', current.score, current.satiety);
    }
  };

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keys = stateRef.current.keys;
      if (keys.hasOwnProperty(e.code) || e.code === 'KeyW' || e.code === 'KeyA' || e.code === 'KeyD' || e.code === 'Space') {
        // Prevent scroll on space & arrow keys
        if (['ArrowUp', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
          e.preventDefault();
        }
        keys[e.code] = true;
      }
      
      // Handle Pause
      if (e.code === 'KeyP' || e.code === 'Escape') {
        togglePause();
      }
      
      // Handle Start / Retry on Enter
      if (e.code === 'Enter' || e.code === 'Space') {
        if (stateRef.current.gameState === 'START' || stateRef.current.gameState === 'GAMEOVER') {
          startGame();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const keys = stateRef.current.keys;
      if (keys.hasOwnProperty(e.code) || e.code === 'KeyW' || e.code === 'KeyA' || e.code === 'KeyD' || e.code === 'Space') {
        keys[e.code] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const handleStartEvent = () => {
      switchScene('scene2');
    };
    const handleWorshipEvent = () => {
      switchScene('scene4');
    };
    const handleCookingEvent = () => {
      switchScene('scene1');
    };

    window.addEventListener('start_arcade_game', handleStartEvent);
    window.addEventListener('start_worship_game', handleWorshipEvent);
    window.addEventListener('start_cooking_game', handleCookingEvent);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('start_arcade_game', handleStartEvent);
      window.removeEventListener('start_worship_game', handleWorshipEvent);
      window.removeEventListener('start_cooking_game', handleCookingEvent);
    };
  }, [highScore]);

  // Audio Context Activator on Page Click (due to browser audio autoplay policy)
  useEffect(() => {
    const activateAudio = () => {
      if (typeof window !== 'undefined') {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const tempCtx = new AudioContextClass();
          tempCtx.resume();
        }
      }
      window.removeEventListener('click', activateAudio);
      window.removeEventListener('keydown', activateAudio);
      window.removeEventListener('touchstart', activateAudio);
    };
    
    window.addEventListener('click', activateAudio);
    window.addEventListener('keydown', activateAudio);
    window.addEventListener('touchstart', activateAudio);
    
    return () => {
      window.removeEventListener('click', activateAudio);
      window.removeEventListener('keydown', activateAudio);
      window.removeEventListener('touchstart', activateAudio);
    };
  }, []);

  // Update logic (runs within game loop)
  const updateGame = () => {
    const current = stateRef.current;
    
    if (current.gameState === 'WORSHIP') {
      current.lanternOffset += 0.035; // keep lanterns swaying during worship
      
      // Update particles
      for (let i = current.particles.length - 1; i >= 0; i--) {
        const p = current.particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy -= 0.02; // Smoke / sparkles draft effect upwards
        p.alpha = 1 - p.life / p.maxLife;

        if (p.life >= p.maxLife || p.alpha <= 0) {
          current.particles.splice(i, 1);
        }
      }
      return;
    }

    if (current.gameState !== 'PLAYING') return;

    // 1. Satiety bounds check
    if (current.satiety <= 0) {
      current.satiety = 0;
      current.gameState = 'GAMEOVER';
      playGameOverSound();
      updateReactState('GAMEOVER', current.score, 0);
      return;
    }

    // Update screen shake decay
    if (current.screenShake > 0) {
      current.screenShake -= 0.1;
    }

    // 2. Player horizontal movement
    const movingLeft = current.keys.ArrowLeft || current.keys.KeyA;
    const movingRight = current.keys.ArrowRight || current.keys.KeyD;
    const jumpRequested = current.keys.ArrowUp || current.keys.KeyW || current.keys.Space;

    current.player.isMoving = movingLeft || movingRight;

    if (movingRight) {
      current.player.vx += current.player.speed * 0.18;
      current.player.facing = 'RIGHT';
    }
    if (movingLeft) {
      current.player.vx -= current.player.speed * 0.18;
      current.player.facing = 'LEFT';
    }

    current.player.vx *= friction;

    // 3. Player jump logic
    if (jumpRequested && current.player.isGrounded) {
      current.player.vy = current.player.jumpPower;
      current.player.isGrounded = false;
      playJumpSound();
      
      // Kick off dust particles on jump
      for (let i = 0; i < 6; i++) {
        current.particles.push({
          x: current.player.x + current.player.width / 2,
          y: current.player.y + current.player.height,
          vx: (Math.random() - 0.5) * 3,
          vy: -Math.random() * 2,
          radius: Math.random() * 3 + 2,
          color: 'rgba(235, 220, 200, 0.6)',
          alpha: 0.8,
          life: 0,
          maxLife: 20 + Math.random() * 15,
        });
      }
    }

    // Gravity
    current.player.vy += gravity;

    // Apply movement
    current.player.x += current.player.vx;
    current.player.y += current.player.vy;

    // Boundary constraints
    if (current.player.x < 0) {
      current.player.x = 0;
      current.player.vx = 0;
    }
    if (current.player.x + current.player.width > 800) {
      current.player.x = 800 - current.player.width;
      current.player.vx = 0;
    }

    // Ground collision
    const groundLevel = 400 - 40; // 40px traditional brick pavement border
    if (current.player.y + current.player.height >= groundLevel) {
      current.player.y = groundLevel - current.player.height;
      
      // Handle sound-less landing puff
      if (!current.player.isGrounded && current.player.vy > 3) {
        for (let i = 0; i < 4; i++) {
          current.particles.push({
            x: current.player.x + (i === 0 ? 0 : i === 1 ? current.player.width : current.player.width / 2),
            y: groundLevel,
            vx: (Math.random() - 0.5) * 2,
            vy: -Math.random() * 1,
            radius: Math.random() * 2 + 1.5,
            color: 'rgba(220, 205, 185, 0.7)',
            alpha: 0.7,
            life: 0,
            maxLife: 15,
          });
        }
      }
      
      current.player.vy = 0;
      current.player.isGrounded = true;
    }

    // Animation frames update
    if (current.player.isMoving) {
      current.player.animFrame += 0.15;
    } else {
      current.player.animFrame += 0.02; // soft breathing idle
    }

    // 4. Food drop generation
    current.foodSpawnTimer++;
    // Drop food every 1.2 to 1.5 seconds, accelerates slightly based on score
    const spawnRate = Math.max(45, 85 - Math.floor(current.score / 20) * 4);
    if (current.foodSpawnTimer >= spawnRate) {
      current.foodSpawnTimer = 0;
      
      const isGolden = Math.random() < 0.12; // 12% golden salty bread
      const isRotten = !isGolden && Math.random() < 0.15; // 15% sour burnt bread
      
      let type: 'NORMAL' | 'GOLDEN' | 'ROTTEN' = 'NORMAL';
      let satietyRestore = 15;
      let points = 10;
      let color = '#f5c35c'; // Normal golden bread

      if (isGolden) {
        type = 'GOLDEN';
        satietyRestore = 25;
        points = 25;
        color = '#fff066'; // Glowing gold bread
      } else if (isRotten) {
        type = 'ROTTEN';
        satietyRestore = -12;
        points = -5;
        color = '#544738'; // Dark moldy bread
      }

      const radius = 13 + Math.random() * 3;
      const x = radius + Math.random() * (800 - radius * 2);
      const speedY = 2 + Math.random() * 2.5 + Math.min(2.5, current.score * 0.05); // Speed escalates
      const speedX = (Math.random() - 0.5) * 1.5; // Slight drift
      const rotSpeed = (Math.random() - 0.5) * 0.08;

      current.foods.push({
        id: Math.random().toString(36).substr(2, 9),
        x,
        y: -10,
        radius,
        speedX,
        speedY,
        rotation: Math.random() * Math.PI,
        rotSpeed,
        points,
        satietyRestore,
        type,
        color,
      });
    }

    // 5. Update Food Physics & Collision
    for (let i = current.foods.length - 1; i >= 0; i--) {
      const food = current.foods[i];
      food.x += food.speedX;
      food.y += food.speedY;
      food.rotation += food.rotSpeed;

      // Bounce off walls
      if (food.x - food.radius < 0) {
        food.x = food.radius;
        food.speedX *= -0.8;
      }
      if (food.x + food.radius > 800) {
        food.x = 800 - food.radius;
        food.speedX *= -0.8;
      }

      // Check collision with Player
      // Approximating box bounds for player, food center
      const px = current.player.x;
      const py = current.player.y;
      const pw = current.player.width;
      const ph = current.player.height;

      // Nearest point on player rectangle to food center
      const closestX = Math.max(px, Math.min(food.x, px + pw));
      const closestY = Math.max(py, Math.min(food.y, py + ph));

      const dx = food.x - closestX;
      const dy = food.y - closestY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < food.radius) {
        // Yum! Collided!
        playCollectSound();
        current.score = Math.max(0, current.score + food.points);
        current.satiety = Math.min(100, Math.max(0, current.satiety + food.satietyRestore));
        
        // Victory check: Is Bajie full? (Satiety hits 100/100)
        if (current.satiety >= 100) {
          current.satiety = 100;
          current.gameState = 'VICTORY';
          updateReactState('VICTORY', current.score, 100);
          // Spawn extra celebrate particles!
          for (let k = 0; k < 30; k++) {
            const angle = Math.random() * Math.PI * 2;
            const mag = 2 + Math.random() * 5;
            current.particles.push({
              x: closestX,
              y: closestY,
              vx: Math.cos(angle) * mag,
              vy: Math.sin(angle) * mag - 3,
              radius: Math.random() * 4 + 2,
              color: k % 3 === 0 ? '#ff85a2' : k % 3 === 1 ? '#ffeb3b' : '#ffc107',
              alpha: 1.0,
              life: 0,
              maxLife: 40 + Math.random() * 30,
            });
          }
        }
        
        // Spawn yummy splash particles
        const numParticles = food.type === 'GOLDEN' ? 16 : food.type === 'ROTTEN' ? 8 : 10;
        const particleColor = food.type === 'GOLDEN' ? '#ffe853' : food.type === 'ROTTEN' ? '#705c48' : '#ffeb85';
        
        for (let j = 0; j < numParticles; j++) {
          const angle = Math.random() * Math.PI * 2;
          const mag = 1.5 + Math.random() * 4;
          current.particles.push({
            x: food.x,
            y: food.y,
            vx: Math.cos(angle) * mag,
            vy: Math.sin(angle) * mag - 1,
            radius: Math.random() * 3 + 2,
            color: particleColor,
            alpha: 1.0,
            life: 0,
            maxLife: 25 + Math.random() * 20,
          });
        }

        // Short feedback texts (e.g. +15, +25, -12) inside particles as flying texts!
        const scoreTxtColor = food.type === 'GOLDEN' ? '#fff44f' : food.type === 'ROTTEN' ? '#ff6666' : '#ffd019';
        const txtPrefix = food.satietyRestore > 0 ? '+' : '';
        const particleText = `${txtPrefix}${food.satietyRestore} 飽食`;
        
        // Let's create a customized text particle by abusing standard particle properties (we'll draw it as text!)
        current.particles.push({
          x: current.player.x + current.player.width / 2,
          y: current.player.y - 12,
          vx: (Math.random() - 0.5) * 1,
          vy: -2 - Math.random() * 1.2,
          radius: 999, // Flag indicating this is a text particle
          color: scoreTxtColor,
          alpha: 1.0,
          life: 0,
          maxLife: 45,
        });

        // Trigger screen shake slightly of visual kick
        current.screenShake = food.type === 'GOLDEN' ? 3 : food.type === 'ROTTEN' ? 4 : 1.5;

        // Remove food
        current.foods.splice(i, 1);
        continue;
      }

      // Check off-screen fallback
      if (food.y - food.radius > 400) {
        current.foods.splice(i, 1);
      }
    }

    // 6. Update general particles
    for (let i = current.particles.length - 1; i >= 0; i--) {
      const p = current.particles[i];
      p.life++;
      p.x += p.vx;
      p.y += p.vy;

      // slow deceleration of gravity
      if (p.radius < 50) { // regular dust deceleration
        p.vy += 0.05;
      }
      p.alpha = 1 - p.life / p.maxLife;

      if (p.life >= p.maxLife) {
        current.particles.splice(i, 1);
      }
    }

    // Render stats back periodically to React UI to avoid throttling
    updateReactState(current.gameState, current.score, Math.round(current.satiety));
  };

  // Draw Logic
  const drawGame = (ctx: CanvasRenderingContext2D) => {
    const current = stateRef.current;
    
    // Clear & Save for screen shake
    ctx.clearRect(0, 0, 800, 400);
    ctx.save();
    
    if (current.screenShake > 0.1 && current.gameState === 'PLAYING') {
      const dx = (Math.random() - 0.5) * current.screenShake;
      const dy = (Math.random() - 0.5) * current.screenShake;
      ctx.translate(dx, dy);
    }

    // --- DRAW DETAILED BACKGROUND: HSINCHUANG CIYOU TEMPLE & EARLY MARKET VIBE ---
    // 1. Sky / Dawn background gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, 400);
    skyGradient.addColorStop(0, '#2d1b33'); // night sky deep violet
    skyGradient.addColorStop(0.5, '#42243d'); // dawn deep pink-violet
    skyGradient.addColorStop(0.9, '#8c4e51'); // warm clay red for ground transition
    skyGradient.addColorStop(1, '#b56d5e'); // warm terracotta
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, 800, 400);

    // 2. Far Silhouettes / Traditional buildings of Temple Street
    ctx.fillStyle = '#1e1124';
    ctx.beginPath();
    // Left houses
    ctx.moveTo(0, 360);
    ctx.lineTo(0, 240);
    ctx.lineTo(60, 240);
    ctx.lineTo(80, 220); // traditional sloped roof
    ctx.lineTo(100, 240);
    ctx.lineTo(150, 240);
    ctx.lineTo(150, 360);
    // Temple Archway silhouette in center-left background
    ctx.lineTo(240, 360);
    ctx.lineTo(240, 180);
    ctx.lineTo(220, 190);
    ctx.lineTo(240, 150); // roof curvin
    ctx.lineTo(310, 150);
    ctx.lineTo(330, 190);
    ctx.lineTo(310, 180);
    ctx.lineTo(310, 360);
    // Right houses
    ctx.lineTo(500, 360);
    ctx.lineTo(500, 260);
    ctx.lineTo(540, 230);
    ctx.lineTo(580, 260);
    ctx.lineTo(640, 260);
    ctx.lineTo(670, 200);
    ctx.lineTo(700, 260);
    ctx.lineTo(800, 260);
    ctx.lineTo(800, 360);
    ctx.closePath();
    ctx.fill();

    // 3. Middle ground: Ciyou Temple Outer Walls & Ornate Pillars
    // Main Temple Gate in center
    ctx.fillStyle = '#5c2222'; // Temple deep red-caramel
    ctx.fillRect(280, 160, 240, 200);
    
    // Draw golden roof for the temple gate
    ctx.fillStyle = '#cca825'; // Golden glazed tile color
    ctx.beginPath();
    // Swirling traditional curved roof
    ctx.moveTo(270, 175);
    ctx.bezierCurveTo(280, 150, 320, 140, 400, 140);
    ctx.bezierCurveTo(480, 140, 520, 150, 530, 175);
    ctx.lineTo(510, 175);
    ctx.bezierCurveTo(480, 160, 450, 153, 400, 153);
    ctx.bezierCurveTo(350, 153, 320, 160, 290, 175);
    ctx.closePath();
    ctx.fill();

    // Temple Dragon Pillars / Stone pillars decoration
    ctx.fillStyle = '#4a444a'; // Stone dark grey
    ctx.fillRect(320, 175, 20, 185); // Left Pillar
    ctx.fillRect(460, 175, 20, 185); // Right Pillar
    
    // Golden patterns around the pillars simulating dragons
    ctx.fillStyle = '#dca714';
    ctx.fillRect(323, 210, 14, 8);
    ctx.fillRect(323, 260, 14, 8);
    ctx.fillRect(323, 310, 14, 8);
    ctx.fillRect(463, 210, 14, 8);
    ctx.fillRect(463, 260, 14, 8);
    ctx.fillRect(463, 310, 14, 8);

    // Temple Door and Plaques
    ctx.fillStyle = '#261010'; // Dark ancient timber door
    ctx.fillRect(360, 250, 80, 110);
    ctx.fillStyle = '#f5b53d'; // Golden door locks/studs
    ctx.beginPath();
    ctx.arc(395, 300, 4, 0, Math.PI * 2);
    ctx.arc(405, 300, 4, 0, Math.PI * 2);
    ctx.fill();

    // Authentic plaque above door "慈祐宮"
    ctx.fillStyle = '#9c2424'; // Red frame
    ctx.fillRect(375, 190, 50, 24);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#fcae1e';
    ctx.strokeRect(377, 192, 46, 20);
    ctx.fillStyle = '#ffd54f';
    ctx.font = "bold 10px 'ZCOOL Xiaowei', 'Noto Sans TC', sans-serif";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('慈 祐 宮', 400, 202);

    // Lantern poles or strings carrying red lanterns swaying in wind
    ctx.strokeStyle = '#3d2524';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, 50);
    ctx.bezierCurveTo(200, 80, 600, 80, 800, 50);
    ctx.stroke();

    // Sways with a smooth sine wave
    current.lanternOffset += 0.035;
    const swayAngle = Math.sin(current.lanternOffset) * 0.08;

    // Draw multiple traditional red lanterns along the rope
    const lanternPositions = [120, 240, 360, 440, 560, 680];
    lanternPositions.forEach((lx) => {
      // Find y projection from curve
      const ratio = lx / 800;
      const ly = 50 + (ratio * (1 - ratio) * 4) * 30; // bezier approximation

      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(swayAngle);

      // Thread hook
      ctx.strokeStyle = '#ffd54f';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 10);
      ctx.stroke();

      // Golden caps
      ctx.fillStyle = '#cca825';
      ctx.fillRect(-8, 10, 16, 4);
      ctx.fillRect(-8, 30, 16, 4);

      // Red lantern bulb
      ctx.fillStyle = '#d32f2f'; // Glowing festival red
      ctx.beginPath();
      ctx.ellipse(0, 20, 12, 11, 0, 0, Math.PI * 2);
      ctx.fill();

      // Radial inner glow (simulates night candle)
      const lanternGlow = ctx.createRadialGradient(0, 20, 1, 0, 20, 11);
      lanternGlow.addColorStop(0, '#fff4cc');
      lanternGlow.addColorStop(0.4, '#fbc02d');
      lanternGlow.addColorStop(1, '#d32f2f');
      ctx.fillStyle = lanternGlow;
      ctx.beginPath();
      ctx.ellipse(0, 20, 11, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Golden dangling ribbon
      ctx.fillStyle = '#cca825';
      ctx.fillRect(-2, 34, 4, 10);

      ctx.restore();
    });

    // 4. Ground/Pavement floor drawing
    const pavementY = 400 - 40;
    // Base floor coloring shadow
    ctx.fillStyle = '#b56133'; // reddish clay earth floor
    ctx.fillRect(0, pavementY, 800, 40);

    // Draw individual bricks pavement lines
    ctx.strokeStyle = '#7c2e00';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, pavementY);
    ctx.lineTo(800, pavementY); // Top pavement line
    
    // Draw floor brick horizontal seams
    ctx.moveTo(0, pavementY + 12);
    ctx.lineTo(800, pavementY + 12);
    ctx.moveTo(0, pavementY + 24);
    ctx.lineTo(800, pavementY + 24);
    
    // Vertical seams offset to create running bond bricks
    const colStep = 45;
    for (let x = 0; x < 840; x += colStep) {
      // Row 1
      ctx.moveTo(x, pavementY);
      ctx.lineTo(x, pavementY + 12);
      // Row 2 offset
      ctx.moveTo(x + colStep / 2, pavementY + 12);
      ctx.lineTo(x + colStep / 2, pavementY + 24);
      // Row 3
      ctx.moveTo(x, pavementY + 24);
      ctx.lineTo(x, pavementY + 40);
    }
    ctx.stroke();

    // 5. Draw Food list
    current.foods.forEach((food) => {
      ctx.save();
      ctx.translate(food.x, food.y);
      ctx.rotate(food.rotation);

      if (food.type === 'GOLDEN') {
        // glowing sun halo
        const haloGlow = ctx.createRadialGradient(0, 0, 2, 0, 0, food.radius + 6);
        haloGlow.addColorStop(0, 'rgba(255, 235, 80, 0.6)');
        haloGlow.addColorStop(0.5, 'rgba(255, 220, 0, 0.2)');
        haloGlow.addColorStop(1, 'rgba(255, 220, 0, 0)');
        ctx.fillStyle = haloGlow;
        ctx.beginPath();
        ctx.arc(0, 0, food.radius + 6, 0, Math.PI * 2);
        ctx.fill();
      }

      // Classic "鹹光餅" Double Circle Glazed Bread Design
      ctx.fillStyle = food.color;
      ctx.beginPath();
      ctx.arc(0, 0, food.radius, 0, Math.PI * 2);
      ctx.fill();

      // Shiny bread glaze details
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, food.radius - 2.5, Math.PI * 1.0, Math.PI * 1.6); // highlighting arc
      ctx.stroke();

      // Outer brown glazed bread crust shade
      ctx.strokeStyle = food.type === 'ROTTEN' ? '#3d2e1f' : '#b27a1c';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, 0, food.radius - 0.9, 0, Math.PI * 2);
      ctx.stroke();

      // Transparent center hole (Salty light bread donut look)
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(0, 0, food.radius * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Draw sesame seeds inside the bread ring (little brown/beige dots)
      ctx.fillStyle = food.type === 'ROTTEN' ? '#2e4c19' : '#5c3d25';
      const numSesame = 6;
      for (let s = 0; s < numSesame; s++) {
        const seedAngle = (s * Math.PI * 2 / numSesame) + 0.3;
        const dist = food.radius * 0.65;
        const sx = Math.cos(seedAngle) * dist;
        const sy = Math.sin(seedAngle) * dist;
        ctx.fillRect(sx - 0.8, sy - 0.8, 1.8, 2);
      }

      ctx.restore();
    });

    if (current.gameState !== 'WORSHIP' && current.gameState !== 'START') {
      // 6. Draw Player (Zhu Bajie 豬八戒 or classic Red Block)
      const p = current.player;
      ctx.save();
    
    if (charStyle === 'RED_BLOCK') {
      // --- ORIGINAL RED RECTANGLE STYLE ---
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(p.x, p.y, p.width, p.height);
      ctx.strokeStyle = '#c0392b';
      ctx.lineWidth = 2;
      ctx.strokeRect(p.x, p.y, p.width, p.height);
    } else {
      // --- DETAILED RETRO ANIMATED PIG / ZHU BAJIE ---
      const flipped = p.facing === 'LEFT';
      ctx.translate(p.x + p.width / 2, p.y + p.height / 2);
      
      if (flipped) {
        ctx.scale(-1, 1);
      }

      // Add bounce based on jump / motion
      let squatY = 0;
      if (!p.isGrounded) {
        // Squash on rise, stretch on peak/drop
        squatY = Math.max(-5, p.vy * 0.4);
      } else if (p.isMoving) {
        squatY = Math.sin(p.animFrame * 2) * 2;
      }

      ctx.scale(1, 1 + squatY * 0.08);

      // Pig Tail (Drawn at the back, so on left side of flipped avatar)
      ctx.strokeStyle = '#ff9cae';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-16, 4);
      ctx.quadraticCurveTo(-24, 2, -22, -6);
      ctx.quadraticCurveTo(-16, -6, -18, -1);
      ctx.stroke();

      // Fat Piggy Chubby Body
      ctx.fillStyle = '#1c1510'; // Ancient black traveler robe
      ctx.beginPath();
      ctx.ellipse(0, 6, 17, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Prominent Fat Pink Belly (exposing out of black robes!)
      ctx.fillStyle = '#ffb3c1'; // Pale piggy pink
      ctx.beginPath();
      ctx.ellipse(4, 9, 12, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Belly button
      ctx.fillStyle = '#e57c8d';
      ctx.fillRect(6, 10, 2, 2);

      // Chubby Pig Face
      ctx.fillStyle = '#ff9cae'; // Darker pink face
      ctx.beginPath();
      ctx.arc(4, -10, 13, 0, Math.PI * 2);
      ctx.fill();

      // Pig floppy ears
      ctx.fillStyle = '#ffccd5'; // Ear inner pink
      ctx.strokeStyle = '#ff9cae';
      ctx.lineWidth = 1.5;
      
      // Back Ear
      ctx.save();
      ctx.translate(-7, -18);
      ctx.rotate(-Math.PI * 0.2 + (squatY * 0.02));
      ctx.beginPath();
      ctx.ellipse(0, 0, 8, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Front Ear
      ctx.save();
      ctx.translate(5, -19);
      ctx.rotate(Math.PI * 0.15 - (squatY * 0.02));
      ctx.beginPath();
      ctx.ellipse(0, 0, 8, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Piggy Cute Snout
      ctx.fillStyle = '#ffccd5';
      ctx.strokeStyle = '#eb778b';
      ctx.lineWidth = 1;
      
      ctx.beginPath();
      ctx.ellipse(11, -8, 6, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // Nostril holes
      ctx.fillStyle = '#730d1d';
      ctx.fillRect(9, -9, 1.8, 2);
      ctx.fillRect(13, -9, 1.8, 2);

      // Eyes
      ctx.fillStyle = '#000000';
      // Looking forward
      ctx.fillRect(5, -14, 2, 3.5);
      ctx.fillRect(0, -14, 2, 3.5);
      
      // Chubby cheeks
      ctx.fillStyle = '#ff6b8b';
      ctx.beginPath();
      ctx.arc(5, -6, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Ancient Black Hat ("九齒釘耙" / Daoit hat shape)
      ctx.fillStyle = '#2b231d'; // dark felt
      ctx.beginPath();
      ctx.moveTo(-7, -20);
      ctx.lineTo(13, -20);
      ctx.lineTo(8, -26);
      ctx.lineTo(-2, -26);
      ctx.closePath();
      ctx.fill();
      // Hat rim
      ctx.strokeStyle = '#2b231d';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-10, -19);
      ctx.lineTo(15, -19);
      ctx.stroke();

      // Legs walking animation
      ctx.strokeStyle = '#2b231d';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      
      const walkCycle = Math.sin(p.animFrame * 2);
      
      // Left leg
      ctx.save();
      ctx.translate(-7, 18);
      ctx.rotate(p.isGrounded ? walkCycle * 0.4 : 0.3);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 5);
      ctx.stroke();
      ctx.restore();

      // Right leg
      ctx.save();
      ctx.translate(6, 18);
      ctx.rotate(p.isGrounded ? -walkCycle * 0.4 : -0.3);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 5);
      ctx.stroke();
      ctx.restore();

      // Carrying a cute iconic Nine-Toothed Rake (九齒釘耙)
      ctx.save();
      ctx.rotate(-0.2 + (Math.sin(p.animFrame) * 0.05));
      // Rake shaft
      ctx.strokeStyle = '#7c541c';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-10, 15);
      ctx.lineTo(-10, -15);
      ctx.stroke();
      
      // Rake teeth
      ctx.fillStyle = '#7a8e9e'; // metallic grey teeth
      ctx.fillRect(-15, -20, 10, 5);
      ctx.strokeStyle = '#4e565c';
      ctx.lineWidth = 1;
      
      // draw triple fine teeth
      ctx.strokeRect(-15, -20, 10, 5);
      ctx.beginPath();
      ctx.moveTo(-15, -15);
      ctx.lineTo(-15, -12);
      ctx.moveTo(-10, -15);
      ctx.lineTo(-10, -12);
      ctx.moveTo(-5, -15);
      ctx.lineTo(-5, -12);
      ctx.stroke();
      ctx.restore();
    }

      ctx.restore(); // restore from translate player
    }

    // 7. Draw Visual Particles (and flying score text particles!)
    current.particles.forEach((p) => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      
      if (p.radius === 999) {
        // Special scoring/satiety float text particle!
        ctx.fillStyle = p.color;
        ctx.strokeStyle = 'rgba(0,0,0,0.8)';
        ctx.lineWidth = 3;
        ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
        ctx.textAlign = 'center';
        ctx.strokeText(p.color.includes('ffa') || p.color.includes('fff') ? `飽食回復! ✨` : `肚子餓扁... 💦`, p.x, p.y);
        ctx.fillText(p.color.includes('ffa') || p.color.includes('fff') ? `飽食回復! ✨` : `肚子餓扁... 💦`, p.x, p.y);
      } else {
        // Beautiful sparkles!
        ctx.fillStyle = p.color;
        ctx.beginPath();
        
        // draw a diamond/star shape if it's a golden sparkle
        if (p.color === '#ffe853' && Math.random() < 0.5) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y - p.radius);
          ctx.lineTo(p.x + p.radius / 1.5, p.y);
          ctx.lineTo(p.x, p.y + p.radius);
          ctx.lineTo(p.x - p.radius / 1.5, p.y);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      ctx.restore();
    });

    if (current.gameState !== 'WORSHIP' && current.gameState !== 'START') {
      // --- DRAW REQUIRED HUD USER INTERFACE ON THE CANVAS LEFT-TOP ---
      // At left-top: Satiety progress bar
      const barX = 20;
    const barY = 20;
    const barW = 200;
    const barH = 16;
    
    // Draw background gauge frame
    ctx.fillStyle = 'rgba(44, 30, 24, 0.85)';
    ctx.strokeStyle = '#ebc1a0';
    ctx.lineWidth = 2.5;
    // draw round rect or a classy vintage frame
    ctx.fillRect(barX, barY, barW, barH);
    ctx.strokeRect(barX, barY, barW, barH);

    // Satiety Fill Color (Green if full, Yellow if hungry, flashing Red if dying!)
    let fillStyle = '#2ecc71'; // standard green
    if (current.satiety < 35) {
      fillStyle = '#e74c3c'; // red warning
      if (Math.floor(Date.now() / 150) % 2 === 0) {
        fillStyle = '#f39c12'; // flashing alternate orange
      }
    } else if (current.satiety < 65) {
      fillStyle = '#f1c40f'; // warning yellow
    }

    const fillW = Math.max(0, Math.min(barW, (current.satiety / 100) * barW));
    ctx.fillStyle = fillStyle;
    ctx.fillRect(barX, barY, fillW, barH);

    // Grid lines block shader for retro feel
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    for (let g = 0; g < barW; g += 15) {
      if (g < fillW) {
        ctx.fillRect(barX + g, barY, 2, barH);
      }
    }

    // "飽食度" Chinese Label
    ctx.fillStyle = '#ffffff';
    ctx.font = "bold 11px system-ui, -apple-system, 'Noto Sans TC', sans-serif";
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;
    ctx.fillText(`飽食度 Satiety: ${Math.round(current.satiety)}%`, barX + 6, barY + barH / 2);
    ctx.shadowBlur = 0; // reset shadow

      // Little indicators
      if (current.satiety < 35) {
        ctx.fillStyle = '#ff4d4d';
        ctx.font = "bold 11px system-ui, sans-serif";
        ctx.fillText('⚡ 嚴重飢餓中 ⚡', barX, barY + barH + 15);
      }
    }

    ctx.restore(); // restore from screen shake
  };

  // Setup loop
  useEffect(() => {
    let active = true;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = (timestamp: number) => {
      if (!active) return;
      
      if (stateRef.current.currentScene === 'scene2') {
        updateGame();
        drawGame(ctx);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      
      stateRef.current.frameId = requestAnimationFrame(loop);
    };

    stateRef.current.frameId = requestAnimationFrame(loop);

    return () => {
      active = false;
      cancelAnimationFrame(stateRef.current.frameId);
    };
  }, [charStyle]);

  // Virtual arcade mobile touch moves handlers
  const handleVirtMoveLeft = (start: boolean) => {
    stateRef.current.keys.ArrowLeft = start;
  };
  const handleVirtMoveRight = (start: boolean) => {
    stateRef.current.keys.ArrowRight = start;
  };
  const handleVirtJump = () => {
    // Single jump trigger (simulating a keypress pulse)
    if (stateRef.current.player.isGrounded) {
      stateRef.current.player.vy = stateRef.current.player.jumpPower;
      stateRef.current.player.isGrounded = false;
      playJumpSound();
      
      // Burst
      for (let i = 0; i < 6; i++) {
        stateRef.current.particles.push({
          x: stateRef.current.player.x + stateRef.current.player.width / 2,
          y: stateRef.current.player.y + stateRef.current.player.height,
          vx: (Math.random() - 0.5) * 3,
          vy: -Math.random() * 2,
          radius: Math.random() * 3 + 2,
          color: 'rgba(235, 220, 200, 0.6)',
          alpha: 0.8,
          life: 0,
          maxLife: 20 + Math.random() * 15,
        });
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      
      {/* Top dashboard panel */}
      <div className="w-full flex flex-wrap justify-between items-center bg-stone-900/60 p-3.5 rounded-xl border border-stone-800/80 shadow-md mb-4 gap-3 bg-opacity-70 backdrop-blur-md">
        
        {/* Left Stats Info */}
        <div className="flex items-center space-x-5">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-rose-400" />
            <span className="text-stone-300 text-xs font-semibold">
              🌸 點擊上方 <strong className="text-rose-300">「與八戒同遊 COZY CHAT」</strong> 可隨時開啟或重新閱讀新莊廟街深層故事與對話！
            </span>
          </div>
        </div>

        {/* Right Settings Selector */}
        <div className="flex items-center space-x-3">
          {/* Character Style toggle */}
          <button
            onClick={() => setCharStyle(prev => prev === 'PIG' ? 'RED_BLOCK' : 'PIG')}
            className="flex items-center space-x-2 px-3 py-1.5 text-xs bg-stone-800/80 border border-stone-700 hover:bg-stone-700 hover:text-white active:bg-stone-900 rounded-lg text-stone-300 font-bold transition-all shadow-sm cursor-pointer"
            title="點擊切換主角的外觀模組"
            id="char-toggle-btn"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
            <span>外觀: {charStyle === 'PIG' ? '🐷 豬八戒' : '🟥 紅色方塊'}</span>
          </button>
        </div>
      </div>

      {/* Main Canvas view box with relative container */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-stone-800 ring-8 ring-stone-950/60 shadow-2xl bg-stone-900 w-full min-h-[400px]">
        
        {/* #scene1：製作鹹光餅（互動手作大烤爐遊戲） */}
        <div 
          id="scene1"
          style={{ 
            display: currentScene === 'scene1' ? 'flex' : 'none',
            opacity: currentScene === 'scene1' ? sceneOpacity : 0,
            transition: 'opacity 350ms ease-in-out'
          }}
          className="absolute inset-0 bg-stone-950 flex flex-col items-center justify-center text-center p-3 backdrop-blur-sm z-20 overflow-y-auto"
        >
          <BiscuitMaker onComplete={() => {
            window.dispatchEvent(new CustomEvent('activate_dialogue', { detail: { nodeId: 'temple_pray_intro' } }));
          }} />
        </div>

        {/* #scene2：接鹹光餅大挑戰（請將我原本的 <canvas> 元素放在這裡面） */}
        <div 
          id="scene2"
          style={{ 
            display: currentScene === 'scene2' ? 'block' : 'none',
            opacity: currentScene === 'scene2' ? sceneOpacity : 0,
            transition: 'opacity 350ms ease-in-out'
          }}
          className="w-full h-full relative"
        >
          {/* 這裡放入你原本的 Canvas 程式碼 */}
          <canvas
            ref={canvasRef}
            width={800}
            height={400}
            className="block bg-neutral-900 max-w-full"
            id="gameCanvas"
          />

          {/* --- CUSTOM GORGEOUS OVERLAY SCREENS FOR BETTER USER EXPERIENCE --- */}
          
          {/* START Screen */}
          {gameState === 'START' && (
            <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center text-center p-6 backdrop-blur-sm z-10 transition-opacity">
              <div className="max-w-md bg-amber-950/95 border-2 border-yellow-600/60 p-8 rounded-2xl shadow-2xl text-center flex flex-col items-center">
                
                {/* Traditional Temple Gate Icon Decoration */}
                <div className="w-16 h-16 rounded-full bg-amber-900/80 flex items-center justify-center border-2 border-yellow-500 shadow mb-4">
                  <span className="text-3xl">🏮</span>
                </div>
                
                <h2 className="text-3xl font-extrabold text-yellow-400 tracking-wider mb-2 font-serif">
                  新莊廟街：美好食光
                </h2>
                <p className="text-amber-200/85 text-xs tracking-wide uppercase mb-4 border-b border-amber-900 pb-2 w-full font-bold">
                  這是一場專為八戒準備平安鹹光餅的美味冒險
                </p>
                
                <div className="space-y-2 text-left bg-black/40 p-4 rounded-xl text-xs text-amber-100 border border-amber-900/50 mb-6 w-full">
                  <p className="font-semibold text-center text-yellow-500 mb-1 border-b border-amber-950 pb-1">
                    💡 遊戲玩法 Guide
                  </p>
                  <div className="flex justify-between py-1">
                    <span>左右移動 Left / Right:</span>
                    <span className="font-mono text-yellow-400 font-bold">← → 或 A / D</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>跳躍 Jump:</span>
                    <span className="font-mono text-yellow-400 font-bold">↑ 或 W 或 空白鍵</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>暫停 Pause:</span>
                    <span className="font-mono text-yellow-400 font-bold">ESC 或 P鍵</span>
                  </div>
                  <p className="text-[11px] text-rose-300 text-center mt-2 pt-1 border-t border-amber-950/50 leading-relaxed font-semibold">
                    🌸 接下金黃與普通鹹光餅，累加飽食度至 100% 即可通關！請竭力避開那些引起肚子痛的「焦黑炭燒霉餅」喔！
                  </p>
                </div>

                <button
                  onClick={startGame}
                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-amber-950 font-black text-base py-3 px-6 rounded-xl shadow-lg hover:shadow-yellow-500/10 active:scale-95 transition-all outline-none"
                  id="start-game-btn"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>開始迎接美味鹹光餅 🏮</span>
                </button>
              </div>
            </div>
          )}

          {/* WORSHIP Screen overlay */}
          {gameState === 'WORSHIP' && (
            <div className="absolute inset-0 bg-black/65 flex flex-col items-center justify-center text-center p-6 backdrop-blur-[3px] z-10 transition-all duration-300">
              <div className="max-w-md w-full bg-stone-900/95 border-2 border-yellow-600/50 p-6 sm:p-8 rounded-2xl shadow-2xl text-center flex flex-col items-center relative animate-fade-in">
                
                {/* Header decor */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-600 text-stone-950 font-black px-4 py-1 rounded-full text-[10px] tracking-widest border border-yellow-400 uppercase shadow-lg">
                  百年古剎 🏮 慈祐宮祭祀环節
                </div>

                {/* Title representation */}
                <h3 className="text-2xl font-black text-yellow-400 mt-2 tracking-wide font-serif">
                  殿前香火 · 祈願闔家平安
                </h3>
                
                <p className="text-stone-300 text-[11px] leading-relaxed mt-2 max-w-sm">
                  施主好心地！在正式收穫平安鹹光餅前，咱們先向慈祐宮殿前獻上虔誠清香，點燃祈福香火，祈願這趟古蹟旅程闔家平安、萬事大吉！
                </p>

                {/* Progress Bar showing Devotion percentage */}
                <div className="w-full mt-6 bg-stone-950 border border-stone-850 p-1.5 rounded-xl">
                  <div className="flex justify-between items-center text-[10px] font-bold text-amber-500 mb-1 px-1">
                    <span>✨ 虔誠香火能量 DEVOTION</span>
                    <span className="font-mono">{Math.floor(worshipProgress)}%</span>
                  </div>
                  
                  <div className="w-full h-4 bg-stone-950 rounded-lg overflow-hidden border border-stone-900 shadow-inner relative">
                    <div 
                      className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 rounded-lg shadow-sm transition-all duration-150 ease-out flex items-center justify-end pr-1 text-[8px] text-stone-950 font-black select-none"
                      style={{ width: `${worshipProgress}%` }}
                    >
                      {worshipProgress > 15 && `🔥`}
                    </div>
                  </div>
                </div>

                {/* Center Sanctuary interactive area */}
                <div className="my-6 relative flex items-center justify-center min-h-[160px] w-full" id="worship-shrine-area">
                  
                  {/* Visual indicator bubbles showing where things flow */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 pointer-events-none text-[10px] bg-red-950/80 border border-red-500/30 text-rose-300 select-none px-2.5 py-0.5 rounded-full animate-pulse flex items-center space-x-1 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span>祈願字句 正隨煙霧緩緩升向神殿... 🏮</span>
                  </div>

                  {/* The Incense Burner Component */}
                  <div 
                    onMouseDown={(e) => {
                      setIsActiveWorshipPressed(true);
                      handleWorshipInteraction();
                    }}
                    onMouseUp={() => setIsActiveWorshipPressed(false)}
                    onMouseLeave={() => setIsActiveWorshipPressed(false)}
                    onTouchStart={(e) => {
                      e.preventDefault(); // prevent double triggers on mobile
                      setIsActiveWorshipPressed(true);
                      handleWorshipInteraction();
                    }}
                    onTouchEnd={() => setIsActiveWorshipPressed(false)}
                    className={`w-32 h-32 rounded-full bg-gradient-to-b from-amber-600 to-amber-950 border-4 ${isActiveWorshipPressed ? 'border-yellow-400 scale-95 shadow-[0_0_30px_rgba(234,179,8,0.7)]' : 'border-yellow-600 hover:border-yellow-500 scale-100'} hover:shadow-[0_0_20px_rgba(234,179,8,0.5)] flex flex-col items-center justify-center cursor-pointer transition-all relative select-none shadow-xl`}
                    id="worship-incense-burner"
                    title="點擊或長按香爐開始參拜"
                  >
                    <span className="text-5xl select-none" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))' }}>🏺</span>
                    <span className="text-[11px] font-black text-amber-100 font-sans tracking-wide mt-1">祈福香爐</span>
                    <span className="text-[8px] bg-yellow-500/20 text-yellow-300 font-bold px-1.5 py-0.5 rounded-full mt-1.5 animate-pulse">長按或連續點擊</span>
                    
                    {/* Floating texts absolute mapping */}
                    {worshipTextList.map(item => (
                      <div 
                        key={item.id} 
                        className="absolute text-yellow-300 text-xs font-black tracking-wide pointer-events-none whitespace-nowrap animate-float-up-fade filter drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)] z-20"
                        style={{ 
                          left: `calc(50% + ${item.x}px)`, 
                          top: `calc(50% + ${item.y}px)` 
                        }}
                      >
                        {item.text}
                      </div>
                    ))}
                  </div>

                  {/* Left Mini Pig avatar cheering */}
                  <div className="absolute left-0 bottom-4 animate-bounce text-3xl select-none pointer-events-none" title="豬八戒">
                    🐷
                    <div className="absolute -top-10 -right-6 bg-black/80 border border-rose-500/30 text-rose-200 text-[9px] px-2 py-0.5 rounded-lg whitespace-nowrap font-bold">
                      {worshipProgress < 30 ? "施主，拜託了！" : worshipProgress < 75 ? "好香啊，心誠則靈！" : "神明保佑平安！"}
                    </div>
                  </div>

                  {/* Right Lantern decor */}
                  <div className="absolute right-0 bottom-4 text-3xl select-none pointer-events-none animate-pulse">
                    🏮
                  </div>
                </div>

                {/* Worship Bottom Action Guide */}
                <div className="w-full text-[11px] text-amber-200/70 font-semibold italic">
                  👉「快速連續點選」或「按住不放」香爐，誠心灌注參拜，當香火升至 100% 即可開啟鹹光餅大考驗！
                </div>
              </div>
            </div>
          )}

          {/* PAUSED Screen */}
          {gameState === 'PAUSED' && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-center p-6 backdrop-blur-sm z-10">
              <div className="bg-amber-950/95 border border-yellow-600/40 p-6 rounded-2xl shadow-xl w-64">
                <h3 className="text-xl font-bold text-yellow-400 mb-4 tracking-wider">
                  遊戲暫停 中
                </h3>
                <p className="text-amber-100 text-xs mb-6">
                  豬八戒正在廟街旁休息...
                </p>
                
                <button
                  onClick={togglePause}
                  className="w-full flex items-center justify-center space-x-2 bg-yellow-500 hover:bg-yellow-400 text-amber-950 font-bold py-2.5 rounded-lg active:scale-95 transition-all mb-3 text-xs shadow"
                  id="resume-btn-paused"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>繼續遊戲</span>
                </button>
                
                <button
                  onClick={startGame}
                  className="w-full flex items-center justify-center space-x-2 bg-amber-900 hover:bg-amber-800 text-amber-100 font-medium py-2 rounded-lg active:scale-95 transition-all text-xs border border-amber-800"
                  id="restart-btn-paused"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>重新開始</span>
                </button>
              </div>
            </div>
          )}

          {/* GAME OVER Screen */}
          {gameState === 'GAMEOVER' && (
            <div className="absolute inset-0 bg-red-950/80 bg-opacity-75 flex flex-col items-center justify-center text-center p-6 backdrop-blur-sm z-10 animate-fade-in">
              <div className="max-w-sm bg-orange-950/95 border-2 border-dashed border-red-500/60 p-8 rounded-2xl shadow-2xl flex flex-col items-center">
                
                {/* Crying pig or warning icon */}
                <div className="w-16 h-16 rounded-full bg-red-900/50 flex items-center justify-center border-2 border-red-500/80 text-3xl mb-4 animate-bounce">
                  😭
                </div>
                
                <h3 className="text-2xl font-black text-red-400 tracking-wide mb-1">
                  哎呀！肚子不舒服了！
                </h3>
                <p className="text-amber-100 text-xs mb-6 border-b border-orange-900/40 pb-3 w-full leading-relaxed">
                  八戒吃到太多焦黑霉餅，肚子難受走不動了。快去安慰他吧！
                </p>

                <div className="flex flex-col gap-2.5 w-full">
                  <div className="text-amber-200/95 text-xs font-bold flex items-center gap-1.5 justify-center animate-pulse">
                    <span>🌸 正在開啟與八戒的安撫密語...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VICTORY Screen */}
          {gameState === 'VICTORY' && (
            <div className="absolute inset-0 bg-rose-950/85 bg-opacity-80 flex flex-col items-center justify-center text-center p-6 backdrop-blur-sm z-10 animate-fade-in">
              <div className="max-w-sm bg-stone-900/95 border-2 border-rose-500 p-8 rounded-2xl shadow-2xl flex flex-col items-center">
                
                {/* Hearts or Stars icon */}
                <div className="w-16 h-16 rounded-full bg-rose-500/15 flex items-center justify-center border-2 border-rose-400 text-3xl mb-4 animate-bounce">
                  💖
                </div>
                
                <h3 className="text-2xl font-black text-rose-300 tracking-wide mb-1">
                  吃飽喝足！美食大成功！
                </h3>
                <p className="text-amber-100 text-xs mb-6 border-b border-rose-900/30 pb-3 w-full">
                  八戒肚子飽滿滾圓，正陶醉在滿滿幸福之中 🌸
                </p>

                <div className="flex flex-col gap-2.5 w-full">
                  <div className="text-rose-400 text-xs font-bold flex items-center gap-1.5 justify-center animate-pulse mb-2">
                    <span>🌸 正在開啟與八戒的新莊古蹟巡禮老街密談...</span>
                  </div>
                  <button
                    onClick={() => switchScene('scene3')}
                    className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-stone-100 font-extrabold text-sm py-2 px-4 rounded-xl shadow-lg active:scale-95 transition-all outline-none animate-bounce cursor-pointer"
                  >
                    <span>（大功告成）前往替八戒收涎 🌸</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* #scene3：替八戒收涎（互動收涎小遊戲） */}
        <div 
          id="scene3"
          style={{ 
            display: currentScene === 'scene3' ? 'flex' : 'none',
            opacity: currentScene === 'scene3' ? sceneOpacity : 0,
            transition: 'opacity 350ms ease-in-out'
          }}
          className="absolute inset-0 bg-stone-950 flex flex-col items-center justify-center text-center p-4 backdrop-blur-sm z-20 overflow-y-auto"
        >
          <div className="max-w-md w-full bg-stone-900/95 border-2 border-rose-500/50 p-5 sm:p-6 rounded-2xl shadow-2xl text-center flex flex-col items-center animate-fade-in my-auto">
            
            <h3 className="text-xl sm:text-2xl font-black text-rose-400 tracking-wide font-serif flex items-center justify-center gap-2">
              <span>🌸</span> 場景三：替八戒平安收涎 <span>🌸</span>
            </h3>
            
            <p className="text-stone-300 text-[11px] sm:text-xs leading-relaxed mt-2 max-w-sm">
              八戒嘴邊沾滿了香氣四溢的芝麻和亮晶晶的涎水！請移動或點擊，用吉祥紅線串起的溫暖鹹光餅幫他擦拭嘴角，好運連連喔！
            </p>

            {/* Interactive zone container with relative boundaries */}
            <div 
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const px = ((e.clientX - rect.left) / rect.width) * 100;
                const py = ((e.clientY - rect.top) / rect.height) * 100;
                setWiperX(px);
                setWiperY(py);
                setIsWipingHover(true);

                droolDrops.forEach(drop => {
                  if (!drop.cleaned) {
                    const dist = Math.sqrt((drop.x - px) ** 2 + (drop.y - py) ** 2);
                    if (dist < 10) { // Wipe distance
                      handleWipeDrool(drop.id);
                    }
                  }
                });
              }}
              onTouchMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                if (e.touches.length > 0) {
                  const touch = e.touches[0];
                  const px = ((touch.clientX - rect.left) / rect.width) * 100;
                  const py = ((touch.clientY - rect.top) / rect.height) * 100;
                  setWiperX(px);
                  setWiperY(py);
                  setIsWipingHover(true);

                  droolDrops.forEach(drop => {
                    if (!drop.cleaned) {
                      const dist = Math.sqrt((drop.x - px) ** 2 + (drop.y - py) ** 2);
                      if (dist < 12) { // Slightly bigger hitarea on touch
                        handleWipeDrool(drop.id);
                      }
                    }
                  });
                }
              }}
              onMouseLeave={() => setIsWipingHover(false)}
              onTouchEnd={() => setIsWipingHover(false)}
              className="relative w-full max-w-[280px] h-[240px] bg-gradient-to-b from-stone-900 via-rose-950/20 to-stone-950 rounded-2xl border-2 border-rose-500/30 overflow-hidden shadow-inner my-3 select-none flex items-center justify-center cursor-none group"
            >
              {/* Grid / decorative guidelines */}
              <div className="absolute inset-0 bg-[radial-gradient(#e11d4810_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-40" />

              {/* Status Indicator inside the canvas */}
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-rose-950/80 border border-rose-500/20 rounded text-[9px] font-bold text-rose-300">
                ✨ {droolProgress === 100 ? "清潔度 100% ✨" : `清潔進度: ${droolProgress}%`}
              </div>

              {/* ZHU BAJIE AVATAR AND NECKLACE GRAPHICS */}
              <div className="relative w-44 h-44 flex items-center justify-center">
                {/* Cheeks Rosiness behind Face */}
                <div 
                  className="absolute bottom-10 left-6 w-10 h-6 bg-rose-500 rounded-full blur transition-opacity duration-300"
                  style={{ opacity: droolProgress * 0.007 + 0.1 }}
                />
                <div 
                  className="absolute bottom-10 right-6 w-10 h-6 bg-rose-500 rounded-full blur transition-opacity duration-300"
                  style={{ opacity: droolProgress * 0.007 + 0.1 }}
                />

                {/* Left Ear */}
                <div className="absolute top-3 -left-4 w-12 h-14 bg-rose-300 border-2 border-rose-400 rounded-tr-3xl rounded-bl-3xl rotate-[20deg] shadow-md transition-all duration-300 group-hover:-rotate-[10deg]" />
                
                {/* Right Ear */}
                <div className="absolute top-3 -right-4 w-12 h-14 bg-rose-300 border-2 border-rose-400 rounded-tl-3xl rounded-br-3xl -rotate-[20deg] shadow-md transition-all duration-300 group-hover:rotate-[10deg]" />

                {/* Main Face Circle */}
                <div className="relative w-36 h-36 rounded-full bg-gradient-to-b from-rose-200 to-rose-300 border-4 border-rose-400 flex flex-col items-center justify-center shadow-lg select-none z-10">
                  
                  {/* Eye Left */}
                  <span className="absolute top-10 left-10 text-2xl select-none">
                    {droolProgress === 100 ? "🥰" : "🤤"}
                  </span>
                  
                  {/* Eye Right */}
                  <span className="absolute top-10 right-10 text-2xl select-none">
                    {droolProgress === 100 ? "🥰" : "🤤"}
                  </span>

                  {/* Huge Nose / Snout */}
                  <div className="absolute top-[52px] w-14 h-10 rounded-full bg-rose-400 border-2 border-rose-500 flex items-center justify-center gap-1.5 shadow select-none animate-bounce" style={{ animationDuration: '3s' }}>
                    <div className="w-2.5 h-4 rounded-full bg-rose-600 opacity-80" />
                    <div className="w-2.5 h-4 rounded-full bg-rose-600 opacity-80" />
                  </div>

                  {/* Smiling Mouth / Chin Area */}
                  <div className="absolute bottom-6 w-12 h-5 flex flex-col items-center justify-center">
                    {droolProgress < 100 ? (
                      <div className="w-10 h-4 bg-sky-200/50 border border-sky-300/60 rounded-full animate-pulse filter blur-[1px]" />
                    ) : (
                      <div className="w-8 h-3 border-b-2 border-rose-600 rounded-b-full bg-transparent" />
                    )}
                  </div>
                </div>

                {/* Red Collar / Necklace with Savory Biscuits (鹹光餅) */}
                <div className="absolute -bottom-2 w-48 h-10 border-b-4 border-red-600 rounded-b-full z-0 pointer-events-none flex items-center justify-around px-3">
                  {/* Pendant Biscuits arranged around the red string */}
                  <span className="text-sm transform rotate-12 filter drop-shadow">🥯</span>
                  <span className="text-base transform -rotate-12 filter drop-shadow">🥯</span>
                  <span className="text-lg transform hover:scale-110 transition-transform filter drop-shadow">🥯</span>
                  <span className="text-base transform rotate-12 filter drop-shadow">🥯</span>
                  <span className="text-sm transform -rotate-12 filter drop-shadow">🥯</span>
                </div>
              </div>

              {/* RENDER SALIVA DROPLETS (ONLY THOSE UNCLEANED) */}
              {droolDrops.map(drop => {
                if (drop.cleaned) return null;
                return (
                  <div
                    key={drop.id}
                    style={{ left: `${drop.x}%`, top: `${drop.y}%` }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWipeDrool(drop.id);
                    }}
                    className="absolute cursor-pointer flex items-center justify-center select-none z-20"
                  >
                    <span 
                      className="text-2xl animate-bounce filter drop-shadow-[0_2px_4px_rgba(56,189,248,0.7)] hover:scale-130 transition-transform"
                      style={{ 
                        fontSize: `${drop.size}px`,
                        animationDelay: `${drop.id * 150}ms`,
                        animationDuration: '1.2s'
                      }}
                    >
                      💦
                    </span>
                  </div>
                );
              })}

              {/* CUSTOM CURSOR: WIPING BISCUIT */}
              {isWipingHover && (
                <div 
                  style={{ left: `${wiperX}%`, top: `${wiperY}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 select-none flex flex-col items-center"
                >
                  <span className="text-2xl animate-pulse filter drop-shadow-[0_2px_8px_rgba(234,179,8,0.8)]">🥯</span>
                  <span className="text-[8px] bg-yellow-400 text-stone-900 font-extrabold px-1 py-0.2 rounded shadow-sm scale-90 whitespace-nowrap -mt-1">
                    暖心餅
                  </span>
                </div>
              )}
            </div>

            {/* PROGRESS BAR DISPLAY */}
            <div className="w-full bg-stone-950 border border-stone-850 p-2 rounded-xl mb-3 shadow animate-fade-in">
              <div className="flex justify-between items-center text-[10px] font-bold text-rose-400 mb-1 px-1">
                <span>🌸 嘴邊涎水乾淨度</span>
                <span className="font-mono">{droolProgress}%</span>
              </div>
              <div className="w-full h-3 bg-stone-900 rounded-lg overflow-hidden border border-stone-800 shadow-inner relative">
                <div 
                  className="h-full bg-gradient-to-r from-pink-500 via-rose-500 to-emerald-500 rounded-lg shadow-sm transition-all duration-300 ease-out"
                  style={{ width: `${droolProgress}%` }}
                />
              </div>
            </div>

            {/* TRADITIONAL BLESSING CARD */}
            <div className="w-full min-h-[50px] bg-stone-950/70 border border-stone-850 p-2.5 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 text-center animate-fade-in">
              <p className="text-rose-200 text-xs font-semibold leading-relaxed whitespace-pre-line px-1">
                {shouXianBlessingText}
              </p>
            </div>

            <div className="flex gap-2.5 w-full mt-4 animate-fade-in">
              {droolProgress === 100 ? (
                <button
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('activate_dialogue', { detail: { nodeId: 'gameover_high_affection' } }));
                  }}
                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-stone-100 font-extrabold text-sm py-2.5 px-6 rounded-xl shadow-lg active:scale-95 transition-all outline-none cursor-pointer animate-bounce"
                  id="finish-drool-btn"
                >
                  <span>🌸 收涎功功德圓滿，與八戒漫步夕陽長堤 👣</span>
                </button>
              ) : (
                <div className="w-full py-2.5 px-4 bg-stone-800/50 border border-stone-800 text-stone-500 text-xs font-extrabold rounded-xl select-none italic">
                  🔒 請將所有涎水滴 💦 擦乾，完成傳統收涎儀式...
                </div>
              )}
            </div>

          </div>
        </div>

        {/* #scene4：參拜慈祐宮（本次實作重點） */}
        <div 
          id="scene4"
          style={{ 
            display: currentScene === 'scene4' ? 'flex' : 'none',
            opacity: currentScene === 'scene4' ? sceneOpacity : 0,
            transition: 'opacity 350ms ease-in-out'
          }}
          className="absolute inset-0 bg-stone-950 flex flex-col items-center justify-center text-center p-2 backdrop-blur-sm z-20 overflow-y-auto"
        >
          <WorshipStage onComplete={() => {
            window.dispatchEvent(new CustomEvent('activate_dialogue', { detail: { nodeId: 'cooking_final_golden' } }));
          }} />
        </div>

        {/* #scene5：美好結局（目前只需放一段文字「與八戒開心逛廟街」） */}
        <div 
          id="scene5"
          style={{ 
            display: currentScene === 'scene5' ? 'flex' : 'none',
            opacity: currentScene === 'scene5' ? sceneOpacity : 0,
            transition: 'opacity 350ms ease-in-out'
          }}
          className="absolute inset-0 bg-stone-950 flex flex-col items-center justify-center text-center p-6 backdrop-blur-sm z-20"
        >
          <div className="max-w-md w-full bg-stone-900/90 border-2 border-yellow-500/50 p-6 sm:p-8 rounded-2xl shadow-2xl text-center flex flex-col items-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-yellow-500/15 flex items-center justify-center border-2 border-yellow-400 shadow mb-4 text-3xl animate-bounce">
              🏮
            </div>
            
            <h3 className="text-2xl font-black text-yellow-400 tracking-wide font-serif">
              場景五：美好結局
            </h3>
            
            <div className="bg-black/30 border border-stone-850 p-4 rounded-xl mt-3 w-full">
              <p className="text-yellow-300 text-sm font-black tracking-wide">
                與八戒開心逛廟街 🏮
              </p>
            </div>
            
            <p className="text-stone-300 text-xs leading-relaxed mt-4 max-w-sm border-t border-stone-800/60 pt-4">
              暮色已深，璀璨香火煙雲繚繞，新莊三百年老街上高掛起紅彤彤的燈籠。你大手牽起八戒熱呼呼的手掌，一邊細細品嚼平安鹹光餅的麵香，一邊悠哉遊哉漫步前進...
            </p>

            <button
              onClick={() => {
                resetWorshipSystem();
                resetDroolSystem();
                switchScene('scene1');
              }}
              className="mt-6 w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-100 font-extrabold text-sm py-2.5 px-6 rounded-xl shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>重新體驗美味故事之旅</span>
            </button>
          </div>
        </div>

      </div>

      {/* Touch Screen On-Screen Virtual Arcade Controller Layout */}
      {showTouchPrompt && (
        <div className="w-full max-w-lg mt-5 p-4 bg-amber-950/20 shadow-inner rounded-xl border border-amber-900/30 flex justify-between items-center bg-opacity-70 backdrop-blur" id="mobile-gamepads">
          
          {/* Directional buttons (Left, Right) */}
          <div className="flex space-x-3">
            <button
              onTouchStart={() => handleVirtMoveLeft(true)}
              onTouchEnd={() => handleVirtMoveLeft(false)}
              onMouseDown={() => handleVirtMoveLeft(true)}
              onMouseUp={() => handleVirtMoveLeft(false)}
              onMouseLeave={() => handleVirtMoveLeft(false)}
              className="w-16 h-16 rounded-full bg-amber-900/50 hover:bg-amber-800 border-2 border-amber-700/80 active:scale-90 text-amber-200 text-xl font-bold flex items-center justify-center select-none shadow hover:shadow-amber-500/10 cursor-pointer"
              id="virt-left-btn"
            >
              ◀ 
            </button>
            <button
              onTouchStart={() => handleVirtMoveRight(true)}
              onTouchEnd={() => handleVirtMoveRight(false)}
              onMouseDown={() => handleVirtMoveRight(true)}
              onMouseUp={() => handleVirtMoveRight(false)}
              onMouseLeave={() => handleVirtMoveRight(false)}
              className="w-16 h-16 rounded-full bg-amber-900/50 hover:bg-amber-800 border-2 border-amber-700/80 active:scale-90 text-amber-200 text-xl font-bold flex items-center justify-center select-none shadow hover:shadow-amber-500/10 cursor-pointer"
              id="virt-right-btn"
            >
              ▶
            </button>
          </div>

          <div className="text-center text-[10px] text-amber-200/50 max-w-[120px] leading-tight select-none pointer-events-none hidden sm:block">
            <Smartphone className="w-4 h-4 mx-auto mb-1 opacity-70" />
            偵測到觸控裝置<br />點擊或按住前進
          </div>

          {/* Jump Action Button */}
          <div>
            <button
              onTouchStart={handleVirtJump}
              onMouseDown={handleVirtJump}
              className="w-20 h-16 bg-gradient-to-tr from-yellow-600 to-amber-500 hover:from-yellow-500 hover:to-amber-400 active:scale-90 border-2 border-yellow-400 text-amber-950 font-black tracking-wide flex flex-col items-center justify-center rounded-2xl select-none shadow-lg cursor-pointer text-xs"
              id="virt-jump-btn"
            >
              <span className="text-lg">▲</span>
              <span>JUMP</span>
            </button>
          </div>
        </div>
      )}

      {/* Helpful controls footer row */}
      <p className="text-amber-200/40 text-xs mt-3 flex items-center space-x-1.5 select-none">
        <span>🏮 新莊廟街系列 · 慈祐宮殿前廣場 🏮</span>
      </p>

    </div>
  );
}
