# Transfer Tracking Implementation

## Overview
This document describes the transfer tracking system that calculates free transfers, tracks hits, and compares FPL points with and without transfer deductions.

## Key Features

### 1. Transfer Calculator (`lib/transfer-calculator.ts`)
- **Free Transfer Logic:**
  - GW1: 0 free transfers (new game)
  - After each gameweek: +1 free transfer
  - Free transfers carry over (max 2 normally)
  - Special events can grant extra free transfers (e.g., AFCON = 5)

- **Hit Calculation:**
  - Each transfer beyond free transfers = 1 hit
  - Each hit = -4 points
  - Tracks hits per gameweek and total hits

### 2. API Routes

#### `/api/transfers`
Fetches transfer data for all teams from FPL API and processes it:
- Returns transfer history for each team
- Includes free transfers, hits, and costs per gameweek
- Calculates totals across all gameweeks

#### `/api/leaderboard-fpl`
Fetches FPL leaderboard data directly from FPL API:
- Shows points WITHOUT hits (sum of GW points)
- Shows FPL total points (WITH hits)
- Calculates difference to show impact of hits
- Verifies that FPL doesn't include hits in individual GW points but includes them in final total

### 3. Pages

#### `/transfers`
- Transfer tracker page showing:
  - Summary cards (total hits, hit cost, teams)
  - Team selector with tabs
  - Detailed gameweek breakdown per team
  - All teams comparison table

#### `/leaderboard-fpl`
- FPL leaderboard comparison page showing:
  - Points without hits vs FPL total (with hits)
  - Sortable by either metric
  - Hit count and cost per team
  - Difference calculation

## FPL API Data Structure

From FPL API `/entry/{teamId}/history/`:
```typescript
{
  current: [{
    event: number,              // Gameweek number
    points: number,             // GW points WITHOUT hits
    total_points: number,       // Cumulative total WITH hits
    event_transfers: number,    // Number of transfers made
    event_transfers_cost: number // Transfer cost (0 or negative, e.g., -4, -8)
  }]
}
```

**Important:** 
- `points` field = gameweek points BEFORE transfer deductions
- `total_points` field = cumulative total INCLUDING transfer deductions
- `event_transfers_cost` = negative value (0, -4, -8, etc.)

## Free Transfer Rules

1. **GW1:** 0 free transfers
2. **GW2:** 1 free transfer (0 + 1)
3. **GW3+:** Previous unused + 1 (max 2 normally)
4. **Special Events:** Can override normal rules (e.g., AFCON = 5 free transfers)

### Example:
- GW1: 0 free, make 0 transfers → GW2 gets 1 free
- GW2: 1 free, make 1 transfer (use it) → GW3 gets 1 free
- GW2: 1 free, make 0 transfers → GW3 gets 2 free (carry over + 1)
- GW3: 2 free, make 3 transfers → Use 2 free, 1 hit (-4), GW4 gets 1 free

## Special Events

To add special events (like AFCON), update `SPECIAL_TRANSFER_EVENTS` in `lib/transfer-calculator.ts`:

```typescript
export const SPECIAL_TRANSFER_EVENTS: Record<number, number> = {
  20: 5, // GW20 had 5 free transfers due to AFCON
  21: 5, // GW21 had 5 free transfers due to AFCON
}
```

## Navigation Updates

Added to navigation:
- **Transfers** (`/transfers`) - Transfer tracking page
- **FPL Leaderboard** (`/leaderboard-fpl`) - FPL API comparison

## Verification

The system verifies that:
1. FPL does NOT include -4 hits in individual gameweek points
2. FPL DOES include hits in the final total points
3. Our calculation matches: `totalPointsNoHits + totalHitCost = totalPointsFPL`

## Testing

To test the transfer tracking:
1. Navigate to `/transfers` to see transfer data
2. Navigate to `/leaderboard-fpl` to compare points
3. Check that hit costs match FPL API data
4. Verify free transfer calculations are correct

## Next Steps

1. **Verify Google Sheets Data:**
   - Check that sheet data is being fetched correctly
   - Verify tie-breaking logic matches your rules
   - Test edge cases

2. **Add AFCON Special Event:**
   - Identify which gameweeks had 5 free transfers
   - Add to `SPECIAL_TRANSFER_EVENTS`

3. **Compare Leaderboards:**
   - Use `/leaderboard-fpl` to see FPL API data
   - Compare with `/leaderboard` (Google Sheets data)
   - Identify any discrepancies

