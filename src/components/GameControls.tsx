import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface GameControlsProps {
  score: number;
  selectedCount: number;
  isValidPath: boolean;
  gameMode: 'ascending' | 'descending' | null;
  onSubmit: () => void;
  onClear: () => void;
  onNewGame: () => void;
  consecutiveClears: number;
}

export const GameControls = ({
  score,
  selectedCount,
  isValidPath,
  gameMode,
  onSubmit,
  onClear,
  onNewGame,
  consecutiveClears
}: GameControlsProps) => {
  return (
    <Card className="p-6 space-y-6 bg-card border-game-border">
      {/* Score Display */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-primary animate-slide-up">
          {score.toLocaleString()}
        </h2>
        <p className="text-muted-foreground">Score</p>
        
        {consecutiveClears > 0 && (
          <div className="flex items-center justify-center gap-2">
            <span className="text-accent font-bold animate-bounce-in">
              {consecutiveClears}x Combo!
            </span>
          </div>
        )}
      </div>

      {/* Game Mode Indicator */}
      {gameMode && (
        <div className="text-center">
          <div className={cn(
            "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
            "animate-pulse-glow",
            gameMode === 'ascending' 
              ? "bg-path-valid text-white" 
              : "bg-accent text-accent-foreground"
          )}>
            {gameMode === 'ascending' ? '↗ Ascending' : '↘ Descending'}
          </div>
        </div>
      )}

      {/* Path Info */}
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Selected: <span className="font-bold text-foreground">{selectedCount}</span>
        </p>
        {selectedCount > 0 && (
          <div className={cn(
            "text-xs px-2 py-1 rounded",
            selectedCount < 2 
              ? "text-muted-foreground"
              : isValidPath 
                ? "text-path-valid bg-path-valid/10"
                : "text-path-invalid bg-path-invalid/10"
          )}>
            {selectedCount < 2 
              ? "Minimum 2 tiles"
              : isValidPath 
                ? "Ready to submit!"
                : "Invalid sequence"
            }
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          onClick={onSubmit}
          disabled={!isValidPath || selectedCount < 2}
          className={cn(
            "w-full font-bold transition-all duration-300",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            isValidPath && selectedCount >= 2 && "animate-pulse-glow"
          )}
          variant={isValidPath && selectedCount >= 2 ? "default" : "secondary"}
        >
          Submit Sequence
        </Button>
        
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={onClear}
            variant="outline"
            disabled={selectedCount === 0}
            className="font-medium"
          >
            Clear
          </Button>
          
          <Button
            onClick={onNewGame}
            variant="outline"
            className="font-medium"
          >
            New Game
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t border-game-border">
        <p>• Select numbers in ascending (1→2→3) or descending (9→8→7) order</p>
        <p>• Move in any direction including diagonal</p>
        <p>• Minimum 2 numbers required</p>
        <p>• Longer sequences = higher scores!</p>
      </div>
    </Card>
  );
};