import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '@/db/client';
import { properties } from '@/db/schema';
import { desc } from 'drizzle-orm';

export default function RentalYieldScreen() {
    const router = useRouter();
    const [tab, setTab] = useState<'CALCULATOR' | 'MY_PROPERTIES'>('CALCULATOR');

    // Calculator State
    const [price, setPrice] = useState('');
    const [rent, setRent] = useState('');
    const [maintenance, setMaintenance] = useState(''); // Monthly
    const [occupancy, setOccupancy] = useState('100'); // %

    const [grossYield, setGrossYield] = useState(0);
    const [netYield, setNetYield] = useState(0);

    // My Properties State
    const [myProperties, setMyProperties] = useState<any[]>([]);

    useEffect(() => {
        if (tab === 'CALCULATOR') {
            calculateYield();
        } else {
            fetchProperties();
        }
    }, [price, rent, maintenance, occupancy, tab]);

    const calculateYield = () => {
        const p = parseFloat(price) || 0;
        const r = parseFloat(rent) || 0;
        const m = parseFloat(maintenance) || 0;
        const o = parseFloat(occupancy) || 100;

        if (p === 0) {
            setGrossYield(0);
            setNetYield(0);
            return;
        }

        const annualRentRaw = r * 12;
        const annualRentEffective = annualRentRaw * (o / 100);
        const annualExpenses = m * 12;

        const gross = (annualRentRaw / p) * 100;
        const net = ((annualRentEffective - annualExpenses) / p) * 100;

        setGrossYield(gross);
        setNetYield(net);
    };

    const fetchProperties = async () => {
        try {
            // Need to verify 'properties' schema name or structure
            // In schema.ts: export const properties = sqliteTable('properties', ...
            const result = await db.select().from(properties);
            setMyProperties(result);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            <Stack.Screen options={{ title: 'Rental Yield', headerBackTitle: 'Back' }} />

            {/* Tabs */}
            <View className="flex-row p-4 pb-0 gap-2">
                <TouchableOpacity
                    className={`flex-1 py-2 items-center border-b-2 ${tab === 'CALCULATOR' ? 'border-primary' : 'border-transparent'}`}
                    onPress={() => setTab('CALCULATOR')}
                >
                    <Text className={`font-semibold ${tab === 'CALCULATOR' ? 'text-primary' : 'text-muted-foreground'}`}>Calculator</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className={`flex-1 py-2 items-center border-b-2 ${tab === 'MY_PROPERTIES' ? 'border-primary' : 'border-transparent'}`}
                    onPress={() => setTab('MY_PROPERTIES')}
                >
                    <Text className={`font-semibold ${tab === 'MY_PROPERTIES' ? 'text-primary' : 'text-muted-foreground'}`}>My Properties</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
                {tab === 'CALCULATOR' ? (
                    <>
                        {/* Results */}
                        <Card className="bg-primary/10 border-primary/20">
                            <CardContent className="p-6 flex-row justify-between items-center">
                                <View className="items-center flex-1">
                                    <Text className="text-sm text-muted-foreground">Gross Yield</Text>
                                    <Text className="text-3xl font-bold text-foreground">{grossYield.toFixed(2)}%</Text>
                                </View>
                                <View className="h-10 w-[1px] bg-border" />
                                <View className="items-center flex-1">
                                    <Text className="text-sm text-muted-foreground">Net Yield</Text>
                                    <Text className="text-3xl font-bold text-green-600">{netYield.toFixed(2)}%</Text>
                                </View>
                            </CardContent>
                        </Card>

                        {/* Inputs */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Property Details</CardTitle>
                            </CardHeader>
                            <CardContent className="gap-4">
                                <View>
                                    <Text className="text-sm text-muted-foreground mb-1">Property Price</Text>
                                    <Input keyboardType="numeric" value={price} onChangeText={setPrice} placeholder="e.g. 5000000" />
                                </View>
                                <View>
                                    <Text className="text-sm text-muted-foreground mb-1">Monthly Rent</Text>
                                    <Input keyboardType="numeric" value={rent} onChangeText={setRent} placeholder="e.g. 25000" />
                                </View>
                                <View>
                                    <Text className="text-sm text-muted-foreground mb-1">Monthly Maintenance / Tax</Text>
                                    <Input keyboardType="numeric" value={maintenance} onChangeText={setMaintenance} placeholder="e.g. 3000" />
                                </View>
                                <View>
                                    <Text className="text-sm text-muted-foreground mb-1">Occupancy Rate (%)</Text>
                                    <Input keyboardType="numeric" value={occupancy} onChangeText={setOccupancy} placeholder="100" />
                                </View>
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <>
                        {myProperties.length === 0 ? (
                            <View className="items-center py-10">
                                <Text className="text-muted-foreground mb-4">No specific properties tracked in 'Assets'.</Text>
                                <Button label="Add Property to Assets" onPress={() => router.push('/tools/add-asset')} variant="outline" />
                            </View>
                        ) : (
                            myProperties.map(p => {
                                // Quick Calc for list
                                const pVal = p.current_value || 0;
                                const pRent = p.monthly_rent || 0;
                                const y = pVal > 0 ? ((pRent * 12) / pVal) * 100 : 0;

                                return (
                                    <Card key={p.id}>
                                        <CardContent className="p-4 flex-row justify-between items-center">
                                            <View>
                                                <Text className="font-semibold text-foreground">{p.name}</Text>
                                                <Text className="text-xs text-muted-foreground">{p.address || 'No address'}</Text>
                                            </View>
                                            <View className="items-end">
                                                <Text className="font-bold text-green-600">{y.toFixed(2)}% Yield</Text>
                                                <Text className="text-xs text-muted-foreground">Rent: ₹{p.monthly_rent || 0}/m</Text>
                                            </View>
                                        </CardContent>
                                    </Card>
                                );
                            })
                        )}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
