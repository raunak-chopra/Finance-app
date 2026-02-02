export type ParsedTransaction = {
    amount: number;
    type: 'DEBIT' | 'CREDIT';
    account: string; // last 4 digits or logic
    merchant: string;
    balance: number | null;
    bank: string;
    date: Date;
};

// Regex Patterns
const PATTERNS = {
    HDFC: {
        regex: /(debited|credited)\s+(?:INR|Rs\.?)\s*([\d,]+\.?\d*)\s+.*?(?:at|to)\s+([A-Z0-9\s]+).*?Avl Bal.*?([\d,]+\.?\d*)/i,
        senderId: /HDFCBK/i,
    },
    SBI: {
        regex: /(Debited|Credited)\s+INR\s*([\d,]+\.?\d*).*?(?:to|from)\s+([A-Z0-9\s]+).*?Avl Bal.*?([\d,]+\.?\d*)/i,
        senderId: /SBI/i,
    },
    ICICI: {
        regex: /(?:Rs\.?|INR)\s*([\d,]+\.?\d*)\s+(debited|credited).*?(?:from|to)\s+([A-Z0-9\s]+).*?Info:(.+?)(?:\.|$)/i,
        senderId: /ICICI/i,
    },
    AXIS: {
        regex: /(?:Rs\.?|INR)\s*([\d,]+\.?\d*)\s+(debited|credited).*?(?:to|from)\s+([A-Z0-9\s]+).*?avl bal\s*(?:Rs|INR)\s*([\d,]+\.?\d*)/i,
        senderId: /AXIS/i,
    }
};

export function parseSMS(message: string, sender?: string): ParsedTransaction | null {
    // 1. Identify Bank (simplified logic for text-paste: check content keywords if sender not provided)
    let bank = 'UNKNOWN';
    let match: RegExpMatchArray | null = null;
    let patternType: keyof typeof PATTERNS | null = null;

    // Simple heuristic if direct sender not available (for paste testing)
    if (message.toLowerCase().includes('hdfc')) patternType = 'HDFC';
    else if (message.toLowerCase().includes('sbi')) patternType = 'SBI';
    else if (message.toLowerCase().includes('icici')) patternType = 'ICICI';
    else if (message.toLowerCase().includes('axis')) patternType = 'AXIS';

    if (!patternType) return null;

    bank = patternType;
    const bankConfig = PATTERNS[patternType];
    match = message.match(bankConfig.regex);

    if (!match) return null;

    try {
        let amountStr, typeStr, merchant, balanceStr;

        if (patternType === 'HDFC' || patternType === 'SBI') {
            // Group 1: Type, 2: Amount, 3: Merchant, 4: Balance
            typeStr = match[1];
            amountStr = match[2];
            merchant = match[3];
            balanceStr = match[4];
        } else if (patternType === 'ICICI' || patternType === 'AXIS') {
            // Group 1: Amount, 2: Type, 3: Account/Merchant Partial, 4: Merchant/Info
            // ICICI specifically is tricky, let's stick to the FRD pattern structure roughly but adapt
            // The FRD regex for ICICI was: Rs\.\s*([\d,]+\.?\d*)\s+(debited|credited).*?(?:from|to)\s+([A-Z0-9\s]+).*?Info:(.+?)(?:\.|$)
            amountStr = match[1];
            typeStr = match[2];
            // For ICICI 'merchant' might be in group 4 (Info) or 3 depending on flow
            merchant = match[4] || match[3] || "Unknown";

            if (patternType === 'AXIS') {
                merchant = match[3];
                balanceStr = match[4];
            }
        }

        const amount = parseFloat(amountStr!.replace(/,/g, ''));
        const balance = balanceStr ? parseFloat(balanceStr.replace(/,/g, '')) : null;
        const type = typeStr!.toLowerCase().includes('debit') ? 'DEBIT' : 'CREDIT';

        return {
            amount,
            type,
            account: 'XXXX', // Extraction logic for account num needs more complex regex, skipping for MVP
            merchant: merchant!.trim(),
            balance,
            bank,
            date: new Date(), // SMS timestamp usually passed separately, defaulting to now
        };

    } catch (e) {
        console.error("Parsing Error", e);
        return null;
    }
}
