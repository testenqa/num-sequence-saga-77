import { Tile, Position } from "@/types/game";
import { NumberTile } from "./NumberTile";
import { cn } from "@/lib/utils";

interface GameGridProps {
  grid: Tile[][];
  onTileClick: (position: Position) => void;
  onTileHover: (position: Position) => void;
  selectedPath: Position[];
  isValidPath: boolean;
}

export const GameGrid = ({ 
  grid, 
  onTileClick, 
  onTileHover, 
  selectedPath, 
  isValidPath 
}: GameGridProps) => {
  return (
    <div className="relative">
      {/* Grid background with gradient */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-game-bg to-card border border-game-border shadow-lg" />
      
      {/* Grid content */}
      <div className="relative p-4">
        <div className="grid grid-cols-9 gap-1 max-w-fit mx-auto">
          {grid.map((row, rowIndex) =>
            row.map((tile, colIndex) => (
              <NumberTile
                key={tile.id}
                tile={tile}
                onClick={() => onTileClick({ row: rowIndex, col: colIndex })}
                onMouseEnter={() => onTileHover({ row: rowIndex, col: colIndex })}
                className={cn(
                  "transition-all duration-300",
                  tile.isAnimating && "animate-bounce-in"
                )}
              />
            ))
          )}
        </div>
        
        {/* Path validation indicator */}
        {selectedPath.length > 0 && (
          <div className={cn(
            "absolute -top-2 left-1/2 transform -translate-x-1/2",
            "px-4 py-2 rounded-full text-sm font-bold",
            "transition-all duration-300 animate-slide-up",
            isValidPath 
              ? "bg-path-valid text-white shadow-lg" 
              : selectedPath.length >= 2 
                ? "bg-path-invalid text-white shadow-lg"
                : "bg-muted text-muted-foreground"
          )}>
            {selectedPath.length < 2 
              ? `${selectedPath.length}/2 minimum`
              : isValidPath 
                ? "Valid sequence!" 
                : "Invalid sequence"
            }
          </div>
        )}
      </div>
    </div>
  );
};