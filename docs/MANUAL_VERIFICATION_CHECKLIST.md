# Manual Verification Checklist for URL State Persistence

**Feature:** URL State Persistence and Sharing
**Implementation Date:** 2025-11-06
**Status:** Ready for Manual Testing

## Automated Testing Status

✅ **All automated tests passing:**
- 100 tests total (75 unit/integration + 25 edge case tests)
- Test coverage includes:
  - URL parsing and serialization
  - Store initialization with custom values
  - Page load function
  - Edge cases (invalid values, extra params, boundaries)
  - Backward compatibility

✅ **Build verification:**
- Production build succeeds without errors
- Static site generation works correctly

## Manual Testing Required

Since automated browser testing is not set up, the following manual tests need to be performed by the user to verify the URL persistence feature works correctly.

---

## Test Suite 1: Complete User Flow (14 steps from plan)

### Setup
1. Start the development server: `npm run dev`
2. Open browser to: `http://localhost:5173/`

### Test Steps

**Step 1: Verify defaults are shown**
- [ ] Page loads successfully
- [ ] Form shows default values:
  - Initial Investment: 1000
  - Deposit Amount: 100
  - Frequency: monthly
  - Time Period: 20 years
  - Expected Return: 7%
  - MyInvestor TER: 0.05%
- [ ] URL updates to include default parameters

**Step 2: Change initial investment to 10000**
- [ ] Enter 10000 in the Initial Investment field
- [ ] URL automatically updates to include `initial=10000`

**Step 3: Change deposit to 500**
- [ ] Enter 500 in the Deposit Amount field
- [ ] URL automatically updates to include `deposit=500`

**Step 4: Change frequency to quarterly**
- [ ] Select "Quarterly" from the dropdown
- [ ] URL automatically updates to include `freq=quarterly`

**Step 5: Copy URL from address bar**
- [ ] Copy the full URL from the browser address bar
- Expected format: `http://localhost:5173/?initial=10000&deposit=500&freq=quarterly&years=20&return=7&ter=0.05`

**Step 6: Open URL in new incognito tab**
- [ ] Open a new incognito/private window
- [ ] Paste the copied URL
- [ ] Navigate to the URL

**Step 7: Verify all values match**
- [ ] Initial Investment: 10000 ✓
- [ ] Deposit Amount: 500 ✓
- [ ] Frequency: quarterly ✓
- [ ] Time Period: 20 years ✓
- [ ] Expected Return: 7% ✓
- [ ] MyInvestor TER: 0.05% ✓
- [ ] Chart displays correctly with these values
- [ ] Calculations are accurate

**Step 8: Refresh the incognito tab**
- [ ] Press F5 or Ctrl+R (Cmd+R on Mac)
- [ ] Page reloads

**Step 9: Verify values still match**
- [ ] All form values remain the same after refresh
- [ ] URL parameters are preserved
- [ ] No values reverted to defaults

**Step 10: Close incognito tab**
- [ ] Close the incognito/private window

**Step 11: Go back to original tab and change years to 30**
- [ ] Switch back to the original browser tab
- [ ] Change Time Period to 30 years
- [ ] URL updates to include `years=30`

**Step 12: Refresh**
- [ ] Press F5 or Ctrl+R (Cmd+R on Mac)

**Step 13: Verify years is still 30**
- [ ] Time Period shows 30 years
- [ ] URL still contains `years=30`
- [ ] All other values are preserved

**Step 14: Complete flow verification**
- [ ] All steps completed successfully
- [ ] URL state is fully preserved across refreshes
- [ ] Changes to form update the URL
- [ ] URL can be shared and works in new windows

---

## Test Suite 2: Edge Cases

### Test 2.1: Invalid Parameters
**URL:** `http://localhost:5173/?initial=invalid&deposit=-100&freq=badvalue`

- [ ] Page loads without errors
- [ ] Form shows default values (invalid values are ignored)
- [ ] No console errors

### Test 2.2: Extra/Unknown Parameters
**URL:** `http://localhost:5173/?initial=5000&extra=ignored&another=param&unknown=value`

- [ ] Page loads successfully
- [ ] Initial Investment shows 5000
- [ ] Other parameters default to normal values
- [ ] Extra parameters are silently ignored
- [ ] No console errors

### Test 2.3: Boundary Values - Very Large
**URL:** `http://localhost:5173/?initial=999999999&deposit=999999&years=100`

- [ ] Page loads successfully
- [ ] Form accepts and displays large values
- [ ] Calculations work correctly
- [ ] No overflow errors

