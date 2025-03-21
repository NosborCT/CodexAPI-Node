// src/graphql/modules/user/__tests__/resolvers.test.ts

import { GraphQLError } from "graphql";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Users } from "../../../../models/User";
import resolvers from "../resolvers";

// Mock dependencies
jest.mock("../../../../models/User");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
jest.mock("../../logs/resolvers", () => ({
  createLog: jest.fn(),
}));

describe("User Resolvers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Query", () => {
    describe("user", () => {
      it("should return user when found", async () => {
        const mockUser = { id: "123", name: "Test User" };
        (Users.findById as jest.Mock).mockResolvedValue(mockUser);

        const result = await resolvers.Query.user(null, { id: "123" });
        expect(result).toEqual(mockUser);
      });

      it("should throw error when user not found", async () => {
        (Users.findById as jest.Mock).mockResolvedValue(null);

        await expect(resolvers.Query.user(null, { id: "123" }))
          .rejects
          .toThrow(new GraphQLError("Esse usuário não existe"));
      });
    });

    describe("users", () => {
      it("should return filtered users list", async () => {
        const mockUsers = [
          { id: "1", name: "User 1" },
          { id: "2", name: "User 2" }
        ];
        const mockCount = 2;

        (Users.countDocuments as jest.Mock).mockResolvedValue(mockCount);
        (Users.find as jest.Mock).mockReturnValue({
          sort: () => ({
            skip: () => ({
              limit: () => mockUsers
            })
          })
        });

        const result = await resolvers.Query.users(null, {
            skip: 0,
            limit: 10,
            sort: "createdAt",
            sortType: "DESC",
            filter: { name: "User" }
        });

        expect(result).toEqual({
          users: mockUsers,
          totalCount: mockCount
        });
      });
    });
  });

  describe("Mutation", () => {
    describe("loginUser", () => {
      it("should login successfully with valid credentials", async () => {
        const mockUser = {
          id: "123",
          email: "test@test.com",
          password: "hashedPassword",
          role: "USER"
        };
        const mockToken = "jwt-token";

        (Users.findOne as jest.Mock).mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        (jwt.sign as jest.Mock).mockReturnValue(mockToken);

        const result = await resolvers.Mutation.loginUser(null, {
          data: {
            email: "test@test.com",
            password: "Password123!"
          }
        });

        expect(result).toEqual({ token: mockToken });
      });

      it("should throw error with invalid credentials", async () => {
        (Users.findOne as jest.Mock).mockResolvedValue({
          email: "test@test.com",
          password: "hashedPassword"
        });
        (bcrypt.compare as jest.Mock).mockResolvedValue(false);

        await expect(resolvers.Mutation.loginUser(null, {
          data: {
            email: "test@test.com",
            password: "wrongpassword"
          }
        })).rejects.toThrow(new GraphQLError("Senha incorreta."));
      });
    });

    describe("createUser", () => {
      it("should create user successfully", async () => {
        const mockUserData = {
          email: "new@test.com",
          name: "New User",
          password: "ValidPass123!",
          role: "USER"
        };
        const hashedPassword = "hashedPassword123";

        (Users.findOne as jest.Mock).mockResolvedValue(null);
        (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
        (Users.prototype.save as jest.Mock).mockResolvedValue({
          ...mockUserData,
          password: hashedPassword
        });

        const result = await resolvers.Mutation.createUser(null, {
          data: mockUserData
        }, {});

        expect(result).toBeDefined();
        expect(Users.prototype.save).toHaveBeenCalled();
      });

      it("should throw error for existing email", async () => {
        const mockUserData = {
          email: "existing@test.com",
          password: "ValidPass123!"
        };

        (Users.findOne as jest.Mock).mockResolvedValue({ email: mockUserData.email });

        await expect(resolvers.Mutation.createUser(null, {
          data: mockUserData
        }, {})).rejects.toThrow(new GraphQLError("Já existe um usuário com esse email"));
      });
    });
  });
});