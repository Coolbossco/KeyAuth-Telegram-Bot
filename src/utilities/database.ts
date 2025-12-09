import { Database } from "bun:sqlite";
import fs from "fs";
import path from "path";

export class BunDB {
  private db: Database;

  constructor(filename: string) {
    // Ensure directory exists
    const dir = path.dirname(filename);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    
    this.db = new Database(filename);
    this.db.run("CREATE TABLE IF NOT EXISTS key_value (key TEXT PRIMARY KEY, value TEXT)");
  }

  async get(key: string): Promise<any> {
    const result = this.db.query("SELECT value FROM key_value WHERE key = ?").get(key) as { value: string } | null;
    if (!result) return null;
    try {
      return JSON.parse(result.value);
    } catch {
      return result.value;
    }
  }

  async set(key: string, value: any): Promise<void> {
    const stringValue = JSON.stringify(value);
    this.db.run("INSERT OR REPLACE INTO key_value (key, value) VALUES (?, ?)", [key, stringValue]);
  }

  async delete(key: string): Promise<void> {
    this.db.run("DELETE FROM key_value WHERE key = ?", [key]);
  }

  async has(key: string): Promise<boolean> {
    const result = this.db.query("SELECT 1 FROM key_value WHERE key = ?").get(key);
    return !!result;
  }
}
