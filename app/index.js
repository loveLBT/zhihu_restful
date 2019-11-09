const Koa = require('koa')
const koaBody = require('koa-body')
const koaJsonError = require('koa-json-error')
const koaStatic = require('koa-static')
const parameter = require('koa-parameter')
const mongoose = require('mongoose')
const path = require('path')
const app = new Koa()
const routes = require('./routes')
const config = require('./config')

mongoose.connect(config.connectionStr, { useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false })
mongoose.connection.on("error", console.error)

app.use(koaStatic(path.join(__dirname, 'public')))
app.use(koaJsonError({
  postFormat: (e, { stack, ...rest }) => process.env.NODE_ENV === 'production' ? rest : { stack, ...rest }
}))
app.use(koaBody({
  multipart: true,
  formidable: {
    uploadDir: path.join(__dirname, '/public/uploads'),
    keepExtensions: true
  }
}))
app.use(parameter(app))
routes(app)

app.listen(3001, () => console.log('starting port in 3001'))