import { getCurrentUserId } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateAllocations, type TierType, type AllocationInput } from '@/lib/allocationEngine';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify membership
    const member = await prisma.eventMember.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    if (!member) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { tiers } = await request.json() as Record<string, unknown>;

    if (!tiers || typeof tiers !== 'object') {
      return NextResponse.json(
        { error: 'Invalid tiers data' },
        { status: 400 }
      );
    }

    // Get event and baseline budget scenario
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const scenario = await prisma.budgetScenario.findFirst({
      where: { eventId, isPrimary: true },
    });

    if (!scenario) {
      return NextResponse.json({ error: 'No budget scenario found' }, { status: 400 });
    }

    const eventCategories = await prisma.eventCategory.findMany({
      where: { eventId, isEnabled: true },
      include: { category: true },
    });

    if (eventCategories.length === 0) {
      return NextResponse.json(
        { error: 'No enabled categories' },
        { status: 400 }
      );
    }

    // Build tier mapping
    const tierByCategoryId: Record<string, TierType> = {};
    eventCategories.forEach(ec => {
      const tierValue = (tiers as Record<string, unknown>)[ec.categoryId];
      tierByCategoryId[ec.categoryId] = (typeof tierValue === 'string' && ['TOP', 'IMPORTANT', 'NICE'].includes(tierValue) ? tierValue as TierType : 'IMPORTANT');
    });

    // Calculate allocations
    const allocationInput: AllocationInput = {
      totalBudgetCents: scenario.totalBudgetCents,
      enabledCategoryIds: eventCategories.map(ec => ec.categoryId),
      baseWeights: Object.fromEntries(
        eventCategories.map(ec => [ec.categoryId, ec.category.baseWeight])
      ),
      tierByCategoryId,
    };

    const allocationOutput = calculateAllocations(allocationInput);

    // Delete existing allocations for this scenario
    await prisma.categoryAllocation.deleteMany({
      where: { scenarioId: scenario.id },
    });

    // Create new allocations for this scenario
    const allocations_created = await Promise.all(
      Object.entries(allocationOutput.allocationsByCategoryId).map(([categoryId, allocatedCents]) =>
        prisma.categoryAllocation.create({
          data: {
            scenarioId: scenario.id,
            categoryId,
            allocatedCents: allocatedCents as number,
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      count: allocations_created.length,
      allocations: allocationOutput.allocationsByCategoryId,
    });
  } catch (error) {
    console.error('Error generating allocations:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate allocations' },
      { status: 500 }
    );
  }
}
