const jsonwebtoken = require('jsonwebtoken')
const User = require('../models/users')
const Question = require('../models/questions')
const config = require('../config')

class UsersCtl {
  async checkOwner(ctx, next) {
    if (ctx.params.id !== ctx.state.user._id) { ctx.throw(403, '没有权限') }
    await next()
  }
  async checkUserExist(ctx, next) {
    const user = await User.findById(ctx.params.id)
    if (!user) { ctx.throw(404, '用户不存在') }
    await next()
  }

  async find(ctx) {
    const { page = 1, size = 10 } = ctx.query
    const page_num = Math.max(page * 1, 1) - 1
    const size_num = Math.max(size * 1, 1)
    ctx.body = await User.find({ name: new RegExp(ctx.query.q) }).limit(size_num).skip(page_num * size_num)
  }
  async findById(ctx) {
    const { fields = '' } = ctx.query
    const selectFields = fields.split(';')
                                .filter(f => f)
                                .map(f => ' +' + f)
                                .join('') //filter过滤空字段
    const populateFields = fields.split(';')
                                  .filter(f => f)
                                  .map(f => {
                                    if(f === 'employments') {
                                      return 'employments.company employments.job'
                                    }else if(f === 'educations') {
                                      return 'educations.school educations.major'
                                    }else {
                                      return f
                                    }
                                  })
                                  .join(' ')
    const user = ctx.body = await User.findById(ctx.params.id)
                                      .select(selectFields) //显示隐藏得字段
                                      .populate(populateFields)
    if (!user) { ctx.throw(404, '用户不存在') }
    ctx.body = user
  }
  async create(ctx) {
    // verifyParams方法来自koa-parameter
    ctx.verifyParams({
      name: { type: 'string', required: true },
      password: { type: 'string', required: true }
    })
    //  用户名唯一性校验
    const { name } = ctx.request.body
    const repeatedUser = await User.findOne({ name })
    if (repeatedUser) { ctx.throw(409, '用户名已被占用') }
    // 新增用户
    const user = await new User(ctx.request.body).save()
    ctx.body = user
  }
  async updete(ctx) {
    // verifyParams方法来自koa-parameter
    ctx.verifyParams({
      name: { type: 'string', required: false },
      password: { type: 'string', required: false },
      avatar_url: { type: 'string', required: false },
      gender: { type: 'string', required: false },
      headline: { type: 'string', required: false },
      location: { type: 'array', itemType: 'string', required: false },
      business: { type: 'string', required: false },
      employments: { type: 'array', itemType: 'object', required: false },
      educations: { type: 'array', itemType: 'object', required: false }
    })
    const user = await User.findByIdAndUpdate(ctx.params.id, ctx.request.body)
    if (!user) { ctx.throw(404, '用户不存在') }
    ctx.body = user
  }
  async delete(ctx) {
    const user = await User.findByIdAndRemove(ctx.params.id)
    if (!user) { ctx.throw(404, '用户不存在') }
    ctx.status = 204
  }
  async login(ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: true },
      password: { type: 'string', required: true }
    })
    const user = await User.findOne(ctx.request.body)
    if (!user) { ctx.throw(401, '用户名或者密码不正确') }

    const { _id, name } = user
    const token = jsonwebtoken.sign({ _id, name }, config.secret, { expiresIn: '1d' }) // expiresIn过期时间
    ctx.body = { token }
  }
  async listFollowing(ctx) {
    const user = await User.findById(ctx.params.id).select('+following').populate('following')
    if (!user) { ctx.throw(404, '用户不存在') }
    ctx.body = user.following
  }
  async following(ctx) {
    const me = await User.findById(ctx.state.user._id).select('+following')
    if (!me.following.map(f => f.toString()).includes(ctx.params.id)) {
      me.following.push(ctx.params.id)
      me.save()
    }
    ctx.status = 204
  }
  async unfollowing(ctx) {
    const me = await User.findById(ctx.state.user._id).select('+following')
    var index = me.following.map(f => f.toString()).indexOf(ctx.params.id)
    if (index !== -1) {
      me.following.splice(index, 1)
      me.save()
    }
    ctx.status = 204
  }
  async listFollowers(ctx) {
    const users = await User.find({ following: ctx.params.id })
    ctx.body = users
  }
  async listFollowingTopics(ctx) {
    const user = await User.findById(ctx.params.id).select('+followingTopics').populate('followingTopics')
    if(!user) {ctx.throw(404, '用户不存在')}
    ctx.body = user.followingTopics
  }
  async listQuestions(ctx) {
    const questions = await Question.find({questioner: ctx.params.id})
    ctx.body = questions
  }
  async listLikingAnswers(ctx) {
    const user = await User.findById(ctx.params.id).select('+likingAnswers').populate('likingAnswers')
    if(!user) {ctx.throw(404, '用户不存在')}
    ctx.body = user.likingAnswers
  }
  async listDisLikingAnswer(ctx) {
    const user = await User.findById(ctx.params.id).select('+dislikingAnswers')
    if(!user) {ctx.throw(404, '用户不存在')}
    ctx.body = user.dislikingAnswers
  }
}

module.exports = new UsersCtl()