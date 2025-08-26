import { Request, Response, Router } from "express";

const homeRoutes = Router();

homeRoutes.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Hello ForceMap" });
});

export default homeRoutes;
