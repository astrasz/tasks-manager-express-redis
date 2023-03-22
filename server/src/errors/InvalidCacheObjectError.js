export default class InvalidCacheObjectError extends Error {
    constructor(message) {
        super(message);
        this.name = 'InvalidCacheObjectError';
        this.statusCode = 400;
    }
}