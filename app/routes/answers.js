const Router = require('koa-router')
const jwt = require('koa-jwt')

const answersCtl = require('../controllers/answers')
const config = require('../config')

const router = new Router()
const auth = jwt({secret: config.secret})
const routerPrefix = '/questions/:questionId/answers'
const routerPrefix2 = '/answer'

router.get(routerPrefix, answersCtl.find)
router.post(routerPrefix, auth, answersCtl.create)
router.get(`${routerPrefix}/:id`, answersCtl.checkAnswerExist, answersCtl.findById)
router.patch(`${routerPrefix}/:id`, auth, answersCtl.checkAnswerExist, answersCtl.checkAnswerer, answersCtl.update)
router.delete(`${routerPrefix}/:id`, auth, answersCtl.checkAnswerExist, answersCtl.checkAnswerer, answersCtl.delete)
router.post(`${routerPrefix2}/:id/likeAnswer`, auth, answersCtl.checkAnswerExist, answersCtl.likeAnswer)
router.delete(`${routerPrefix2}/:id/unlikeAnswer`, auth, answersCtl.checkAnswerExist, answersCtl.unlikeAnswer)

module.exports = router