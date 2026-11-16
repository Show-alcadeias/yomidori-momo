import express from "express";

import { initializeDatabase } from "#server/db/schema";
import { documentsRouter } from "#server/routes/documents";

initializeDatabase();

const app = express();

// JSONリクエストを解析
app.use(express.json());

// 文章管理API
app.use("/api/documents", documentsRouter);

// 動作確認用
app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

const server = app.listen(3001, "127.0.0.1", () => {
  console.log("API server: http://127.0.0.1:3001");
});

server.on("error", (error) => {
  console.error(error);
  process.exit(1);
});
