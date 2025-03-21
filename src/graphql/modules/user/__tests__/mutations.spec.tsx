// src/graphql/modules/user/__tests__/mutations.test.ts

import { GraphQLError } from "graphql";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Users } from "../../../../models/User";
import resolvers from "../resolvers";

jest.mock("../../../../models/User");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
jest.mock("../../logs/resolvers", () => ({
  createLog: jest.fn(),
}));

describe("User Mutations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createUser", () => {
    const mockUserData = {
      email: "test@test.com",
      name: "Test User",
      password: "ValidPass123!",
      phone: "1234567890",
      role: "USER"
    };

    it("should create user successfully", async () => {
      (Users.findOne as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");
      (Users.prototype.save as jest.Mock).mockResolvedValue({
        ...mockUserData,
        id: "123",
        password: "hashedPassword"
      });

      const result = await resolvers.Mutation.createUser(
        null,
        { data: mockUserData },
        { req: { headers: {} }}
      );

      expect(result).toBeDefined();
      expect(result.email).toBe(mockUserData.email);
      expect(Users.prototype.save).toHaveBeenCalled();
    });

    it("should throw error for existing email", async () => {
      (Users.findOne as jest.Mock).mockResolvedValue({ email: mockUserData.email });

      await expect(
        resolvers.Mutation.createUser(
          null,
          { data: mockUserData },
          { req: { headers: {} }}
        )
      ).rejects.toThrow("Já existe um usuário com esse email");
    });
  });

  describe("loginUser", () => {
    const loginData = {
      email: "test@test.com",
      password: "ValidPass123!"
    };

    it("should login successfully", async () => {
      const mockUser = {
        id: "123",
        email: loginData.email,
        password: "hashedPassword",
        role: "USER"
      };
      const mockToken = "jwt-token";

      (Users.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      const result = await resolvers.Mutation.loginUser(null, { data: loginData });

      expect(result).toEqual({ token: mockToken });
      expect(jwt.sign).toHaveBeenCalled();
    });

    it("should throw error for incorrect password", async () => {
      (Users.findOne as jest.Mock).mockResolvedValue({
        email: loginData.email,
        password: "hashedPassword"
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        resolvers.Mutation.loginUser(null, { data: loginData })
      ).rejects.toThrow("Senha incorreta.");
    });
  });

  describe("updateUser", () => {
    it("should update user successfully", async () => {
      const mockUser = {
        id: "123",
        email: "old@test.com",
        name: "Old Name",
        userInformation: {
          configuration: {},
          trial: {}
        }
      };

      const updateData = {
        name: "New Name",
        email: "new@test.com"
      };

      (Users.findById as jest.Mock).mockResolvedValue(mockUser);
      (Users.findOne as jest.Mock).mockResolvedValue(null);
      (Users.findByIdAndUpdate as jest.Mock).mockResolvedValue({
        ...mockUser,
        ...updateData
      });

      const result = await resolvers.Mutation.updateUser(
        null,
        { id: "123", data: updateData },
        { req: { headers: { authorization: "Bearer token" } }}
      );

      expect(result.name).toBe(updateData.name);
      expect(result.email).toBe(updateData.email);
    });

    it("should throw error for duplicate email", async () => {
      const mockUser = {
        id: "123",
        email: "old@test.com"
      };

      (Users.findById as jest.Mock).mockResolvedValue(mockUser);
      (Users.findOne as jest.Mock).mockResolvedValue({ email: "new@test.com" });

      await expect(
        resolvers.Mutation.updateUser(
          null,
          { 
            id: "123", 
            data: { email: "new@test.com" }
          },
          { req: { headers: { authorization: "Bearer token" } }}
        )
      ).rejects.toThrow("Já existe um usuário com esse email");
    });
  });
  
});