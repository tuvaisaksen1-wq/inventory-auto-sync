import { Request, Response, NextFunction } from "express";

export function requireInternalToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  const token = header?.replace("Bearer ", "").trim();

  if (!token || token !== process.env.INTERNAL_API_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
}
