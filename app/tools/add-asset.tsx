import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '@/db/client';
import { assets } from '@/db/schema';
import * as Crypto from 'expo-crypto';

const ASSET_TYPES = ['REAL_ESTATE', 'GOLD', 'VEHICLE', 'INVESTMENT', 'FD', 'PF', 'OTHER'];

export default function AddAssetScreen() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [type, setType] = useState(ASSET_TYPES[0]);
    const [value, setValue] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!name || !value) {
            Alert.alert("Missing Fields", "Please enter asset name and current value");
            return;
        }

        try {
            setLoading(true);
            await db.insert(assets).values({
                id: Crypto.randomUUID(),
                name,
                type,
                current_value: parseFloat(value),
                last_updated: new Date(),
                notes
            });
            Alert.alert("Success", "Asset added successfully");
            router.back();
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Failed to save asset");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            <Stack.Screen options={{ title: 'Add Asset', headerBackTitle: 'Back' }} />
            <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>

                <Card>
                    <CardContent className="gap-4 pt-4">
                        <View>
                            <Text className="text-sm text-muted-foreground mb-1">Asset Name</Text>
                            <Input placeholder="e.g. Apartment, FD" value={name} onChangeText={setName} />
                        </View>

                        <View>
                            <Text className="text-sm text-muted-foreground mb-1">Asset Type</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
                                {ASSET_TYPES.map(t => (
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
                            <Text className="text-sm text-muted-foreground mb-1">Current Value</Text>
                            <Input
                                placeholder="0.00"
                                keyboardType="numeric"
                                value={value}
                                onChangeText={setValue}
                                className="text-2xl font-bold"
                            />
                        </View>

                        <View>
                            <Text className="text-sm text-muted-foreground mb-1">Notes (Optional)</Text>
                            <Input
                                placeholder="Details..."
                                value={notes}
                                onChangeText={setNotes}
                            />
                        </View>
                    </CardContent>
                </Card>

                <Button label={loading ? "Saving..." : "Save Asset"} onPress={handleSave} size="lg" disabled={loading} />

            </ScrollView>
        </SafeAreaView>
    );
}
