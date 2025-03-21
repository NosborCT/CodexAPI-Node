# 🚀 Configuração do Servidor Apollo para GraphQL

Este documento detalha a configuração do **Apollo Server** para interação com o **GraphQL**, incluindo integração com **MongoDB**, suporte a **WebSockets** e gestão do ciclo de vida do servidor.

---

## 📌 Tecnologias Utilizadas

- **Apollo Server** - Servidor GraphQL para manipulação de dados.
- **Express** - Middleware HTTP para gerenciar as requisições.
- **Mongoose** - ORM para interagir com o banco de dados MongoDB.
- **WebSockets** - Para suporte a subscriptions em tempo real.
- **GraphQL** - Linguagem de consulta utilizada para APIs.

---

## 💾 Conexão com o MongoDB

```ts
async function connectDB() {
  try {
    mongoose.set("strictQuery", true); // Configura a validação estrita de queries.
    await mongoose.connect(process.env.REACT_APP_DB_STRING as string, {
      autoIndex: true, // Cria índices automaticamente.
      authSource: "admin", // Define a fonte de autenticação para o MongoDB.
    });
    console.log("💽 MongoDB está conectado");
  } catch (err) {
    console.log("💽 MongoDB não está conectado", err);
  }
}
```

### 🔍 Explicação:
- **`mongoose.connect`**: Estabelece conexão com o banco de dados.
- **`autoIndex`**: Garante que índices sejam criados automaticamente.
- **`authSource`**: Define que a autenticação ocorrerá no banco `admin`.

---

## 🎯 Configuração do Apollo Server

```ts
export async function startApolloServer(app: any, httpServer: any) {
  const schema = makeExecutableSchema(await getSchema()); // Cria o esquema GraphQL a partir de definições e resolvers.
```

### 🔍 Explicação:
- **`getSchema`**: Função que retorna as definições de tipos (`typeDefs`) e resolvers do GraphQL.
- **`makeExecutableSchema`**: Combina tipos e resolvers em um esquema executável GraphQL.

---

## 🔗 Configuração do WebSocket

```ts
const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/graphql",
});
const serverCleanup = useServer({ schema }, wsServer);
```

### 🔍 Explicação:
- **`WebSocketServer`**: Configura um servidor WebSocket para operações em tempo real.
- **`useServer`**: Integra o WebSocket ao Apollo Server, permitindo **subscriptions** no GraphQL.
- **`serverCleanup.dispose`**: Garante que as conexões WebSocket sejam encerradas corretamente.

---

## 🛠 Instância do Apollo Server

```ts
const server = new ApolloServer({
  schema,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }), // Fecha o servidor HTTP corretamente.
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose(); // Encerra as conexões WebSocket.
          },
        };
      },
    },
  ],
});
```

### 🔍 Explicação:
- **`schema`**: O esquema GraphQL criado com `makeExecutableSchema`.
- **`plugins`**:
  - **`ApolloServerPluginDrainHttpServer`**: Gerencia o encerramento do servidor HTTP.
  - **`serverWillStart`**: Define ações executadas antes da inicialização do servidor.
  - **`drainServer`**: Garante que as conexões WebSocket sejam fechadas ao desligar o servidor.

---

## 🚀 Inicialização do Servidor

```ts
await server.start();
app.use(
  "/graphql",
  expressMiddleware(server, {
    context: async ({ req }) => ({ req }), // Passa o request para os resolvers do GraphQL.
  })
);
```

### 🔍 Explicação:
- **`server.start()`**: Inicia o Apollo Server.
- **`expressMiddleware`**: Configura o middleware para receber requisições GraphQL via HTTP.
- **`context`**: Permite que os resolvers acessem dados da requisição (ex: autenticação).

---

## 🔗 Conexão com MongoDB

```ts
await connectDB();
```

- **`connectDB`**: Inicia a conexão com o MongoDB antes do servidor processar requisições.

---

## 📜 Resumo

### ✅ O que o código faz?
1. **Conecta ao banco de dados** MongoDB via `mongoose.connect`.
2. **Configura o servidor Apollo** com suporte a GraphQL e subscriptions em tempo real.
3. **Integra o Apollo Server ao Express**, tornando a API acessível via `/graphql`.
4. **Garante a finalização correta** do servidor e WebSocket ao desligar.

### 🎯 Benefícios
✅ Suporte a **queries, mutations e subscriptions** no GraphQL.
✅ Integração com **WebSockets** para tempo real.
✅ Modularidade com `getSchema`, facilitando a manutenção e expansão da API.
✅ Gerenciamento robusto do ciclo de vida do servidor, evitando vazamento de conexões.

---

