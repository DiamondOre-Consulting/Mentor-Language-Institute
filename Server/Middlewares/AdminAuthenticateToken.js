import jwt from 'jsonwebtoken';

const AdminAuthenticateToken = (req, res, next) => {
    // Get the JWT token from the request headers
    const token = req.headers.authorization?.split(' ')[1];
  
    if (!token) {
      return res.status(401).json({ message: 'Authorization token not found' });
    }
  
    try {
      // Verify and decode the token
      const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
  
      // Attach the decoded token to the request object
      req.user = decoded;
  
      // Proceed to the next middleware or route handler
      next();
    } catch (error) {
      console.error('Error verifying token:', error);
      return res.status(401).json({ message: 'Invalid token' });
    }
  };

  export default AdminAuthenticateToken;