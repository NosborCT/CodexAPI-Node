# 📘 Construção do Esquema GraphQL para o Servidor

Este módulo é responsável pela **construção dinâmica do esquema GraphQL**, carregando automaticamente **as definições de tipos (typeDefs) e os resolvers** para configurar o servidor GraphQL.

---

## 🚀 Tecnologias Utilizadas

- **GraphQL** - Para manipulação e consulta de dados.
- **Mongoose** - Para modelagem e interação com o banco de dados MongoDB.
- **Node.js** - Para execução do servidor GraphQL.
- **glob** - Para encontrar arquivos do esquema automaticamente.
- **fs** - Para leitura dos arquivos do esquema.
- **lodash** - Para mesclar resolvers de diferentes arquivos.
- **path** - Para manipulação de diretórios e arquivos.

---

## 📂 Estrutura do Código

Este módulo realiza três funções principais:

1. **Carrega as definições de tipos (`typeDefs`)** automaticamente a partir de arquivos `.gql`.
2. **Carrega e combina todos os resolvers (`resolvers`)** encontrados no projeto.
3. **Retorna um esquema unificado** (`typeDefs` + `resolvers`) que pode ser usado pelo servidor GraphQL.

---

## 📌 Carregamento das Definições de Tipos (`typeDefs`)

Os arquivos `.gql` contêm a definição dos tipos e são carregados automaticamente pelo módulo.

```ts
import { glob } from "glob";
import fs from "fs";
import { parse } from "graphql";

const typeDefsPaths = glob.sync("**/*.gql");
let schemaString = "";

typeDefsPaths.forEach((filePath) => {
  schemaString += fs.readFileSync(filePath, "utf8");
});

export const typeDefs = parse(schemaString);
```

### 🔍 Explicação

- **Busca todos os arquivos `.gql`** no projeto.
- **Lê e concatena o conteúdo** desses arquivos.
- **Converte para um formato compatível com GraphQL** usando `parse(schemaString)`.

---

## 📌 Carregamento e Combinação dos Resolvers

Os resolvers são carregados dinamicamente a partir dos arquivos que contêm `resolvers.*` no nome.

```ts
import pkg from "lodash";
import path from "path";

const { merge } = pkg;
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
      console.error(`Erro ao importar resolvers de ${filePath}:`, error);
    }
  }
  return combinedResolvers;
}
```

### Explicação

- **Busca todos os arquivos `resolvers.*`** dentro do projeto.
- **Importa cada resolver dinamicamente** e os mescla em um único objeto.
- **Utiliza `lodash.merge`** para garantir que não haja sobrescrita de propriedades.

---

## 📌 Construção do Esquema GraphQL

A função `getSchema()` retorna o esquema completo para o servidor.

```ts
export async function getSchema() {
  const resolvers = await getResolvers();
  return { typeDefs, resolvers };
}
```

### 🔍 Explicação2

- **Chama `getResolvers()`** para recuperar todos os resolvers.
- **Retorna um objeto contendo `typeDefs` e `resolvers`**, prontos para serem usados no servidor GraphQL.

---

## 🔥 Benefícios desta Abordagem

✅ **Automatiza o carregamento** de esquemas e resolvers, reduzindo a necessidade de import manual.
✅ **Facilita a manutenção** do código, pois novos resolvers e tipos são automaticamente incluídos.
✅ **Melhora a escalabilidade**, permitindo adição de novos módulos sem alteração estrutural no carregador.

---

## 🛠️ Exemplo de Uso

### 📌 Inicializando o Servidor GraphQL

```ts
import { ApolloServer } from "apollo-server-express";
import express from "express";
import { getSchema } from "./path/to/schemaLoader";

async function startServer() {
  const app = express();
  const { typeDefs, resolvers } = await getSchema();
  const server = new ApolloServer({ typeDefs, resolvers });

  await server.start();
  server.applyMiddleware({ app });
  app.listen(4000, () => {
    console.log("🚀 Servidor GraphQL rodando em http://localhost:4000/graphql");
  });
}

startServer();
```

---

## 📌 Conclusão

Este módulo permite a **construção dinâmica** do esquema GraphQL, garantindo um processo mais eficiente e automatizado para carregamento de **typeDefs** e **resolvers**, facilitando a escalabilidade do sistema.

---
