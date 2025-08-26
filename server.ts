import "dotenv/config";

import express from "express";

import routes from "./src/main/routes";

const app = express();
app.use(express.json());

app.use("/api/v1", routes);

if (process.env.NODE_ENV === "development") {
  const PORT = parseInt(process.env.PORT!) || 3333;
  const HOST = process.env.HOST! || "0.0.0.0";

  app.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}/api/v1`);
  });
}

export default app;
