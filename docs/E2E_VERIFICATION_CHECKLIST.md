# End-to-End Verification Checklist

**Date:** 2025-11-06
**Feature:** Tiered Custody Fees & Enhanced Bracket Visualization
**Dev Server:** http://localhost:5174/

## Overview

This checklist verifies:
1. Purple vertical lines are clearly visible at fee bracket changes
2. Tiered custody fees are calculated correctly
3. Multiple bracket transitions are properly displayed
4. Tooltips show accurate fee information

---

## Test Case 1: Custody Bracket Crossing (10k threshold)

**Purpose:** Verify custody fee bracket change from 0.109% to 0.103%

**Input Parameters:**
- Initial Investment: €9,000
- Monthly Deposit: €100
- Period: 15 months
- Expected Return: 5%

**Expected Results:**

✓ **Purple Line Visibility:**
- Purple vertical line appears around month 10-11 when balance crosses €10,000
- Line should be 4px thick and fully opaque (clearly visible)
- Line color: rgba(157, 127, 199, 1.0) - solid purple

✓ **Tooltip Verification (before crossing):**
- Hover over months 1-9
- IndexaCapital fee rate should show ≈ 0.612% (0.405% + 0.109% + 0.098%)
- Should NOT show "⚠️ Fee bracket changed"

✓ **Tooltip Verification (at crossing):**
- Hover over the month with purple line (likely month 10-11)
- Should show "⚠️ Fee bracket changed"
- IndexaCapital fee rate should show ≈ 0.586% (0.385% + 0.103% + 0.098%)

✓ **Tooltip Verification (after crossing):**
- Hover over months after the purple line
- IndexaCapital fee rate should show ≈ 0.586%

✓ **BreakdownTable Display:**
- IndexaCapital Average Fee Rate: Should be between 0.610% and 0.612% (mix of both brackets)
- IndexaCapital Current Fee Rate: Should be 0.586% (final bracket: 10k-100k)
- MyInvestor Fee Rate: Should remain constant at 0.35%

---

## Test Case 2: Multiple Custody Brackets (10k + 100k crossings)

**Purpose:** Verify multiple custody fee bracket changes

**Input Parameters:**
- Initial Investment: €8,000
- Monthly Deposit: €5,000
- Period: 3 years (36 months)
- Expected Return: 8%

**Expected Results:**

✓ **Multiple Purple Lines:**
- First purple line around month 1-2 (crossing €10,000)
  - Custody changes: 0.109% → 0.103%
- Second purple line around month 19-20 (crossing €100,000)
  - Custody changes: 0.103% → 0.097%

✓ **Fee Progression:**
- Months 1: ≈ 0.612% (< 10k bracket)
- Months 2-18: ≈ 0.586% (10k-100k bracket)
- Months 19+: ≈ 0.550% (100k-500k bracket)

✓ **BreakdownTable Display:**
- Average Fee Rate: Should reflect weighted average across all three brackets
- Current Fee Rate: Should be 0.550% (final bracket: 100k-500k)
- Difference between Average and Current should be visible (Average > Current)

---

## Test Case 3: Large Balance (1M threshold)

**Purpose:** Verify custody fee drop at €1,000,000 threshold

**Input Parameters:**
- Initial Investment: €900,000
- Monthly Deposit: €10,000
- Period: 2 years (24 months)
- Expected Return: 7%

**Expected Results:**

✓ **Purple Line at 1M:**
- Purple line appears around month 10-12 when crossing €1,000,000
- Should be clearly visible (4px thick, fully opaque)

✓ **Significant Fee Change:**
- Before 1M: ≈ 0.489% (0.3% + 0.091% + 0.098%)
- After 1M: ≈ 0.396% (0.25% + 0.048% + 0.098%)
- Drop of ≈ 0.093% - should be visually significant in the chart

✓ **Tooltip Verification:**
- At purple line month: "⚠️ Fee bracket changed"
- Fee rate changes from 0.489% to 0.396%

✓ **BreakdownTable Display:**
- Average Fee Rate: Higher than current (mix of 500k-1M and 1M+ brackets)
- Current Fee Rate: 0.396% (1M-5M bracket)
- Clear difference between Average and Current demonstrates bracket crossing impact

---

## Visual Verification Checklist

### Chart Visualization

- [ ] Purple vertical lines are clearly visible (not faint or transparent)
- [ ] Lines appear at correct months (when balance crosses thresholds)
- [ ] Lines are thick enough to see easily (4px width)
- [ ] Line color is solid purple, not semi-transparent
- [ ] Lines extend full height of chart
- [ ] Multiple bracket changes show multiple purple lines

### Tooltip Accuracy

- [ ] Hover tooltips show current fee rate for each provider
- [ ] Fee rates shown match expected values (see test cases)
- [ ] "⚠️ Fee bracket changed" appears only at bracket change months
- [ ] Tooltip footer shows which provider is ahead
- [ ] All fee rates display with 3 decimal places (e.g., 0.612%)

### BreakdownTable Display

