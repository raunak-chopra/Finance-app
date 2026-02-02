declare module 'react-native-get-sms-android' {
    export interface SmsFilter {
        box?: 'inbox' | 'sent' | 'draft';
        read?: 0 | 1;
        _id?: number;
        address?: string;
        body?: string;
        indexFrom?: number;
        maxCount?: number;
    }

    export default class SmsAndroid {
        static list(
            filter: string,
            fail: (error: string) => void,
            success: (count: number, smsList: string) => void
        ): void;
    }
}
