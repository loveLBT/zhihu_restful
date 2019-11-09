const mongoose = require('mongoose')

const { Schema, model } = mongoose

const commentSchema = new Schema({
	__v: {type: Number, select: false},
	content: {type: String, required: true},
	commentator: {type: Schema.Types.ObjectId, ref: 'User', required: true},
	answerId: {type: String, required: true},
	questionId: {type: String, required: true},
	rootCommentId: {type: String},	//根评论
	replyTo: {type: Schema.Types.ObjectId, ref: 'User'}	//回复给哪个用户
},{timestamps: true})	//	timestamps 展示数据的创建时间与更改时间

module.exports = model('Comment', commentSchema)