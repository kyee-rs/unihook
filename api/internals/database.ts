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

    async getUser(_id: number) {
        let id = _id.toString()
        return await this.user.findUnique({ where: { id } });
    }

    async createUser(_id: number) {
        let id = _id.toString()
        return await this.user.create({ data: { id } });
    }

    async getPatterns(_id: number) {
        let id = _id.toString()
        return await this.pattern.findMany({ where: { userId: id } });
    }

    async createPattern(id: string, pattern: string, _userId: number) {
        let userId = _userId.toString()
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

    async deleteAllPatterns(_id: number) {
        let id = _id.toString()
        return await this.pattern.deleteMany({ where: { userId: id } });
    }

    async getPattern(id: string) {
        return await this.pattern.findUnique({ where: { id } });
    }
}
