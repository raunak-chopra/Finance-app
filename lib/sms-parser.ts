export type ParsedTransaction = {
    amount: number;
    type: 'DEBIT' | 'CREDIT';
    account: string; // last 4 digits or logic
    merchant: string;
    balance: number | null;
    bank: string;
    date: Date;
};


// Simplified Regex Patterns - more flexible to handle real-world variations
const PATTERNS = {
    HDFC: {
        // Matches: debited/credited + amount + merchant (optional) + balance
        regex: /(debited|credited).*?(?:INR|Rs\.?)\s*([\d,]+\.?\d*).*?(?:at|to|from)\s+([A-Z0-9\s]+)(?:\.|on|Avl).*?Bal.*?([\d,]+\.?\d*)/i,
        senderId: /HDFCBK/i,
    },
    SBI: {
        // Matches: Debited/Credited + INR + amount + to/from + merchant + balance
        regex: /(Debited|Credited)\s+INR\s*([\d,]+\.?\d*).*?(?:to|from)\s+([A-Z0-9\s]+)(?:\.|on|Avl).*?Bal.*?([\d,]+\.?\d*)/i,
        senderId: /SBI/i,
    },
    ICICI: {
        // Matches: amount + debited/credited + merchant in Info field
        regex: /(?:Rs\.?|INR)\s*([\d,]+\.?\d*)\s+(debited|credited).*?Info:\s*(.+?)(?:\.|$)/i,
        senderId: /ICICI/i,
    },
    AXIS: {
        // Matches: amount + debited/credited + to/from + merchant + balance
        regex: /(?:Rs\.?|INR)\s*([\d,]+\.?\d*)\s+(debited|credited).*?(?:to|from)\s+([A-Z0-9\s]+)(?:\.|on|avl).*?avl bal.*?([\d,]+\.?\d*)/i,
        senderId: /AXIS/i,
    }
};


export function parseSMS(message: string, sender?: string): ParsedTransaction | null {
    // 1. Identify Bank (simplified logic for text-paste: check content keywords if sender not provided)
    let bank = 'UNKNOWN';
    let match: RegExpMatchArray | null = null;
    let patternType: keyof typeof PATTERNS | null = null;

    // 1. Identify Bank — sender ID is the most reliable signal (real device SMS)
    //    Fall back to body-text keyword matching for manual paste testing.
    const lowerMessage = message.toLowerCase();
    const lowerSender = (sender || '').toLowerCase();

    if (lowerSender.includes('hdfc') || lowerMessage.includes('hdfc')) patternType = 'HDFC';
    else if (lowerSender.includes('sbi') || lowerMessage.includes('sbi')) patternType = 'SBI';
    else if (lowerSender.includes('icici') || lowerMessage.includes('icici')) patternType = 'ICICI';
    else if (lowerSender.includes('axis') || lowerMessage.includes('axis')) patternType = 'AXIS';

    if (!patternType) return null;

    bank = patternType;
    const bankConfig = PATTERNS[patternType];
    match = message.match(bankConfig.regex);

    if (!match) return null;

    try {
        let amountStr, typeStr, merchant, balanceStr;

        if (patternType === 'HDFC') {
            // Group 1: Type, 2: Amount, 3: Merchant, 4: Balance
            typeStr = match[1];
            amountStr = match[2];
            merchant = match[3];
            balanceStr = match[4];
        } else if (patternType === 'SBI') {
            // Group 1: Type, 2: Amount, 3: Merchant, 4: Balance
            typeStr = match[1];
            amountStr = match[2];
            merchant = match[3];
            balanceStr = match[4];
        } else if (patternType === 'ICICI') {
            // Group 1: Amount, 2: Type, 3: Merchant (from Info field)
            amountStr = match[1];
            typeStr = match[2];
            merchant = match[3] || "Unknown";
            balanceStr = null; // ICICI often doesn't include balance in the test messages
        } else if (patternType === 'AXIS') {
            // Group 1: Amount, 2: Type, 3: Merchant, 4: Balance
            amountStr = match[1];
            typeStr = match[2];
            merchant = match[3];
            balanceStr = match[4];
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
