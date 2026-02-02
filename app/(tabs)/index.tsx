import { View, Text, ScrollView, SafeAreaView, Dimensions, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';

// Mock Data
const MOCK_TRANSACTIONS = [
  { id: '1', merchant: 'Zomato', amount: -450, date: 'Today, 2:30 PM', category: 'Food' },
  { id: '2', merchant: 'Salary', amount: 85000, date: 'Yesterday', category: 'Income' },
  { id: '3', merchant: 'Uber', amount: -320, date: 'Yesterday', category: 'Transport' },
];

export default function DashboardScreen() {
  const router = useRouter();
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
              <Text className="text-4xl font-bold text-foreground">₹ 12,45,000</Text>
              <Text className="text-sm text-green-500 mt-1">+2.5% from last month</Text>
            </CardContent>
          </Card>
        </TouchableOpacity>

        {/* Budget Summary */}
        <View className="flex-row gap-4">
          <Card className="flex-1 bg-card">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Income</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Text className="text-2xl font-bold text-green-500">₹ 85k</Text>
            </CardContent>
          </Card>
          <Card className="flex-1 bg-card">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Expense</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Text className="text-2xl font-bold text-red-500">₹ 24k</Text>
            </CardContent>
          </Card>
        </View>

        {/* Recent Transactions */}
        <View>
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-lg font-semibold text-foreground">Recent Transactions</Text>
            <Button label="View All" variant="ghost" size="sm" />
          </View>

          <View className="gap-2">
            {MOCK_TRANSACTIONS.map((tx) => (
              <Card key={tx.id} className="border-border/50">
                <CardContent className="flex-row items-center justify-between p-4">
                  <View className="flex-row items-center gap-3">
                    <View className="h-10 w-10 rounded-full bg-secondary items-center justify-center">
                      <IconSymbol name={tx.amount > 0 ? "chevron.right" : "list.bullet"} size={18} color="white" />
                    </View>
                    <View>
                      <Text className="font-semibold text-foreground">{tx.merchant}</Text>
                      <Text className="text-xs text-muted-foreground">{tx.date}</Text>
                    </View>
                  </View>
                  <Text className={`font-bold ${tx.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount)}
                  </Text>
                </CardContent>
              </Card>
            ))}
          </View>
        </View>

        {/* Financial Tools */}
        <View>
          <Text className="text-lg font-semibold text-foreground mb-2">Financial Tools</Text>
          <View className="flex-row gap-4">
            <TouchableOpacity className="flex-1" onPress={() => router.push('/tools/fire-calculator')}>
              <Card className="bg-card">
                <CardHeader className="p-4 py-6 items-center">
                  <IconSymbol name="flame" size={32} color="#FF5722" />
                  <Text className="font-semibold mt-2">F.I.R.E.</Text>
                  <Text className="text-xs text-muted-foreground text-center">Retirement Planner</Text>
                </CardHeader>
              </Card>
            </TouchableOpacity>

            <TouchableOpacity className="flex-1" onPress={() => router.push('/tools/net-worth')}>
              <Card className="bg-card">
                <CardHeader className="p-4 py-6 items-center">
                  <IconSymbol name="chart.bar.fill" size={32} color="#4CAF50" />
                  <Text className="font-semibold mt-2">Net Worth</Text>
                  <Text className="text-xs text-muted-foreground text-center">Assets & Liabilities</Text>
                </CardHeader>
              </Card>
            </TouchableOpacity>

            <TouchableOpacity className="flex-1" onPress={() => router.push('/tools/rental-yield')}>
              <Card className="bg-card">
                <CardHeader className="p-4 py-6 items-center">
                  <IconSymbol name="house" size={32} color="#2196F3" />
                  <Text className="font-semibold mt-2">Rental</Text>
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
                  Alert.alert('Sync Complete');
                } catch (e) {
                  Alert.alert('Sync Failed');
                }
              }}
            />
          </CardContent>
        </Card>

      </ScrollView>
    </SafeAreaView>
  );
}
