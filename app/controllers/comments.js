const Comment = require('../models/comments')

class CommentsCtl {
	async checkCommentExist(ctx, next) {
		const comment = await Comment.findById(ctx.params.id)
		if(!comment) {ctx.throw(404, '评论不存在')}
		if(ctx.params.answerId !== comment.answerId.toString()) {ctx.throw(404, '当前答案下没有这个评论')}
		if(ctx.params.questionId !== comment.questionId.toString()) {ctx.throw(404, '当前问题下没有这个评论')}
		ctx.state.comment = comment
		await next()
	}
	async checkCommentator(ctx, next) {
		if(ctx.state.comment.commentator.toString() !== ctx.state.user._id) {
			ctx.throw(403, '没有权限')
		}

		await next()
	}

	async find(ctx) {
		const { page = 1, size = 10, q, rootCommentId } = ctx.query
		const { questionId, answerId } = ctx.params
		const page_num = Math.max(page * 1, 1) - 1
		const size_num = Math.max(size * 1)
		const comments = await Comment.find({content: new RegExp(q), questionId, answerId, rootCommentId})	// questionId, answerId 匹配某个问题或者某个答案下的所有评论
																	.limit(size_num)
																	.skip(size_num * page_num)
																	.populate('commentator replyTo')
		ctx.body = comments
	}
	async create(ctx) {
		ctx.verifyParams({
			content: {type: 'string', required: true},
			rootCommentId: {type: 'string', required: false},
			replyTo: {type: 'string', required: false}
		})
		const body = {
			...ctx.request.body,
			commentator: ctx.state.user._id,
			questionId: ctx.params.questionId,
			answerId: ctx.params.answerId
		}
		const comment = await new Comment(body).save()

		ctx.body = comment
	}
	async findById(ctx) {
		const comment = await Comment.findById(ctx.params.id).populate('commentator')
		if(!comment) {ctx.throw(404, '评论不存在')}
		ctx.body = comment
	}
	async update(ctx) {
		ctx.verifyParams({
			content: {type: 'string', required: false}
		})
		const { content } = ctx.request.body
		await ctx.state.comment.update({content})
		ctx.body = ctx.state.comment
	}
	async delete(ctx) {
		await ctx.state.comment.remove()
		ctx.status = 204
	}
}

module.exports = new CommentsCtl()