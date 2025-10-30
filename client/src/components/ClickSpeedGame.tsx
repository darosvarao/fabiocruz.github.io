import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Zap } from "lucide-react";

interface ClickSpeedGameProps {
  onComplete: () => void;
}

export default function ClickSpeedGame({ onComplete }: ClickSpeedGameProps) {
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startGameMutation = trpc.games.startGame.useMutation({
    onSuccess: () => {
      setIsPlaying(true);
      setTimeLeft(10);
      setClicks(0);
      setGameOver(false);
    },
    onError: (error) => {
      toast.error("Cannot start game", {
        description: error.message,
      });
    },
  });

  const submitScoreMutation = trpc.games.submitScore.useMutation({
    onSuccess: (data) => {
      toast.success(`Game complete! Earned ${data.hashPowerBonus} hash power for 30 minutes!`);
      onComplete();
    },
    onError: (error) => {
      toast.error("Failed to submit score", {
        description: error.message,
      });
    },
  });

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && isPlaying) {
      endGame();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, isPlaying]);

  const startGame = () => {
    // Consume energy when starting game
    startGameMutation.mutate();
  };

  const handleClick = () => {
    if (isPlaying && timeLeft > 0) {
      setClicks(clicks + 1);
    }
  };

  const endGame = () => {
    setIsPlaying(false);
    setGameOver(true);
    
    const score = clicks * 10;
    submitScoreMutation.mutate({
      gameType: "click_speed",
      score,
    });
  };

  const getCPS = () => {
    if (timeLeft === 10) return 0;
    return (clicks / (10 - timeLeft)).toFixed(1);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        {!isPlaying && !gameOver && (
          <div className="space-y-4">
            <p className="text-muted-foreground">Click as fast as you can in 10 seconds!</p>
            <Button 
              onClick={startGame} 
              size="lg"
              className="neon-border-cyan"
            >
              Start Game
            </Button>
          </div>
        )}

        {isPlaying && (
          <div className="space-y-6">
            <div className="text-6xl font-bold neon-cyan">
              {timeLeft}
            </div>
            <Card 
              className="neon-border-magenta bg-card/80 cursor-pointer select-none hover:scale-105 transition-transform active:scale-95"
              onClick={handleClick}
            >
              <CardContent className="p-16">
                <Zap className="w-32 h-32 mx-auto text-primary pulse-glow" />
              </CardContent>
            </Card>
            <div className="space-y-2">
              <p className="text-4xl font-bold neon-magenta">{clicks}</p>
              <p className="text-sm text-muted-foreground">Clicks</p>
              <p className="text-lg text-muted-foreground">
                {getCPS()} <span className="text-xs">clicks/sec</span>
              </p>
            </div>
          </div>
        )}

        {gameOver && (
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-2xl font-bold neon-cyan">Game Over!</p>
              <p className="text-4xl font-bold neon-magenta">{clicks}</p>
              <p className="text-sm text-muted-foreground">Total Clicks</p>
              <p className="text-lg text-muted-foreground">
                Average: {getCPS()} clicks/sec
              </p>
            </div>
            <Button 
              onClick={startGame} 
              variant="outline"
              className="neon-border-cyan"
            >
              Play Again
            </Button>
          </div>
        )}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>Click the lightning bolt as many times as you can!</p>
        <p>More clicks = higher score = more hash power</p>
      </div>
    </div>
  );
}
