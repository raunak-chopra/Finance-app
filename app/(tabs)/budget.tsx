import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const BUDGETS = [
    { category: 'Food & Dining', spent: 12000, limit: 15000, color: 'bg-orange-500' },
    { category: 'Transport', spent: 4500, limit: 5000, color: 'bg-blue-500' },
    { category: 'Shopping', spent: 8000, limit: 5000, color: 'bg-red-500' }, // Over budget
    { category: 'Entertainment', spent: 1200, limit: 4000, color: 'bg-purple-500' },
];

export default function BudgetScreen() {
    return (
        <SafeAreaView className="flex-1 bg-background">
            <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
                <Text className="text-3xl font-bold text-foreground mt-4 mb-2">Monthly Budget</Text>

                <Card className="bg-card">
                    <CardHeader>
                        <CardTitle className="text-lg">Total Budget</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Text className="text-4xl font-bold text-foreground">₹ 25,700 <Text className="text-sm text-muted-foreground font-normal">/ ₹ 29,000</Text></Text>
                        <View className="h-4 w-full bg-secondary rounded-full mt-4 overflow-hidden">
                            <View className="h-full w-[88%] bg-primary rounded-full" />
                        </View>
                        <Text className="text-right text-xs text-muted-foreground mt-1">88% Used</Text>
                    </CardContent>
                </Card>

                <Text className="text-lg font-semibold text-foreground mt-4">Category Breakdown</Text>

                <View className="gap-3">
                    {BUDGETS.map((b) => {
                        const percentage = Math.min(100, (b.spent / b.limit) * 100);
                        const isOver = b.spent > b.limit;

                        return (
                            <Card key={b.category}>
                                <CardContent className="p-4">
                                    <View className="flex-row justify-between mb-2">
                                        <Text className="font-medium text-foreground">{b.category}</Text>
                                        <Text className={isOver ? "text-red-500 font-bold" : "text-muted-foreground"}>
                                            {Math.round(percentage)}%
                                        </Text>
                                    </View>
                                    <View className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                        <View
                                            className={`h-full ${isOver ? 'bg-destructive' : 'bg-primary'}`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </View>
                                    <View className="flex-row justify-between mt-1">
                                        <Text className="text-xs text-muted-foreground">₹{b.spent}</Text>
                                        <Text className="text-xs text-muted-foreground">Limit: ₹{b.limit}</Text>
                                    </View>
                                </CardContent>
                            </Card>
                        );
                    })}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
