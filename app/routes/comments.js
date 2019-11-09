const Router = require('koa-router')
const jwt = require('koa-jwt')

const commentsCtl = require('../controllers/comments')
const config = require('../config')

const auth = jwt({secret: config.secret})

const router = new Router({prefix: '/questions/:questionId/answers/:answerId/comments'})

router.get('/', commentsCtl.find)
router.post('/', auth, commentsCtl.create)
router.get('/:id', commentsCtl.findById)
router.patch('/:id', auth, commentsCtl.checkCommentExist, commentsCtl.checkCommentator, commentsCtl.update)
router.delete('/:id', auth, commentsCtl.checkCommentExist, commentsCtl.checkCommentator, commentsCtl.delete)

module.exports = router