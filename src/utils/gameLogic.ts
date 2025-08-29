import { Tile, Position, GameState, Direction } from '../types/game';

export const generateRandomGrid = (): Tile[][] => {
  const grid: Tile[][] = [];
  
  for (let row = 0; row < 9; row++) {
    grid[row] = [];
    for (let col = 0; col < 9; col++) {
      grid[row][col] = {
        id: `${row}-${col}-${Date.now()}-${Math.random()}`,
        value: Math.floor(Math.random() * 9) + 1,
        position: { row, col },
        isSelected: false,
        isInPath: false,
      };
    }
  }
  
  return grid;
};

export const isAdjacent = (pos1: Position, pos2: Position): boolean => {
  const rowDiff = Math.abs(pos1.row - pos2.row);
  const colDiff = Math.abs(pos1.col - pos2.col);
  
  return (rowDiff <= 1 && colDiff <= 1) && !(rowDiff === 0 && colDiff === 0);
};

export const isValidSequence = (path: Position[], grid: Tile[][]): { valid: boolean; mode: 'ascending' | 'descending' | null } => {
  if (path.length < 2) return { valid: false, mode: null };
  
  const values = path.map(pos => grid[pos.row][pos.col].value);
  
  // Check if ascending
  let isAscending = true;
  for (let i = 1; i < values.length; i++) {
    if (values[i] !== values[i-1] + 1) {
      isAscending = false;
      break;
    }
  }
  
  // Check if descending
  let isDescending = true;
  for (let i = 1; i < values.length; i++) {
    if (values[i] !== values[i-1] - 1) {
      isDescending = false;
      break;
    }
  }
  
  // Check adjacency
  let isAdjacencyValid = true;
  for (let i = 1; i < path.length; i++) {
    if (!isAdjacent(path[i-1], path[i])) {
      isAdjacencyValid = false;
      break;
    }
  }
  
  const valid = isAdjacencyValid && (isAscending || isDescending);
  const mode = isAscending ? 'ascending' : isDescending ? 'descending' : null;
  
  return { valid, mode };
};

export const calculateScore = (path: Position[], grid: Tile[][]): number => {
  return path.reduce((sum, pos) => {
    return sum + grid[pos.row][pos.col].value;
  }, 0);
};

export const removeTilesAndDrop = (grid: Tile[][], path: Position[]): Tile[][] => {
  const newGrid = grid.map(row => [...row]);
  
  // Mark tiles for removal
  path.forEach(pos => {
    newGrid[pos.row][pos.col] = null as any;
  });
  
  // Drop tiles down
  for (let col = 0; col < 9; col++) {
    const column = [];
    
    // Collect non-null tiles
    for (let row = 8; row >= 0; row--) {
      if (newGrid[row][col] !== null) {
        column.push(newGrid[row][col]);
      }
    }
    
    // Fill column from bottom up
    for (let row = 8; row >= 0; row--) {
      if (column.length > 0) {
        const tile = column.shift()!;
        newGrid[row][col] = {
          ...tile,
          position: { row, col },
          id: `${row}-${col}-${Date.now()}-${Math.random()}`,
          isAnimating: tile.position.row !== row
        };
      } else {
        // Generate new tile for empty spaces
        newGrid[row][col] = {
          id: `${row}-${col}-${Date.now()}-${Math.random()}`,
          value: Math.floor(Math.random() * 9) + 1,
          position: { row, col },
          isSelected: false,
          isInPath: false,
          isAnimating: true
        };
      }
    }
  }
  
  return newGrid;
};

export const clearAnimations = (grid: Tile[][]): Tile[][] => {
  return grid.map(row => 
    row.map(tile => ({
      ...tile,
      isAnimating: false
    }))
  );
};