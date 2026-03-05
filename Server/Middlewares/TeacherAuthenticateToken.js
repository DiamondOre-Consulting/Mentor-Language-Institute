import jwt from "jsonwebtoken";
import { getCookieValue } from "../utils/cookies.js";

const TeacherAuthenticateToken = (req, res, next) => {
  // Get the JWT token from the request headers
  const headerToken = req.headers.authorization?.split(" ")[1];
  const cookieToken = getCookieValue(req, "ml_access");
  const token = headerToken || cookieToken;

  if (!token) {
    return res.status(401).json({ message: "Authorization token not found" });
  }

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.TEACHER_JWT_SECRET);

    // Attach the decoded token to the request object
    req.user = decoded;
    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    if (cookieToken && cookieToken !== token) {
      try {
        const decoded = jwt.verify(cookieToken, process.env.TEACHER_JWT_SECRET);
        req.user = decoded;
        return next();
      } catch (cookieError) {
        // fall through
      }
    }
    console.error("Error verifying token:", error);
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default TeacherAuthenticateToken;
