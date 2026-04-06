import app from "./app";
import { env } from "./config/env";
import { initializeDatabase } from "./db";

const start = async () => {
  await initializeDatabase();

  app.listen(env.PORT, () => {
    console.log(`Server running at http://localhost:${env.PORT}`);
  });
};

start().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
