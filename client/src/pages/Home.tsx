import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Cpu, Zap, Bitcoin, Coins, Trophy, Gamepad2, ArrowRight, History as HistoryIcon, Battery, Play } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export default function Home() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { data: stats, refetch: refetchStats } = trpc.user.getStats.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 1000,
  });
  const watchAdMutation = trpc.ads.watch.useMutation({
    onSuccess: (data) => {
      refetchStats();
      toast.success(`Earned ${data.creditsEarned} credits!`, {
        description: `New balance: ${data.newBalance} credits`,
      });
    },
    onError: (error) => {
      toast.error("Cannot watch ad", {
        description: error.message,
      });
    },
  });

  const claimRewardMutation = trpc.mining.claimReward.useMutation({
    onSuccess: () => {
      refetchStats();
    },
  });

  const [timeUntilClaim, setTimeUntilClaim] = useState(600); // 10 minutes in seconds

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeUntilClaim((prev) => {
        if (prev <= 0) return 600;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCrypto = (amount: number, decimals: number) => {
    return (amount / Math.pow(10, decimals)).toFixed(decimals);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center cyber-grid">
        <div className="text-2xl neon-cyan">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center cyber-grid scanlines">
        <div className="container max-w-4xl text-center space-y-8">
          <h1 className="text-6xl md:text-8xl font-bold neon-cyan mb-4">
            CryptoMiner
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold neon-magenta">
            Simulator
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mt-6">
            Mine virtual cryptocurrencies, build your mining empire, and compete with players worldwide in this cyberpunk mining simulation.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <Card className="neon-border-cyan bg-card/50 backdrop-blur">
              <CardHeader>
                <Cpu className="w-12 h-12 text-primary mx-auto mb-2" />
                <CardTitle className="text-xl">Build Your Rig</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Purchase and upgrade mining equipment from CPUs to legendary quantum miners.
                </p>
              </CardContent>
            </Card>

            <Card className="neon-border-magenta bg-card/50 backdrop-blur">
              <CardHeader>
                <Gamepad2 className="w-12 h-12 text-secondary mx-auto mb-2" />
                <CardTitle className="text-xl">Play Minigames</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Boost your hash power by playing fun minigames and earning temporary bonuses.
                </p>
              </CardContent>
            </Card>

            <Card className="neon-border-pink bg-card/50 backdrop-blur">
              <CardHeader>
                <Bitcoin className="w-12 h-12 text-accent mx-auto mb-2" />
                <CardTitle className="text-xl">Mine Crypto</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Earn virtual Bitcoin, Ethereum, and Dogecoin every 10 minutes based on your hash power.
                </p>
              </CardContent>
            </Card>
          </div>

          <Button 
            size="lg" 
            className="mt-12 text-lg px-8 py-6 neon-border-cyan"
            onClick={() => window.location.href = getLoginUrl()}
          >
            Start Mining Now <ArrowRight className="ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background cyber-grid">
      <div className="container py-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold neon-cyan">Mining Dashboard</h1>
            <p className="text-muted-foreground mt-2">Welcome back, {user?.name || 'Miner'}</p>
          </div>
          <div className="flex gap-4">
            <Link href="/shop">
              <Button variant="outline" className="neon-border-cyan">
                <Coins className="mr-2 h-4 w-4" />
                Shop
              </Button>
            </Link>
            <Link href="/games">
              <Button variant="outline" className="neon-border-magenta">
                <Gamepad2 className="mr-2 h-4 w-4" />
                Games
              </Button>
            </Link>
            <Link href="/history">
              <Button variant="outline" className="neon-border-pink">
                <HistoryIcon className="mr-2 h-4 w-4" />
                History
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="neon-border-cyan bg-card/80 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hash Power</CardTitle>
              <Zap className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold neon-cyan">{stats?.totalHashPower || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Total mining power</p>
            </CardContent>
          </Card>

          <Card className="neon-border-cyan bg-card/80 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credits</CardTitle>
              <Coins className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold neon-cyan">{stats?.credits || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Available to spend</p>
            </CardContent>
          </Card>

          <Card className="neon-border-magenta bg-card/80 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bitcoin</CardTitle>
              <Bitcoin className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold neon-magenta">
                {formatCrypto(stats?.btcBalance || 0, 8)} BTC
              </div>
              <p className="text-xs text-muted-foreground mt-1">{stats?.btcBalance || 0} satoshis</p>
            </CardContent>
          </Card>

          <Card className="neon-border-pink bg-card/80 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ethereum</CardTitle>
              <Coins className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold neon-pink">
                {formatCrypto(stats?.ethBalance || 0, 6)} ETH
              </div>
              <p className="text-xs text-muted-foreground mt-1">Scaled balance</p>
            </CardContent>
          </Card>

          <Card className="neon-border-magenta bg-card/80 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Energy</CardTitle>
              <Battery className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold neon-magenta">
                {stats?.energy || 0}/{stats?.maxEnergy || 100}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.energy === stats?.maxEnergy 
                  ? "Full energy" 
                  : `Next: ${Math.floor((stats?.timeUntilNextEnergy || 0) / 60)}m ${(stats?.timeUntilNextEnergy || 0) % 60}s`
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Mining Reward Section */}
        <Card className="neon-border-cyan bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl neon-cyan">Mining Rewards</CardTitle>
            <CardDescription>
              Claim your mining rewards every 10 minutes based on your hash power
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Next claim available in:</p>
                <p className="text-3xl font-bold neon-cyan">{formatTime(timeUntilClaim)}</p>
              </div>
              <Button
                size="lg"
                className="neon-border-cyan"
                onClick={() => claimRewardMutation.mutate()}
                disabled={claimRewardMutation.isPending || timeUntilClaim > 0 || (stats?.totalHashPower || 0) === 0}
              >
                {claimRewardMutation.isPending ? "Claiming..." : "Claim Rewards"}
              </Button>
            </div>
            
            {(stats?.totalHashPower || 0) === 0 && (
              <div className="bg-muted/50 p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">
                  You need mining equipment to earn rewards. Visit the <Link href="/shop" className="text-primary hover:underline">Shop</Link> to purchase your first miner!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Watch Ad Card */}
        <Card className="neon-border-cyan bg-gradient-to-br from-cyan-950/50 to-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-6 w-6 text-primary" />
              Watch Ads for Credits
            </CardTitle>
            <CardDescription>
              Earn {stats?.adRewardCredits || 100} credits per ad
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Today:</span>
              <span className="font-bold neon-cyan">
                {stats?.adsWatchedToday || 0} / {stats?.maxAdsPerDay || 20}
              </span>
            </div>
            
            {stats?.canWatchAd ? (
              <Button 
                onClick={() => watchAdMutation.mutate()}
                disabled={watchAdMutation.isPending}
                className="w-full neon-border-cyan"
                size="lg"
              >
                {watchAdMutation.isPending ? (
                  "Loading Ad..."
                ) : (
                  <>
                    <Play className="mr-2 h-5 w-5" />
                    Watch Ad (+{stats?.adRewardCredits || 100} Credits)
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-2">
                <Button disabled className="w-full" size="lg">
                  <Play className="mr-2 h-5 w-5" />
                  Ad Not Available
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  {stats?.adsWatchedToday === stats?.maxAdsPerDay 
                    ? "Daily limit reached. Come back tomorrow!" 
                    : `Next ad in: ${Math.floor((stats?.timeUntilNextAd || 0) / 60)}m ${(stats?.timeUntilNextAd || 0) % 60}s`
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/shop">
            <Card className="neon-border-cyan bg-card/80 backdrop-blur hover:bg-card/90 transition-all cursor-pointer">
              <CardHeader>
                <Cpu className="w-12 h-12 text-primary mb-2" />
                <CardTitle>Mining Shop</CardTitle>
                <CardDescription>
                  Browse and purchase mining equipment to increase your hash power
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/games">
            <Card className="neon-border-magenta bg-card/80 backdrop-blur hover:bg-card/90 transition-all cursor-pointer">
              <CardHeader>
                <Gamepad2 className="w-12 h-12 text-secondary mb-2" />
                <CardTitle>Minigames</CardTitle>
                <CardDescription>
                  Play games to earn temporary hash power bonuses
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/achievements">
            <Card className="neon-border-pink bg-card/80 backdrop-blur hover:bg-card/90 transition-all cursor-pointer">
              <CardHeader>
                <Trophy className="w-12 h-12 text-accent mb-2" />
                <CardTitle>Achievements</CardTitle>
                <CardDescription>
                  Track your progress and unlock special rewards
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
