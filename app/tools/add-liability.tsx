import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '@/db/client';
import { liabilities } from '@/db/schema';
import * as Crypto from 'expo-crypto';

const LIABILITY_TYPES = ['HOME_LOAN', 'CAR_LOAN', 'PERSONAL_LOAN', 'CREDIT_CARD', 'OTHER'];

export default function AddLiabilityScreen() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [type, setType] = useState(LIABILITY_TYPES[0]);
    const [outstanding, setOutstanding] = useState('');
    const [emi, setEmi] = useState('');
    const [interest, setInterest] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!name || !outstanding) {
            Alert.alert("Missing Fields", "Please enter liability name and outstanding amount");
            return;
        }

        try {
            setLoading(true);
            await db.insert(liabilities).values({
                id: Crypto.randomUUID(),
                name,
                type,
                current_outstanding: parseFloat(outstanding),
                emi_amount: emi ? parseFloat(emi) : null,
                interest_rate: interest ? parseFloat(interest) : null,
            });
            Alert.alert("Success", "Liability added successfully");
            router.back();
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Failed to save liability");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            <Stack.Screen options={{ title: 'Add Liability', headerBackTitle: 'Back' }} />
            <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>

                <Card>
                    <CardContent className="gap-4 pt-4">
                        <View>
                            <Text className="text-sm text-muted-foreground mb-1">Liability Name</Text>
                            <Input placeholder="e.g. HDFC Home Loan" value={name} onChangeText={setName} />
                        </View>

                        <View>
                            <Text className="text-sm text-muted-foreground mb-1">Liability Type</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
                                {LIABILITY_TYPES.map(t => (
                                    <TouchableOpacity
                                        key={t}
                                        onPress={() => setType(t)}
                                        className={`px-4 py-2 rounded-full border ${type === t ? 'bg-primary border-primary' : 'bg-background border-border'}`}
                                    >
                                        <Text className={type === t ? 'text-primary-foreground font-semibold' : 'text-foreground'}>{t}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <View>
                            <Text className="text-sm text-muted-foreground mb-1">Current Outstanding</Text>
                            <Input
                                placeholder="0.00"
                                keyboardType="numeric"
                                value={outstanding}
                                onChangeText={setOutstanding}
                                className="text-2xl font-bold text-red-500"
                            />
                        </View>

                        <View className="flex-row gap-4">
                            <View className="flex-1">
                                <Text className="text-sm text-muted-foreground mb-1">EMI Amount</Text>
                                <Input
                                    placeholder="0.00"
                                    keyboardType="numeric"
                                    value={emi}
                                    onChangeText={setEmi}
                                />
                            </View>
                            <View className="flex-1">
                                <Text className="text-sm text-muted-foreground mb-1">Interest Rate (%)</Text>
                                <Input
                                    placeholder="e.g. 8.5"
                                    keyboardType="numeric"
                                    value={interest}
                                    onChangeText={setInterest}
                                />
                            </View>
                        </View>
                    </CardContent>
                </Card>

                <Button label={loading ? "Saving..." : "Save Liability"} onPress={handleSave} size="lg" disabled={loading} />

            </ScrollView>
        </SafeAreaView>
    );
}
