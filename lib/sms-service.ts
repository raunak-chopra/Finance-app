import SmsAndroid from 'react-native-get-sms-android';
import { db } from '@/db/client';
import { transactions } from '@/db/schema';
import { parseSMS } from './sms-parser';
import { PermissionsAndroid, Platform } from 'react-native';
import { eq } from 'drizzle-orm';
import * as Crypto from 'expo-crypto';
import { categorizeTransaction } from './category-rules';

export async function syncSmsToDb() {
    if (Platform.OS !== 'android') {
        console.log("SMS sync only supported on Android");
        return;
    }

    try {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_SMS,
            {
                title: "SMS Permission",
                message: "App needs access to SMS to track finances automatically.",
                buttonNeutral: "Ask Me Later",
                buttonNegative: "Cancel",
                buttonPositive: "OK"
            }
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            console.log("SMS permission denied");
            return;
        }

        const filter = {
            box: 'inbox',
            maxCount: 200,
        };

        return new Promise<void>((resolve, reject) => {
            SmsAndroid.list(
                JSON.stringify(filter),
                (fail: string) => {
                    console.log('Failed with this error: ' + fail);
                    reject(fail);
                },
                async (count: number, smsList: string) => {
                    try {
                        const arr = JSON.parse(smsList);
                        let addedCount = 0;

                        for (const sms of arr) {
                            const parsed = parseSMS(sms.body, sms.address);
                            if (parsed) {
                                // Check if we already have this SMS
                                const existing = await db.select().from(transactions).where(eq(transactions.raw_message, sms.body));

                                if (existing.length === 0) {
                                    await db.insert(transactions).values({
                                        id: Crypto.randomUUID(),
                                        source: 'SMS',
                                        type: parsed.type,
                                        amount: parsed.amount,
                                        category: categorizeTransaction(parsed.merchant),
                                        merchant: parsed.merchant,
                                        account_identifier: parsed.account || 'XXXX',
                                        date: new Date(Number(sms.date)),
                                        raw_message: sms.body,
                                        is_personal: true,
                                        note: `Bank: ${parsed.bank}`,
                                        isSynced: false
                                    });
                                    addedCount++;
                                }
                            }
                        }
                        console.log(`Synced ${addedCount} new transactions from ${count} SMS messages.`);
                        resolve();
                    } catch (e) {
                        console.error("Error processing SMS list", e);
                        reject(e);
                    }
                },
            );
        });

    } catch (err) {
        console.warn(err);
    }
}
