import { GraphQLError } from "graphql";
import auth from "../../../util/auth";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Users } from "../../../models/User";
const Query = {
  authProvider: async (_: any, args: any, context: any) => {
    try {
      // Autenticação do usuário
      const userAuth = auth(context);
      const userId = typeof userAuth === "string" ? userAuth : userAuth.id;

      const baseFilter: any = {
        user: userId,
        isActive: true,
      };

      // Hashing do ID do usuário e do papel em paralelo
      const [hashedUserId, hashedUserRole] =
        await Promise.all([
          bcrypt.hash(userId, 2),
          bcrypt.hash(
            typeof userAuth === "string" ? userAuth : userAuth.role,
            2
          ),
        ]);

      return {
        uId: hashedUserId,
        uRole: hashedUserRole,
      };
    } catch (error: any) {
      console.error("Erro no authProvider:", error);
      throw new GraphQLError(
        "Erro ao processar a solicitação. Tente novamente mais tarde."
      );
    }
  },
  configurationProvider: async (_: any, args: any, context: any) => {
    try {
      const userAuth = auth(context);
      const userId = typeof userAuth === "string" ? userAuth : userAuth.id;
      const user = userId && (await Users.findById(userId));

      const configurations = user?.userInformation?.configuration ? user?.userInformation?.configuration : false;

      const moreThan7Days = (new Date().getTime() - user.createdAt) > 7 * 24 * 60 * 60 * 1000;

      const [d, en, t, n, em, e, m] = await Promise.all([
        bcrypt.hash(
          user && configurations.darkMode
            ? configurations.darkMode.toString()
            : "false",
          2
        ),
        bcrypt.hash(
          user && configurations.emailNotification
            ? configurations.emailNotification.toString()
            : "false",
          2
        ),
        bcrypt.hash(
          user && configurations?.terms?.acceptTerm
            ? "true"
            : "false",
          2
        ),
        bcrypt.hash(
          user && user.name
            ? user.name.toString().replace(/\s+/g, "").toLowerCase()
            : "false",
          2
        ),
        (user && user.email
          ? user.email.toString().replace(/\s+/g, "").toLowerCase()
          : "false"
        ),
        bcrypt.hash(
          user && configurations.evaluation
            ? "true"
            : "false",
          2
        ),
        bcrypt.hash(
          user && moreThan7Days
            ? "true"
            : "false",
          2
        ),
      ]);

      return {
        d: d,
        en: en,
        t: t,
        n: n,
        em: em,
        e: e,
        m: m,
      };
    } catch (error: any) {
      console.error("Erro no authProvider:", error);
      throw new GraphQLError(
        "Erro ao processar a solicitação. Tente novamente mais tarde."
      );
    }
  },
};

const resolvers = {
  Query,
};

export default resolvers;
