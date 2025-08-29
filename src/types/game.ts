export type Position = {
  row: number;
  col: number;
};

export type Tile = {
  id: string;
  value: number;
  position: Position;
  isSelected: boolean;
  isInPath: boolean;
  isAnimating?: boolean;
};

export type GameState = {
  grid: Tile[][];
  selectedPath: Position[];
  score: number;
  isValidPath: boolean;
  gameMode: 'ascending' | 'descending' | null;
  consecutiveClears: number;
};

export type Direction = 
  | 'up' | 'down' | 'left' | 'right'
  | 'up-left' | 'up-right' | 'down-left' | 'down-right';