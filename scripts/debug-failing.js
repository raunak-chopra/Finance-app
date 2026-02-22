const { parseSMS } = require('../lib/sms-parser');

// Test the failing HDFC messages
const tests = [
    "HDFC Bank: Rs.450.00 debited from A/c **1234 on 02-02-26 at ZOMATO BANGALORE. Avl Bal Rs.12,450.50",
    "HDFC: INR 85000.00 credited to A/c **5678 on 01-02-26. Avl Bal INR 97,450.50",
    "SBI Bank: Credited INR 50,000.00 from SALARY CREDIT to A/c XX5678 on 01-02-26. Avl Bal INR 65,600.00",
    "ICICI: INR 3,200.50 credited from REFUND to A/c XX4321. Info: Flipkart refund processed"
];

tests.forEach((msg, i) => {
    console.log(`\n\nTest ${i + 1}:`);
    console.log('Message:', msg);
    const result = parseSMS(msg);
    console.log('Result:', result);

    // Test regex directly
    const hdfcRegex = /(debited|credited).*?(?:INR|Rs\.?)\s*([\d,]+\.?\d*).*?(?:at|to|from)\s+([A-Z0-9\s]+?)(?:\.| on| Avl).*?(?:Avl Bal|Bal).*?(?:INR|Rs\.)?\s*([\d,]+\.?\d*)/i;
    const match = msg.match(hdfcRegex);
    console.log('Regex match:', match ? match.slice(0, 5) : null);
});
