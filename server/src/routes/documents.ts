import { Router } from "express";
import {
  createDocument,
  selectDocuments,
  selectDocumentById,
  updateDocument,
  deleteDocument,
} from "#server/repositories/documentRepository";

export const documentsRouter = Router();

documentsRouter.post("/", (req, res) => {
  const inputTitle = req.body?.title;
  const inputContent = req.body?.content;

  // ① 型の検証
  if (typeof inputTitle !== "string" || typeof inputContent !== "string") {
    return res.status(400).json({
      error: "title and content must be strings",
    });
  }

  // ② 空文字の検証
  if (inputTitle.trim() === "" || inputContent.trim() === "") {
    return res.status(400).json({
      error: "title and content cannot be empty",
    });
  }

  // ③ タイトルの文字数制限
  if (inputTitle.length > 100) {
    return res.status(400).json({
      error: "title must be 100 characters or fewer",
    });
  }

  // ④ データベースへの登録
  const result = createDocument(inputTitle, inputContent);

  // ⑤ 登録成功レスポンス
  return res.status(201).json({
    id: result.lastInsertRowid?.toString(),
    title: inputTitle,
    content: inputContent,
  });
});

documentsRouter.get("/", (_req, res) => {
  // ① Repositoryの全件取得関数を呼ぶ
  const documents = selectDocuments();

  // ② 取得した配列をJSONで返す
  return res.status(200).json(documents);
});

documentsRouter.get("/:id", (req, res) => {
  // ① URLからIDを取得
  const inputId = req.params.id;

  if (typeof inputId !== "string") {
    return res.status(400).json({
      error: "Invalid document ID",
    });
  }

  // ② 数値に変換して検証
  const validId = Number(inputId);

  if (!Number.isSafeInteger(validId) || validId <= 0) {
    return res.status(400).json({
      error: "Invalid document ID",
    });
  }

  // ③ SQLiteから取得
  const table = selectDocumentById(validId);

  if (!table) {
    return res.status(404).json({
      error: "Document not found",
    });
  }

  // ④ JSONで返す
  return res.status(200).json({
    id: table.id,
    title: table.title,
    content: table.content,
  });
});

documentsRouter.put("/:id", (req, res) => {
  // ① req.params.idを取得する
  const inputId = req.params.id;

  // ② IDを数値に変換して検証する
  const validId = Number(inputId);

  if (!Number.isSafeInteger(validId) || validId <= 0) {
    return res.status(400).json({
      error: "Invalid document ID",
    });
  }

  // ③ req.bodyからtitleとcontentを取得する
  const inputTitle = req.body?.title;
  const inputContent = req.body?.content;

  // ④ POSTと同じ入力検証を行う

  // 型の検証
  if (typeof inputTitle !== "string" || typeof inputContent !== "string") {
    return res.status(400).json({
      error: "title and content must be strings",
    });
  }

  // 空文字の検証
  if (inputTitle.trim() === "" || inputContent.trim() === "") {
    return res.status(400).json({
      error: "title and content cannot be empty",
    });
  }

  // タイトルの文字数制限
  if (inputTitle.length > 100) {
    return res.status(400).json({
      error: "title must be 100 characters or fewer",
    });
  }

  // ⑤ updateDocument()を呼び出す

  const result = updateDocument(validId, inputTitle, inputContent);

  if (result.changes === 0) {
    return res.status(404).json({
      error: "Document not found",
    });
  }

  // ⑥ 更新結果を確認してレスポンスを返す

  return res.status(200).json({
    id: validId,
    title: inputTitle,
    content: inputContent,
  });
});

documentsRouter.delete("/:id", (req, res) => {
  // ① req.params.idを取得する
  const inputId = req.params.id;

  // ② 正の安全な整数か検証する
  const validId = Number(inputId);

  if (!Number.isSafeInteger(validId) || validId <= 0) {
    return res.status(400).json({
      error: "Invalid document ID",
    });
  }

  // ③ deleteDocument(id)を呼び出す

  const result = deleteDocument(validId);

  // ④ result.changesを確認する

  if (result.changes === 0) {
    return res.status(404).json({
      error: "Document not found",
    });
  }

  // ⑤ HTTPレスポンスを返す
  return res.status(204).send();
});
