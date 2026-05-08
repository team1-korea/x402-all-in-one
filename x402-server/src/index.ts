import "dotenv/config";
import express from "express";
import servicesRouter from "./routes/services.js";
import questRouter from "./routes/quest.js";

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

app.use("/v1/services", servicesRouter);
app.use("/v1/quest", questRouter);

const port = Number(process.env.PORT || 4010);
app.listen(port, () => {
  console.log(`x402-server listening on http://localhost:${port}`);
  console.log(`facilitator: ${process.env.FACILITATOR_URL}`);
  console.log(`network: eip155:${process.env.CHAIN_ID || "402"}`);
  console.log(`payTo: ${process.env.PAY_TO}`);
});
