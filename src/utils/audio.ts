// Simple browser Web Audio API synthesizer for retro sound effects
let audioCtx: AudioContext | null = null;
let isMuted = false;

function getAudioContext(): AudioContext | null {
  if (isMuted) return null;
  if (typeof window === 'undefined') return null;
  
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  
  return audioCtx;
}

export const toggleMute = (): boolean => {
  isMuted = !isMuted;
  if (isMuted && audioCtx) {
    audioCtx.close().then(() => {
      audioCtx = null;
    });
  }
  return isMuted;
};

export const getMuteState = (): boolean => {
  return isMuted;
};

// Play retro jump sound (frequency sweep up)
export const playJumpSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = 'triangle'; // Retro NES sound
  osc.frequency.setValueAtTime(150, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.15);

  gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.15);

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.15);
};

// Play retro food eat sound (fast, cute dual-tone arpeggio)
export const playCollectSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  
  // Note 1
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'square';
  osc1.frequency.setValueAtTime(523.25, now); // C5
  gain1.gain.setValueAtTime(0.08, now);
  gain1.gain.linearRampToValueAtTime(0.01, now + 0.08);
  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.start(now);
  osc1.stop(now + 0.08);

  // Note 2 (slightly offset)
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'square';
  osc2.frequency.setValueAtTime(783.99, now + 0.08); // G5
  gain2.gain.setValueAtTime(0.08, now + 0.08);
  gain2.gain.linearRampToValueAtTime(0.01, now + 0.2);
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.start(now + 0.08);
  osc2.stop(now + 0.2);
};

// Play retro game over sound (melancholic cascading sweep down)
export const playGameOverSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(300, now);
  osc.frequency.linearRampToValueAtTime(120, now + 0.6);

  gainNode.gain.setValueAtTime(0.15, now);
  gainNode.gain.setValueAtTime(0.15, now + 0.1);
  gainNode.gain.linearRampToValueAtTime(0.01, now + 0.6);

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.6);
};
