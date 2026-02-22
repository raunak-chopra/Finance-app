import { View, Text, ScrollView, SafeAreaView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useCallback } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { db } from '@/db/client';
import { transactions, budgets } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// Default budget limits per category (can be made configurable later)
const DEFAULT_LIMITS: Record<string, number> = {
    'Food': 15000,
    'Transport': 5000,
    'Shopping': 10000,
    'Entertainment': 4000,
    'Utilities': 3000,
    'Health': 5000,
    'Rent': 25000,
    'EMI': 20000,
};

const CATEGORY_COLORS: Record<string, string> = {
    'Food': 'bg-orange-500',
    'Transport': 'bg-blue-500',
    'Shopping': 'bg-purple-500',
    'Entertainment': 'bg-pink-500',
    'Utilities': 'bg-teal-500',
    'Health': 'bg-green-500',
    'Rent': 'bg-amber-500',
    'EMI': 'bg-red-500',
};

export default function BudgetScreen() {
    const router = useRouter();
    const [categorySpend, setCategorySpend] = useState<Record<string, number>>({});
    const [totalSpent, setTotalSpent] = useState(0);
    const [totalBudget, setTotalBudget] = useState(0);
    const [loading, setLoading] = useState(true);
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    const fetchBudgetData = async () => {
        try {
            setLoading(true);
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

            // Fetch all debit transactions for this month
            const allTxns = await db.select().from(transactions);
            const monthDebits = allTxns.filter(t => {
                const d = t.date instanceof Date ? t.date : new Date(t.date);
                return t.type === 'DEBIT' && d >= startOfMonth;
            });

            // Group by category
            const spend: Record<string, number> = {};
            for (const tx of monthDebits) {
                const cat = tx.category || 'Uncategorized';
                if (DEFAULT_LIMITS[cat] !== undefined) {
                    spend[cat] = (spend[cat] || 0) + tx.amount;
                }
            }
            setCategorySpend(spend);

            const totalS = Object.values(spend).reduce((a, b) => a + b, 0);
            const totalB = Object.values(DEFAULT_LIMITS).reduce((a, b) => a + b, 0);
            setTotalSpent(totalS);
            setTotalBudget(totalB);
        } catch (e) {
            console.error('Budget fetch error', e);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchBudgetData();
        }, [])
    );

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-background items-center justify-center">
                <ActivityIndicator size="large" />
            </SafeAreaView>
        );
    }

    const overallPercent = totalBudget > 0 ? Math.min(100, (totalSpent / totalBudget) * 100) : 0;

    return (
        <SafeAreaView className="flex-1 bg-background">
            <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
                <Text className="text-3xl font-bold text-foreground mt-4 mb-2">Monthly Budget</Text>
                <Text className="text-xs text-muted-foreground -mt-2 mb-2">{currentMonth}</Text>

                {/* Total Summary */}
                <Card className="bg-card">
                    <CardHeader>
                        <CardTitle className="text-lg">Total Spend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Text className="text-4xl font-bold text-foreground">
                            ₹{totalSpent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                            <Text className="text-sm text-muted-foreground font-normal">
                                {' '}/ ₹{totalBudget.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                            </Text>
                        </Text>
                        <View className="h-4 w-full bg-secondary rounded-full mt-4 overflow-hidden">
                            <View
                                className={`h-full rounded-full ${overallPercent >= 100 ? 'bg-destructive' : 'bg-primary'}`}
                                style={{ width: `${overallPercent}%` }}
                            />
                        </View>
                        <Text className="text-right text-xs text-muted-foreground mt-1">
                            {overallPercent.toFixed(0)}% Used
                        </Text>
                    </CardContent>
                </Card>

                <Text className="text-lg font-semibold text-foreground mt-4">Category Breakdown</Text>

                {Object.keys(DEFAULT_LIMITS).length === 0 ? (
                    <Text className="text-muted-foreground text-center mt-4">
                        No categories configured.
                    </Text>
                ) : totalSpent === 0 ? (
                    <Card className="bg-muted/30">
                        <CardContent className="p-6 items-center">
                            <Text className="text-muted-foreground text-sm text-center">No spending recorded for this month yet.</Text>
                            <Text className="text-xs text-muted-foreground text-center mt-1">Add transactions to see your budget breakdown.</Text>
                        </CardContent>
                    </Card>
                ) : (
                    <View className="gap-3">
                        {Object.entries(DEFAULT_LIMITS).map(([cat, limit]) => {
                            const spent = categorySpend[cat] || 0;
                            const percentage = Math.min(100, (spent / limit) * 100);
                            const isOver = spent > limit;
                            const color = CATEGORY_COLORS[cat] || 'bg-primary';

                            return (
                                <Card key={cat}>
                                    <CardContent className="p-4">
                                        <View className="flex-row justify-between mb-2">
                                            <Text className="font-medium text-foreground">{cat}</Text>
                                            <Text className={isOver ? 'text-red-500 font-bold' : 'text-muted-foreground'}>
                                                {Math.round(percentage)}%{isOver ? ' ⚠️' : ''}
                                            </Text>
                                        </View>
                                        <View className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                            <View
                                                className={`h-full ${isOver ? 'bg-destructive' : color}`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </View>
                                        <View className="flex-row justify-between mt-1">
                                            <Text className="text-xs text-muted-foreground">
                                                ₹{spent.toLocaleString('en-IN', { maximumFractionDigits: 0 })} spent
                                            </Text>
                                            <Text className="text-xs text-muted-foreground">
                                                Limit: ₹{limit.toLocaleString('en-IN')}
                                            </Text>
                                        </View>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
