import prisma from '@/lib/prisma';

export const DEFAULT_USER_ID = 'default_user_janitha';

export const DEFAULT_GOALS = {
  calories: 2200,
  protein: 155,
  carbs: 235,
  fat: 65,
  sugar: 35,
  water: 8,
};

/**
 * Fetches persisted user macro/calorie goals from PostgreSQL,
 * falling back to DEFAULT_GOALS when unset.
 */
export async function getUserGoals(userId = DEFAULT_USER_ID) {
  const user = await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      name: 'Janitha',
      tdee: DEFAULT_GOALS.calories,
      goal: JSON.stringify(DEFAULT_GOALS),
    },
  });

  let goals = { ...DEFAULT_GOALS };
  if (user?.goal) {
    try {
      goals = { ...goals, ...JSON.parse(user.goal) };
    } catch {
      // Ignore malformed JSON and keep defaults
    }
  } else if (user?.tdee) {
    goals.calories = user.tdee;
  }

  return goals;
}
