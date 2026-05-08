import "dotenv/config";
import express from "express";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import servicesRouter from "./routes/services.js";
import questRouter from "./routes/quest.js";
import usersRouter from "./routes/users.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json());

// CORS (밋업 환경에서 다양한 클라이언트 허용)
app.use((_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-PAYMENT");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  next();
});

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    facilitator: process.env.FACILITATOR_URL,
    network: `eip155:${process.env.CHAIN_ID || "402"}`,
    payTo: process.env.PAY_TO,
  });
});

app.get("/llms.txt", (_req, res) => {
  const base = process.env.API_BASE_URL || "http://localhost:4010";
  const template = readFileSync(join(__dirname, "..", "llms.txt"), "utf8");
  const content = template.replaceAll("{{BASE_URL}}", base);
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.send(content);
});

app.use("/v1/register", usersRouter);
app.use("/v1/services", servicesRouter);
app.use("/v1/quest", questRouter);

const port = Number(process.env.PORT || 4010);
app.listen(port, () => {
  console.log(`x402-server listening on http://localhost:${port}`);
  console.log(`facilitator: ${process.env.FACILITATOR_URL}`);
  console.log(`network: eip155:${process.env.CHAIN_ID || "402"}`);
  console.log(`payTo: ${process.env.PAY_TO}`);
});
