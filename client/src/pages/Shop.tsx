import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Cpu, Zap, Coins, ArrowLeft, ShoppingCart } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

const rarityColors = {
  common: "bg-gray-500",
  rare: "bg-blue-500 neon-border-cyan",
  epic: "bg-purple-500 neon-border-magenta",
  legendary: "bg-yellow-500 neon-border-pink",
};

const rarityGlow = {
  common: "",
  rare: "neon-cyan",
  epic: "neon-magenta",
  legendary: "neon-pink",
};

export default function Shop() {
  const { isAuthenticated } = useAuth();
  const { data: miners, isLoading: loadingMiners } = trpc.miners.getAll.useQuery();
  const { data: stats, refetch: refetchStats } = trpc.user.getStats.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const purchaseMutation = trpc.miners.purchase.useMutation({
    onSuccess: () => {
      toast.success("Miner purchased successfully!");
      refetchStats();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handlePurchase = (minerId: number, price: number, name: string) => {
    if (!stats || stats.credits < price) {
      toast.error("Insufficient credits!");
      return;
    }

    if (confirm(`Purchase ${name} for ${price} credits?`)) {
      purchaseMutation.mutate({ minerId });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center cyber-grid">
        <Card className="neon-border-cyan">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to access the shop</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background cyber-grid">
      <div className="container py-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <Link href="/">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-4xl font-bold neon-cyan">Mining Equipment Shop</h1>
            <p className="text-muted-foreground mt-2">Upgrade your mining rig with powerful equipment</p>
          </div>
          <Card className="neon-border-cyan bg-card/80">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold neon-cyan">{stats?.credits || 0}</span>
                <span className="text-sm text-muted-foreground">Credits</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Miners Grid */}
        {loadingMiners ? (
          <div className="text-center text-2xl neon-cyan">Loading miners...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {miners?.map((miner) => (
              <Card 
                key={miner.id} 
                className={`${rarityColors[miner.rarity]} bg-card/80 backdrop-blur hover:scale-105 transition-transform`}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className={`text-xl ${rarityGlow[miner.rarity]}`}>
                      {miner.name}
                    </CardTitle>
                    <Badge variant="secondary" className="capitalize">
                      {miner.rarity}
                    </Badge>
                  </div>
                  <CardDescription className="text-foreground/80">
                    {miner.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-primary" />
                      <span className="text-sm text-muted-foreground">Hash Power</span>
                    </div>
                    <span className="text-xl font-bold neon-cyan">{miner.hashPower}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Coins className="h-5 w-5 text-primary" />
                      <span className="text-sm text-muted-foreground">Price</span>
                    </div>
                    <span className="text-xl font-bold neon-cyan">{miner.price}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full neon-border-cyan"
                    onClick={() => handlePurchase(miner.id, miner.price, miner.name)}
                    disabled={purchaseMutation.isPending || !stats || stats.credits < miner.price}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {purchaseMutation.isPending ? "Purchasing..." : "Purchase"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Info Section */}
        <Card className="neon-border-cyan bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-6 w-6 text-primary" />
              How Mining Equipment Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-muted-foreground">
            <p>• Each miner provides a specific amount of <strong className="text-primary">Hash Power</strong></p>
            <p>• Your total hash power determines how much cryptocurrency you earn every 10 minutes</p>
            <p>• Higher rarity miners provide more hash power but cost more credits</p>
            <p>• All purchased miners are automatically activated and start mining immediately</p>
            <p>• Combine multiple miners to build a powerful mining empire!</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