### Test 2.4: Boundary Values - Very Small
**URL:** `http://localhost:5173/?initial=0.01&deposit=0.01&ter=0.05`

- [ ] Page loads successfully
- [ ] Form accepts and displays small values
- [ ] Calculations work correctly

### Test 2.5: TER Boundaries
**URL:** `http://localhost:5173/?ter=0.05` (minimum)

- [ ] TER shows 0.05%
- [ ] Value is accepted

**URL:** `http://localhost:5173/?ter=0.59` (maximum)

- [ ] TER shows 0.59%
- [ ] Value is accepted

**URL:** `http://localhost:5173/?ter=0.01` (below minimum)

- [ ] TER shows default 0.05% (invalid value ignored)

**URL:** `http://localhost:5173/?ter=0.99` (above maximum)

- [ ] TER shows default 0.05% (invalid value ignored)

### Test 2.6: Empty and Malformed URLs
**URL:** `http://localhost:5173/?&&&`

- [ ] Page loads successfully
- [ ] Form shows default values
- [ ] No console errors

**URL:** `http://localhost:5173/?initial=&deposit=&freq=`

- [ ] Page loads successfully
- [ ] Form shows default values
- [ ] No console errors

### Test 2.7: Zero Deposit
**URL:** `http://localhost:5173/?initial=5000&deposit=0`

- [ ] Page loads successfully
- [ ] Deposit Amount shows 0
- [ ] Calculations work correctly (investment without recurring deposits)

---

## Test Suite 3: Backward Compatibility

### Test 3.1: Existing Shared URLs
Test with URLs that may have been shared before (simulate with these examples):

**URL:** `http://localhost:5173/?initial=1000&deposit=100&freq=monthly&years=20&return=7&ter=0.05`

- [ ] All parameters load correctly
- [ ] No breaking changes to URL format

**URL:** `http://localhost:5173/?initial=2000&years=10`

- [ ] Partial parameters work
- [ ] Missing parameters use defaults
- [ ] URL format remains consistent

---

## Test Suite 4: Browser Compatibility

Test in multiple browsers if available:

### Chrome/Edge
- [ ] All features work correctly
- [ ] URL updates properly
- [ ] Refresh preserves state

### Firefox
- [ ] All features work correctly
- [ ] URL updates properly
- [ ] Refresh preserves state

### Safari
- [ ] All features work correctly
- [ ] URL updates properly
- [ ] Refresh preserves state

---

## Test Suite 5: Production Build

### Setup
1. Build for production: `npm run build`
2. Preview production build: `npm run preview`
3. Open browser to the preview URL

### Tests
- [ ] Production build loads successfully
- [ ] URL state persistence works in production
- [ ] All form interactions work
- [ ] URL updates correctly
- [ ] Refresh preserves state

---

## Test Suite 6: Real-World Scenarios

### Scenario A: Sharing with a Friend
1. [ ] Configure simulation with custom values
2. [ ] Copy URL
3. [ ] Send to another device/person (email, message, etc.)
4. [ ] Recipient opens URL
5. [ ] Recipient sees exact same values

### Scenario B: Bookmarking
1. [ ] Configure simulation with specific scenario
2. [ ] Bookmark the page (with parameters in URL)
3. [ ] Close browser
4. [ ] Open bookmarked URL
5. [ ] Values are preserved

### Scenario C: Browser Back/Forward
1. [ ] Start with defaults
2. [ ] Change some values (URL updates)
3. [ ] Change more values (URL updates again)
4. [ ] Click browser back button
5. [ ] [ ] Previous values are restored
6. [ ] Click browser forward button
7. [ ] [ ] Most recent values are restored

---

## Known Limitations (Document any found during testing)

_Record any issues or limitations discovered during manual testing:_

- None found in automated testing
-

---

## Verification Sign-Off

**Tester Name:** _________________

**Date:** _________________

**Overall Status:**
- [ ] ✅ All tests passed
- [ ] ⚠️ Some issues found (document above)
- [ ] ❌ Critical issues found (do not deploy)

**Notes:**
_Add any additional observations or comments:_

---

## Automated Test Results (Reference)

```
Test Files: 17 passed (17)
Tests: 100 passed (100)
Duration: 1.54s
```

**Test Coverage:**
- URL sync utility: 34 tests (4 basic + 5 integration + 25 edge cases)
- Page load function: 2 tests
- Store initialization: 5 tests
- Component tests: 28 tests
- Calculation tests: 26 tests
- Other utilities: 5 tests

**Build Status:**
- Production build: ✅ Success
- Static site generation: ✅ Success
- Build size: ~245 KB (main chunk, gzipped: ~83 KB)
