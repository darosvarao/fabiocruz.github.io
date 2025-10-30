import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Bitcoin, Coins, Zap } from "lucide-react";
import { Link } from "wouter";

export default function History() {
  const { isAuthenticated } = useAuth();
  const { data: miningHistory, isLoading } = trpc.mining.getHistory.useQuery(
    { limit: 100 },
    { enabled: isAuthenticated }
  );

  const formatCrypto = (amount: number, decimals: number) => {
    return (amount / Math.pow(10, decimals)).toFixed(decimals);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center cyber-grid">
        <Card className="neon-border-cyan">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to view mining history</CardDescription>
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
          <h1 className="text-4xl font-bold neon-cyan">Mining History</h1>
          <p className="text-muted-foreground mt-2">
            View all your mining rewards and earnings
          </p>
        </div>

        {/* History Table */}
        <Card className="neon-border-cyan bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              Reward History
            </CardTitle>
            <CardDescription>
              Your mining rewards are distributed based on your hash power
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center text-xl neon-cyan py-8">Loading history...</div>
            ) : !miningHistory || miningHistory.length === 0 ? (
              <div className="text-center py-8 space-y-4">
                <p className="text-muted-foreground">No mining rewards yet</p>
                <p className="text-sm text-muted-foreground">
                  Purchase miners from the <Link href="/shop" className="text-primary hover:underline">Shop</Link> and claim your first reward!
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead className="text-right">Hash Power</TableHead>
                      <TableHead className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Bitcoin className="h-4 w-4" />
                          Bitcoin
                        </div>
                      </TableHead>
                      <TableHead className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Coins className="h-4 w-4" />
                          Ethereum
                        </div>
                      </TableHead>
                      <TableHead className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Coins className="h-4 w-4" />
                          Dogecoin
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {miningHistory.map((reward) => (
                      <TableRow key={reward.id}>
                        <TableCell className="font-medium">
                          {formatDate(reward.timestamp)}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="neon-cyan font-bold">{reward.hashPowerUsed}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="neon-magenta">
                            {formatCrypto(reward.btcAmount, 8)} BTC
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="neon-pink">
                            {formatCrypto(reward.ethAmount, 6)} ETH
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-primary">
                            {formatCrypto(reward.dogeAmount, 8)} DOGE
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Summary */}
        {miningHistory && miningHistory.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="neon-border-cyan bg-card/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Total BTC Earned</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold neon-magenta">
                  {formatCrypto(
                    miningHistory.reduce((sum, r) => sum + r.btcAmount, 0),
                    8
                  )} BTC
                </div>
              </CardContent>
            </Card>

            <Card className="neon-border-magenta bg-card/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Total ETH Earned</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold neon-pink">
                  {formatCrypto(
                    miningHistory.reduce((sum, r) => sum + r.ethAmount, 0),
                    6
                  )} ETH
                </div>
              </CardContent>
            </Card>

            <Card className="neon-border-pink bg-card/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold neon-cyan">
                  {miningHistory.length}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
