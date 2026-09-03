import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { MongoClient } from "mongodb";
import { createEmptyStats } from "@soccer-stats/shared";
import { hashPassword } from "../lib/auth.js";
import { createId, createPublicIdentifier } from "../lib/ids.js";

const rootDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
const now = () => new Date().toISOString();
type LocalDocument = { _id: string; [key: string]: any };

const loadLocalEnvironment = async () => {
  const content = await readFile(resolve(rootDirectory, ".env"), "utf8");
  return Object.fromEntries(content.split(/\r?\n/).flatMap((line) => {
    const trimmed = line.trim();
    const separator = trimmed.indexOf("=");
    if (!trimmed || trimmed.startsWith("#") || separator < 1) return [];
    const value = trimmed.slice(separator + 1).trim().replace(/^['\"]|['\"]$/g, "");
    return [[trimmed.slice(0, separator).trim(), value]];
  }));
};

const outfield = (pac: number, sho: number, pas: number, dri: number, def: number, phy: number) => ({ pac, sho, pas, dri, def, phy });
const goalkeeper = (div: number, han: number, kic: number, ref: number, spd: number, pos: number) => ({ div, han, kic, ref, spd, pos });

async function main() {
  const environment = await loadLocalEnvironment();
  const client = new MongoClient(environment.MONGODB_URI ?? "mongodb://localhost:27017");
  await client.connect();

  try {
    const database = client.db(environment.MONGODB_DB ?? "soccer_stats");
    const users = database.collection<LocalDocument>("users");
    const profiles = database.collection<LocalDocument>("player_profiles");
    const teams = database.collection<LocalDocument>("teams");
    const overrides = database.collection<LocalDocument>("team_athlete_skill_overrides");
    const testPassword = hashPassword("password");

    const accountDefinitions = [
      { email: "demo-rafa-silva@example.invalid", username: "rafa_silva" },
      { email: "demo-lucas-souza@example.invalid", username: "lucas_souza" },
      { email: "demo-bruno-costa@example.invalid", username: "bruno_costa" },
      { email: "atleta.convite@local.test", username: "atleta_convite" },
      { email: "atleta.solicitacao@local.test", username: "atleta_solicitacao" }
    ];

    const preparedUsers: Array<{ _id: string; email: string; username: string; publicIdentifier: string }> = [];
    for (const definition of accountDefinitions) {
      const existing = await users.findOne({ email: definition.email });
      const timestamp = now();
      const providers = [...new Set([...(existing?.providers ?? []), "credentials"])];
      let publicIdentifier = existing?.publicIdentifier as string | undefined;
      while (!publicIdentifier) {
        const candidate = createPublicIdentifier();
        if (!await users.findOne({ publicIdentifier: candidate })) publicIdentifier = candidate;
      }
      const userId = (existing?._id as string | undefined) ?? createId();
      await users.updateOne(
        { _id: userId },
        {
          $set: { email: definition.email, username: definition.username, publicIdentifier, providers, passwordHash: testPassword, updatedAt: timestamp },
          $setOnInsert: { _id: userId, locale: "pt-BR", theme: "system", platformRole: "user", createdAt: timestamp }
        },
        { upsert: true }
      );
      await profiles.updateOne(
        { userId },
        { $setOnInsert: { userId, displayName: definition.username, preferredFoot: "right", preferredPosition: "central-midfielder", stats: createEmptyStats() } },
        { upsert: true }
      );
      preparedUsers.push({ _id: userId, email: definition.email, username: definition.username, publicIdentifier });
    }

    const existingTeams = await teams.find({}).toArray();
    for (const existingTeam of existingTeams) {
      if (existingTeam.publicCode) continue;
      let publicCode: string | undefined;
      while (!publicCode) {
        const candidate = createPublicIdentifier();
        if (!await teams.findOne({ publicCode: candidate })) publicCode = candidate;
      }
      await teams.updateOne({ _id: existingTeam._id }, { $set: { publicCode } });
    }
    const team = await teams.findOne({ name: "So Fuleragem" });
    if (!team) throw new Error("O time So Fuleragem nao foi encontrado no banco local.");
    const publicCode = team.publicCode as string;
    await teams.updateOne({ _id: team._id }, { $set: { visibility: "public", joinPolicy: "request", updatedAt: now() } });

    const ownerId = team.ownerId as string;
    const playerDefinitions = [
      { userId: ownerId, outfield: outfield(4, 4, 4, 4, 3, 4), isGoalkeeper: false },
      { userId: preparedUsers.find((user) => user.username === "rafa_silva")!._id, outfield: outfield(2, 2, 3, 2, 3, 3), isGoalkeeper: true, goalkeeper: goalkeeper(5, 4, 4, 5, 3, 4) },
      { userId: preparedUsers.find((user) => user.username === "lucas_souza")!._id, outfield: outfield(3, 3, 3, 3, 3, 3), isGoalkeeper: true, goalkeeper: goalkeeper(4, 5, 4, 4, 4, 5) },
      { userId: preparedUsers.find((user) => user.username === "bruno_costa")!._id, outfield: outfield(4, 3, 5, 4, 3, 3), isGoalkeeper: false }
    ];
    for (const player of playerDefinitions) {
      await overrides.updateOne(
        { teamId: team._id, userId: player.userId },
        { $set: { ...player, teamId: team._id, updatedBy: ownerId, updatedAt: now() }, $setOnInsert: { _id: createId() } },
        { upsert: true }
      );
    }

    console.log(`Time: So Fuleragem — ${publicCode}`);
    for (const user of preparedUsers) console.log(`${user.username}: ${user.email} — ${user.publicIdentifier} — senha password`);
  } finally {
    await client.close();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
