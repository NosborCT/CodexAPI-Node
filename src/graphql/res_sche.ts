import { glob } from "glob";
import fs from "fs";
import pkg from "lodash";
import path from "path";
import { parse } from "graphql";

const { merge } = pkg;

const typeDefsPaths = glob.sync("**/*.gql");
let schemaString = "";

typeDefsPaths.forEach((filePath) => {
  schemaString += fs.readFileSync(filePath, "utf8");
});

export const typeDefs = parse(schemaString);

const resolverPaths = glob.sync("**/resolvers.*");

async function getResolvers() {
  let combinedResolvers = {};
  for (const filePath of resolverPaths) {
    try {
      const resolver = await import(path.resolve(filePath));
      if (resolver.default) {
        combinedResolvers = merge(combinedResolvers, resolver.default);
      } else {
        console.log(`Não foi possível importar resolvers de ${filePath}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        // Verifique se o erro é uma instância da classe Error.
        console.error(
          `Erro ao importar resolvers de ${filePath}: ${error.message}`
        );
      } else {
        // Se não for uma instância da classe Error, você pode querer lidar com isso de forma diferente.
        console.error(`Erro ao importar resolvers de ${filePath}: ${error}`);
      }
    }
  }
  return combinedResolvers;
}

export async function getSchema() {
  const resolvers = await getResolvers();
  return { typeDefs, resolvers };
}