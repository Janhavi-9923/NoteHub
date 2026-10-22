// Catches any error thrown in a route and turns it into a clean JSON response
// instead of crashing the server or leaking a stack trace to the user.
function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Something went wrong on the server.' });
}

module.exports = errorHandler;
