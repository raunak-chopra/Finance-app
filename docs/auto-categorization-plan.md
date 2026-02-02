# Auto-Categorization Logic

## Goal
Automatically assign a category to a transaction based on the merchant name or description using a keyword matching approach.

## Implementation Steps

1.  **Define Rules**: Create `lib/category-rules.ts` containing a dictionary of keywords to categories.
    *   *Food*: swiggy, zomato, mcdonalds, burger king, pizza, restaurant
    *   *Transport*: uber, ola, rapido, metro, fuel, petrol
    *   *Shopping*: amazon, flipkart, myntra, retail, mart
    *   *Groceries*: blinkit, zepto, bigbasket, dmart, reliance fresh
    *   *Utilities*: bescom, electricity, water, gas, airtel, jio, act
    *   *Entertainment*: netflix, spotify, bookmyshow, pvr, inox
    *   *Health*: pharmacy, hospital, clinic, medplus, apollo
    *   *Income*: salary, credit, upi credit (generic fallback if no other match)
    *   *Rent*: rent, nobroker
    *   *EMI*: emi, loan, finance

2.  **Logic Function**: Export a function `categorizeTransaction(merchant: string, description?: string): string` that returns the best match or "Uncategorized".

3.  **Integration**:
    *   Update `sms-parser.ts` to use this function when parsing SMS.
    *   Update `transactions.tsx` (Manual SMS Paste) to auto-fill the category.
    *   Update `modal.tsx` (Manual Add) to auto-suggest category when Merchant is typed (onBlur or periodic).
