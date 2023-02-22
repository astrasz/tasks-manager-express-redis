import redis from 'redis';

export const DEFAULT_EXPIRATION = 3600;

class RedisService {
    static _instance;

    constructor() { }

    static getInstance() {
        if (this._instance) {
            return this._instance;
        }

        this._instance = redis.createClient({
            legacyMode: true,
            socket: {
                host: 'redis',
                port: 6379
            }
        })

        return this._instance;
    }
}

const redisClient = RedisService.getInstance();
redisClient.connect().then(() => console.log('Redis connected')).catch(console.error);

export default redisClient;