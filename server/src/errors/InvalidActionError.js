export default class InvalidActionError extends Error {
    constructor(message) {
        super(message);
        this.name = 'InvalidActionError';
        this.statusCode = 400;
    }
}