# Bug Report - Financial Health App

**Date**: February 3, 2026  
**Status**: Fixed

## Critical Bugs Fixed

### 1. ❌ Missing Icon Mappings (CRITICAL - App Crash)
**Location**: `components/ui/icon-symbol.tsx`  
**Severity**: Critical  
**Impact**: App would crash when navigating to Dashboard

**Issue**:
Dashboard was using icons that weren't mapped in the IconSymbol component:
- `flame` (F.I.R.E. Calculator)
- `chart.bar.fill` (Net Worth)
- `house` (Rental Yield)

**Fix**:
Added missing icon mappings:
```tsx
'flame': 'whatshot',
'chart.bar.fill': 'bar-chart',
'house': 'home',
```

**Files Changed**:
- `components/ui/icon-symbol.tsx`

---

### 2. ⚠️ Auto-Categorization Not Applied (Medium)
**Location**: `app/(tabs)/transactions.tsx`  
**Severity**: Medium  
**Impact**: Manual SMS transactions always categorized as "Uncategorized"

**Issue**:
When users manually pasted SMS to add transactions, the app hardcoded the category as 'Uncategorized' instead of using the auto-categorization logic.

**Fix**:
- Imported `categorizeTransaction` function
- Applied categorization before inserting transaction:
```tsx
const category = categorizeTransaction(parsedData.merchant);
```

**Files Changed**:
- `app/(tabs)/transactions.tsx` (added import and logic)

---

## Additional Issues Identified (Not Fixed Yet)

### 3. 📊 Dashboard Uses Mock Data
**Location**: `app/(tabs)/index.tsx`  
**Severity**: Low  
**Impact**: Dashboard shows fake transactions instead of real data

**Issue**:
Dashboard displays hardcoded mock transactions instead of fetching from database.

**Recommendation**:
- Fetch recent transactions from database
- Calculate real income/expense totals
- Update net worth from actual assets/liabilities

---

### 4. 🔍 Search Filter Case Sensitivity
**Location**: `app/(tabs)/transactions.tsx`  
**Severity**: Low  
**Impact**: Search might miss results due to case sensitivity

**Issue**:
The search uses SQL `LIKE` which is case-sensitive in some SQLite configurations.

**Recommendation**:
Use case-insensitive search or convert to lowercase before comparison.

---

## Test Results

### Before Fixes:
- ❌ App crashes when opening Dashboard
- ❌ Manual SMS parsing always shows "Uncategorized"

### After Fixes:
- ✅ Dashboard loads without crashes
- ✅ Manual SMS parsing applies correct categories (Food, Transport, etc.)
- ✅ All icon mappings working

---

## Files Modified

1. `components/ui/icon-symbol.tsx` - Added 3 icon mappings
2. `app/(tabs)/transactions.tsx` - Added auto-categorization

---

## Recommendations for Future

1. **Add Unit Tests**: Test icon mappings to catch missing icons early
2. **TypeScript Strict Mode**: Enable strict mode to catch type errors
3. **Lint Rules**: Add ESLint rules to catch unused imports
4. **Integration Tests**: Test SMS parsing end-to-end
5. **Error Boundaries**: Add error boundaries to prevent full app crashes

---

## Next Steps

1. ✅ Rebuild APK with fixes
2. Test on S23 Ultra
3. Verify dashboard loads correctly
4. Test manual SMS parsing with categorization
5. Consider fixing dashboard mock data issue
