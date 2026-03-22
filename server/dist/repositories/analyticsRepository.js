import { Prisma } from '@prisma/client';
import prisma from '../config/client.js';
export class AnalyticsRepository {
    async getRequestCountsByEndpoint(projectId) {
        const args = Prisma.validator()({
            by: ['endpoint_id', 'method', 'url'],
            where: { endpoint: { project_id: projectId } },
            _count: { id: true },
            orderBy: [
                {
                    _count: {
                        id: 'desc'
                    }
                }
            ]
        });
        return prisma.requestHistory.groupBy(args); // Keeping as any for now as Prisma groupBy types are notoriously difficult with aggregates and relations.
    }
    async getDailyRequestCounts(projectId, days = 7) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        return prisma.$queryRaw `
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM "RequestHistory"
      WHERE endpoint_id IN (SELECT id FROM "Endpoint" WHERE project_id = ${projectId})
      AND created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;
    }
    async getTotalEndpoints(projectId) {
        return prisma.endpoint.count({
            where: { project_id: projectId }
        });
    }
}
