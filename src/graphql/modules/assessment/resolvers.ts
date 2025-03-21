import { GraphQLError } from "graphql";
import { Assessments, EvaluationType } from "../../../models/Assessment";
import { Users } from "../../../models/User";
import auth from "../../../util/auth";

const Assessment = {
    user: async (assessment: any) => {
        try {
            const user = await Users.findById(assessment.user);
            if (user) {
                return user;
            }
        } catch {
            throw new GraphQLError('Error fetching user');
        }
    }
}

const Query = {
    async assessments(_: any, { skip, limit, sort, sortType, filter }: { skip: number; limit: number; sort: any; sortType: string; filter: any }, context: any) {
        try {
            const mongoFilter: any = {};
            const userFilter: any = {};

            if (filter.userName) {
                userFilter.name = { $regex: filter.userName, $options: 'i' };
                const users = await Users.find(userFilter);
                mongoFilter.user = { $in: users.map(user => user._id) };
            }

            const totalCount = await Assessments.countDocuments(mongoFilter);

            const assessments = await Assessments.find(mongoFilter)
                .sort(sort && sortType ? { [sortType]: sort } : { name: "asc" })
                .skip(skip || 0)
                .limit(limit || 0);

            return { assessments, totalCount };
        } catch {
            throw new GraphQLError('Error fetching assessments');
        }
    },
    async assessment(_: any, { id }: any) {
        try {
            const assessment = await Assessments.findById(id);
            if (assessment) {
                return assessment;
            }
        } catch {
            throw new GraphQLError('Error fetching assessment');
        }
    },
    async getTotalAssessmentAverage() {
        const assessments = await Assessments.find()

        if (assessments.length === 0) return 0;

        // 1. Calcula a média de cada assessment
        const assessmentAverages = assessments.map((assessment: any) => {
            const { evaluations } = assessment;
            if (evaluations.length === 0) return 0;

            const totalEvaluationValue = evaluations.reduce((sum: any, evalItem: any) => sum + evalItem.value, 0);
            return totalEvaluationValue / evaluations.length;
        });

        // 2. Calcula a média geral
        const overallAverage =
            assessmentAverages.reduce((sum: any, avg: any) => sum + avg, 0) / assessmentAverages.length;

        return overallAverage;
    },
    async getTypeAssessmentAverage() {
        const assessments = await Assessments.find();
        if (!assessments.length) return [];

        const typeSums: any = {};

        assessments.forEach(({ evaluations }) => {
            evaluations.forEach(({ type, value }) => {
                typeSums[type] = typeSums[type] || { total: 0, count: 0 };
                typeSums[type].total += value;
                typeSums[type].count++;
            });
        });

        return Object.entries(typeSums).map(([type, { total, count }]: any) => ({
            type,
            average: total / count
        }));
    }
}

const Mutation = {
    async createAssessment(_: any, { data }: any, context: any) {
        try {
            const userAuth = auth(context);

            const newAssessment = await Assessments.create(({
                ...data,
                createdBy: typeof userAuth === 'string' ? userAuth : userAuth.id,
            }));
            return await newAssessment.save();
        } catch {
            throw new GraphQLError('Error creating assessment');
        }
    },
    async updateAssessment(_: any, { id, data }: any, context: any) {
        try {
            const userAuth = auth(context);

            const updateAssessment = {
                ...data,
                updatedBy: typeof userAuth === 'string' ? userAuth : userAuth.id,
                updatedAt: Date.now(),
            }

            return await Assessments.findByIdAndUpdate(id, updateAssessment, { new: true });
        } catch {
            throw new GraphQLError('Error updating assessment');
        }
    },
    async deleteAssessment(_: any, { id }: any, context: any) {
        try {
            auth(context);

            const assessment = await Assessments.findByIdAndDelete(id);
            if (assessment) {
                return assessment;
            }
        } catch {
            throw new GraphQLError('Error deleting assessment');
        }
    },
    async deleteAllAssessments(_: any, { }: any, context: any) {
        try {
            auth(context);
            const assessments = await Assessments.deleteMany();
            if (assessments) {
                return assessments;
            }
        } catch {
            throw new GraphQLError('Error deleting all assessments');
        }
    }
}

const resolvers = {
    Assessment,
    Query,
    Mutation,
}

export default resolvers;