import { GraphQLError } from "graphql";
import auth from "../../../util/auth";
import { Comments } from "../../../models/Comment";
import { Users } from "../../../models/User";
import { createLog } from "../logs/resolvers";

const Comment = {
  user: async (questionComment: any) => {
    try {
      const user = await Users.findById(questionComment.user);

      if (user) {
        return user;
      }
    } catch (err: any) {
      throw new GraphQLError(err.message);
    }
  },
  createdBy: async (questionComment: any) => {
    try {
      const user = await Users.findById(questionComment.createdBy);
      if (user) {
        return user;
      }
    } catch (err: any) {
      throw new GraphQLError(err.message);
    }
  },
  updateBy: async (questionComment: any) => {
    try {
      const user = await Users.findById(questionComment.updateBy);
      if (user) {
        return user;
      }
    } catch (err: any) {
      throw new GraphQLError(err.message);
    }
  },
};
const Query = {
  async comment (_: any, { id }: { id: String }) {
    try {
      return await Comments.findById(id);
    }
    catch (err: any) {
      throw new GraphQLError(err.message);
    }
  },
};

const Mutation = {
  async createComment(_: any, { data }: { data: any }, context: any) {
    const userAuth = auth(context);

    const newQuestionComment = new Comments({
      ...data,
      createdBy: typeof userAuth === "string" ? userAuth : userAuth.id,
    });

    const create = await newQuestionComment.save();

    await createLog({
      action: "CREATE",
      data: create?.toString(),
      table: "Comment",
    }, context);

    return create;
  },
  async updateComment(
    _: any,
    { id, data }: { id: String; data: any },
    context: any
  ) {
    const userAuth = auth(context);

    const updateComment = {
      ...data,
      updateAt: new Date().valueOf(),
      updateBy: typeof userAuth === "string" ? userAuth : userAuth.id,
    };

    const update = await Comments.findByIdAndUpdate(id, updateComment, {
      new: true,
    });

    await createLog({
      action: "UPDATE",
      data: update?.toString(),
      table: "Comment",
    }, context);

    return update;
  },
  async deleteComment(_: any, { id }: { id: String }, context: any) {
    auth(context);

    const questionComment = !!Comments.findByIdAndDelete(id);
    if (questionComment) {
      const deletedComment = await Comments.findByIdAndDelete(id);

      await createLog({
        action: "DELETE",
        data: deletedComment?.toString(),
        table: "Comment",
      }, context);

      return deletedComment;
    }
  },
  async deleteAllComments(_: any, __: any, context: any) {
    auth(context);

    const result = await Comments.deleteMany({});
    return result.deletedCount;
  }
};

const resolvers = {
  Comment,
  Query,
  Mutation,
};

export default resolvers;
