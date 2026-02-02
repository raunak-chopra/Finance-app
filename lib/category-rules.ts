export const CATEGORY_KEYWORDS: Record<string, string[]> = {
    'Food': ['swiggy', 'zomato', 'mcdonalds', 'burger', 'pizza', 'restaurant', 'cafe', 'coffee', 'starbucks', 'kfc', 'dominos', 'eat'],
    'Transport': ['uber', 'ola', 'rapido', 'metro', 'fuel', 'petrol', 'shell', 'hpcl', 'bpcl', 'ioc'],
    'Shopping': ['amazon', 'flipkart', 'myntra', 'ajio', 'retail', 'mart', 'store', 'shop'],
    'Groceries': ['blinkit', 'zepto', 'bigbasket', 'dmart', 'reliance fresh', 'nature bas', 'daily'],
    'Utilities': ['bescom', 'electricity', 'water', 'gas', 'airtel', 'jio', 'vi', 'vodafone', 'act', 'broadband', 'bill'],
    'Entertainment': ['netflix', 'spotify', 'prime', 'hotstar', 'bookmyshow', 'pvr', 'inox', 'cinema', 'movie'],
    'Health': ['pharmacy', 'hospital', 'clinic', 'medplus', 'apollo', 'doctor', 'dr.', 'lab', 'diag'],
    'Rent': ['rent', 'nobroker', 'deposit'],
    'EMI': ['emi', 'loan', 'finance', 'bajaj'],
    'Salary': ['salary', 'payroll', 'stipend'],
    'Transfer': ['transfer', 'upi', 'imps', 'neft']
};

export function categorizeTransaction(text: string): string {
    const lowerText = text.toLowerCase();

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keywords.some(keyword => lowerText.includes(keyword))) {
            return category;
        }
    }

    return 'Uncategorized';
}
