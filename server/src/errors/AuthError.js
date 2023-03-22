export default class AuthError extends Error {
    constructor(message, statusCode = null) {
        super(message);
        this.name = 'AuthError';
        if (statusCode) {
            this.statusCode = statusCode;
        }
    }
}