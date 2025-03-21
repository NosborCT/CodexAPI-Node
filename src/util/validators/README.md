# 📘 Validações de Usuário

Este módulo contém diferentes funções para validação de usuário, garantindo que os dados inseridos respeitem regras específicas antes de serem processados pelo sistema.

## 🚀 Tecnologias Utilizadas
- **TypeScript/JavaScript** - Para validação de entrada e manipulação de dados.
- **Regex** - Utilizado para validar padrões de email.
- **Segurança** - Regras para senhas e autenticação.

---

## 📂 Validações Disponíveis

### 📌 1 - Validação de Login (`validateLogin`)

```ts
export const validateLogin = (userName: string, email: string, password: string) => {
  const errors: { [key: string]: string } = {};
  if (userName === "" || email === "") {
    errors.userName = "Nome de usuário ou email não pode estar vazio";
  }

  if (password === "") {
    errors.password = "Senha ou usuário estão incorretos";
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};
```
**Regras:**
- Nome de usuário ou email não podem estar vazios.
- Senha não pode estar vazia.

---

### 📌 2 - Validação de Criação de Usuário (`validateCreateUser`)

```ts
export const validateCreateUser = (email: string) => {
  const errors: { [key: string]: string } = {};

  if (email === "") {
    errors.email = "O email não pode estar vazio";
  } else {
    const regEx =
      /^([0-9a-zA-Z]([-.\u200c\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-.\u200c\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
    if (!email.match(regEx)) {
      errors.email = "O endereço de email não é válido";
    }
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};
```
**Regras:**
- O email não pode estar vazio.
- Deve corresponder a um formato válido.

---

### 📌 3 - Validação de Atualização de Usuário (`validateUpdateUser`)

```ts
export const validateUpdateUser = (userName: string, phone: string) => {
  return {
    errors: {},
    valid: true,
  };
};
```
**Regras:**
- Nenhuma regra de validação ativa.

---

### 📌 4 - Validação de Atualização de Senha (`validatPasswordUpdateUser`)

```ts
export const validatPasswordUpdateUser = (
  password: string,
  confirmPassword: string,
  oldPassword: string
) => {
  const errors: { [key: string]: string } = {};

  if (password === "") {
    errors.password = "A senha não pode estar vazia";
  } else if (password !== confirmPassword) {
    errors.password = "A confirmação de senha está diferente";
  } else if (!oldPassword) {
    errors.oldPassword = "Digite a senha antiga";
  } else if (oldPassword === password) {
    errors.password = "A nova senha deve ser diferente da antiga";
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};
```
**Regras:**
- Senha nova não pode estar vazia.
- Senha nova deve ser diferente da antiga.
- A confirmação de senha deve ser idêntica à senha nova.
- Senha antiga deve ser informada.

---

### 📌 5 - Validação de Reset de Senha (`validateResetPasswordRequesUser`)

```ts
export const validateResetPasswordRequesUser = (userName: string, email: string) => {
  const errors: { [key: string]: string } = {};
  if (userName === "" || email === "") {
    errors.userName = "Nome de usuário ou email não pode estar vazio";
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};
```
**Regras:**
- Nome de usuário ou email não pode estar vazio.

---

### 📌 6 - Validação de Atualização de Email (`validateRequestupdateEmailUser`)

```ts
export const validateRequestupdateEmailUser = (userName: string, email: string, password: string) => {
  const errors: { [key: string]: string } = {};
  if (userName === "") {
    errors.userName = "Nome de usuário não pode estar vazio";
  }

  if (password === "") {
    errors.password = "Senha está vazia";
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};
```
**Regras:**
- Nome de usuário não pode estar vazio.
- Senha não pode estar vazia.

---

## 📊 Considerações Finais

### 🔹 O que o código faz?
- Valida informações inseridas pelo usuário antes de armazená-las no banco de dados.
- Garante que senhas sejam seguras e corretamente confirmadas.
- Impede cadastros de emails mal formatados.

### 🔹 Benefícios
- Evita erros comuns antes de armazenar dados.
- Garante maior segurança para as credenciais dos usuários.
- Melhora a experiência do usuário prevenindo entradas inválidas.

---

