// Transfer Calculator
// Handles free transfer logic and hit calculations

export interface TransferData {
  gameweek: number
  transfersMade: number
  freeTransfersAvailable: number
  freeTransfersUsed: number
  hits: number // Number of hits taken (-4 points each)
  hitCost: number // Total points deducted (hits * -4)
  gwPoints: number // Gameweek points (before hits)
  gwPointsWithHits: number // Gameweek points (after hits)
}

export interface TeamTransferHistory {
  teamId: string
  userName: string
  transfers: TransferData[]
  totalHits: number
  totalHitCost: number
  totalGwPoints: number // Sum of GW points without hits
  totalGwPointsWithHits: number // Sum of GW points with hits
}

/**
 * Calculate free transfers for a gameweek
 * Rules:
 * - GW1: 0 free transfers (new game)
 * - After each gameweek: +1 free transfer
 * - Free transfers carry over (max 2, but can be more due to special events like AFCON)
 * - Special events can grant extra free transfers (e.g., AFCON = 5 free transfers)
 */
export function calculateFreeTransfers(
  gameweek: number,
  previousFreeTransfers: number = 0,
  specialEventFreeTransfers?: number
): number {
  if (gameweek === 1) {
    return 0 // First gameweek, no free transfers
  }
  
  // Check for special events (AFCON, etc.)
  // Based on user note: "very recently we had 5 free transfers because of afcon"
  // This likely happened around GW20-21 (January 2024)
  if (specialEventFreeTransfers !== undefined) {
    return specialEventFreeTransfers
  }
  
  // Standard logic: previous free transfers + 1 (but max 2 normally)
  // However, if previous was 0 (GW1), then GW2 gets 1
  // If previous was 1, then next gets 2 (max)
  // If previous was 2, stays at 2 (unless used)
  
  if (previousFreeTransfers === 0) {
    return 1 // GW2 gets 1 free transfer
  }
  
  // Standard: add 1, but cap at 2 (unless special event)
  return Math.min(previousFreeTransfers + 1, 2)
}

/**
 * Calculate transfer costs and hits
 */
export function calculateTransferCosts(
  transfersMade: number,
  freeTransfersAvailable: number
): {
  freeTransfersUsed: number
  hits: number
  hitCost: number
} {
  if (transfersMade <= freeTransfersAvailable) {
    return {
      freeTransfersUsed: transfersMade,
      hits: 0,
      hitCost: 0,
    }
  }
  
  const extraTransfers = transfersMade - freeTransfersAvailable
  const hits = extraTransfers
  const hitCost = hits * -4 // Each hit costs -4 points
  
  return {
    freeTransfersUsed: freeTransfersAvailable,
    hits,
    hitCost,
  }
}

/**
 * Process transfer data for a team across all gameweeks
 */
export function processTeamTransfers(
  teamId: string,
  userName: string,
  gameweekData: Array<{
    gameweek: number
    transfers: number
    transfersCost: number // From FPL API (negative value, e.g., -4, -8)
    points: number // GW points before hits (FPL doesn't include hits in gameweek points)
  }>,
  specialEvents?: Record<number, number> // Map of gameweek -> free transfers (for special events)
): TeamTransferHistory {
  const transfers: TransferData[] = []
  let previousFreeTransfers = 0
  
  let totalHits = 0
  let totalHitCost = 0
  let totalGwPoints = 0
  let totalGwPointsWithHits = 0
  
  // Sort by gameweek to ensure correct order
  const sortedData = [...gameweekData].sort((a, b) => a.gameweek - b.gameweek)
  
  sortedData.forEach((gw) => {
    // Calculate free transfers available for this gameweek
    let freeTransfersAvailable: number
    if (specialEvents?.[gw.gameweek] !== undefined) {
      freeTransfersAvailable = specialEvents[gw.gameweek]
    } else {
      freeTransfersAvailable = calculateFreeTransfers(gw.gameweek, previousFreeTransfers)
    }
    
    // Get transfer data from FPL API
    const transfersMade = gw.transfers || 0
    const transfersCostNegative = gw.transfersCost || 0 // Negative value from FPL API (e.g., -4, -8, -12)
    const hitCostAbsolute = Math.abs(transfersCostNegative) // Positive for counting
    const hits = hitCostAbsolute / 4 // Each hit is -4 points
    
    // Calculate free transfers used (can't exceed available)
    const freeTransfersUsed = Math.min(transfersMade, freeTransfersAvailable)
    
    // Calculate free transfers for next gameweek
    // Standard rule: unused transfers carry over, then +1 is added (max 2 normally)
    // Special events override this
    if (specialEvents?.[gw.gameweek + 1] !== undefined) {
      previousFreeTransfers = specialEvents[gw.gameweek + 1]
    } else {
      const unusedFreeTransfers = freeTransfersAvailable - freeTransfersUsed
      // Next GW gets: unused + 1, but normally capped at 2 (unless special event)
      previousFreeTransfers = Math.min(unusedFreeTransfers + 1, 2)
    }
    
    // FPL API: points field does NOT include transfer costs
    // transfersCost is negative (e.g., -4, -8)
    const transferData: TransferData = {
      gameweek: gw.gameweek,
      transfersMade,
      freeTransfersAvailable,
      freeTransfersUsed,
      hits,
      hitCost: transfersCostNegative, // Keep original negative value for display
      gwPoints: gw.points, // Points without hits
      gwPointsWithHits: gw.points + transfersCostNegative, // Points with hits (add negative value)
    }
    
    transfers.push(transferData)
    
    totalHits += hits
    totalHitCost += hitCostAbsolute
    totalGwPoints += gw.points
    totalGwPointsWithHits += transferData.gwPointsWithHits
  })
  
  return {
    teamId,
    userName,
    transfers,
    totalHits,
    totalHitCost,
    totalGwPoints,
    totalGwPointsWithHits,
  }
}

/**
 * Special events that grant extra free transfers
 * Format: { gameweek: freeTransfers }
 * 
 * GW16 (2024/25 season): 5 free transfers granted (1 regular + 4 additional)
 */
export const SPECIAL_TRANSFER_EVENTS: Record<number, number> = {
  16: 5, // GW16 had 5 free transfers (1 + 4 additional)
}

