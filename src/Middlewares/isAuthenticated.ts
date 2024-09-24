import jwt from 'jsonwebtoken';
import { Request,Response,NextFunction } from 'express';

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token is missing or invalid' });
  }
  console.log(token)
  try {
    // console.log("Hello")
    const secret=process.env.JWT_SECRET || 'secret';
    // console.log(secret);
    const decoded = jwt.verify(token, secret );
    // req.user = decoded;
    req.user = decoded; // Attach the decoded user data to the request
    // console.log(req.user)
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

export default isAuthenticated;
