import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DATA_DIR = process.env.DATA_DIR ?? process.cwd();
const DB_PATH = path.join(DATA_DIR, "projects.db");
const PROJECTS_DIR = path.join(DATA_DIR, "saved_projects");

function getDb() {
  const db = new Database(DB_PATH);
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      download_token TEXT UNIQUE NOT NULL,
      product_id TEXT NOT NULL,
      file_path TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )
  `);
  // Migrate existing rows that predate the download_token column
  try {
    db.exec(`ALTER TABLE projects ADD COLUMN download_token TEXT`);
    db.exec(`UPDATE projects SET download_token = id WHERE download_token IS NULL`);
  } catch {
    // Column already exists — ignore
  }
  return db;
}

export function saveProject(
  id: string,
  downloadToken: string,
  productId: string,
  pngBuffer: Buffer
): void {
  if (!fs.existsSync(PROJECTS_DIR)) {
    fs.mkdirSync(PROJECTS_DIR, { recursive: true });
  }
  const filePath = path.join(PROJECTS_DIR, `${id}.png`);
  fs.writeFileSync(filePath, pngBuffer);

  const db = getDb();
  db.prepare(
    "INSERT INTO projects (id, download_token, product_id, file_path, created_at) VALUES (?, ?, ?, ?, ?)"
  ).run(id, downloadToken, productId, filePath, Date.now());
  db.close();
}

/** Used by the download route — looks up by the secret download_token */
export function getProjectPathByToken(token: string): string | null {
  const db = getDb();
  const row = db
    .prepare("SELECT file_path FROM projects WHERE download_token = ?")
    .get(token) as { file_path: string } | undefined;
  db.close();
  return row?.file_path ?? null;
}

/** Used by the admin lookup route — looks up by the customer-facing display ID */
export function getDownloadToken(displayId: string): string | null {
  const db = getDb();
  const row = db
    .prepare("SELECT download_token FROM projects WHERE id = ?")
    .get(displayId.toUpperCase()) as { download_token: string } | undefined;
  db.close();
  return row?.download_token ?? null;
}
