const Router = require('koa-router')
const jwt = require('koa-jwt')

const usersCtl = require('../controllers/users')
const config = require('../config')

const router = new Router({prefix: '/users'})
const auth = jwt({secret: config.secret})
/*const auth = async (ctx, next) => {
	const { authorization='' } = ctx.request.header
	const token = authorization.replace('Bearer ', '')

	try {
		const user = jsonwebtoken.verify(token, config.secret)
		ctx.state.user = user
	} catch (err) {
		ctx.throw(401, err.message)
	}
	await next()
}*/

router.get('/', usersCtl.find)
router.post('/', usersCtl.create)
router.get('/:id', usersCtl.findById)
router.patch('/:id', auth, usersCtl.checkOwner, usersCtl.updete)		//put跟新整体数据 patch跟新部分数据
router.delete('/:id', auth, usersCtl.checkOwner, usersCtl.delete)
router.post('/login', usersCtl.login)
router.get('/:id/listFollowing', usersCtl.listFollowing)	//嵌套路由url
router.post('/:id/following', auth, usersCtl.checkUserExist, usersCtl.following)
router.delete('/:id/unfollowing', auth, usersCtl.checkUserExist, usersCtl.unfollowing)
router.get('/:id/listFollowers', usersCtl.checkUserExist, usersCtl.listFollowers)
router.get('/:id/listFollowingTopics', usersCtl.listFollowingTopics)
router.get('/:id/listQuestions', usersCtl.checkUserExist, usersCtl.listQuestions)
router.get('/:id/listLikingAnswers', usersCtl.checkUserExist, usersCtl.listLikingAnswers)
router.get('/:id/listDisLikingAnswer', usersCtl.checkUserExist, usersCtl.listDisLikingAnswer)

module.exports = router
