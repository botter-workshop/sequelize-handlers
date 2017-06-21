class HttpStatusError extends Error {
    constructor(status, message) {
        this.name = 'HttpStatusError';
        this.status = status;
        this.message = message;
    }
}

module.exports = {
    HttpStatusError
};