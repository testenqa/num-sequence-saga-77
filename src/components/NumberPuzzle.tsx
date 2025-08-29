import { useState, useCallback, useEffect } from "react";
import { GameGrid } from "./GameGrid";
import { GameControls } from "./GameControls";
import { GameState, Position, Tile } from "@/types/game";
import { 
  generateRandomGrid, 
  isValidSequence, 
  calculateScore, 
  removeTilesAndDrop,
  clearAnimations
} from "@/utils/gameLogic";
import { toast } from "sonner";
import { playCoinDropSound } from "@/utils/audioUtils";

export const NumberPuzzle = () => {
  const [gameState, setGameState] = useState<GameState>({
    grid: generateRandomGrid(),
    selectedPath: [],
    score: 0,
    isValidPath: false,
    gameMode: null,
    consecutiveClears: 0
  });

  const [isMouseDown, setIsMouseDown] = useState(false);

  // Clear animations after they complete
  useEffect(() => {
    const hasAnimatingTiles = gameState.grid.some(row => 
      row.some(tile => tile.isAnimating)
    );
    
    if (hasAnimatingTiles) {
      const timer = setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          grid: clearAnimations(prev.grid)
        }));
      }, 600);
      
      return () => clearTimeout(timer);
    }
  }, [gameState.grid]);

  const updateGridState = useCallback((grid: Tile[][], selectedPath: Position[]) => {
    const newGrid = grid.map(row => 
      row.map(tile => ({
        ...tile,
        isSelected: selectedPath.some(pos => 
          pos.row === tile.position.row && pos.col === tile.position.col
        ),
        isInPath: selectedPath.some(pos => 
          pos.row === tile.position.row && pos.col === tile.position.col
        )
      }))
    );
    
    const validation = isValidSequence(selectedPath, newGrid);
    
    return {
      grid: newGrid,
      isValidPath: validation.valid,
      gameMode: validation.mode
    };
  }, []);

  const handleTileClick = useCallback((position: Position) => {
    setGameState(prev => {
      const isAlreadySelected = prev.selectedPath.some(pos => 
        pos.row === position.row && pos.col === position.col
      );

      // If we already have a valid sequence and player clicks
      if (prev.isValidPath && prev.selectedPath.length >= 2 && !isAlreadySelected) {
        // Check if the clicked tile would extend the current sequence
        const lastSelected = prev.selectedPath[prev.selectedPath.length - 1];
        const clickedValue = prev.grid[position.row][position.col].value;
        const lastValue = prev.grid[lastSelected.row][lastSelected.col].value;
        
        // Check if adjacent
        const rowDiff = Math.abs(position.row - lastSelected.row);
        const colDiff = Math.abs(position.col - lastSelected.col);
        const isAdjacent = rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0);
        
        // Check if continues the sequence pattern
        let continuesSequence = false;
        if (isAdjacent) {
          if (prev.gameMode === 'ascending') {
            continuesSequence = clickedValue === lastValue + 1;
          } else if (prev.gameMode === 'descending') {
            continuesSequence = clickedValue === lastValue - 1;
          }
        }
        
        if (continuesSequence) {
          // Extend the sequence
          const newPath = [...prev.selectedPath, position];
          const { grid, isValidPath, gameMode } = updateGridState(prev.grid, newPath);
          
          return {
            ...prev,
            selectedPath: newPath,
            grid,
            isValidPath,
            gameMode
          };
        } else {
          // Submit the current sequence since the new tile doesn't extend it
          setTimeout(() => {
            const points = calculateScore(prev.selectedPath, prev.grid);
            const newGrid = removeTilesAndDrop(prev.grid, prev.selectedPath);
            
            setGameState(prevState => ({
              ...prevState,
              grid: newGrid,
              selectedPath: [],
              score: prevState.score + points,
              isValidPath: false,
              gameMode: null,
              consecutiveClears: prevState.consecutiveClears + 1
            }));

            const sequenceNumbers = prev.selectedPath.map(pos => prev.grid[pos.row][pos.col].value).join(' + ');
            
            playCoinDropSound();
            toast.success(`+${points} points!`, {
              description: `${sequenceNumbers} = ${points}`
            });
          }, 0);
          
          return prev; // Don't modify state immediately
        }
      }

      let newPath: Position[];

      if (isAlreadySelected) {
        // If clicking on already selected tile, remove it and everything after it
        const index = prev.selectedPath.findIndex(pos => 
          pos.row === position.row && pos.col === position.col
        );
        newPath = prev.selectedPath.slice(0, index);
      } else {
        // Add to path
        newPath = [...prev.selectedPath, position];
      }

      const { grid, isValidPath, gameMode } = updateGridState(prev.grid, newPath);

      return {
        ...prev,
        selectedPath: newPath,
        grid,
        isValidPath,
        gameMode
      };
    });
  }, [updateGridState]);

  const handleTileHover = useCallback((position: Position) => {
    if (!isMouseDown || gameState.selectedPath.length === 0) return;

    setGameState(prev => {
      const lastSelected = prev.selectedPath[prev.selectedPath.length - 1];
      
      // Check if hovering over an adjacent tile
      const rowDiff = Math.abs(position.row - lastSelected.row);
      const colDiff = Math.abs(position.col - lastSelected.col);
      const isAdjacent = rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0);
      
      if (!isAdjacent) return prev;

      const isAlreadyInPath = prev.selectedPath.some(pos => 
        pos.row === position.row && pos.col === position.col
      );

      if (isAlreadyInPath) return prev;

      // For sequences of 2+, check if this continues the established pattern
      if (prev.selectedPath.length >= 1) {
        const currentValue = prev.grid[position.row][position.col].value;
        const lastValue = prev.grid[lastSelected.row][lastSelected.col].value;
        
        // If we have 2+ tiles, check against the established mode
        if (prev.selectedPath.length >= 2 && prev.gameMode) {
          const expectedValue = prev.gameMode === 'ascending' ? lastValue + 1 : lastValue - 1;
          if (currentValue !== expectedValue) return prev; // Don't extend if it breaks the pattern
        }
        // For the second tile, allow either direction
        else if (prev.selectedPath.length === 1) {
          const isValidNext = currentValue === lastValue + 1 || currentValue === lastValue - 1;
          if (!isValidNext) return prev; // Only allow consecutive numbers
        }
      }

      const newPath = [...prev.selectedPath, position];
      const { grid, isValidPath, gameMode } = updateGridState(prev.grid, newPath);

      return {
        ...prev,
        selectedPath: newPath,
        grid,
        isValidPath,
        gameMode
      };
    });
  }, [isMouseDown, gameState.selectedPath.length, updateGridState]);

  const handleSubmit = useCallback(() => {
    if (!gameState.isValidPath || gameState.selectedPath.length < 2) {
      toast.error("Invalid sequence!");
      return;
    }

    const points = calculateScore(gameState.selectedPath, gameState.grid);
    const newGrid = removeTilesAndDrop(gameState.grid, gameState.selectedPath);

    setGameState(prev => ({
      ...prev,
      grid: newGrid,
      selectedPath: [],
      score: prev.score + points,
      isValidPath: false,
      gameMode: null,
      consecutiveClears: prev.consecutiveClears + 1
    }));

    const sequenceNumbers = gameState.selectedPath.map(pos => gameState.grid[pos.row][pos.col].value).join(' + ');
    
    playCoinDropSound();
    toast.success(`+${points} points!`, {
      description: `${sequenceNumbers} = ${points}`
    });
  }, [gameState.isValidPath, gameState.selectedPath, gameState.grid, gameState.consecutiveClears]);

  const handleClear = useCallback(() => {
    setGameState(prev => {
      const { grid } = updateGridState(prev.grid, []);
      return {
        ...prev,
        selectedPath: [],
        grid,
        isValidPath: false,
        gameMode: null,
        consecutiveClears: 0
      };
    });
  }, [updateGridState]);

  const handleNewGame = useCallback(() => {
    setGameState({
      grid: generateRandomGrid(),
      selectedPath: [],
      score: 0,
      isValidPath: false,
      gameMode: null,
      consecutiveClears: 0
    });
    toast.success("New game started!");
  }, []);

  const handleRightClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); // Prevent context menu
    
    if (gameState.isValidPath && gameState.selectedPath.length >= 2) {
      const points = calculateScore(gameState.selectedPath, gameState.grid);
      const newGrid = removeTilesAndDrop(gameState.grid, gameState.selectedPath);
      
      setGameState(prev => ({
        ...prev,
        grid: newGrid,
        selectedPath: [],
        score: prev.score + points,
        isValidPath: false,
        gameMode: null,
        consecutiveClears: prev.consecutiveClears + 1
      }));

      const sequenceNumbers = gameState.selectedPath.map(pos => gameState.grid[pos.row][pos.col].value).join(' + ');
      
      playCoinDropSound();
      toast.success(`+${points} points!`, {
        description: `Right-click submit! ${sequenceNumbers} = ${points}`
      });
    } else if (gameState.selectedPath.length > 0) {
      toast.error("Invalid sequence! Need 2+ tiles in order.");
    }
  }, [gameState.isValidPath, gameState.selectedPath, gameState.grid, gameState.consecutiveClears]);

  return (
    <div 
      className="min-h-screen bg-background p-4"
      onMouseDown={() => setIsMouseDown(true)}
      onMouseUp={() => setIsMouseDown(false)}
      onContextMenu={handleRightClick}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2 animate-slide-up">
            Number Puzzle
          </h1>
          <p className="text-muted-foreground animate-slide-up">
            9×9 Grid • Create sequences of ascending or descending numbers • Right-click to submit
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">
          <GameGrid
            grid={gameState.grid}
            onTileClick={handleTileClick}
            onTileHover={handleTileHover}
            selectedPath={gameState.selectedPath}
            isValidPath={gameState.isValidPath}
          />

          <GameControls
            score={gameState.score}
            selectedCount={gameState.selectedPath.length}
            isValidPath={gameState.isValidPath}
            gameMode={gameState.gameMode}
            onSubmit={handleSubmit}
            onClear={handleClear}
            onNewGame={handleNewGame}
            consecutiveClears={gameState.consecutiveClears}
          />
        </div>
      </div>
    </div>
  );
};