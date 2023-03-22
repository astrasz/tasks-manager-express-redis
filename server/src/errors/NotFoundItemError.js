export default class NotFoundItemError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NotFoundItemError';
        this.statusCode = 404;
    }
}