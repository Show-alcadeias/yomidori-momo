import { DatabaseSync } from "node:sqlite";
import { Router } from "express";

export const db = new DatabaseSync("server/data/yomidori.sqlite");

export const documentsRouter = Router();

documentsRouter.post("/", (req, res) => {
  const inputTitle = req.body.title;
  const inputContent = req.body.content;

  console.log(inputTitle, inputContent);

  res.status(200).json({
    title: inputTitle,
    content: inputContent,
  });
});
