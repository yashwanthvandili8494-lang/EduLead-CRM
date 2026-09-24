export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error('[API Error]:', err);

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate value entered for ${field}: ${err.keyValue[field]}. A record with this information already exists.`;
    return res.status(400).json({ success: false, message, code: 'DUPLICATE_KEY' });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message).join(', ');
    return res.status(400).json({ success: false, message, code: 'VALIDATION_ERROR' });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    return res.status(404).json({ success: false, message, code: 'NOT_FOUND' });
  }

  // Optimistic concurrency conflict error
  if (err.name === 'VersionError') {
    return res.status(409).json({
      success: false,
      message: 'Conflict: This record was modified by another user while you were viewing it. Please refresh and review latest changes.',
      code: 'CONCURRENCY_CONFLICT',
    });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal Server Error',
  });
};
