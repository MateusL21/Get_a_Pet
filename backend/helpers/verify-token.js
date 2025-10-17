const jwt = require("jsonwebtoken");
const getToken = require("./get-token");

// middleware to verify token and protect routes
const checkToken = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ message: "Acesso negado!" });
  }
  const token = getToken(req);

  if (!token) {
    res.status(401).json({ message: "Acesso negado!" });
    return;
  }
  try {
    const verified = jwt.verify(token, "nossosecret");
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ message: "Token inválido!" });
  }
};

module.exports = checkToken;
