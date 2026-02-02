import { View, Text, ScrollView, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '@/db/client';
import { assets, liabilities } from '@/db/schema';
import { desc } from 'drizzle-orm';

export default function NetWorthScreen() {
    const router = useRouter();
    const [assetList, setAssetList] = useState<any[]>([]);
    const [liabilityList, setLiabilityList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [totalAssets, setTotalAssets] = useState(0);
    const [totalLiabilities, setTotalLiabilities] = useState(0);

    const fetchData = async () => {
        try {
            setLoading(true);
            const fetchedAssets = await db.select().from(assets).orderBy(desc(assets.current_value));
            const fetchedLiabilities = await db.select().from(liabilities).orderBy(desc(liabilities.current_outstanding));

            setAssetList(fetchedAssets);
            setLiabilityList(fetchedLiabilities);

            const tAsset = fetchedAssets.reduce((sum, item) => sum + item.current_value, 0);
            const tLiab = fetchedLiabilities.reduce((sum, item) => sum + item.current_outstanding, 0);

            setTotalAssets(tAsset);
            setTotalLiabilities(tLiab);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

    const formatCurrency = (amount: number) => {
        return '₹ ' + amount.toLocaleString('en-IN');
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            <Stack.Screen options={{ title: 'Net Worth', headerBackTitle: 'Back' }} />
            <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>

                {/* Sync Status / Info could go here */}

                {/* Net Worth Summary */}
                <Card className="bg-primary/10 border-primary/20">
                    <CardHeader>
                        <CardTitle className="text-primary text-center text-sm">Total Net Worth</CardTitle>
                    </CardHeader>
                    <CardContent className="items-center pb-6">
                        <Text className="text-4xl font-bold text-foreground">{formatCurrency(totalAssets - totalLiabilities)}</Text>
                        <View className="flex-row gap-6 mt-4">
                            <View className="items-center">
                                <Text className="text-xs text-muted-foreground">Assets</Text>
                                <Text className="text-green-500 font-semibold">{formatCurrency(totalAssets)}</Text>
                            </View>
                            <View className="h-full w-[1px] bg-border" />
                            <View className="items-center">
                                <Text className="text-xs text-muted-foreground">Liabilities</Text>
                                <Text className="text-red-500 font-semibold">{formatCurrency(totalLiabilities)}</Text>
                            </View>
                        </View>
                    </CardContent>
                </Card>

                {/* Assets Section */}
                <View>
                    <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-lg font-semibold text-foreground">Assets</Text>
                        <Button label="+ Add" size="sm" variant="secondary" onPress={() => router.push('/tools/add-asset')} />
                    </View>

                    {assetList.length === 0 ? (
                        <Text className="text-muted-foreground text-center py-4 bg-muted/20 rounded-lg">No assets added yet.</Text>
                    ) : (
                        <View className="gap-2">
                            {assetList.map(item => (
                                <Card key={item.id} className="bg-card">
                                    <CardContent className="flex-row justify-between items-center p-4">
                                        <View>
                                            <Text className="font-semibold text-foreground">{item.name}</Text>
                                            <Text className="text-xs text-muted-foreground">{item.type}</Text>
                                        </View>
                                        <Text className="font-bold text-green-500">{formatCurrency(item.current_value)}</Text>
                                    </CardContent>
                                </Card>
                            ))}
                        </View>
                    )}
                </View>

                {/* Liabilities Section */}
                <View>
                    <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-lg font-semibold text-foreground">Liabilities</Text>
                        <Button label="+ Add" size="sm" variant="secondary" onPress={() => router.push('/tools/add-liability')} />
                    </View>

                    {liabilityList.length === 0 ? (
                        <Text className="text-muted-foreground text-center py-4 bg-muted/20 rounded-lg">No liabilities added yet.</Text>
                    ) : (
                        <View className="gap-2">
                            {liabilityList.map(item => (
                                <Card key={item.id} className="bg-card">
                                    <CardContent className="flex-row justify-between items-center p-4">
                                        <View>
                                            <Text className="font-semibold text-foreground">{item.name}</Text>
                                            <Text className="text-xs text-muted-foreground">{item.type} {(item.interest_rate > 0) ? `• ${item.interest_rate}%` : ''}</Text>
                                        </View>
                                        <Text className="font-bold text-red-500">{formatCurrency(item.current_outstanding)}</Text>
                                    </CardContent>
                                </Card>
                            ))}
                        </View>
                    )}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}
