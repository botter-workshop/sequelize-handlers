class HttpStatusError extends Error {
    constructor(status, message) {
        super(message);
        this.name = 'HttpStatusError';
        this.status = status;
    }
}

module.exports = {
    HttpStatusError
};