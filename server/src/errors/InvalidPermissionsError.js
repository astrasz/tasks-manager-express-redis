export default class InvalidPermissionsError extends Error {
    constructor(message) {
        super(message);
        this.name = 'InvalidPermissionsError';
        this.statusCode = 401;
    }
}