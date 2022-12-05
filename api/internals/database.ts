import { PrismaClient } from "@prisma/client";
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

    async getUser(id: number) {
        return await this.user.findUnique({ where: { id } });
    }

    async createUser(id: number) {
        return await this.user.create({ data: { id } });
    }

    async getPatterns(id: number) {
        return await this.pattern.findMany({ where: { userId: id } });
    }

    async createPattern(id: string, pattern: string, userId: number) {
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

    async deleteAllPatterns(id: number) {
        return await this.pattern.deleteMany({ where: { userId: id } });
    }

    async getPattern(id: string) {
        return await this.pattern.findUnique({ where: { id } });
    }
}
