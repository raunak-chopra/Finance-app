import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as LocalAuthentication from 'expo-local-authentication';
import { useEffect, useState, useCallback } from 'react';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface LockScreenProps {
    onUnlock: () => void;
}

export default function LockScreen({ onUnlock }: LockScreenProps) {
    const [isBiometricSupported, setIsBiometricSupported] = useState(false);
    const [authStatus, setAuthStatus] = useState('Locked');

    const authenticate = useCallback(async () => {
        try {
            const hasSavedBiometrics = await LocalAuthentication.isEnrolledAsync();
            if (!hasSavedBiometrics) {
                Alert.alert('No Biometrics Found', 'Please set up FaceID or Fingerprint in your device settings to use this feature.');
                return;
            }

            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Unlock Financial Health',
                fallbackLabel: 'Use Passcode',
                disableDeviceFallback: false,
            });

            if (result.success) {
                setAuthStatus('Unlocked');
                onUnlock();
            } else {
                setAuthStatus('Authentication Failed');
            }
        } catch (error) {
            console.log(error);
            setAuthStatus('Error during authentication');
        }
    }, [onUnlock]);

    useEffect(() => {
        (async () => {
            const compatible = await LocalAuthentication.hasHardwareAsync();
            setIsBiometricSupported(compatible);
            if (compatible) {
                authenticate();
            }
        })();
    }, [authenticate]);

    return (
        <SafeAreaView className="flex-1 bg-background items-center justify-center gap-8">
            <View className="items-center gap-4">
                <View className="h-24 w-24 bg-primary/20 rounded-3xl items-center justify-center">
                    <IconSymbol name="lock" size={48} color="#16a34a" />
                </View>
                <Text className="text-2xl font-bold text-foreground">Financial Health</Text>
                <Text className="text-muted-foreground">Secure your future</Text>
            </View>

            <View className="items-center gap-2">
                <TouchableOpacity
                    onPress={authenticate}
                    className="bg-primary px-8 py-3 rounded-full flex-row items-center gap-2"
                >
                    <IconSymbol name="faceid" size={24} color="white" />
                    <Text className="text-primary-foreground font-semibold text-lg">Unlock App</Text>
                </TouchableOpacity>

                {!isBiometricSupported && (
                    <Text className="text-xs text-red-500 mt-2">Biometrics not supported on this device.</Text>
                )}
            </View>
        </SafeAreaView>
    );
}
