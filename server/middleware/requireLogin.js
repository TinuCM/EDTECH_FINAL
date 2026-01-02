const jwt = require("jsonwebtoken");

const requireLogin = (req, res, next) => {
  let token = req.headers["authorization"];

  // Handle "Bearer <token>" format
  if (token && token.startsWith("Bearer ")) {
    token = token.slice(7, token.length); // Remove "Bearer " prefix
  }

  if (!token) {
    return res.status(401).json({ 
      message: "No token provided. You have to log in to continue" 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    if (err) {
      return res
        .status(401)
        .json({ 
          message: "Invalid or expired token. Please log in again.",
          error: err.message 
        });
    }
    req.user = user;
    next();
  });
};

module.exports = requireLogin;