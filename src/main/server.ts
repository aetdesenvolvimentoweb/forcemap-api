import express, { Request, Response, Router } from "express";

const app = express();

const route = Router();

app.use(express.json());

route.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello Force Map" });
});

app.use(route);

const port = process.env.PORT || 3333;
app.listen(port, () => console.log(`server running on port ${port}`));

export default app;
