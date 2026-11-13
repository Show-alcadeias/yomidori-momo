import { DatabaseSync } from "node:sqlite";

export const db = new DatabaseSync("server/data/yomidori.sqlite");
