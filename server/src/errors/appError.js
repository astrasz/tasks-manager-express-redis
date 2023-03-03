class AppError extends Error {
    constructor(message, statusCode = null) {
        super(message);
        this.name = 'AppError';
        if (statusCode) {
            this.statusCode = statusCode;
        }
    }
}

export default AppError;