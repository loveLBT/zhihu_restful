const Answer = require('../models/answers')
const Question = require('../models/questions')
const User = require('../models/users')

class AnswersCtl {
	async checkAnswerExist(ctx, next) {
		const answer = await Answer.findById(ctx.params.id)
		if(!answer) {ctx.throw(404, '答案不存在')}
		//答案的增删改查做questionId的判断（答案的喜欢和不喜欢操作不做判断）
		if(ctx.params.questionId && answer.questionId.toString() !== ctx.params.questionId) {ctx.throw(404, '当前问题下没有这个答案')}
		ctx.state.answer = answer
		await next()
	}
	async checkAnswerer(ctx, next) {
		if(ctx.state.answer.answerer.toString() !== ctx.state.user._id) {
			ctx.throw(403, '没有权限')
		}
		await next()
	}

	async find(ctx) {
		const { page = 1, size = 10, q } = ctx.query
		const page_num = Math.max(page * 1, 1) - 1
		const size_num = Math.max(size * 1, 1)
		const answers = await Answer.find({content: new RegExp(q), questionId: ctx.params.questionId})	//questionId 匹配某个问题下的所有答案
																.limit(size_num)
																.skip(size_num * page_num)
		ctx.body = answers
	}
	findById(ctx) {
		ctx.body = ctx.state.answer
	}
	async create(ctx) {
		ctx.verifyParams({
			content: {type: 'string', required: true}
		})
		const body = {
			answerer: ctx.state.user._id,
			questionId: ctx.params.questionId,
			...ctx.request.body
		}
		const answer = await new Answer(body).save()
		ctx.body = answer
	}
	async update(ctx) {
		ctx.verifyParams({
			content: {type: 'string', required: false}
		})
		await ctx.state.answer.update(ctx.request.body)
		ctx.body = ctx.state.answer
	}
	async delete(ctx) {
		await ctx.state.answer.remove()
		ctx.status = 204
	}
  async likeAnswer(ctx) {
    const me = await User.findById(ctx.state.user._id).select('+likingAnswers +dislikingAnswers')
    const likingAnswers = me.likingAnswers.map(a => a.toString())
    const dislikingAnswers = me.dislikingAnswers.map(a => a.toString())
    const index = dislikingAnswers.indexOf(ctx.params.id)
    console.log(likingAnswers)
    console.log(dislikingAnswers)
    if(!likingAnswers.includes(ctx.params.id)) {
      me.likingAnswers.push(ctx.params.id)
      await Answer.findByIdAndUpdate(ctx.params.id, {$inc: {voteCount: 1}}) // $inc: Number类型自动加1 
    }
    if(index !== -1) {
      me.dislikingAnswers.splice(index, 1)
    }
    me.save()
    ctx.status = 204
  }
  async unlikeAnswer(ctx) {
  	const me = await User.findById(ctx.state.user._id).select('+likingAnswers +dislikingAnswers')
    const likingAnswers = me.likingAnswers.map(a => a.toString())
    const dislikingAnswers = me.dislikingAnswers.map(a => a.toString())
    const index = likingAnswers.indexOf(ctx.params.id)
    console.log(likingAnswers)
    console.log(dislikingAnswers)
    if(!dislikingAnswers.includes(ctx.params.id)) {
      me.dislikingAnswers.push(ctx.params.id)
      await Answer.findByIdAndUpdate(ctx.params.id, {$inc: {voteCount: -1}}) // $inc: Number类型自动加1 
    }
    if(index !== -1) {
      me.likingAnswers.splice(index, 1)
    }
    me.save()
    ctx.status = 204
  }
}

module.exports = new AnswersCtl()