/**
 * Wedding Budget Allocation Engine
 *
 * Calculates recommended category allocations for a wedding budget
 * using weighted tier multipliers and stable rounding.
 */

export type TierType = 'TOP' | 'IMPORTANT' | 'NICE';

export interface AllocationInput {
  totalBudgetCents: number;
  enabledCategoryIds: string[];
  baseWeights: Record<string, number>; // categoryId -> base weight
  tierByCategoryId: Record<string, TierType>;
  tierMultipliers?: {
    TOP: number;
    IMPORTANT: number;
    NICE: number;
  };
}

export interface AllocationOutput {
  allocationsByCategoryId: Record<string, number>;
  debug: {
    sumEffectiveWeights: number;
    effectiveWeightsByCategoryId: Record<string, number>;
    sharesByCategoryId: Record<string, number>;
    roundingRemainders: Array<{ categoryId: string; remainder: number }>;
  };
}

// Default tier multipliers
const DEFAULT_TIER_MULTIPLIERS = {
  TOP: 1.4,
  IMPORTANT: 1.0,
  NICE: 0.7,
};

// Safe default base weight for custom categories
const DEFAULT_BASE_WEIGHT = 0.3;

/**
 * Calculate weighted allocations for enabled categories
 */
export function calculateAllocations(input: AllocationInput): AllocationOutput {
  const {
    totalBudgetCents,
    enabledCategoryIds,
    baseWeights,
    tierByCategoryId,
    tierMultipliers = DEFAULT_TIER_MULTIPLIERS,
  } = input;

  if (enabledCategoryIds.length === 0) {
    return {
      allocationsByCategoryId: {},
      debug: {
        sumEffectiveWeights: 0,
        effectiveWeightsByCategoryId: {},
        sharesByCategoryId: {},
        roundingRemainders: [],
      },
    };
  }

  // Step 1: Calculate effective weights
  const effectiveWeights: Record<string, number> = {};
  let sumEffectiveWeights = 0;

  for (const categoryId of enabledCategoryIds) {
    const baseWeight = baseWeights[categoryId] ?? DEFAULT_BASE_WEIGHT;
    const tier = tierByCategoryId[categoryId] ?? 'IMPORTANT';
    const multiplier = tierMultipliers[tier];

    const effectiveWeight = baseWeight * multiplier;
    effectiveWeights[categoryId] = effectiveWeight;
    sumEffectiveWeights += effectiveWeight;
  }

  // Step 2: Calculate shares and raw allocations
  const shares: Record<string, number> = {};
  const rawAllocations: Record<string, number> = {};
  const fractionalRemainders: Array<{ categoryId: string; remainder: number }> = [];

  for (const categoryId of enabledCategoryIds) {
    const share = effectiveWeights[categoryId] / sumEffectiveWeights;
    shares[categoryId] = share;

    const rawAllocation = share * totalBudgetCents;
    const floorAllocation = Math.floor(rawAllocation);
    const remainder = rawAllocation - floorAllocation;

    rawAllocations[categoryId] = floorAllocation;
    if (remainder > 0) {
      fractionalRemainders.push({ categoryId, remainder });
    }
  }

  // Step 3: Stable rounding - distribute remaining cents
  // Sort by remainder descending to ensure consistent distribution
  fractionalRemainders.sort((a, b) => b.remainder - a.remainder);

  let totalAllocated = Object.values(rawAllocations).reduce((sum, val) => sum + val, 0);
  let remainingCents = totalBudgetCents - totalAllocated;

  for (const { categoryId } of fractionalRemainders) {
    if (remainingCents <= 0) break;
    rawAllocations[categoryId] += 1;
    remainingCents -= 1;
  }

  return {
    allocationsByCategoryId: rawAllocations,
    debug: {
      sumEffectiveWeights,
      effectiveWeightsByCategoryId: effectiveWeights,
      sharesByCategoryId: shares,
      roundingRemainders: fractionalRemainders,
    },
  };
}

/**
 * Validate that TOP priority count is between 3 and 5
 */
export function validatePriorityCount(
  tierByCategoryId: Record<string, TierType>,
  enabledCategoryIds: string[]
): { isValid: boolean; topCount: number; message: string } {
  const topCategories = enabledCategoryIds.filter(
    (id) => tierByCategoryId[id] === 'TOP'
  );
  const topCount = topCategories.length;

  if (topCount < 3) {
    return {
      isValid: false,
      topCount,
      message: `Please select at least 3 top priorities (currently ${topCount})`,
    };
  }

  if (topCount > 5) {
    return {
      isValid: false,
      topCount,
      message: `Please select at most 5 top priorities (currently ${topCount})`,
    };
  }

  return {
    isValid: true,
    topCount,
    message: 'Priority count is valid',
  };
}

/**
 * Built-in validation tests
 * Returns true if all tests pass, false otherwise
 */
