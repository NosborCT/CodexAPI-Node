import { GraphQLError } from "graphql";
import auth from "../../../util/auth";
import { FavoriteBooks } from "../../../models/FavoriteBook";
import { Users } from "../../../models/User";
import { createLog } from "../logs/resolvers";


const FavoriteBook = {
    user: async (FavoriteBook: any) => {
        try {
            const student = await Users.findById(FavoriteBook.user);

            if (student) {
                return student;
            }
        } catch (err: any) {
            throw new GraphQLError(err.message);
        }
    },
    createdBy: async (FavoriteBook: any) => {
        try {
            const user = await Users.findById(FavoriteBook.createdBy);
            if (user) {
                return user;
            }
        } catch (err: any) {
            throw new GraphQLError(err.message);
        }
    },
    updateBy: async (FavoriteBook: any) => {
        try {
            const user = await Users.findById(FavoriteBook.updateBy);
            if (user) {
                return user;
            }
        } catch (err: any) {
            throw new GraphQLError(err.message);
        }
    },
};

const Query = {
    async FavoriteBook(_: any, { id }: { id: string }) {
        try {
            const FavoriteBook = await FavoriteBooks.findById(id);
            if (FavoriteBook) {
                return FavoriteBook;
            } else {
                throw new GraphQLError("Esse curso favorito não existe");
            }
        } catch (error: any) {
            throw new GraphQLError(error);
        }
    }
}

const Mutation = {
    async createFavoriteBook(_: any, { data }: { data: any }, context: any) {
        const userAuth = auth(context);

        const newFavoriteBook = new FavoriteBooks({
            ...data,
            createdAt: new Date().valueOf(),
            createdBy: typeof userAuth === "string" ? userAuth : userAuth.id,
        });

        const create = await newFavoriteBook.save();

        await createLog({ action: "CREATE", data: create?.toString(), table: "FavoriteBook" }, context);

        return create;
    },
    async updateFavoriteBook(
        _: any,
        { FavoriteBookId, data }: { FavoriteBookId: String; data: any },
        context: any
    ) {
        const userAuth = auth(context);

        const updateCourse = {
            ...data,
            updateAt: new Date().valueOf(),
            updateBy: typeof userAuth === "string" ? userAuth : userAuth.id,
        };

        const update = await FavoriteBooks.findByIdAndUpdate(FavoriteBookId, updateCourse, {
            new: true,
        });

        await createLog({ action: "UPDATE", data: update?.toString(), table: "FavoriteBook" }, context);

        return update;
    },
    async deleteFavoriteBook(_: any, { id }: { id: String }, context: any) {
        auth(context);

        const FavoriteBook = !!FavoriteBooks.findByIdAndDelete(id);
        if (FavoriteBook) {
            const deletedFc = await FavoriteBooks.findByIdAndDelete(id);

            await createLog({ action: "DELETE", data: deletedFc?.toString(), table: "FavoriteBook" },
                context);

            return deletedFc;
        }
    },
    async deleteAllFavoriteBooks(_: any, __: any, context: any) {
        auth(context);

        const result = await FavoriteBooks.deleteMany({});
        return result.deletedCount;
    },
    async deleteAllFavoriteBooksByUser(_: any, { userId }: { userId: String }, context: any) {
        auth(context);

        const result = await FavoriteBooks.deleteMany({ user: userId });
        return result.deletedCount;
    },
};

const resolvers = {
    FavoriteBook,
    Query,
    Mutation,
};

export default resolvers;
