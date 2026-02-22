import { parseSMS, ParsedTransaction } from './sms-parser';
import { categorizeTransaction } from './category-rules';

// Test SMS samples from different banks
const TEST_MESSAGES = {
    HDFC: [
        {
            message: "Rs.450.00 debited from A/c **1234 on 02-02-26 at ZOMATO BANGALORE. Avl Bal Rs.12,450.50",
            expected: {
                amount: 450,
                type: 'DEBIT',
                merchant: 'ZOMATO BANGALORE',
                balance: 12450.50,
                bank: 'HDFC'
            }
        },
        {
            message: "INR 85000.00 credited to A/c **5678 on 01-02-26. Avl Bal INR 97,450.50",
            expected: {
                amount: 85000,
                type: 'CREDIT',
                merchant: '',
                balance: 97450.50,
                bank: 'HDFC'
            }
        },
        {
            message: "Rs.1,250.75 debited from A/c **9012 at SWIGGY DELHI on 03-02-26. Avl Bal Rs.8,199.25",
            expected: {
                amount: 1250.75,
                type: 'DEBIT',
                merchant: 'SWIGGY DELHI',
                balance: 8199.25,
                bank: 'HDFC'
            }
        }
    ],
    SBI: [
        {
            message: "Debited INR 2,500.00 from A/c XX1234 to AMAZON PAY on 02-02-26. Avl Bal INR 15,600.00",
            expected: {
                amount: 2500,
                type: 'DEBIT',
                merchant: 'AMAZON PAY',
                balance: 15600,
                bank: 'SBI'
            }
        },
        {
            message: "Credited INR 50,000.00 from SALARY CREDIT to A/c XX5678 on 01-02-26. Avl Bal INR 65,600.00",
            expected: {
                amount: 50000,
                type: 'CREDIT',
                merchant: 'SALARY CREDIT',
                balance: 65600,
                bank: 'SBI'
            }
        }
    ],
    ICICI: [
        {
            message: "Rs. 750.00 debited from A/c XX9876 to UPI-UBER-REF123456. Info: Payment successful",
            expected: {
                amount: 750,
                type: 'DEBIT',
                merchant: 'Payment successful',
                bank: 'ICICI'
            }
        },
        {
            message: "INR 3,200.50 credited from REFUND to A/c XX4321. Info: Flipkart refund processed",
            expected: {
                amount: 3200.50,
                type: 'CREDIT',
                merchant: 'Flipkart refund processed',
                bank: 'ICICI'
            }
        }
    ],
    AXIS: [
        {
            message: "Rs. 1,800.00 debited from A/c XX7890 to NETFLIX SUBSCRIPTION on 02-02-26. avl bal INR 22,300.00",
            expected: {
                amount: 1800,
                type: 'DEBIT',
                merchant: 'NETFLIX SUBSCRIPTION',
                balance: 22300,
                bank: 'AXIS'
            }
        },
        {
            message: "INR 5,000.00 credited to A/c XX1111 from UPI TRANSFER. avl bal Rs 27,300.00",
            expected: {
                amount: 5000,
                type: 'CREDIT',
                merchant: 'UPI TRANSFER',
                balance: 27300,
                bank: 'AXIS'
            }
        }
    ]
};

// Categorization test cases
const CATEGORIZATION_TESTS = [
    { text: 'ZOMATO BANGALORE', expected: 'Food' },
    { text: 'SWIGGY DELHI', expected: 'Food' },
    { text: 'UBER TRIP', expected: 'Transport' },
    { text: 'AMAZON PAY', expected: 'Shopping' },
    { text: 'NETFLIX SUBSCRIPTION', expected: 'Entertainment' },
    { text: 'SALARY CREDIT', expected: 'Salary' },
    { text: 'UPI TRANSFER', expected: 'Transfer' },
    { text: 'RANDOM MERCHANT', expected: 'Uncategorized' }
];

// Test runner
export function runSMSParserTests(): { passed: number; failed: number; results: any[] } {
    const results: any[] = [];
    let passed = 0;
    let failed = 0;

    console.log('🧪 Running SMS Parser Tests...\n');

    // Test parsing for each bank
    for (const [bank, tests] of Object.entries(TEST_MESSAGES)) {
        console.log(`\n📱 Testing ${bank} Bank SMS Parsing:`);

        tests.forEach((test, index) => {
            const parsed = parseSMS(test.message);
            const testName = `${bank} Test ${index + 1}`;

            if (!parsed) {
                failed++;
                results.push({
                    test: testName,
                    status: 'FAILED',
                    reason: 'Failed to parse SMS',
                    message: test.message
                });
                console.log(`  ❌ ${testName}: Failed to parse`);
                return;
            }

            // Validate parsed data
            const checks = {
                amount: parsed.amount === test.expected.amount,
                type: parsed.type === test.expected.type,
                bank: parsed.bank === test.expected.bank,
                balance: test.expected.balance ? parsed.balance === test.expected.balance : true,
                merchant: test.expected.merchant ? parsed.merchant.includes(test.expected.merchant) : true
            };

            const allPassed = Object.values(checks).every(v => v);

            if (allPassed) {
                passed++;
                results.push({
                    test: testName,
                    status: 'PASSED',
                    parsed
                });
                console.log(`  ✅ ${testName}: Passed`);
            } else {
                failed++;
                results.push({
                    test: testName,
                    status: 'FAILED',
                    checks,
                    expected: test.expected,
                    actual: parsed,
                    message: test.message
                });
                console.log(`  ❌ ${testName}: Failed validation`);
                console.log(`     Expected:`, test.expected);
                console.log(`     Got:`, parsed);
            }
        });
    }

    // Test categorization
    console.log('\n\n🏷️  Testing Auto-Categorization:');
    CATEGORIZATION_TESTS.forEach((test, index) => {
        const category = categorizeTransaction(test.text);
        const testName = `Category Test ${index + 1}`;

        if (category === test.expected) {
            passed++;
            results.push({
                test: testName,
                status: 'PASSED',
                text: test.text,
                category
            });
            console.log(`  ✅ ${testName}: "${test.text}" → ${category}`);
        } else {
            failed++;
            results.push({
                test: testName,
                status: 'FAILED',
                text: test.text,
                expected: test.expected,
                actual: category
            });
            console.log(`  ❌ ${testName}: "${test.text}" → Expected: ${test.expected}, Got: ${category}`);
        }
    });

    // Summary
    console.log('\n\n📊 Test Summary:');
    console.log(`  Total Tests: ${passed + failed}`);
    console.log(`  ✅ Passed: ${passed}`);
    console.log(`  ❌ Failed: ${failed}`);
    console.log(`  Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

    return { passed, failed, results };
}

// Export for use in app
export { TEST_MESSAGES, CATEGORIZATION_TESTS };
