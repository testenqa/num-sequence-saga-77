import { cn } from "@/lib/utils";
import { Tile } from "@/types/game";

interface NumberTileProps {
  tile: Tile;
  onClick: () => void;
  onMouseEnter: () => void;
  className?: string;
}

export const NumberTile = ({ tile, onClick, onMouseEnter, className }: NumberTileProps) => {
  const getNumberStyle = (value: number) => {
    const styles = {
      1: { color: 'transparent', WebkitTextStroke: '2px hsl(0 85% 65%)' },
      2: { color: 'transparent', WebkitTextStroke: '2px hsl(30 95% 65%)' },
      3: { color: 'transparent', WebkitTextStroke: '2px hsl(60 85% 65%)' },
      4: { color: 'transparent', WebkitTextStroke: '2px hsl(120 75% 55%)' },
      5: { color: 'transparent', WebkitTextStroke: '2px hsl(180 85% 60%)' },
      6: { color: 'transparent', WebkitTextStroke: '2px hsl(220 90% 70%)' },
      7: { color: 'transparent', WebkitTextStroke: '2px hsl(270 85% 75%)' },
      8: { color: 'transparent', WebkitTextStroke: '2px hsl(320 85% 70%)' },
      9: { color: 'transparent', WebkitTextStroke: '2px hsl(15 90% 65%)' },
    };
    return styles[value as keyof typeof styles] || { color: 'hsl(var(--foreground))' };
  };

  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={cn(
        "relative w-16 h-16 rounded-lg text-3xl",
        "transition-all duration-200 transform-gpu",
        "hover:scale-110 hover:shadow-md active:scale-95",
        "bg-tile-bg p-0.5",
        "hover:bg-tile-hover",
        tile.isSelected && "ring-3 ring-selected scale-110 shadow-lg",
        tile.isInPath && "ring-2 ring-path-valid shadow-md scale-105",
        tile.isAnimating && "animate-fall",
        className
      )}
      style={{
        background: `linear-gradient(135deg, hsl(220 60% 85%), hsl(240 70% 88%), hsl(200 65% 82%))`,
        padding: '2px'
      }}
    >
      {/* Inner tile content */}
      <div className={cn(
        "w-full h-full rounded-md bg-tile-bg flex items-center justify-center",
        "transition-all duration-200",
        tile.isSelected && "bg-tile-selected/5",
        tile.isInPath && !tile.isSelected && "bg-path-valid/5",
        "hover:bg-tile-hover"
      )}>
        <span 
          className="relative z-10 font-normal select-none"
          style={getNumberStyle(tile.value)}
        >
          {tile.value}
        </span>
      </div>
      
      {/* Glow effect for selected tiles */}
      {tile.isSelected && (
        <div className="absolute inset-0 rounded-lg bg-selected/10 animate-pulse-glow" />
      )}
      
      {/* Path indicator */}
      {tile.isInPath && !tile.isSelected && (
        <div className="absolute inset-0 rounded-lg bg-path-valid/10" />
      )}
    </button>
  );
};