import { DEFAULT_EXPIRATION } from "./RedisService.js";
import InvalidCacheObjectError from "../errors/InvalidCacheObjectError.js"

export default class AbstractService {

    expiration = DEFAULT_EXPIRATION;

    constructor(models, redisClient) {
        this.models = models;
        this.client = redisClient;
    }

    async updateCache(item = null, itemId = null, type = null) {
        if (item) {
            let cacheKey;
            switch (true) {
                case item instanceof this.models.Task:
                    cacheKey = `tasks:${item.id}`;
                    break;
                case item instanceof this.models.User:
                    cacheKey = `users:${item.id}`;
                    break;
                default:
                    throw new InvalidCacheObjectError("Cannot cache unknown object");
            }

            await this.client.set(cacheKey, JSON.stringify(item), { EX: this.expiration });
        }

        if (itemId && type) {
            let cacheKey;

            switch (type) {
                case 'task':
                    cacheKey = `tasks:${itemId}`;
                    break;
                case 'user':
                    `users:${itemId}`;
                default:
                    throw new InvalidCacheObjectError("Cannot cache unknown object");
            }
            const isSet = this.client.keys(cacheKey);
            isSet && await this.client.del(cacheKey);
        }

        if (item instanceof this.models.Task || type === 'task') {
            await this.client.del('tasks');
            await this.client.del('unprocessed');
        }

        if (item instanceof this.models.User || type === 'user') {
            await this.client.del('users');
        }
    }
}