//Validação de login do usuário
export const validateLogin = (
  userName: string,
  email: string,
  password: string
) => {
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

//Validação de criação do usuário
export const validateCreateUser = (email: string, phone: string, password: string) => {
  const errors: { [key: string]: string } = {};

  if (email === "") {
    errors.email = "O email pode estar vazio";
  } else {
    const regEx =
      /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-.\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
    if (!email.match(regEx)) {
      errors.email = "O endereço de email não é válido";
    }
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

//Validação de atualização do usuário
export const validateUpdateUser = (userName: string, phone: string) => {
  const errors: { [key: string]: string } = {};

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

//Validação de atualização da senha do usuário
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

  if (confirmPassword === "") {
    errors.confirmPassword = "Confirmação de senha não pode estar vazio";
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

//Validação de troca de senha
export const validateResetPasswordRequesUser = (
  userName: string,
  email: string
) => {
  const errors: { [key: string]: string } = {};
  if (userName === "" || email === "") {
    errors.userName = "Nome de usuário ou email não pode estar vazio";
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

//Validação de troca de email
export const validateRequestupdateEmailUser = (
  userName: string,
  email: string,
  password: string
) => {
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
