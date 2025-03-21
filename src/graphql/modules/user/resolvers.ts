import { GraphQLError } from "graphql";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import auth from "../../../util/auth";
import { Users } from "../../../models/User";
import { validatePassword } from "../../../util/stringUtils";
import { createLog } from "../logs/resolvers";
import { jwtDecode } from "jwt-decode";
const contextNull = (token: string) => {
  return {
    req: {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  };
};

const User = {
  createdBy: async (user: any) => {
    try {
      const u = await Users.findById(user.createdBy);
      if (u) {
        return u;
      }
    } catch (error: any) {
      throw new GraphQLError(error);
    }
  },
  updateBy: async (user: any) => {
    try {
      const u = await Users.findById(user.updateBy);
      if (u) {
        return u;
      }
    } catch (error: any) {
      throw new GraphQLError(error);
    }
  },
  userInformation: async (user: any) => {
    try {
      const currentDate = new Date().valueOf();

      const baseFilter: any = {
        user: user.id,
        isActive: true,
      };

      return {
        configuration: user?.userInformation?.configuration,
        trial: user?.userInformation?.trial,
      };
    } catch (error: any) {
      throw new GraphQLError(error.message);
    }
  },
};

const Query = {
  async user(_: any, { id }: { id: string }) {
    try {
      const user = await Users.findById(id);
      if (user) {
        return user;
      } else {
        throw new GraphQLError("Esse usuário não existe");
      }
    } catch (error: any) {
      throw new GraphQLError(error);
    }
  },
  async users(
    _: any,
    {
      skip,
      limit,
      sort,
      sortType,
      filter,
    }: { skip: number; limit: number; sort: any; sortType: string; filter: any }
  ) {
    try {
      const mongoFilter: any = {};

      if (filter?.phone) {
        mongoFilter.phone = { $regex: filter.phone, $options: "i" };
      }

      if (filter?.cep) {
        mongoFilter.cep = { $regex: filter.cep, $options: "i" };
      }

      if (filter?.role) {
        mongoFilter.role = filter.role;
      }

      if (filter?.name || filter?.email || filter?.cpf) {
        mongoFilter.$or = [];
        if (filter?.cpf) {
          mongoFilter.$or.push({
            cpf: { $regex: filter.cpf, $options: "i" },
          });
        }
        if (filter?.name) {
          mongoFilter.$or.push({
            name: { $regex: filter.name, $options: "i" },
          });
        }
        if (filter?.email) {
          mongoFilter.$or.push({
            email: { $regex: filter.email, $options: "i" },
          });
        }
      }

      const totalCount = await Users.countDocuments(mongoFilter);

      const users = await Users.find(mongoFilter)
        .sort(sort && sortType ? { [sortType]: sort } : { name: "asc" })
        .skip(skip || 0)
        .limit(limit || 0);

      return { users, totalCount };
    } catch (error: any) {
      throw new GraphQLError(error);
    }
  },
};

const Mutation = {
  async updateUserPassword(
    _: any,
    {
      id,
      newPassword,
    }: { id: string; newPassword: string; currentPassword: string },
    context: any
  ) {
    const passToken =
      newPassword.split(".").length >= 4 && newPassword.split(".")[0];
    const tokenPass =
      newPassword.split(".").length >= 4 &&
      contextNull(newPassword.split(".").slice(1).join("."));

    const userAuth = !tokenPass && auth(context);

    const user = await Users.findById(id);
    if (!user) {
      throw new GraphQLError("Usuário não encontrado.");
    }

    if (await bcrypt.compare(newPassword, user.password as string)) {
      throw new GraphQLError("A nova senha deve ser diferente da antiga");
    }

    if (newPassword && !validatePassword(newPassword)) {
      throw new GraphQLError(
        "A senha deve conter pelo menos 8 caracteres, incluindo uma letra maiúscula, uma letra minúscula, um número e um caractere especial."
      );
    }

    const passwordEncrypted = await bcrypt.hash(passToken || newPassword, 12);
    user.oldPassword = user.password;
    user.password = passwordEncrypted;

    const update: any = await Users.findByIdAndUpdate(
      id,
      { password: passwordEncrypted, oldPassword: user.password },
      { new: true, lean: true }
    );

    if (update.password || update.oldPassword) {
      delete update.password;
      delete update.oldPassword;
    }

    await createLog(
      {
        action: "UPDATE",
        data: update?.toString(),
        table: "User",
      },
      tokenPass ? tokenPass : context
    );

    return update;
  },
  async updateUserEmail(
    _: any,
    { id, newEmail }: { id: string; newEmail: string; currentPassword: string },
    context: any
  ) {
    const userAuth = auth(context);

    const user = await Users.findById(id);
    if (!user) {
      throw new GraphQLError("Usuário não encontrado.");
    }

    user.email = newEmail;

    const update: any = await Users.findByIdAndUpdate(id, user, { new: true });

    if (update.password || update.oldPassword) {
      delete update.password;
      delete update.oldPassword;
    }

    await createLog(
      {
        action: "UPDATE",
        data: update?.toString(),
        table: "User",
      },
      context
    );

    return update;
  },

  // Mutation para atualizar usuário
  async updateUser(
    _: any,
    { id, data }: { id: string; data: any },
    context: any
  ) {
    const user = await Users.findById(id);
    if (!user) {
      throw new GraphQLError("Usuário não encontrado.");
    }

    // Atualiza os campos permitidos
    const {
      email,
      name,
      phone,
      password,
      cep,
      cpf,
      role,
      address,
      neighborhood,
      city,
      bubbleId,
      isActive,
      configuration,
      onTrial,
    } = data;

    const { terms, darkMode, emailNotification, evaluation } =
      configuration ?? {};
      
    if (email) {
      const emailExists = await Users.findOne({ email });
      if (emailExists && emailExists.email !== user.email) {
        throw new GraphQLError("Já existe um usuário com esse email");
      }
    }

    if (cpf) {
      const cpfExists = await Users.findOne({ cpf });
      if (cpfExists && cpfExists.cpf !== user.cpf) {
        throw new GraphQLError("Já existe um usuário com esse CPF");
      }
    }

    if (phone) {
      const phoneExists = await Users.findOne({ phone });
      if (phoneExists && phoneExists.phone !== user.phone) {
        throw new GraphQLError("Já existe um usuário com esse telefone");
      }
    }

    if (data.password && !validatePassword(data.password)) {
      throw new GraphQLError(
        "A senha deve conter pelo menos 8 caracteres, incluindo uma letra maiúscula, uma letra minúscula, um número e um caractere especial."
      );
    }

    let passwordEncrypted;

    if (password) {
      passwordEncrypted = (await bcrypt.hash(password, 12)) as string;
    }

    const updatedUser = {
      name: name || user.name,
      email: email || user.email,
      cpf: cpf || user.cpf,
      role: role || user.role,
      cep: cep || user.cep,
      bubbleId: bubbleId || user.bubbleId,
      phone: phone || user.phone,
      address: address || user.address,
      neighborhood: neighborhood || user.neighborhood,
      city: city || user.city,
      password: passwordEncrypted || user.password,
      isActive: typeof isActive == "boolean" ? isActive : user.isActive,
      userInformation: {
        trial: {
          onTrial: onTrial || user?.userInformation?.trial?.onTrial,
          dateStart: onTrial
            ? new Date().valueOf()
            : user?.userInformation?.trial?.dateStart,
          dateEnd: onTrial
            ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                .setHours(23, 59, 59, 999)
                .valueOf()
            : user?.userInformation?.trial?.dateEnd,
        },
        configuration: {
          darkMode:
            typeof darkMode === "boolean"
              ? darkMode
              : user?.userInformation?.configuration?.darkMode,
          emailNotification:
            typeof emailNotification === "boolean"
              ? emailNotification
              : user?.userInformation?.configuration?.emailNotification,
          terms: {
            dateTerm: typeof terms?.acceptTerm == "boolean"
              ? new Date().valueOf()
              : user?.userInformation?.configuration?.terms?.dateTerm,
            acceptTerm:
              typeof terms?.acceptTerm == "boolean" 
              ? terms?.acceptTerm 
              : user?.userInformation?.configuration?.terms?.acceptTerm,
          },
          evaluation:
            typeof evaluation === "boolean"
              ? evaluation
              : user?.userInformation?.configuration?.evaluation,
        },
      },
      updateAt: new Date().valueOf(),
    };

    // Atualiza o usuário no banco de dados
    const update: any = await Users.findByIdAndUpdate(id, updatedUser, {
      new: true,
    });

    if (update.password || update.oldPassword) {
      delete update.password;
      delete update.oldPassword;
    }

    await createLog(
      {
        action: "UPDATE",
        data: update?.toString(),
        table: "User",
      },
      context
    );

    return update;
  },

  // Mutation criar usuário
  async createUser(_: any, { data }: { data: any }, context: any) {
    const {
      email,
      name,
      phone,
      password,
      cep,
      cpf,
      role,
      city,
      neighborhood,
      address,
      comissao,
      image,
      imageLink,
      bubbleId,
      configuration,
      onTrial,
    } = data;

    const { terms, darkMode, emailNotification } = configuration ?? {};

    // const { valid, errors } = validateCreateUser(email, phone, password);
    // if (!valid) {
    //   throw new GraphQLError("Erros", { extensions: { errors } });
    // }

    if (email) {
      const emailExists = await Users.findOne({ email });
      if (emailExists) {
        throw new GraphQLError("Já existe um usuário com esse email");
      }
    }

    if (cpf) {
      const cpfExists = await Users.findOne({ cpf });
      if (cpfExists) {
        throw new GraphQLError("Já existe um usuário com esse CPF");
      }
    }

    if (phone) {
      const phoneExists = await Users.findOne({ phone });
      if (phoneExists) {
        throw new GraphQLError("Já existe um usuário com esse telefone");
      }
    }

    if (!validatePassword(password)) {
      throw new GraphQLError(
        "A senha deve conter pelo menos 8 caracteres, incluindo uma letra maiúscula, uma letra minúscula, um número e um caractere especial."
      );
    }

    const passwordEncrypted = (await bcrypt.hash(password, 12)) as any;

    const newUser = {
      name,
      email,
      cpf,
      cep,
      role,
      comissao,
      address,
      city,
      neighborhood,
      image,
      imageLink,
      bubbleId,
      phone,
      active: true,
      password: passwordEncrypted,
      updateAt: new Date().valueOf(),
      userInformation: {
        trial: {
          onTrial: onTrial || false,
          dateStart: new Date().valueOf(),
          dateEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            .setHours(23, 59, 59, 999)
            .valueOf(),
        },
        configuration: {
          darkMode: darkMode || false,
          emailNotification: emailNotification || true,
          terms: {
            dateTerm: terms?.acceptTerm ? new Date().valueOf() : null,
            acceptTerm: terms?.acceptTerm || false,
          },
        },
      },
    };

    const createdUser = new Users(newUser);

    const create: any = await createdUser.save();

    if (create.password || create.oldPassword) {
      delete create.password;
      delete create.oldPassword;
    }

    await createLog(
      {
        action: "CREATE",
        data: create.toString(),
        table: "User",
      },
      context
    );

    return create;
  },
  async loginUser(_: any, { data }: { data: any }) {
    // Validação dos dados de entrada
    const { email, password } = data;

    if (!email) {
      throw new GraphQLError("Informe o nome de usuário ou email.");
    }

    const user: any = await Users.findOne({ email: email });

    if (!user) {
      throw new GraphQLError("Usuário não encontrado.");
    }

    const isMatch = await bcrypt.compare(password, user.password as string);
    if (!isMatch) {
      throw new GraphQLError("Senha incorreta.");
    }

    // Gerar token
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.REACT_APP_SKEY as string,
      { expiresIn: "30d" }
    );

    const contextLogin = {
      req: {
        headers: {
          authorization: `Bearer ${token}`,
        },
      },
    };

    if(user.password || user.oldPassword) {
      delete user.password;
      delete user.oldPassword;
    }

    // Cria log utilizando o contexto
    await createLog(
      {
        action: "LOGIN",
        data: user.toString(),
        table: "User",
      },
      contextNull(token)
    );

    return { token };
  },
  async loginWithGoogle(_: any, { creds }: { creds: any }) {
    const credsDecoded: any = jwtDecode(creds);

    const user: any = await Users.findOne({ email: credsDecoded?.email });

    if (!user) {
      throw new GraphQLError("Usuário não encontrado.");
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.REACT_APP_SKEY as string,
      { expiresIn: "30d" }
    );

    if(user.password || user.oldPassword) {
      delete user.password;
      delete user.oldPassword;
    }

    await createLog(
      {
        action: "LOGIN",
        data: user.toString(),
        table: "User",
      },
      contextNull(token)
    );

    return { token };
  },
  async loginHowUser(_: any, { data }: { data: any }) {
    // Validação dos dados de entrada
    const { email, password } = data;

    if (!email) {
      throw new GraphQLError("Informe o nome de usuário ou email.");
    }

    const user: any = await Users.findOne({ email: email });

    if (!user) {
      throw new GraphQLError("Usuário não encontrado.");
    }

    // Extrair as partes da senha baseando-se nos dados do usuário
    const cpf = user.cpf || "000";
    const telefone = user.phone || "8888";
    const userEmail = user.email || "mmmmm";

    const senhaGerada =
      cpf.substring(0, 3) + // Três primeiros dígitos do CPF
      userEmail.substring(0, 5).toLowerCase() + // Cinco primeiras letras do email
      telefone.slice(-4); // Quatro últimos dígitos do telefone

    if (password !== senhaGerada) {
      throw new GraphQLError("Código incorreto.");
    }

    // Atualizar token
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.REACT_APP_SKEY as string,
      { expiresIn: "1d" }
    );

    if(user.password || user.oldPassword) {
      delete user.password;
      delete user.oldPassword;
    }

    await createLog(
      {
        action: "LOGIN",
        data: user.toString(),
        table: "User",
      },
      contextNull(token)
    );

    return {
      token,
    };
  },
  async deleteUser(_: any, { id }: { id: string }, context: any) {
    auth(context);

    const user = !!Users.findByIdAndDelete(id);
    if (user) {
      const deletedUser = await Users.findByIdAndDelete(id);

      await createLog(
        {
          action: "DELETE",
          data: deletedUser?.toString(),
          table: "User",
        },
        context
      );

      return deletedUser;
    }
  },
  async deleteAllUsers(_: any, __: any, context: any) {
    auth(context);

    const result = await Users.deleteMany({});
    return result.deletedCount;
  },
};

const resolvers = {
  User,
  Query,
  Mutation,
};

export default resolvers;
