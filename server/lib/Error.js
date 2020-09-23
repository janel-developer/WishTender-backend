/**
 * Class representing an error thrown from the WishTender App point.
 * Creates an error with info object
 */
class ApplicationError extends Error {
  /**
   * Custom Error for WishTender App
   * @param {object} info additional info object added by developer
   * @param {string} message error message
   * @constructor
   */
  constructor(info, message) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(message);

    // Not sure what this is it was in the tutorial I go this code from:
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    // if (Error.captureStackTrace) {
    //   Error.captureStackTrace(this, UsefulError);
    // }

    this.info = info;
    this.date = new Date();
  }
}

// class DatabaseError extends ApplicationError {}

// class UserFacingError extends ApplicationError {}

module.exports.ApplicationError = ApplicationError;
