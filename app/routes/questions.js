const Router = require('koa-router')
const jwt = require('koa-jwt')

const questionsCtl = require('../controllers/questions')
const config = require('../config')

const router = new Router({prefix: '/questions'})
const auth = jwt({secret: config.secret})

router.get('/', questionsCtl.find)
router.post('/', auth, questionsCtl.create)
router.get('/:id', questionsCtl.findById)
router.patch('/:id', auth, questionsCtl.checkQuestionExist, questionsCtl.checkQuestioner, questionsCtl.update)
router.delete('/:id', auth, questionsCtl.checkQuestionExist, questionsCtl.checkQuestioner, questionsCtl.delete)
router.get('/:id/listTopics', questionsCtl.listTopics)
router.post('/:id/following', auth, questionsCtl.checkQuestionExist, questionsCtl.following)
router.delete('/:id/unfollowing', auth, questionsCtl.checkQuestionExist, questionsCtl.unfollowing)
router.get('/:id/listAnswers', questionsCtl.listAnswers)

module.exports = router