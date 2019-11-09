const Topic = require('../models/topics')
const User = require('../models/users')
const Question = require('../models/questions')

class TopicsCtl {
	async checkTopicExist (ctx, next) {
		const topic = await Topic.findById(ctx.params.id)
		if(!topic) {
			ctx.throw(404, '话题不存在')
		}
		await next()
	}
	async find(ctx) {
		const { page = 1, size = 10 } = ctx.query
		const page_num = Math.max(page * 1, 1) - 1
		const size_num =Math.max(size * 1, 1)
		ctx.body = await Topic.find({name: new RegExp(ctx.query.q)}).limit(size_num).skip(page_num * size_num)	//limit: 返回数据限制数量, skip: 跳过指定的数据数量
	}
	async findById(ctx) {
		const { fields = '' } = ctx.query
		const selectFields = fields.split(";").filter(f => f).map(f => ' +' + f).join('')
		const topic = await Topic.findById(ctx.params.id).select(selectFields)
		if(!topic) {ctx.throw(404, '话题不存在')}
		ctx.body = topic 
	}
	async create(ctx) {
		ctx.verifyParams({
			name: {type: 'string', required: true},
			avatar_url: {type: 'string', required: false},
			introduction: {type: 'string', required: false}
		})
		const topic = await new Topic(ctx.request.body).save()
		ctx.body = topic
	}
	async update(ctx) {
		ctx.verifyParams({
			name: {type: 'string', required: false},
			avatar_url: {type: 'string', required: false},
			introduction: {type: 'string', required: false}
		})
		const topic = await Topic.findByIdAndUpdate(ctx.params.id, ctx.request.body)
		if(!topic) {ctx.throw(404, '话题不存在')}
		ctx.body = topic
	}
	async following(ctx) {
		const me = await User.findById(ctx.state.user._id).select('+followingTopics')
		const followingTopics = me.followingTopics.map(f => f.toString())
		if(!followingTopics.includes(ctx.params.id)) {
			me.followingTopics.push(ctx.params.id)
			me.save()
		}
		ctx.status = 204
	}
	async unfollowing(ctx) {
		const me = await User.findById(ctx.state.user._id).select('+followingTopics')
		const index = me.followingTopics.map(f => f.toString()).indexOf(ctx.params.id)
		if(index !== -1) {
			me.followingTopics.splice(index, 1)
			me.save()
		}
		ctx.status = 204
	}
	async listFollowers(ctx) {
		const users = await User.find({followingTopics: ctx.params.id})
		ctx.body = users
	}
	async listQuestions(ctx) {
		const questions = await Question.find({topics: ctx.params.id})
		ctx.body = questions
	}
}

module.exports = new TopicsCtl()