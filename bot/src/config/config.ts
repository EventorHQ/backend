import dotenv from "dotenv";

dotenv.config();

export const BOT_TOKEN = process.env.BOT_TOKEN || "tonsociety";
export const BOT_HOST = process.env.BOT_HOST || "localhost";
export const BOT_PORT = process.env.BOT_PORT ? +process.env.BOT_PORT : 3001;

export const BOT = {
  TOKEN: BOT_TOKEN,
  HOST: BOT_HOST,
  PORT: BOT_PORT,
};
