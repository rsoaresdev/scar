/* eslint-disable global-require */
import { PrismaClient } from "@prisma/client";
import { debuggerConfig } from "@scar/config";
import { createPrismaRedisCache } from "prisma-redis-middleware";
import { Logger } from "./logger.js";
import Redis from "./redis.js";

const prismaClientSingleton = () => {
 Logger("info", "Setting up Prisma...");
 return new PrismaClient();
};

const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma || prismaClientSingleton();

const logger = (params, next) => {
 const before = Date.now();
 const result = next(params);
 const after = Date.now();
 Logger("info", `Query ${params.model}.${params.action} took ${after - before}ms`);
 return result;
};

if (debuggerConfig.displayDatabaseLogs) prisma.$use(logger);

const cache = createPrismaRedisCache({
 models: [
  { model: "User", excludeMethods: ["findMany"] },
  { model: "Guild", excludeMethods: ["findMany"], invalidateRelated: ["GuildDisabledCommands", "GuildDisabledCategories"] },
  { model: "GuildDisabledCommands", excludeMethods: ["findMany"], invalidateRelated: ["Guild"] },
  { model: "GuildDisabledCategories", excludeMethods: ["findMany"], invalidateRelated: ["Guild"] },
  { model: "GuildLogs", cacheTime: 15 },
  { model: "GuildXp", cacheTime: 15 },
 ],
 storage: {
  // Prettier
  type: Redis instanceof Map ? "memory" : "redis",
  options: {
   // Prettier
   client: Redis instanceof Map ? undefined : Redis,
   invalidation: { referencesTTL: 300 },
  },
 },
 cacheTime: 30,
 excludeModels: ["Session", "Account"],
 onHit: (key) => {
  if (debuggerConfig.displayCacheMessages) {
   Logger("info", `Cache hit for key ${key}`);
  }
 },
 onMiss: (key) => {
  if (debuggerConfig.displayCacheMessages) {
   Logger("info", `Cache miss for key ${key}`);
  }
 },
 onError: (key) => {
  if (debuggerConfig.displayCacheMessages) {
   Logger("info", `Cache error for key ${key}`);
  }
 },
});

prisma.$use(cache);

export default prisma;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
