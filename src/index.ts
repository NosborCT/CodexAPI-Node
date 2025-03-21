import express from "express";
import http from "http";
import { startApolloServer } from "./server/apollo";
import cors from "cors";

const app = express();
const httpServer = http.createServer(app);

app.use(cors());
app.use(express.json());

async function startServer() {
  await startApolloServer(app, httpServer);
  const port = process.env.PORT || 4001;
  await new Promise<void>((resolve) =>
    httpServer.listen(port, () => resolve())
  );
  console.log(`🚀 Server ready at http://localhost:${port}/graphql`);
}

startServer();
