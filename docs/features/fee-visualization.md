# Fee Visualization Feature

## Overview

The IndexFunds comparison tool now displays detailed fee information and visualizes when IndexaCapital's tiered fee structure causes bracket changes.

## Components

### Fee Display

**Location:** BreakdownTable component

**IndexaCapital:**
- Average Fee Rate: Weighted average across investment period
- Current Fee Rate: Fee rate at final balance

**MyInvestor:**
- Fee Rate: Fixed rate (0.3% + TER)

### Bracket Change Visualization

**Location:** ComparisonChart component

**Visual Indicators:**
- Purple vertical grid lines at months where fee bracket changes
- Thicker grid lines for emphasis
- Tooltip footer shows "⚠️ Fee bracket changed" message

**Data:**
- Each MonthlySnapshot tracks current feeRate
- bracketChanged flag indicates transitions

## IndexaCapital Fee Brackets

Balance Range | Management Fee
---|---
< €10,000 | 0.405%
€10,000 - €99,999 | 0.385%
€100,000 - €499,999 | 0.355%
€500,000 - €999,999 | 0.30%
€1M - €4.99M | 0.25%
€5M - €9.99M | 0.20%
€10M - €49.99M | 0.15%
€50M - €99.99M | 0.10%
≥ €100M | 0.08%

*Plus fixed costs: 0.194% (custody 0.096% + underlying 0.098%)*

## Implementation Details

### Data Model

```typescript
interface MonthlySnapshot {
	month: number;
	balance: number;
	totalDeposited: number;
	totalFeesPaid: number;
	totalReturns: number;
	feeRate: number; // Annual fee rate
	bracketChanged?: boolean; // Fee bracket transition flag
}

interface ProviderResult {
	// ... existing fields
	averageFeeRate: number; // Weighted average
	currentFeeRate: number; // Final month rate
}
```

### Testing

Run full test suite:
```bash
npm test
```

Key test files:
- `src/lib/calculations/simulator.test.ts` - Fee tracking and bracket detection
- `src/lib/components/BreakdownTable.test.ts` - Fee display rendering

### Future Enhancements

- Add fee breakdown showing management vs fixed costs
- Export bracket change data to CSV
- Add annual summary showing average fee per year
