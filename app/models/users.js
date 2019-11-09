const mongoose = require('mongoose')

const { Schema, model } = mongoose

const userSchema = new Schema({
  __v: { type: Number, select: false },
  name: { type: String, required: true },
  password: { type: String, required: true, select: false },
  avatar_url: { type: String },
  gender: { type: String, enum: ['male', 'female'], default: 'male', required: true }, //可枚举类型 上传得数据必须是数组中得一项
  headline: { type: String },
  locations: { type: [{ type: Schema.Types.ObjectId, ref: 'Topic' }], select: false },
  business: { type: Schema.Types.ObjectId, ref: 'Topic', select: false },
  employments: {
    type: [{
      company: { type: Schema.Types.ObjectId, ref: 'Topic' },
      job: { type: Schema.Types.ObjectId, ref: 'Topic' }
    }],
    select: false
  },
  educations: {
    type: [{
      school: { type: Schema.Types.ObjectId, ref: 'Topic' },
      major: { type: Schema.Types.ObjectId, ref: 'Topic' },
      diplome: { type: Number, enum: [1, 2, 3, 4, 5] },
      entrance_year: { type: Number },
      graduation_year: { type: Number }
    }],
    select: false
  },
  following: {
    type: [{ type: Schema.Types.ObjectId, ref: 'User' }], //ref引用User文档中得数据， 配合控制器中中populater方法使用
    select: false
  },
  followingTopics: {
    type: [{type: Schema.Types.ObjectId, ref: 'Topic'}],
    select: false
  },
  followingQuestions: {
    type: [{type: Schema.Types.ObjectId, ref: 'Question'}],
    select: false
  },
  likingAnswers: {
    type: [{type: Schema.Types.ObjectId, ref: 'Answer'}],
    select: false
  },
  dislikingAnswers: {
    type: [{type: Schema.Types.ObjectId, ref: 'Answer'}],
    select: false
  }
})

module.exports = model('User', userSchema)