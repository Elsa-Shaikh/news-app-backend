import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader === null || authHeader === undefined) {
    return res
      .status(401)
      .json({ status: 401, success: false, message: "UnAuthorized!" });
  }
  const token = authHeader.split(" ")[1];
  //verify the jwt token
  jwt.verify(token, process.env.JWTSECRET, (err, user) => {
    if (err)
      return res
        .status(401)
        .json({ status: 401, success: false, message: "UnAuthorized!" });
    req.user = user;
    next();
  });
};

export default authMiddleware;
