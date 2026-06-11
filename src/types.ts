export type GameState = 'START' | 'WORSHIP' | 'PLAYING' | 'GAMEOVER' | 'PAUSED' | 'INTERACTIVE_DIALOG' | 'VICTORY';

export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  speed: number;
  jumpPower: number;
  isGrounded: boolean;
  facing: 'LEFT' | 'RIGHT';
  animFrame: number;
  isMoving: boolean;
}

export type FoodType = 'NORMAL' | 'GOLDEN' | 'ROTTEN';

export interface Food {
  id: string;
  x: number;
  y: number;
  radius: number;
  speedY: number;
  speedX: number;
  rotation: number;
  rotSpeed: number;
  points: number;
  satietyRestore: number;
  type: FoodType;
  color: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export type BajieExpression = 'SHY' | 'WINK' | 'HUNGRY' | 'CRY' | 'STARRY' | 'SMILE';

export interface DialogueChoice {
  text: string;
  nextId: string;
  affectionBonus: number;
  reply?: string;
}

export interface DialogueNode {
  id: string;
  text: string;
  expression: BajieExpression;
  choices: DialogueChoice[];
  action?: string;
}

