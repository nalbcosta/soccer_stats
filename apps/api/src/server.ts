import { loadConfig } from "./config.js";
import { createMongoRepositories } from "./repositories/mongo.js";
import { createApp } from "./app.js";

const bootstrap = async (): Promise<void> => {
  const config = loadConfig();
  const persistence = await createMongoRepositories(config.mongodbUri, config.mongodbDb);
  const app = await createApp(config, persistence.repositories);

  const close = async () => {
    await app.close();
    await persistence.client.close();
  };

  process.on("SIGINT", close);
  process.on("SIGTERM", close);

  await app.listen({ port: config.port, host: "0.0.0.0" });
};

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
