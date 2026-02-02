import { View, Text, FlatList, TextInput, Alert, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useCallback } from 'react';
import { parseSMS, ParsedTransaction } from '@/lib/sms-parser';
import { db } from '@/db/client';
import { transactions } from '@/db/schema';
import { desc, eq, and, like, SQL } from 'drizzle-orm';
import { useFocusEffect } from 'expo-router';
import * as Crypto from 'expo-crypto';

export default function TransactionsScreen() {
  const [smsText, setSmsText] = useState('');
  const [showParser, setShowParser] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [parsedData, setParsedData] = useState<ParsedTransaction | null>(null);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'DEBIT' | 'CREDIT'>('ALL');

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);

      const conditions: SQL[] = [];
      if (filterType !== 'ALL') {
        conditions.push(eq(transactions.type, filterType));
      }
      if (searchQuery) {
        conditions.push(like(transactions.merchant, `%${searchQuery}%`));
      }

      let query;
      if (conditions.length === 0) {
        query = db.select().from(transactions).orderBy(desc(transactions.date));
      } else {
        query = db.select().from(transactions).where(and(...conditions)).orderBy(desc(transactions.date));
      }

      const result = await query;
      setData(result);
    } catch (e) {
      console.error(e);
      Alert.alert("Error fetching transactions");
    } finally {
      setLoading(false);
    }
  }, [filterType, searchQuery]);

  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
    }, [fetchTransactions])
  );

  const handleParse = () => {
    const result = parseSMS(smsText);
    if (result) {
      setParsedData(result);
    } else {
      Alert.alert('Error', 'Could not parse SMS. Try a different format or ensure Bank name (HDFC, SBI, etc) is in text.');
    }
  };

  const confirmAdd = async () => {
    if (!parsedData) return;

    try {
      await db.insert(transactions).values({
        id: Crypto.randomUUID(),
        merchant: parsedData.merchant,
        amount: parsedData.amount, // Schema handles positive amount + type DEBIT/CREDIT
        date: parsedData.date,
        category: 'Uncategorized',
        type: parsedData.type,
        source: 'MANUAL_SMS',
        is_personal: true,
        isSynced: false,
        raw_message: smsText
      });

      setSmsText('');
      setParsedData(null);
      setShowParser(false);
      fetchTransactions();
      Alert.alert("Success", "Transaction added");
    } catch (e) {
      Alert.alert("Error", String(e));
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-4">
      {/* Header & Filter Section */}
      <View className="mb-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-2xl font-bold text-foreground">Transactions</Text>
          <Button label={showParser ? "Close Parser" : "Paste SMS"} variant="secondary" size="sm" onPress={() => setShowParser(!showParser)} />
        </View>

        {/* Search Input */}
        <Input
          placeholder="Search transactions..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="mb-2 bg-card"
        />

        {/* Filter Chips */}
        <View className="flex-row gap-2">
          {(['ALL', 'DEBIT', 'CREDIT'] as const).map(type => (
            <TouchableOpacity
              key={type}
              onPress={() => setFilterType(type)}
              className={`px-4 py-1.5 rounded-full ${filterType === type ? 'bg-primary' : 'bg-muted'}`}
            >
              <Text className={`${filterType === type ? 'text-primary-foreground' : 'text-muted-foreground'} font-medium text-xs capitalize`}>
                {type.toLowerCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {showParser && (
        <Card className="mb-4 bg-muted/20">
          <CardContent className="p-4 gap-3">
            <Text className="text-muted-foreground text-sm">Paste Bank SMS to test parsing:</Text>
            <Input
              placeholder="e.g. Rs. 450 debited from HDFC Bank..."
              value={smsText}
              onChangeText={setSmsText}
              multiline
              numberOfLines={3}
              className="h-20 text-foreground"
              style={{ verticalAlign: 'top' }}
            />

            {parsedData ? (
              <View className="bg-card p-3 rounded-md border border-border">
                <Text className="text-green-500 font-bold mb-1">Parsed Successfully!</Text>
                <Text className="text-foreground">Merchant: {parsedData.merchant}</Text>
                <Text className="text-foreground">Amount: {parsedData.amount}</Text>
                <Text className="text-foreground">Type: {parsedData.type}</Text>
                <Button label="Confirm & Add" className="mt-2" onPress={confirmAdd} />
              </View>
            ) : (
              <Button label="Parse SMS" onPress={handleParse} />
            )}

          </CardContent>
        </Card>
      )}

      {loading ? (
        <ActivityIndicator size="large" className="mt-10" />
      ) : (
        <FlatList
          data={data}
          keyExtractor={item => item.id}
          contentContainerStyle={{ gap: 12, paddingBottom: 80 }}
          ListEmptyComponent={<Text className="text-center text-muted-foreground mt-10">No transactions found</Text>}
          renderItem={({ item }) => (
            <Card>
              <CardContent className="flex-row items-center justify-between p-4">
                <View>
                  <Text className="font-semibold text-foreground">{item.merchant || 'Unknown'}</Text>
                  <Text className="text-xs text-muted-foreground">{item.category} • {new Date(item.date).toLocaleDateString()}</Text>
                </View>
                <Text className={`font-bold ${item.type === 'CREDIT' ? 'text-green-500' : 'text-foreground'}`}>
                  {item.type === 'CREDIT' ? '+' : '-'}₹{Math.abs(item.amount)}
                </Text>
              </CardContent>
            </Card>
          )}
        />
      )}
    </SafeAreaView>
  );
}
