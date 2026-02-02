import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '@/db/client';
import { firePlans } from '@/db/schema';
import * as Crypto from 'expo-crypto';
import { desc } from 'drizzle-orm';

export default function FireCalculatorScreen() {
    const [monthlyExpense, setMonthlyExpense] = useState('50000');
    const [currentSavings, setCurrentSavings] = useState('1000000');
    const [withdrawalRate, setWithdrawalRate] = useState('4'); // 4% Rule
    const [returnRate, setReturnRate] = useState('10'); // 10% Annual Return

    const [fireNumber, setFireNumber] = useState(0);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        calculateFire();
    }, [monthlyExpense, currentSavings, withdrawalRate]);

    const calculateFire = () => {
        const expense = parseFloat(monthlyExpense) || 0;
        const rate = parseFloat(withdrawalRate) || 4;
        const savings = parseFloat(currentSavings) || 0;

        // Annual Expense / Withdrawal Rate %
        // Example: 6L / 0.04 = 1.5Cr
        const annualExpense = expense * 12;
        const target = annualExpense / (rate / 100);

        setFireNumber(target);

        if (target > 0) {
            const prog = (savings / target) * 100;
            setProgress(Math.min(prog, 100));
        } else {
            setProgress(0);
        }
    };

    const handleSavePlan = async () => {
        try {
            // Calculate derived values used in schema
            const expense = parseFloat(monthlyExpense) || 0;
            const annualExpense = expense * 12;
            const savings = parseFloat(currentSavings) || 0;
            const rate = parseFloat(withdrawalRate) || 4;
            const expectedReturn = parseFloat(returnRate) || 10;

            // Simple NPER-like calc for years to reach target
            // Goal: Have 'fireNumber'. Currently have 'savings'. 
            // If savings < fireNumber:
            // We need to know annual contribution to calc years accurately.
            // For now, assuming savings growing at `returnRate` without extra contribution gives Infinite years if < target.
            // Let's just store a placeholder or current year + 10 if unknown. 
            // Better: Ask user for Age and Target Age to fill 'target_retirement_year'.
            // For MVP, let's default to 2050 or calculated rough estimate.

            const yearsEst = 10; // Placeholder until we add Age inputs
            const targetYear = new Date().getFullYear() + yearsEst;

            await db.insert(firePlans).values({
                id: Crypto.randomUUID(),
                target_retirement_year: targetYear,
                target_corpus: fireNumber,
                current_corpus: savings,
                expected_annual_expenses: annualExpense,
                inflation_rate: 0.06,
                created_date: new Date(),
                last_updated: new Date(),
            });
            Alert.alert("Success", "FIRE Plan saved successfully!");
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Failed to save plan: " + String(e));
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            <Stack.Screen options={{ title: 'F.I.R.E. Calculator', headerBackTitle: 'Back' }} />
            <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>

                {/* Results Card */}
                <Card className="bg-primary/10 border-primary/20">
                    <CardHeader>
                        <CardTitle className="text-primary text-center">Your Freedom Number</CardTitle>
                    </CardHeader>
                    <CardContent className="items-center">
                        <Text className="text-4xl font-bold text-foreground">₹ {(fireNumber / 10000000).toFixed(2)} Cr</Text>
                        <Text className="text-muted-foreground mt-1">
                            (₹ {Math.round(fireNumber).toLocaleString()})
                        </Text>

                        <View className="w-full bg-muted h-3 rounded-full mt-6 overflow-hidden">
                            <View className="bg-primary h-full" style={{ width: `${progress}%` }} />
                        </View>
                        <Text className="text-sm text-foreground mt-2 font-medium">{progress.toFixed(1)}% Achieved</Text>
                    </CardContent>
                </Card>

                {/* Inputs */}
                <Card>
                    <CardHeader>
                        <CardTitle>Parameters</CardTitle>
                    </CardHeader>
                    <CardContent className="gap-4">
                        <View>
                            <Text className="text-sm text-muted-foreground mb-1">Target Monthly Expense (Retirement)</Text>
                            <Input
                                keyboardType="numeric"
                                value={monthlyExpense}
                                onChangeText={setMonthlyExpense}
                                className="text-lg"
                            />
                        </View>

                        <View>
                            <Text className="text-sm text-muted-foreground mb-1">Current Savings & Investments</Text>
                            <Input
                                keyboardType="numeric"
                                value={currentSavings}
                                onChangeText={setCurrentSavings}
                                className="text-lg"
                            />
                        </View>

                        <View className="flex-row gap-4">
                            <View className="flex-1">
                                <Text className="text-sm text-muted-foreground mb-1">Withdrawal Rate (%)</Text>
                                <Input
                                    keyboardType="numeric"
                                    value={withdrawalRate}
                                    onChangeText={setWithdrawalRate}
                                    className="text-center"
                                />
                            </View>
                            <View className="flex-1">
                                <Text className="text-sm text-muted-foreground mb-1">Exp. Return (%)</Text>
                                <Input
                                    keyboardType="numeric"
                                    value={returnRate}
                                    onChangeText={setReturnRate}
                                    className="text-center"
                                />
                            </View>
                        </View>
                    </CardContent>
                </Card>

                {/* Action */}
                <Button label="Save Plan" onPress={handleSavePlan} size="lg" />

                <Text className="text-xs text-muted-foreground text-center mt-4">
                    The 4% rule assumes a diversified portfolio (stocks/bonds). Adjust the withdrawal rate based on your risk tolerance.
                </Text>

            </ScrollView>
        </SafeAreaView>
    );
}
