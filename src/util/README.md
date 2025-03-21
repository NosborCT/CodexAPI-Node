# 📘 Middleware de Autenticação e Webhooks - API Magistrar

Este módulo contém funções para **autenticação JWT**, **validação de senhas e strings**, além de **rotas Webhook** para integração com Hotmart, Mercado Pago e RD Station.

---

## 🚀 Tecnologias Utilizadas

- **Express.js** - Framework para criar APIs.
- **JSON Web Token (JWT)** - Para autenticação segura.
- **GraphQL** - Manipulação e consulta de dados.
- **Hotmart & Mercado Pago Webhooks** - Integração para processar pagamentos.

---

## 🔐 Middleware de Autenticação

### `checkAuth`

Esta função verifica a presença e validade do token JWT na requisição.

```ts
export default function checkAuth(context: any) {
  const { req } = context;

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new Error("Authorization header must be provided");
  }

  const token = authHeader.split("Bearer ")[1];
  if (!token) {
    throw new Error("Authentication token must be 'Bearer [token]'");
  }

  if (!process.env.REACT_APP_SKEY) {
    throw new Error("APP_SKEY not defined");
  }

  try {
    const user = jwt.verify(token, process.env.REACT_APP_SKEY as string);
    return user;
  } catch (err) {
    throw new GraphQLError("Invalid/Expired token");
  }
}
```

**Valida:**
- Se existe um cabeçalho de autorização.
- Se o token JWT está no formato correto.
- Se o token é válido e não expirou.

**Retorno:**
- Um objeto com as informações do usuário autenticado.
- Erro caso o token seja inválido ou expirado.

---

## 🔠 Funções de Manipulação de Strings

### `capitalizeFirstLetter`

```ts
export const capitalizeFirstLetter = (string: string) => {
  return string?.charAt(0).toUpperCase() + string?.slice(1);
}
```

**O que faz?**
- Converte a primeira letra da string para maiúscula.

### `normalizeString`

```ts
export const normalizeString = (string: string) => {
  return string
    ?.trim()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ç/g, "c")
    .replace(/Ç/g, "C")
    .replace(/[^a-zA-Z0-9 ]/g, "");
}
```

**O que faz?**
- Remove espaços extras e acentos.
- Substitui "ç" por "c".
- Remove caracteres especiais.

### `validatePassword`

```ts
export const validatePassword = (password: string) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/;
  return passwordRegex.test(password);
}
```

**O que faz?**
- Valida se a senha contém pelo menos:
  - 6 caracteres
  - 1 letra maiúscula
  - 1 letra minúscula
  - 1 número
  - 1 caractere especial

---

## 🔗 Webhooks - Integração com Pagamentos

### 📌 Rota: `POST /hotmart-webhook`

Processa compras aprovadas no Hotmart.

```ts
router.post("/hotmart-webhook", async (req: Request, res: Response) => {
  if (
    !(req.body?.event === "PURCHASE_COMPLETE" || req.body?.event === "PURCHASE_APPROVED")
  ) {
    return res.status(500).send("Payment not approved.");
  }

  try {
    const response: any = await addUserInCourse(req);
    return res.status(response?.code || 200).send(response?.message || "Código não encontrado.");
  } catch (error: any) {
    return res.status(500).send(error.message);
  }
});
```

**O que faz?**
- Valida se o evento do webhook é de uma compra aprovada.
- Adiciona o usuário ao curso correspondente.
- Retorna sucesso ou erro.

### 📌 Rota: `POST /mp-webhook`

Processa pagamentos do Mercado Pago.

```ts
router.post("/mp-webhook", async (req: Request, res: Response) => {
  try {
    await mpPaymentHandler(req, res);
    return res.status(200).send("OK");
  } catch (error: any) {
    return res.status(500).send(error.message);
  }
});
```

**O que faz?**
- Processa pagamentos aprovados via Mercado Pago.
- Chama `mpPaymentHandler` para lidar com a lógica de acesso ao curso.

### 📌 Rota: `POST /rdstation-webhook`

Registra eventos do RD Station (exemplo de integração).

```ts
router.post("/rdstation-webhook", async (req: Request, res: Response) => {
  console.log(res);
  try {
    return res.status(200).send("OK");
  } catch (error: any) {
    return res.status(500).send(error.message);
  }
});
```

**O que faz?**
- Loga o evento recebido.
- Retorna sucesso ou erro.

---

## 🛠️ Como Rodar o Projeto

### 1️⃣ Instalar Dependências
```sh
npm install
```

### 2️⃣ Definir Variáveis de Ambiente
Crie um arquivo `.env` e configure:
```sh
REACT_APP_SKEY=seu_segredo_jwt
MP_ACCESS_TOKEN=seu_token_mercadopago
```

### 3️⃣ Iniciar o Servidor
```sh
npm start
```

### 🔍 Testando Webhooks
Use o **Postman** ou **Insomnia** para enviar requisições POST para:
```sh
http://localhost:3000/hotmart-webhook
http://localhost:3000/mp-webhook
http://localhost:3000/rdstation-webhook
```

---

## 📌 Considerações Finais

- **O que este código faz?**
  - Implementa autenticação JWT.
  - Manipula e normaliza strings.
  - Valida senhas.
  - Processa pagamentos via Hotmart e Mercado Pago.
  - Integra-se com RD Station.

- **Benefícios:**
  - **Autenticação Segura** ✅
  - **Suporte a Webhooks de Pagamento** ✅
  - **Fácil Integração com Outras APIs** ✅

