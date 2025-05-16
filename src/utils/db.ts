import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../db/schema";

// Initialize database connection
const DATABASE_URL = import.meta.env.VITE_DATABASE_URL;

if (!DATABASE_URL) {
  console.error("⚠️ DATABASE_URL is not set in environment variables");
  throw new Error(
    "Database URL is required. Please set VITE_DATABASE_URL in your .env file"
  );
}

let db: ReturnType<typeof drizzle>;

try {
  console.log("🔌 Initializing PostgreSQL connection...");
  const sql = neon(DATABASE_URL);
  db = drizzle(sql, { schema });

  // Test the connection
  sql`SELECT 1`
    .then(() => console.log("✅ Successfully connected to PostgreSQL database"))
    .catch((error) => {
      console.error(
        "❌ Failed to connect to PostgreSQL database:",
        error.message
      );
      console.warn(
        "⚠️ Application will continue, but database features may not work"
      );
    });
} catch (error) {
  if (error instanceof Error) {
    console.error("❌ PostgreSQL connection error:", error.message);
  } else {
    console.error("❌ PostgreSQL connection error:", error);
  }
  throw new Error("Failed to initialize database connection");
}

export { db };
