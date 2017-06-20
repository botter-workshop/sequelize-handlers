function HttpStatusError(status, message) {
    this.name = 'HttpStatusError';
    this.status = status;
    this.message = message;
}

HttpStatusError.prototype = Object.create(Error.prototype);
HttpStatusError.prototype.constructor = HttpStatusError;

module.exports = {
    HttpStatusError
};