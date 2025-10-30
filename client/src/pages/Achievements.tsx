import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Trophy, Lock } from "lucide-react";
import { Link } from "wouter";

export default function Achievements() {
  const { isAuthenticated } = useAuth();
  const { data: allAchievements, isLoading: loadingAll } = trpc.achievements.getAll.useQuery();
  const { data: userAchievements, isLoading: loadingUser } = trpc.achievements.getUserAchievements.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: stats } = trpc.user.getStats.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: userMiners } = trpc.miners.getUserMiners.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center cyber-grid">
        <Card className="neon-border-cyan">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to view achievements</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const unlockedIds = new Set(userAchievements?.map(ua => ua.achievementId) || []);
  
  const getProgress = (achievement: any) => {
    if (!stats) return 0;
    
    let current = 0;
    switch (achievement.requirementType) {
      case "total_hash_power":
        current = stats.totalHashPower;
        break;
      case "total_btc":
        current = stats.btcBalance;
        break;
      case "miners_owned":
        current = userMiners?.length || 0;
        break;
      case "games_played":
        current = 0; // Would need to track this separately
        break;
    }
    
    return Math.min((current / achievement.requirement) * 100, 100);
  };

  const totalAchievements = allAchievements?.length || 0;
  const unlockedCount = userAchievements?.length || 0;
  const completionPercentage = totalAchievements > 0 ? (unlockedCount / totalAchievements) * 100 : 0;

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
          <h1 className="text-4xl font-bold neon-cyan">Achievements</h1>
          <p className="text-muted-foreground mt-2">
            Track your progress and unlock special rewards
          </p>
        </div>

        {/* Progress Overview */}
        <Card className="neon-border-cyan bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-primary" />
              Overall Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold neon-cyan">
                {unlockedCount} / {totalAchievements}
              </span>
              <span className="text-muted-foreground">Achievements Unlocked</span>
            </div>
            <Progress value={completionPercentage} className="h-3" />
            <p className="text-sm text-muted-foreground text-center">
              {completionPercentage.toFixed(1)}% Complete
            </p>
          </CardContent>
        </Card>

        {/* Achievements Grid */}
        {loadingAll || loadingUser ? (
          <div className="text-center text-2xl neon-cyan">Loading achievements...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allAchievements?.map((achievement) => {
              const isUnlocked = unlockedIds.has(achievement.id);
              const progress = getProgress(achievement);
              const unlockData = userAchievements?.find(ua => ua.achievementId === achievement.id);

              return (
                <Card
                  key={achievement.id}
                  className={`${
                    isUnlocked
                      ? "neon-border-cyan bg-card/80"
                      : "bg-muted/50 border-muted"
                  } backdrop-blur transition-all`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`text-4xl ${isUnlocked ? "" : "grayscale opacity-50"}`}>
                          {achievement.icon}
                        </div>
                        <div>
                          <CardTitle className={`text-lg ${isUnlocked ? "neon-cyan" : "text-muted-foreground"}`}>
                            {achievement.name}
                          </CardTitle>
                          {isUnlocked && unlockData && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Unlocked {new Date(unlockData.unlockedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      {!isUnlocked && (
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className={`text-sm ${isUnlocked ? "text-foreground" : "text-muted-foreground"}`}>
                      {achievement.description}
                    </p>
                    
                    {!isUnlocked && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Progress</span>
                          <span>{progress.toFixed(0)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <span className="text-sm text-muted-foreground">Reward</span>
                      <Badge variant={isUnlocked ? "default" : "secondary"} className="font-bold">
                        +{achievement.rewardCredits} Credits
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Info Card */}
        <Card className="neon-border-magenta bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle>About Achievements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-muted-foreground">
            <p>• Achievements are unlocked automatically when you meet their requirements</p>
            <p>• Each achievement rewards you with bonus credits</p>
            <p>• Track your progress towards locked achievements</p>
            <p>• Collect them all to become a legendary crypto miner!</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
