const jwt = require('jsonwebtoken');

// eslint-disable-next-line consistent-return
exports.authenticator = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(400).json('Header is missing!');

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(400).json('Token is null!');

  jwt.verify(token, process.env.JWT_ACCESS_TOKEN, (err, user) => {
    if (err) return res.status(403).json({ result: false, msg: err });

    req.user = user;
    return next();
  });
};
