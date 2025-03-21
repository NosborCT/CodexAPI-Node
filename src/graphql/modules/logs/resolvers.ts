import { GraphQLError } from "graphql";
import auth from "../../../util/auth";
import { Users } from "../../../models/User";
import { Logs } from "../../../models/Log";
import { PubSub } from "graphql-subscriptions";

const pubsub = new PubSub();

const Log = {
    createdBy: async (log: any) => {
        try {
            const user = await Users.findById(log.createdBy);
            if (user) {
                return user;
            }
        } catch (err: any) {
            throw new GraphQLError(err.message);
        }
    },
    updateBy: async (log: any) => {
        try {
            if (log.updateBy) {
                const user = await Users.findById(log.updateBy);
                if (user) {
                    return user;
                }
            }
        } catch (err: any) {
            throw new GraphQLError(err.message);
        }
    },
};

const Query = {
    async log(_: any, { id }: { id: String }) {
        try {
            return await Logs
                .findById(id)

        }
        catch (err: any) {
            throw new GraphQLError(err.message);
        }
    },
    async logs(
        _: any,
        {
            skip,
            limit,
            sort,
            sortType,
            filter,
        }: {
            skip: number;
            limit: number;
            sort: any;
            sortType: string;
            filter: any;
        }
    ) {
        try {
            const mongoFilter: any = {};

            if (filter?.email) {
                const users = await Users.find({ email: { $regex: filter.email, $options: "i" } });

                if (users.length > 0) {
                    mongoFilter.createdBy = { $in: users };
                }
            }

            if (filter?.action) {
                mongoFilter.action = { $regex: filter.action, $options: "i" };
            }

            if (filter?.table) {
                mongoFilter.table = { $regex: filter.table, $options: "i" };
            }

            if (filter?.startDate || filter?.endDate) {
                mongoFilter.createdAt = {};

                if (filter?.startDate) {
                    mongoFilter.createdAt.$gte = filter.startDate;
                }

                if (filter?.endDate) {
                    mongoFilter.createdAt.$lte = filter.endDate;
                }
            }

            const totalCount = await Logs.countDocuments(mongoFilter);
            const logs = await Logs.find(mongoFilter)
                .skip(skip || 0)
                .limit(limit || 0)
                .sort(sort && sortType ? { [sortType]: sort } : { name: "asc" });

            return { logs, totalCount };
        } catch (err: any) {
            throw new GraphQLError(err.message);
        }
    }
};

const Mutation = {
    async createLog(_: any, { data }: { data: any }, context: any) {
        createLog(data, context);
    },
    async updateLog(
        _: any,
        { id, data }: { id: String; data: any },
        context: any
    ) {
        const userAuth = auth(context);

        const updateLog = {
            ...data,
            updateAt: new Date().valueOf(),
            updateBy: typeof userAuth === "string" ? userAuth : userAuth.id,
        };

        return await Logs.findByIdAndUpdate(id, updateLog, {
            new: true,
        });
    },
    async deleteLog(_: any, { id }: { id: String }, context: any) {
        auth(context);

        const log = !!Logs.findByIdAndDelete(id);
        if (log) {
            return await Logs.findByIdAndDelete(id);
        }
    },
};

const Subscription = {
    logCreated: {
        subscribe: () => pubsub.asyncIterator(["logCreated"]),
        resolve: (payload: any) => payload.log,
    },
};

export const createLog = async (data: any, context: any) => {
    const userAuth = auth(context);

    const newLog = new Logs({
        ...data,
        createdAt: new Date().valueOf(),
        updateAt: new Date().valueOf(),
        updateBy: typeof userAuth === "string" ? userAuth : userAuth.id,
        createdBy: typeof userAuth === "string" ? userAuth : userAuth.id,
    });

    pubsub.publish("logCreated", { log: newLog });

    return await newLog.save();
}

const resolvers = {
    Log,
    Query,
    Mutation,
    Subscription,
};

export default resolvers;
