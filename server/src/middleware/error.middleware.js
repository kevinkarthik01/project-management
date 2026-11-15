const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal server error";

    // 1. Handle Invalid MongoDB ObjectId (CastError)
    // Example: GET /api/v1/projects/not-a-valid-id
    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid format for field: ${err.path}`;
    }

    // 2. Handle Mongoose Validation Errors
    // Example: Missing required title
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors)
            .map((val) => val.message)
            .join(', ');
    }

    // 3. Handle Duplicate Key Errors (code 11000)
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue);
        message = `Duplicate value entered for ${field} field.`;
    }

    // Send JSON response
    res.status(statusCode).json({
        success: false,
        status: err.status || 'error',
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};
export default errorHandler;