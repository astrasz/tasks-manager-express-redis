class CustomError extends Error {
    constructor(message, statusCode = null) {
        super(message);
        this.name = 'CustomError';
        if (statusCode) {
            this.statusCode = statusCode;
        }
    }
}

export default CustomError;