- [ ] IndexaCapital shows "Average Fee Rate" label
- [ ] IndexaCapital shows "Current Fee Rate" label
- [ ] MyInvestor shows "Fee Rate" label (not "Average" since it's constant)
- [ ] Average fee ≥ Current fee when brackets crossed (fees decrease over time)
- [ ] All fee rates formatted consistently (3 decimals)
- [ ] Values match chart tooltip values

### Legend and Instructions

- [ ] Explanation text below chart is visible
- [ ] Text mentions "Purple vertical lines indicate when IndexaCapital's fee bracket changes"
- [ ] Instructions tell users to "Hover over the chart to see fee rates"
- [ ] Info icon (ℹ️) appears next to explanation

---

## Edge Cases to Test

### Boundary Conditions

Test with exact boundary values to ensure correct bracket selection:

**10k Boundary:**
- Initial: €9,999, Monthly: €1, Period: 1 month
- Expected: Should cross to 10k-100k bracket in first month

**100k Boundary:**
- Initial: €99,999, Monthly: €1, Period: 1 month
- Expected: Should cross to 100k-500k bracket in first month

**500k Boundary:**
- Initial: €499,999, Monthly: €1, Period: 1 month
- Expected: Should cross to 500k-1M bracket in first month

**1M Boundary:**
- Initial: €999,999, Monthly: €1, Period: 1 month
- Expected: Should cross to 1M+ bracket in first month

### No Bracket Changes

Test scenarios where balance stays within one bracket:

**Stay below 10k:**
- Initial: €1,000, Monthly: €100, Period: 5 years
- Expected: No purple lines, consistent 0.612% fee rate

**Stay in 10k-100k:**
- Initial: €10,000, Monthly: €100, Period: 5 years
- Expected: No purple lines (unless crosses 100k), consistent 0.586% fee rate

---

## Calculation Verification

### Manual Calculation Check

For Test Case 1 (Initial: €9,000, Monthly: €100, Expected Return: 5% annual = 0.417% monthly):

**Month 1:**
- Starting: €9,000
- Deposit: €100
- Balance after deposit: €9,100
- Return (0.417%): €37.95
- Balance after return: €9,137.95
- Fee rate: 0.612% annual = 0.051% monthly
- Fee: €4.66
- Final balance: €9,133.29
- **Custody bracket: < 10k → 0.109%**

**Month 10 (approximately when crossing €10,000):**
- Balance should exceed €10,000
- **Custody bracket changes: 10k-100k → 0.103%**
- Fee rate changes from 0.612% to 0.586%
- Purple line should appear

---

## Performance Check

- [ ] Page loads in < 2 seconds
- [ ] Chart renders in < 1 second
- [ ] No console errors
- [ ] No console warnings
- [ ] Smooth hover interactions (no lag)
- [ ] Form inputs respond immediately
- [ ] Chart updates instantly when parameters change

---

## Compatibility Check

Test in multiple scenarios:

- [ ] Desktop viewport (> 1024px)
- [ ] Tablet viewport (768px - 1024px)
- [ ] Mobile viewport (< 768px)
- [ ] Chart remains readable in all viewports
- [ ] Purple lines visible on all screen sizes

---

## Known Good Values (Quick Reference)

| Balance | Management | Custody | Underlying | Total |
|---------|-----------|---------|------------|-------|
| €5,000 | 0.405% | 0.109% | 0.098% | **0.612%** |
| €15,000 | 0.385% | 0.103% | 0.098% | **0.586%** |
| €150,000 | 0.355% | 0.097% | 0.098% | **0.550%** |
| €750,000 | 0.300% | 0.091% | 0.098% | **0.489%** |
| €2,000,000 | 0.250% | 0.048% | 0.098% | **0.396%** |

---

## Verification Sign-Off

Date: _______________
Tested by: _______________

- [ ] All test cases pass
- [ ] Purple lines clearly visible
- [ ] Tooltips accurate
- [ ] BreakdownTable correct
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Ready for production

---

## Issues Found (if any)

Use this section to document any issues discovered during verification:

**Issue 1:**
- Description:
- Severity:
- Steps to reproduce:

**Issue 2:**
- Description:
- Severity:
- Steps to reproduce:

---

## Reactive Chart with Breakpoint Indicators

- [ ] Chart updates immediately when changing initial investment
- [ ] Chart updates immediately when changing deposit amount
- [ ] Chart updates immediately when changing deposit frequency
- [ ] Chart updates immediately when changing time period
- [ ] Chart updates immediately when changing expected return
- [ ] Chart updates immediately when changing MyInvestor TER
- [ ] Yellow markers appear at fee bracket changes
- [ ] Hovering yellow markers shows tooltip with time, balance, and fee
- [ ] Chart tooltip shows enhanced bracket change information
- [ ] No lag or stuttering when rapidly changing inputs
- [ ] URL parameters sync correctly
- [ ] State restores from URL on page refresh
- [ ] Works in Chrome, Firefox, Safari
- [ ] Responsive on mobile, tablet, desktop
