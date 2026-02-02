import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { db } from '@/db/client';
import { transactions } from '@/db/schema';
import * as Crypto from 'expo-crypto';
import { categorizeTransaction } from '@/lib/category-rules';

export default function AddTransactionScreen() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'DEBIT' | 'CREDIT'>('DEBIT');
  const [category, setCategory] = useState('');
  const [merchant, setMerchant] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMerchantBlur = () => {
    if (merchant && !category) {
      const suggestion = categorizeTransaction(merchant);
      if (suggestion !== 'Uncategorized') {
        setCategory(suggestion);
      }
    }
  };

  const handleSave = async () => {
    if (!amount || !category) {
      Alert.alert("Missing Fields", "Please enter amount and category");
      return;
    }

    try {
      setLoading(true);
      await db.insert(transactions).values({
        id: Crypto.randomUUID(),
        type,
        amount: parseFloat(amount),
        category,
        merchant: merchant || 'Unknown',
        date: new Date(),
        note,
        source: 'MANUAL',
        is_personal: true,
        isSynced: false
      });
      Alert.alert("Success", "Transaction added");
      router.back();
    } catch (e) {
      Alert.alert("Error", String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background p-4" contentContainerStyle={{ gap: 20 }}>
      <Stack.Screen options={{ title: 'Add Transaction' }} />

      {/* Type Selector */}
      <View className="flex-row bg-muted rounded-lg p-1">
        <TouchableOpacity
          className={`flex-1 p-3 rounded-md items-center ${type === 'DEBIT' ? 'bg-background shadow-sm' : ''}`}
          onPress={() => setType('DEBIT')}
        >
          <Text className={`font-semibold ${type === 'DEBIT' ? 'text-red-500' : 'text-muted-foreground'}`}>Expense</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 p-3 rounded-md items-center ${type === 'CREDIT' ? 'bg-background shadow-sm' : ''}`}
          onPress={() => setType('CREDIT')}
        >
          <Text className={`font-semibold ${type === 'CREDIT' ? 'text-green-500' : 'text-muted-foreground'}`}>Income</Text>
        </TouchableOpacity>
      </View>

      {/* Amount */}
      <View>
        <Text className="text-sm text-muted-foreground mb-1">Amount</Text>
        <TextInput
          className="text-4xl font-bold text-foreground h-16"
          placeholder="0.00"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
          autoFocus
        />
      </View>

      {/* Merchant */}
      <View>
        <Text className="text-sm text-muted-foreground mb-1">Merchant / Source</Text>
        <TextInput
          className="bg-card p-4 rounded-lg border border-border text-foreground"
          placeholder="e.g. Zomato, Uber"
          value={merchant}
          onChangeText={setMerchant}
          onBlur={handleMerchantBlur}
        />
      </View>

      {/* Category */}
      <View>
        <Text className="text-sm text-muted-foreground mb-1">Category</Text>
        <TextInput
          className="bg-card p-4 rounded-lg border border-border text-foreground"
          placeholder="e.g. Food, Salary, Rent"
          value={category}
          onChangeText={setCategory}
        />
        {/* Quick suggestions could go here */}
      </View>

      {/* Note */}
      <View>
        <Text className="text-sm text-muted-foreground mb-1">Note (Optional)</Text>
        <TextInput
          className="bg-card p-4 rounded-lg border border-border text-foreground"
          placeholder="Add details..."
          value={note}
          onChangeText={setNote}
        />
      </View>

      <TouchableOpacity
        className={`bg-primary p-4 rounded-full items-center mt-4 ${loading ? 'opacity-50' : ''}`}
        onPress={handleSave}
        disabled={loading}
      >
        <Text className="text-primary-foreground font-bold text-lg">
          {loading ? 'Saving...' : 'Save Transaction'}
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}
