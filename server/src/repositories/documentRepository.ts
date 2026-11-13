import { db } from "#server/db/database";

export function createDocument(title: string, content: string) {
  const statement = db.prepare(`
    INSERT INTO documents (title, content, created_at, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
  `);

  const result = statement.run(title, content);

  console.log(result);

  return result;
}

export function selectDocument() {
  const statement = db.prepare(`
    SELECT title, content FROM documents;
  `);

  return statement.all();
}

export function updateDocument(id: number, title: string, content: string) {
  const statement = db.prepare(`
    UPDATE documents
    SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?;
  `);

  const result = statement.run(title, content, id);

  return result;
}

export function deleteDocument(id: number) {
  // 指定されたIDの文章を削除する
  const statement = db.prepare(`
      DELETE FROM documents
      WHERE id = ?;
      `);

  const result = statement.run(id);

  return result;
}
