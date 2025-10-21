import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  const { authToken } = req.cookies;

  if (!authToken) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized login required" });
  }

  try {
    const tokenDecode = jwt.verify(authToken, process.env.jwt_SECRET);

    if (!tokenDecode) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized login required" });
    }
    req.userId = tokenDecode.userId;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized login required" });
  }
};

export default userAuth;
