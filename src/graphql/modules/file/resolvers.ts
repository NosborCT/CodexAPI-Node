import { GraphQLError } from "graphql";
import { Files } from "../../../models/File";
import auth from "../../../util/auth";
import { Users } from "../../../models/User";
import mongoose from "mongoose";
import { createLog } from "../logs/resolvers";

const File = {
  createdBy: async (file: any) => {
    try {
      const user = await Users.findById(file.createdBy);
      if (user) {
        return user;
      }
    } catch (err: any) {
      throw new GraphQLError(err.message);
    }
  },
  updateBy: async (file: any) => {
    try {
      const user = await Users.findById(file.updateBy);
      if (user) {
        return user;
      }
    } catch (err: any) {
      throw new GraphQLError(err.message);
    }
  },
};

const Query = {
  async file(_: any, { id }: { id: any }) {
    try {
      const file = await Files.findById(id);
      if (file) {
        return file;
      } else {
        throw new Error("Esse arquivo não existe");
      }
    } catch (err: any) {
      throw new GraphQLError(err.message);
    }
  },
  async files(
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

      if (filter?.search) {
        if (mongoose.isValidObjectId(filter.search)) {
          const file = await Files.findById(filter.search).exec();
          if (file) {
            return { files: [file], totalCount: 1 };
          }
        }
        mongoFilter.title = { $regex: filter.search, $options: "i" };
      }

      if (filter?.name) {
        mongoFilter.name = { $regex: filter.name, $options: "i" };
      }
      if (filter?.type) {
        mongoFilter.type = { $regex: filter.type, $options: "i" };
      }

      const totalCount = await Files.countDocuments(mongoFilter);

      const files = await Files.find(mongoFilter)
        .sort(sort && sortType ? { [sortType]: sort } : { title: "asc" })
        .skip(skip || 0)
        .limit(limit || 0);

      return { files, totalCount };
    } catch (error: any) {
      throw new GraphQLError(error);
    }
  },
};
const Mutation = {
  async createFile(_: any, { data }: { data: any }, context: any) {
    const userAuth = auth(context);

    const newFile = new Files({
      ...data,
      createdBy: typeof userAuth === "string" ? userAuth : userAuth.id,
      createdAt: new Date().valueOf(),
    });

    const create = await newFile.save();

    await createLog({
      action: "CREATE",
      data: create.toString(),
      table: "File",
    }, context);
  },
  async updateFile(_: any, { id, data }: { id: any; data: any }, context: any) {
    const userAuth = auth(context);

    const updateFile = {
      ...data,
      updateBy: typeof userAuth === "string" ? userAuth : userAuth.id,
      updatedAt: new Date().valueOf(),
    };

    const update = await Files.findByIdAndUpdate(id, updateFile, { new: true });

    await createLog({
      action: "UPDATE",
      data: update?.toString(),
      table: "File",
    }, context);

    return update;
  },
  async deleteFile(_: any, { id }: { id: any }, context: any) {
    auth(context);
    const file = !!Files.findByIdAndDelete(id);
    if (file) {
      const deletedFile = await Files.findByIdAndDelete(id);

      await createLog({
        action: "DELETE",
        data: deletedFile?.toString(),
        table: "File",
      }, context);

      return deletedFile;
    }
  },
};

const resolvers = {
  File,
  Query,
  Mutation,
};

export default resolvers;
