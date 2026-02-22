const { parseSMS } = require('../lib/sms-parser');

// Test one message at a time
const testMessage = "Rs.450.00 debited from A/c **1234 on 02-02-26 at ZOMATO BANGALORE. Avl Bal Rs.12,450.50";

console.log('Testing message:', testMessage);
console.log('\nParsed result:', parseSMS(testMessage));

// Test if it contains 'hdfc'
console.log('\nContains hdfc?', testMessage.toLowerCase().includes('hdfc'));

// Test the regex directly
const regex = /(debited|credited).*?(?:INR|Rs\.?)\s*([\d,]+\.?\d*).*?(?:at|to|from)\s+([A-Z0-9\s]+?)(?:\.| on| Avl).*?(?:Avl Bal|Bal).*?(?:INR|Rs\.)?\s*([\d,]+\.?\d*)/i;
const match = testMessage.match(regex);
console.log('\nDirect regex match:', match);
