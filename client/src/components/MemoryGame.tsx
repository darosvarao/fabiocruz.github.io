import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const symbols = ["₿", "Ξ", "Ð", "⚡", "💎", "🔥", "⭐", "🚀"];

interface CardType {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryGameProps {
  onComplete: () => void;
}

export default function MemoryGame({ onComplete }: MemoryGameProps) {
  const [cards, setCards] = useState<CardType[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);

  const startGameMutation = trpc.games.startGame.useMutation({
    onSuccess: () => {
      setGameStarted(true);
      setStartTime(Date.now());
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
    initializeGame();
  }, []);

  const initializeGame = () => {
    const gameSymbols = [...symbols, ...symbols];
    const shuffled = gameSymbols
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({
        id: index,
        symbol,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setGameStarted(false);
  };

  const handleCardClick = (id: number) => {
    if (!gameStarted) {
      // Consume energy on first click
      startGameMutation.mutate();
      return; // Wait for mutation to complete
    }

    if (isChecking || flippedCards.length >= 2) return;
    
    const card = cards.find(c => c.id === id);
    if (!card || card.isFlipped || card.isMatched) return;

    const newFlippedCards = [...flippedCards, id];
    setFlippedCards(newFlippedCards);
    
    setCards(cards.map(c => 
      c.id === id ? { ...c, isFlipped: true } : c
    ));

    if (newFlippedCards.length === 2) {
      setMoves(moves + 1);
      checkMatch(newFlippedCards);
    }
  };

  const checkMatch = (flipped: number[]) => {
    setIsChecking(true);
    const [first, second] = flipped;
    const firstCard = cards.find(c => c.id === first);
    const secondCard = cards.find(c => c.id === second);

    setTimeout(() => {
      if (firstCard?.symbol === secondCard?.symbol) {
        setCards(cards.map(c => 
          c.id === first || c.id === second 
            ? { ...c, isMatched: true } 
            : c
        ));
        setMatches(matches + 1);
        
        if (matches + 1 === symbols.length) {
          completeGame();
        }
      } else {
        setCards(cards.map(c => 
          c.id === first || c.id === second 
            ? { ...c, isFlipped: false } 
            : c
        ));
      }
      setFlippedCards([]);
      setIsChecking(false);
    }, 800);
  };

  const completeGame = () => {
    const timeElapsed = Math.floor((Date.now() - startTime) / 1000);
    const score = Math.max(1000 - (moves * 10) - timeElapsed, 100);
    
    submitScoreMutation.mutate({
      gameType: "memory",
      score,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Moves: <span className="text-primary font-bold">{moves}</span></p>
          <p className="text-sm text-muted-foreground">Matches: <span className="text-primary font-bold">{matches}/{symbols.length}</span></p>
        </div>
        <Button onClick={initializeGame} variant="outline" className="neon-border-cyan">
          New Game
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card
            key={card.id}
            className={`aspect-square cursor-pointer transition-all duration-300 ${
              card.isMatched 
                ? "neon-border-cyan bg-primary/20" 
                : card.isFlipped 
                ? "neon-border-magenta bg-card" 
                : "bg-muted hover:bg-muted/80"
            }`}
            onClick={() => handleCardClick(card.id)}
          >
            <CardContent className="flex items-center justify-center h-full p-0">
              {(card.isFlipped || card.isMatched) ? (
                <span className="text-4xl">{card.symbol}</span>
              ) : (
                <span className="text-4xl text-muted-foreground">?</span>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>Match all pairs to earn hash power bonus!</p>
        <p>Fewer moves = higher score = more hash power</p>
      </div>
    </div>
  );
}
