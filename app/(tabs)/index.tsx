import { View, Text, ScrollView, SafeAreaView, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useState, useCallback } from 'react';
import { db } from '@/db/client';
import { transactions, assets, liabilities } from '@/db/schema';
import { desc, eq, sql } from 'drizzle-orm';

export default function DashboardScreen() {
  const router = useRouter();
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [netWorth, setNetWorth] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch recent 5 transactions
      const recent = await db.select().from(transactions)
        .orderBy(desc(transactions.date))
        .limit(5);
      setRecentTransactions(recent);

      // Calculate this month's income/expense
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const allTxns = await db.select().from(transactions);

      const thisMonth = allTxns.filter(t => {
        const d = t.date instanceof Date ? t.date : new Date(t.date);
        return d >= startOfMonth;
      });

      const income = thisMonth.filter(t => t.type === 'CREDIT').reduce((s, t) => s + t.amount, 0);
      const expense = thisMonth.filter(t => t.type === 'DEBIT').reduce((s, t) => s + t.amount, 0);
      setTotalIncome(income);
      setTotalExpenses(expense);

      // Net worth from assets - liabilities
      const assetList = await db.select().from(assets);
      const liabList = await db.select().from(liabilities);
      const totalAssets = assetList.reduce((s, a) => s + a.current_value, 0);
      const totalLiab = liabList.reduce((s, l) => s + l.current_outstanding, 0);
      setNetWorth(totalAssets - totalLiab);
    } catch (e) {
      console.error('Dashboard fetch error', e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [])
  );

  const formatCurrency = (n: number) =>
    `₹ ${Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>

        {/* Header */}
        <View className="mt-4 mb-2">
          <Text className="text-3xl font-bold text-foreground">Overview</Text>
          <Text className="text-muted-foreground">Welcome back, Raunak</Text>
        </View>

        {/* Net Worth Card */}
        <TouchableOpacity onPress={() => router.push('/tools/net-worth')}>
          <Card className="bg-primary/10 border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary text-sm font-medium">Net Worth</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <ActivityIndicator />
              ) : (
                <>
                  <Text className="text-4xl font-bold text-foreground">{formatCurrency(netWorth)}</Text>
                  <Text className="text-sm text-muted-foreground mt-1">Tap to view Assets & Liabilities</Text>
                </>
              )}
            </CardContent>
          </Card>
        </TouchableOpacity>

        {/* Budget Summary — This Month */}
        <View className="flex-row gap-4">
          <Card className="flex-1 bg-card">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Income (MTD)</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              {loading ? <ActivityIndicator size="small" /> : (
                <Text className="text-2xl font-bold text-green-500">{formatCurrency(totalIncome)}</Text>
              )}
            </CardContent>
          </Card>
          <Card className="flex-1 bg-card">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Expense (MTD)</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              {loading ? <ActivityIndicator size="small" /> : (
                <Text className="text-2xl font-bold text-red-500">{formatCurrency(totalExpenses)}</Text>
              )}
            </CardContent>
          </Card>
        </View>

        {/* Recent Transactions */}
        <View>
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-lg font-semibold text-foreground">Recent Transactions</Text>
            {/* Bug 7 Fix: Added onPress to route to Transactions tab */}
            <Button label="View All" variant="ghost" size="sm" onPress={() => router.push('/(tabs)/transactions')} />
          </View>

          {loading ? (
            <ActivityIndicator className="mt-4" />
          ) : recentTransactions.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="p-6 items-center">
                <Text className="text-muted-foreground text-sm">No transactions yet. Add your first one!</Text>
                <Button label="+ Add Transaction" variant="outline" size="sm" className="mt-3" onPress={() => router.push('/modal')} />
              </CardContent>
            </Card>
          ) : (
            <View className="gap-2">
              {recentTransactions.map((tx) => (
                <Card key={tx.id} className="border-border/50">
                  <CardContent className="flex-row items-center justify-between p-4">
                    <View className="flex-row items-center gap-3">
                      <View className="h-10 w-10 rounded-full bg-secondary items-center justify-center">
                        <IconSymbol name={tx.type === 'CREDIT' ? 'chevron.right' : 'list.bullet'} size={18} color="white" />
                      </View>
                      <View>
                        <Text className="font-semibold text-foreground">{tx.merchant || 'Unknown'}</Text>
                        <Text className="text-xs text-muted-foreground">
                          {tx.category} • {new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </Text>
                      </View>
                    </View>
                    <Text className={`font-bold ${tx.type === 'CREDIT' ? 'text-green-500' : 'text-red-500'}`}>
                      {tx.type === 'CREDIT' ? '+' : '-'}₹{Math.abs(tx.amount).toLocaleString('en-IN')}
                    </Text>
                  </CardContent>
                </Card>
              ))}
            </View>
          )}
        </View>

        {/* Financial Tools */}
        <View>
          <Text className="text-lg font-semibold text-foreground mb-2">Financial Tools</Text>
          <View className="flex-row gap-4">
            <TouchableOpacity className="flex-1" onPress={() => router.push('/tools/fire-calculator')}>
              <Card className="bg-card">
                <CardHeader className="p-4 py-6 items-center">
                  <IconSymbol name="flame" size={32} color="#FF5722" />
                  <Text className="font-semibold mt-2 text-foreground">F.I.R.E.</Text>
                  <Text className="text-xs text-muted-foreground text-center">Retirement Planner</Text>
                </CardHeader>
              </Card>
            </TouchableOpacity>

            <TouchableOpacity className="flex-1" onPress={() => router.push('/tools/net-worth')}>
              <Card className="bg-card">
                <CardHeader className="p-4 py-6 items-center">
                  <IconSymbol name="chart.bar.fill" size={32} color="#4CAF50" />
                  <Text className="font-semibold mt-2 text-foreground">Net Worth</Text>
                  <Text className="text-xs text-muted-foreground text-center">Assets & Liabilities</Text>
                </CardHeader>
              </Card>
            </TouchableOpacity>

            <TouchableOpacity className="flex-1" onPress={() => router.push('/tools/rental-yield')}>
              <Card className="bg-card">
                <CardHeader className="p-4 py-6 items-center">
                  <IconSymbol name="house" size={32} color="#2196F3" />
                  <Text className="font-semibold mt-2 text-foreground">Rental</Text>
                  <Text className="text-xs text-muted-foreground text-center">Yield Tracker</Text>
                </CardHeader>
              </Card>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="p-6 items-center justify-center gap-4">
            <Button
              label="+ Add Transaction"
              className="w-full"
              onPress={() => router.push('/modal')}
            />
            <Button
              label="Sync SMS"
              variant="outline"
              className="w-full"
              onPress={async () => {
                try {
                  const { syncSmsToDb } = await import('@/lib/sms-service');
                  await syncSmsToDb();
                  fetchDashboardData();
                  Alert.alert('Sync Complete', 'Your SMS transactions have been synced.');
                } catch (e) {
                  Alert.alert('Sync Failed', String(e));
                }
              }}
            />
          </CardContent>
        </Card>

      </ScrollView>
    </SafeAreaView>
  );
}
