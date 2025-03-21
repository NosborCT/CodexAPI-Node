import { GraphQLError } from "graphql";
import auth from "../../../util/auth";
import { ReportComments, Reports } from "../../../models/Report";
import { Users } from "../../../models/User";
import { createLog } from "../logs/resolvers";

const ReportComment = {
    user: async (comment: any) => {
        try {
            const user = await Users.findById(comment.user)

            if (user) {
                return user
            }
        } catch (err: any) {
            throw new GraphQLError(err.message)
        }
    }
}

const Report = {
    user: async (report: any) => {
        try {
            const user = await Users.findById(report.user);
            if (user) {
                return user;
            }
        } catch (err: any) {
            throw new GraphQLError(err.message);
        }
    },
};

const Query = {
    reportsByUser: async (_: any, { userId, skip, limit, sort, sortType, filter }: { userId: any, skip: number, limit: number, sort: any, sortType: any, filter: any }) => {
        try {
            const mongoFilter: any = {}

            mongoFilter.user = Users.findById(userId)

            const totalCount = await Reports.countDocuments(mongoFilter)

            const reports = await Reports.find(mongoFilter)
                .sort(sort && sortType ? { [sortType]: sort } : { name: "asc" })
                .skip(skip || 0)
                .limit(limit || 0);

            return { reports, totalCount }
        } catch (err: any) {
            throw new GraphQLError(err.message);
        }
    },
    reports: async (_: any, { skip, limit, sort, sortType, filter }: { skip: number, limit: number, sort: any, sortType: any, filter: any }) => {
        try {
            const mongoFilter: any = {}

            const totalCount = await Reports.countDocuments(mongoFilter)

            const reports = await Reports.find()
                .sort(sort && sortType ? { [sortType]: sort } : { name: "asc" })
                .skip(skip || 0)
                .limit(limit || 0);

            return { reports, totalCount }
        } catch (err: any) {
            throw new GraphQLError(err.message);
        }
    },
    report: async (_: any, { id }: any) => {
        try {
            const report = await Reports.findById(id);
            return report;
        } catch (err: any) {
            throw new GraphQLError(err.message);
        }
    },
    reportComments: async (_: any, { }: { }) => {
        try {
            const comments = await ReportComments.find()
            return comments
        } catch (err: any) {
            throw new GraphQLError(err.message)
        }
    },
    reportComment: async (_: any, { id }: { id: String }) => {
        try {
            const comment = await ReportComments.findById(id)

            if (comment) {
                return comment
            }
        } catch (err: any) {
            throw new GraphQLError(err.message)
        }
    }
}

const Mutation = {
    async createReport(_: any, { data }: { data: any }, context: any) {
        const userAuth = auth(context);

        const newReport = new Reports({
            ...data,
            createdAt: new Date(),
            createdBy: typeof userAuth === "string" ? userAuth : userAuth.id,
        });

        const create = await newReport.save();

        await createLog({
            action: `CREATE`,
            data: create?.toString(),
            table: "Report",
        }, context);

        return create;
    },
    async updateReport(_: any, { id, data }: { id: any, data: any }, context: any) {
        const userAuth = auth(context);

        const updateReport = {
            ...data,
            updateAt: new Date().valueOf(),
            updateBy: typeof userAuth === "string" ? userAuth : userAuth.id,
        };

        const update = await Reports.findByIdAndUpdate(id, updateReport, { new: true });

        await createLog({
            action: `UPDATE`,
            data: update?.toString(),
            table: "Report",
        }, context);

        return update;
    },
    async deleteReport(_: any, { id }: { id: any }, context: any) {
        auth(context);

        const report = !!Reports.findByIdAndDelete(id);
        if (report) {
            const deletedReport = await Reports.findByIdAndDelete(id);

            await createLog({
                action: `DELETE`,
                data: deletedReport?.toString(),
                table: "Report",
            }, context);

            return deletedReport;
        }
    },
    async deleteAllReports(_: any, __: any, context: any) {
        auth(context);

        const result = await Reports.deleteMany({});
        return result.deletedCount;
    },
    async createReportComment(_: any, { data }: { data: any }, context: any) {
        const userAuth = auth(context);

        const newComment = new ReportComments({
            ...data,
            createdAt: new Date(),
            createdBy: typeof userAuth === "string" ? userAuth : userAuth.id,
        });

        return await newComment.save();
    },
    async updateReportComment(_: any, { id, data }: { id: any, data: any }, context: any) {
        const userAuth = auth(context);

        const updateReportComment = {
            ...data,
            updateAt: new Date().valueOf(),
            updateBy: typeof userAuth === "string" ? userAuth : userAuth.id,
        };

        return await ReportComments.findByIdAndUpdate(id, updateReportComment, { new: true });
    },
    async deleteReportComment(_: any, { id }: { id: any }, context: any) {
        auth(context);

        const report = !!Reports.findByIdAndDelete(id);
        if (report) {
            return await Reports.findByIdAndDelete(id);
        }
    },
    async deleteAllReportComments(_: any, __: any, context: any) {
        auth(context);

        const result = await ReportComments.deleteMany({});
        return result.deletedCount;
    },
}

const resolvers = {
    ReportComment,
    Report,
    Query,
    Mutation,
};

export default resolvers;