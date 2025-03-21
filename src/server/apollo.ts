import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import { getSchema } from "../graphql/res_sche";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function connectDB() {
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(process.env.REACT_APP_DB_STRING as string, {
      autoIndex: true,
      authSource: "admin",
    });
    console.log("💽 MongoDB está conectado");
  } catch (err) {
    console.log("💽 MongoDB não está conectado", err);
  }
}

export async function startApolloServer(app: any, httpServer: any) {
  const schema = makeExecutableSchema(await getSchema());
  
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });
  const serverCleanup = useServer({ schema }, wsServer);

  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  await server.start();
  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req }) => ({ req }),
    })
  );

  await connectDB();
}