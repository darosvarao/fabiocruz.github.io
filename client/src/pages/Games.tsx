import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import MemoryGame from "@/components/MemoryGame";
import ClickSpeedGame from "@/components/ClickSpeedGame";
import PuzzleGame from "@/components/PuzzleGame";

export default function Games() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("memory");

  const handleGameComplete = () => {
    setTimeout(() => {
      setLocation("/");
    }, 2000);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center cyber-grid">
        <Card className="neon-border-cyan">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to play minigames</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background cyber-grid">
      <div className="container py-8 space-y-8">
        {/* Header */}
        <div>
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-4xl font-bold neon-cyan">Minigames Arena</h1>
          <p className="text-muted-foreground mt-2">
            Play games to earn temporary hash power bonuses
          </p>
        </div>

        {/* Games Tabs */}
        <Card className="neon-border-cyan bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl neon-magenta">Choose Your Game</CardTitle>
            <CardDescription>
              Complete games to earn hash power bonuses that last for 30 minutes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="memory" className="data-[state=active]:neon-border-cyan">
                  Memory Match
                </TabsTrigger>
                <TabsTrigger value="click" className="data-[state=active]:neon-border-magenta">
                  Click Speed
                </TabsTrigger>
                <TabsTrigger value="puzzle" className="data-[state=active]:neon-border-pink">
                  Puzzle Slider
                </TabsTrigger>
              </TabsList>

              <TabsContent value="memory" className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold neon-cyan mb-2">Memory Match</h3>
                  <p className="text-muted-foreground">
                    Match all pairs of crypto symbols. Fewer moves means higher score!
                  </p>
                </div>
                <MemoryGame onComplete={handleGameComplete} />
              </TabsContent>

              <TabsContent value="click" className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold neon-magenta mb-2">Click Speed Challenge</h3>
                  <p className="text-muted-foreground">
                    Click as fast as you can in 10 seconds. More clicks means more hash power!
                  </p>
                </div>
                <ClickSpeedGame onComplete={handleGameComplete} />
              </TabsContent>

              <TabsContent value="puzzle" className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold neon-pink mb-2">Number Puzzle</h3>
                  <p className="text-muted-foreground">
                    Arrange the numbers in order. Solve it quickly with fewer moves for maximum bonus!
                  </p>
                </div>
                <PuzzleGame onComplete={handleGameComplete} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="neon-border-magenta bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle>How Bonuses Work</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-muted-foreground">
            <p>• Each game awards a temporary hash power bonus based on your performance</p>
            <p>• Bonuses last for <strong className="text-primary">30 minutes</strong> from the time you earn them</p>
            <p>• You can stack bonuses by playing multiple games</p>
            <p>• Higher scores earn bigger bonuses</p>
            <p>• The bonus is added to your total hash power when claiming mining rewards</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
