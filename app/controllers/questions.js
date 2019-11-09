const Question = require('../models/questions')
const User = require('../models/users')
const Answer = require('../models/answers')

class QuestionsCtl {
	async checkQuestionExist(ctx, next) {
		const question = await Question.findById(ctx.params.id).select('questioner')
		if(!question) {
			ctx.throw(404, '问题不存在')
		}
		ctx.state.question = question
		await next()
	}
	async checkQuestioner(ctx, next) {
		if(ctx.state.question.questioner.toString() !== ctx.state.user._id) {
			ctx.throw(403, '没有权限')
		}
		await next()
	}

	async find(ctx) {
		const { page = 1, size = 10, q } = ctx.query
		const page_num = Math.max(page * 1, 1) -1
		const size_num = Math.max(size * 1, 1)
		const questions = await Question
															.find({$or: [{title: new RegExp(q)},{description: new RegExp(q)}]})	// $or: 匹配数组中的任意一项
															.limit(size_num)
															.skip(page_num * size_num)
		ctx.body = questions
	}
	async findById(ctx) {
		const { fields = '' } = ctx.query
		const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('')
		const populateFields = fields.split(';').filter(f => f).map(f => f).join(' ')
		const question = await Question.findById(ctx.params.id).select(selectFields).populate(populateFields)
		if(!question) {ctx.throw(404, '话题不存在')}
		ctx.body = question
	}
	async update(ctx) {
		ctx.verifyParams({
			title: {type: 'string', required: false},
			desctiprtion: {type: 'string', required: false},
		})
		await ctx.state.question.update(ctx.request.body)

		ctx.body = ctx.state.question
	}
	async create(ctx) {
		ctx.verifyParams({
			title: {type: 'string', required: true},
			description: {type: 'string', required: false}
		})
		const body = {
			questioner: ctx.state.user._id,
			...ctx.request.body
		}
		const question = await new Question(body).save()
		ctx.body = question
	}
	async delete(ctx) {
		await ctx.state.question.remove()
		ctx.status = 204
	}
	async listTopics(ctx) {
		const question = await Question.findById(ctx.params.id).select('+topics').populate('topics')
		if(!question) {
			ctx.throw(404, '问题不存在')
		}
		ctx.body = question.topics
	}
	async following(ctx) {
		const me = await User.findById(ctx.state.user._id).select('+followingQuestions')
		const followingQuestions = me.followingQuestions.map(q => q.toString())
		if(!followingQuestions.includes(ctx.params.id)) {
			me.followingQuestions.push(ctx.params.id)
			me.save()
		}
		ctx.status = 204
	}
	async unfollowing(ctx) {
		const me = await User.findById(ctx.state.user._id).select('+followingQuestions')
		const followingQuestions = me.followingQuestions.map(q => q.toString())
		const index = followingQuestions.indexOf(ctx.params.id)
		if(index !== -1) {
			me.followingQuestions.splice(index, 1)
			me.save()
		}
		ctx.status = 204
	}
	async listAnswers(ctx) {
		const answers = await Answer.find({questionId: ctx.params.id})
		ctx.body = answers
	}
}

module.exports = new QuestionsCtl()