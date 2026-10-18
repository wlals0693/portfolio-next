import mongoose from "mongoose";
import { setServers } from "node:dns/promises";
const state = globalThis as typeof globalThis & {
  mongoPromise?: Promise<typeof mongoose>;
};
export function hasDatabase() {
  return Boolean(process.env.MONGODB_URI);
}
export async function connectDB() {
  if (!process.env.MONGODB_URI) throw new Error("DB_NOT_CONFIGURED");
  if (!state.mongoPromise)
    state.mongoPromise = mongoose
      .connect(process.env.MONGODB_URI, {
        dbName: process.env.MONGODB_DB || "portfolio",
        serverSelectionTimeoutMS: 5000,
      })
      .catch(async (error) => {
        // 일부 로컬 DNS는 Atlas SRV 조회를 거부합니다. OS 설정은 유지합니다.
        if (error?.code === "ECONNREFUSED" && error?.syscall === "querySrv") {
          setServers(["1.1.1.1", "8.8.8.8"]);
          try {
            return await mongoose.connect(process.env.MONGODB_URI!, {
              dbName: process.env.MONGODB_DB || "portfolio",
              serverSelectionTimeoutMS: 5000,
            });
          } catch (retryError) {
            state.mongoPromise = undefined;
            throw retryError;
          }
        }
        state.mongoPromise = undefined;
        throw error;
      });
  return state.mongoPromise;
}
