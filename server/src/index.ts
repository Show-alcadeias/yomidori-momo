import express from "express";

import { initializeDatabase } from "#server/db/schema";

initializeDatabase();

const app = express();
app.disable("x-powered-by");

// 起動確認専用。文章のCRUD・DB操作・LLM接続は実装しません。
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