export function runValidationTests(): boolean {
  console.log('Running allocation engine tests...\n');

  let allTestsPassed = true;

  // Test 1: Allocations sum to total budget
  console.log('Test 1: Allocations sum to total budget');
  {
    const input: AllocationInput = {
      totalBudgetCents: 3000000, // $30,000
      enabledCategoryIds: ['cat1', 'cat2', 'cat3'],
      baseWeights: {
        cat1: 0.25,
        cat2: 0.2,
        cat3: 0.15,
      },
      tierByCategoryId: {
        cat1: 'TOP',
        cat2: 'IMPORTANT',
        cat3: 'NICE',
      },
    };

    const result = calculateAllocations(input);
    const sum = Object.values(result.allocationsByCategoryId).reduce(
      (a, b) => a + b,
      0
    );

    if (sum === input.totalBudgetCents) {
      console.log(`  ✓ Sum equals total: ${sum} cents`);
    } else {
      console.log(`  ✗ Sum mismatch: ${sum} != ${input.totalBudgetCents}`);
      allTestsPassed = false;
    }
  }

  // Test 2: No negative allocations
  console.log('\nTest 2: No negative allocations');
  {
    const input: AllocationInput = {
      totalBudgetCents: 1000000,
      enabledCategoryIds: ['cat1', 'cat2', 'cat3', 'cat4', 'cat5'],
      baseWeights: {
        cat1: 0.3,
        cat2: 0.25,
        cat3: 0.2,
        cat4: 0.15,
        cat5: 0.1,
      },
      tierByCategoryId: {
        cat1: 'TOP',
        cat2: 'IMPORTANT',
        cat3: 'IMPORTANT',
        cat4: 'NICE',
        cat5: 'NICE',
      },
    };

    const result = calculateAllocations(input);
    const hasNegative = Object.values(result.allocationsByCategoryId).some(
      (val) => val < 0
    );

    if (!hasNegative) {
      console.log(`  ✓ All allocations are non-negative`);
      console.log(
        `    Allocations: ${JSON.stringify(result.allocationsByCategoryId)}`
      );
    } else {
      console.log(`  ✗ Found negative allocations`);
      allTestsPassed = false;
    }
  }

  // Test 3: Disabling a category redistributes budget
  console.log('\nTest 3: Budget redistribution when disabling categories');
  {
    const baseInput: AllocationInput = {
      totalBudgetCents: 5000000,
      enabledCategoryIds: ['cat1', 'cat2', 'cat3'],
      baseWeights: {
        cat1: 0.3,
        cat2: 0.3,
        cat3: 0.3,
      },
      tierByCategoryId: {
        cat1: 'IMPORTANT',
        cat2: 'IMPORTANT',
        cat3: 'IMPORTANT',
      },
    };

    const resultAll = calculateAllocations(baseInput);
    const resultWithoutCat1 = calculateAllocations({
      ...baseInput,
      enabledCategoryIds: ['cat2', 'cat3'],
    });

    const sumWithoutCat1 = Object.values(
      resultWithoutCat1.allocationsByCategoryId
    ).reduce((a, b) => a + b, 0);

    if (
      sumWithoutCat1 === baseInput.totalBudgetCents &&
      resultWithoutCat1.allocationsByCategoryId['cat2'] >
        resultAll.allocationsByCategoryId['cat2']
    ) {
      console.log(`  ✓ Budget redistributed correctly`);
      console.log(
        `    With all 3 categories: cat1=${resultAll.allocationsByCategoryId['cat1']}, cat2=${resultAll.allocationsByCategoryId['cat2']}`
      );
      console.log(
        `    Without cat1: cat2=${resultWithoutCat1.allocationsByCategoryId['cat2']}, cat3=${resultWithoutCat1.allocationsByCategoryId['cat3']}`
      );
    } else {
      console.log(`  ✗ Budget redistribution failed`);
      allTestsPassed = false;
    }
  }

  // Test 4: Priority validation
  console.log('\nTest 4: Priority count validation');
  {
    const validTiers: Record<string, TierType> = {
      cat1: 'TOP',
      cat2: 'TOP',
      cat3: 'TOP',
      cat4: 'TOP',
      cat5: 'IMPORTANT',
    };
    const enabledIds = ['cat1', 'cat2', 'cat3', 'cat4', 'cat5'];

    const validation = validatePriorityCount(validTiers, enabledIds);
    if (validation.isValid) {
      console.log(`  ✓ Valid: ${validation.topCount} top priorities`);
    } else {
      console.log(`  ✗ Invalid: ${validation.message}`);
      allTestsPassed = false;
    }

    // Test with too few TOPs
    const tooFewTops: Record<string, TierType> = {
      cat1: 'TOP',
      cat2: 'TOP',
      cat3: 'IMPORTANT',
      cat4: 'IMPORTANT',
      cat5: 'NICE',
    };

    const validation2 = validatePriorityCount(tooFewTops, enabledIds);
    if (!validation2.isValid && validation2.topCount < 3) {
      console.log(`  ✓ Correctly rejected: ${validation2.message}`);
    } else {
      console.log(`  ✗ Should have rejected too few TOPs`);
      allTestsPassed = false;
    }
  }

  console.log(
    `\n${allTestsPassed ? '✓ All tests passed!' : '✗ Some tests failed'}`
  );
  return allTestsPassed;
}
