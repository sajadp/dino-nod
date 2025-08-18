export enum GameState {
  MainMenu,
  Playing,
  GameOver,
  Leaderboard,
}

export enum Theme {
  Light = 'light',
  Dark = 'dark',
}

export interface ObstacleState {
  id: number;
  x: number;
  width: number;
  height: number;
  y: number;
  passed: boolean;
  type: 'pillar' | 'pit' | 'flying' | 'heart' | 'coin' | 'bomb';
}