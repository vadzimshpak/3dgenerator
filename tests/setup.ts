import { execSync } from "child_process";

process.env.DATABASE_URL = "file:./dev.db";

execSync("npx prisma db push --skip-generate", {
  env: process.env,
  stdio: "inherit",
});
