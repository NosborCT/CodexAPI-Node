# 📘 Configuração do Servidor Express com Apollo e GraphQL

Este documento detalha a configuração do servidor **Express.js** integrado com **Apollo Server** para utilização do **GraphQL**.

---

## 🚀 Tecnologias Utilizadas

- **Express.js** - Framework para criar APIs.
- **Apollo Server** - Implementação do GraphQL para Node.js.
- **HTTP** - Servidor HTTP integrado ao Express.
- **CORS** - Middleware para permissão de requisições entre origens diferentes.
- **dotenv** - Gerenciamento de variáveis de ambiente.

---

## 📂 Estrutura do Servidor

O servidor é configurado em **três etapas principais**:

1. **Inicialização do Express e do Servidor HTTP**
2. **Configuração de Middlewares**
3. **Inicialização do Apollo Server**

---

## 🔧 1. Inicialização do Express e do Servidor HTTP

```ts
const app = express();
const httpServer = http.createServer(app);
```

### 📌 O que acontece aqui?
- `express()` cria uma instância do aplicativo Express.
- `http.createServer(app)` cria um servidor HTTP para manipular requisições.
- O `httpServer` é essencial para integração do **GraphQL com WebSockets**.

---

## 🔧 2. Configuração de Middlewares

```ts
app.use(cors());
app.use(express.json());
```

### 📌 O que acontece aqui?
- `cors()`: Habilita o CORS para permitir requisições entre diferentes domínios.
- `express.json()`: Middleware que converte requisições com corpo **JSON** em objetos JavaScript.

---

## 🔧 3. Inicialização do Apollo Server

```ts
async function startServer() {
  await startApolloServer(app, httpServer);
  const port = process.env.PORT || 4000;
  await new Promise<void>((resolve) => httpServer.listen(port, resolve));
  console.log(`\uD83D\uDE80 Server ready at http://localhost:${port}/graphql`);
}

startServer();
```

### 📌 O que acontece aqui?
1. **`startApolloServer(app, httpServer)`**:
   - Inicializa o **Apollo Server** e o integra com o **Express**.
   - Permite consultas GraphQL no endpoint `/graphql`.
2. **Definição da Porta**:
   - Utiliza a porta definida na variável de ambiente `PORT` ou, caso não esteja configurada, assume `4000`.
3. **Inicia o Servidor**:
   - `httpServer.listen(port, resolve)`: Inicia o servidor HTTP na porta especificada.
   - `console.log`: Exibe a URL do servidor no terminal.

---

## 🛠️ Como Rodar o Servidor

### 1️⃣ Instalar Dependências
```sh
npm install
```

### 2️⃣ Criar o Arquivo `.env`

Crie um arquivo `.env` e configure:
```sh
PORT=4000
```

### 3️⃣ Iniciar o Servidor
```sh
npm start
```

### 🔍 Testando a API GraphQL
Abra o navegador e acesse:
```sh
http://localhost:4000/graphql
```

Você pode usar o **Apollo Sandbox**, **Insomnia** ou **Postman** para testar as queries GraphQL.

---

## 📌 Considerações Finais

- **O que este código faz?**
  - Inicializa um servidor Express.
  - Configura Apollo Server para manipulação de GraphQL.
  - Usa WebSockets para possíveis subscrições GraphQL.
  - Habilita CORS e aceita requisições JSON.

- **Benefícios:**
  - **Facilidade de integração** ✅
  - **Escalabilidade** ✅
  - **Suporte a WebSockets** ✅

---

                                     