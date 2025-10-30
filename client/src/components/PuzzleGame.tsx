import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface PuzzleGameProps {
  onComplete: () => void;
}

export default function PuzzleGame({ onComplete }: PuzzleGameProps) {
  const [tiles, setTiles] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);

  const submitScoreMutation = trpc.games.submitScore.useMutation({
    onSuccess: (data) => {
      toast.success(`Puzzle solved! Earned ${data.hashPowerBonus} hash power for 30 minutes!`);
      onComplete();
    },
  });

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    let shuffled: number[];
    do {
      shuffled = shuffle(Array.from({ length: 9 }, (_, i) => i));
    } while (!isSolvable(shuffled) || isSolved(shuffled));
    
    setTiles(shuffled);
    setMoves(0);
    setIsWon(false);
    setStartTime(Date.now());
  };

  const shuffle = (array: number[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const isSolvable = (tiles: number[]) => {
    let inversions = 0;
    for (let i = 0; i < tiles.length; i++) {
      for (let j = i + 1; j < tiles.length; j++) {
        if (tiles[i] && tiles[j] && tiles[i] > tiles[j]) {
          inversions++;
        }
      }
    }
    return inversions % 2 === 0;
  };

  const isSolved = (tiles: number[]) => {
    for (let i = 0; i < tiles.length - 1; i++) {
      if (tiles[i] !== i + 1) return false;
    }
    return tiles[tiles.length - 1] === 0;
  };

  const canMove = (index: number) => {
    const emptyIndex = tiles.indexOf(0);
    const row = Math.floor(index / 3);
    const col = index % 3;
    const emptyRow = Math.floor(emptyIndex / 3);
    const emptyCol = emptyIndex % 3;

    return (
      (row === emptyRow && Math.abs(col - emptyCol) === 1) ||
      (col === emptyCol && Math.abs(row - emptyRow) === 1)
    );
  };

  const handleTileClick = (index: number) => {
    if (isWon || !canMove(index)) return;

    const emptyIndex = tiles.indexOf(0);
    const newTiles = [...tiles];
    [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];
    
    setTiles(newTiles);
    setMoves(moves + 1);

    if (isSolved(newTiles)) {
      setIsWon(true);
      const timeElapsed = Math.floor((Date.now() - startTime) / 1000);
      const score = Math.max(2000 - (moves * 20) - (timeElapsed * 2), 200);
      
      submitScoreMutation.mutate({
        gameType: "puzzle",
        score,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Moves: <span className="text-primary font-bold">{moves}</span>
          </p>
          {isWon && (
            <p className="text-lg font-bold neon-cyan">Puzzle Solved!</p>
          )}
        </div>
        <Button onClick={initializeGame} variant="outline" className="neon-border-cyan">
          New Puzzle
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto">
        {tiles.map((tile, index) => (
          <Card
            key={index}
            className={`aspect-square cursor-pointer transition-all ${
              tile === 0
                ? "bg-background/20 border-dashed"
                : canMove(index)
                ? "neon-border-cyan bg-card hover:scale-105"
                : "bg-muted cursor-not-allowed"
            }`}
            onClick={() => handleTileClick(index)}
          >
            <CardContent className="flex items-center justify-center h-full p-0">
              {tile !== 0 && (
                <span className="text-4xl font-bold neon-magenta">{tile}</span>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center text-sm text-muted-foreground space-y-1">
        <p>Arrange the numbers in order from 1 to 8</p>
        <p>Click tiles adjacent to the empty space to move them</p>
        <p>Fewer moves = higher score = more hash power</p>
      </div>
    </div>
  );
}
