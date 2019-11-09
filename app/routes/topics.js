const Router = require('koa-router')
const jwt = require('koa-jwt')

const topicsCtl = require('../controllers/topics')
const config = require('../config')

const router = new Router({prefix: '/topics'})
const auth = jwt({secret: config.secret})

router.get('/', topicsCtl.find)
router.post('/', auth, topicsCtl.create)
router.get('/:id', topicsCtl.findById)
router.get('/:id/listFollowers', topicsCtl.checkTopicExist, topicsCtl.listFollowers)
router.patch('/:id', topicsCtl.update)
router.post('/:id/following', auth, topicsCtl.checkTopicExist, topicsCtl.following)
router.delete('/:id/unfollowing',auth, topicsCtl.checkTopicExist, topicsCtl.unfollowing)
router.get('/:id/listQuestions', topicsCtl.checkTopicExist, topicsCtl.listQuestions)

module.exports = router