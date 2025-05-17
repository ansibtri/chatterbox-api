const jwt = require("jsonwebtoken");
const secret = process.env.TOKEN_KEY;

// generate JWT
function generateJWT(data) {
  try {
    const token = jwt.sign({ data }, secret, { expiresIn: "1d" });
    return token;
  } catch (error) {
    return error;
  }
}

function verifyJWT(req) {
  if (jwt.verify(req.cookies.authToken, secret)) return true
  return false;
}

module.exports = { generateJWT, verifyJWT };
