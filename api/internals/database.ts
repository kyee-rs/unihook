import { PrismaClient } from '../../generated/client/deno/edge.ts';

export class Database extends PrismaClient {
    constructor() {
        super();
    }

    async init() {
        await this.$connect();
    }

    async close() {
        await this.$disconnect();
    }

    async getUser(id: string) {
        return await this.user.findUnique({ where: { id } });
    }

    async createUser(id: string) {
        return await this.user.create({ data: { id } });
    }

    async getPatterns(id: string) {
        return await this.pattern.findMany({ where: { userId: id } });
    }

    async createPattern(id: string, pattern: string, userId: string) {
        return await this.pattern.create({
            data: {
                id,
                pattern,
                User: {
                    connect: {
                        id: userId,
                    },
                },
            },
        });
    }

    async deletePattern(id: string) {
        return await this.pattern.delete({ where: { id } });
    }

    async deleteAllPatterns(id: string) {
        return await this.pattern.deleteMany({ where: { userId: id } });
    }

    async getPattern(id: string) {
        return await this.pattern.findUnique({ where: { id } });
    }
}
