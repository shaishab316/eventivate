import chalk from 'chalk';
import ora from 'ora';
import config from '../../../config';
import { EEventStatus, prisma } from '../../../utils/db';
import { UserServices } from '../user/User.service';
import { months } from '../../../constants/month';

/**
 * Admin services
 */
export const AdminServices = {
  /**
   * Seeds the admin user if it doesn't exist in the database
   *
   * This function checks if an admin user already exists in the database.
   * If an admin user exists, it returns without creating a new one.
   * Otherwise, it creates a new admin user with the provided admin data.
   */
  async seed() {
    const spinner = ora({
      color: 'yellow',
      text: '⚙ Seeding admin user...',
    }).start();

    try {
      await UserServices.register({
        ...config.admin,
        avatar: config.server.default_avatar,
        is_active: true,
        is_verified: true,
        is_admin: true,
        is_super_admin: true,
      });

      spinner.succeed(chalk.green('✅ Admin user seeded successfully'));
    } catch (error: any) {
      spinner.fail(chalk.red(`❌ Failed to seed admin user: ${error.message}`));
    }
  },

  /**
   * Get admin overview
   */
  async getAdminOverview() {
    const currentYear = new Date().getFullYear();
    const yearStartDate = new Date(`${currentYear}-01-01`);
    const yearEndDate = new Date(`${currentYear}-12-31T23:59:59`);

    // Calculate date 5 days ago for active users
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    // Parallel execution for better performance
    const [
      totalUsersCount,
      activeUsersCount,
      completedEventsCount,
      monthlyEventCounts,
    ] = await Promise.all([
      // Total users count
      prisma.user.count(),

      // Active users count (updated within last 5 days)
      prisma.user.count({
        where: {
          updated_at: {
            gte: fiveDaysAgo,
          },
        },
      }),

      // Total completed events
      prisma.event.count({
        where: {
          status: EEventStatus.COMPLETED,
        },
      }),

      // Monthly event counts using raw query (most efficient)
      prisma.$queryRaw<Array<{ month: number; count: bigint }>>`
        SELECT 
          EXTRACT(MONTH FROM created_at)::int as month,
          COUNT(*)::bigint as count
        FROM events
        WHERE created_at >= ${yearStartDate}
          AND created_at <= ${yearEndDate}
        GROUP BY EXTRACT(MONTH FROM created_at)
        ORDER BY month
      `,
    ]);

    const totalUsers = totalUsersCount;
    const totalActiveUsers = activeUsersCount;
    const totalCompletedEvents = completedEventsCount;

    // Create a map for O(1) lookups
    const monthToCountMap = new Map(
      monthlyEventCounts.map(({ month, count }) => [month, Number(count)]),
    );

    // Generate all 12 months with counts and month names
    const monthlyEventStatistics = Array.from({ length: 12 }, (_, index) => {
      const monthNumber = index + 1;
      return {
        month: months[index],
        eventCount: monthToCountMap.get(monthNumber) || 0,
      };
    });

    return {
      totalUsers,
      totalActiveUsers,
      totalCompletedEvents,
      monthlyEventStatistics,
    };
  },
};
