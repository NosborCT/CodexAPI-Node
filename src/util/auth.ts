import jwt from "jsonwebtoken";
import { GraphQLError } from "graphql";

const INVALID_OR_EXPIRED_TOKEN = "Invalid/Expired token";
const BEARER_ERROR = "Authentication token must be 'Bearer [token]";
const AUTHORIZATION_ERROR = "Authorization header must be provided";

export default function checkAuth(context: any) {
  const { req } = context;

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new Error(AUTHORIZATION_ERROR);
  }

  const token = authHeader.split("Bearer ")[1];
  if (!token) {
    throw new Error(BEARER_ERROR);
  }

  if (!process.env.REACT_APP_SKEY) {
    throw new Error("APP_SKEY not defined");
  }

  try {
    const user = jwt.verify(token, process.env.REACT_APP_SKEY as string);
    return user;
  } catch (err) {
    throw new GraphQLError(INVALID_OR_EXPIRED_TOKEN);
  }
}