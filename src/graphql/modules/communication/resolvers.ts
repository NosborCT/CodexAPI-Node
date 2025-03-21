import { GraphQLError } from "graphql";
import auth from "../../../util/auth";
import { Communications } from "../../../models/Communication";
import { Users } from "../../../models/User";
import { createLog } from "../logs/resolvers";

const Communication = {
  createdBy: async (communication: any) => {
    try {
      const user = await Users.findById(communication.createdBy);

      if (user) {
        return user;
      }
    } catch (err: any) {
      throw new GraphQLError(err.message);
    }
  },
  updateBy: async (communication: any) => {
    try {
      const user = await Users.findById(communication.updateBy);

      if (user) {
        return user;
      }
    } catch (err: any) {
      throw new GraphQLError(err.message);
    }
  },
};

const Query = {
  async communication(_: any, { id }: { id: String }) {
    try {
      const foundCommunication = await Communications.findById(id);
      if (foundCommunication) {
        return foundCommunication;
      } else {
        throw new GraphQLError("Esse comunicado não existe");
      }
    } catch (err: any) {
      throw new GraphQLError(err.message);
    }
  },
  async communications(
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

      if (filter?.title) {
        mongoFilter.title = { $regex: filter.title, $options: "i" };
      }

      if (filter?.description) {
        mongoFilter.description = filter.description;
      }

      const totalCount = await Communications.countDocuments(mongoFilter);

      const communications = await Communications.find(mongoFilter)
        .sort(sort && sortType ? { [sortType]: sort } : { name: "asc" })
        .skip(skip || 0)
        .limit(limit || 0);

      return { communications, totalCount };
    } catch (error: any) {
      throw new GraphQLError(error);
    }
  },
};

const Mutation = {
  async createCommunication(_: any, { data }: { data: any }, context: any) {
    const userAuth = auth(context);

    const newCommunication = new Communications({
      ...data,
      createdBy: typeof userAuth === "string" ? userAuth : userAuth.id,
    });

    const create = await newCommunication.save();

    await createLog({
      action: "CREATE",
      data: create?.toString(),
      table: "Communication",
    }, context);

    return create;
  },
  async updateCommunication(
    _: any,
    { id, data }: { id: String; data: any },
    context: any
  ) {
    const userAuth = auth(context);

    const updateCommunication = {
      ...data,
      updateAt: new Date().valueOf,
      updateBy: typeof userAuth === "string" ? userAuth : userAuth.id,
    };

    const update = await Communications.findByIdAndUpdate(id, updateCommunication, {
      new: true,
    });

    await createLog({
      action: "UPDATE",
      data: update?.toString(),
      table: "Communication",
    }, context);

    return update;
  },

  async deleteCommunication(_: any, { id }: { id: String }, context: any) {
    auth(context);

    const communication = !!Communications.findByIdAndDelete(id);
    if (communication) {
      const communication = await Communications.findByIdAndDelete(id);

      await createLog({
        action: "DELETE",
        data: communication?.toString(),
        table: "Communication",
      }, context);

      return communication;
    }
  },
  async deleteAllCommunication(_: any, __: any, context: any) {
    auth(context);

    const result = await Communications.deleteMany({});
    return result.deletedCount;
  },
};

const resolvers = {
  Communication,
  Query,
  Mutation,
};

export default resolvers;
