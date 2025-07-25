const express = require('express')
const mongoose = require('mongoose')
const config = require('./utils/config')
const logger = require('./utils/logger')
const listRouter = require("./controllers/blogs")
const loginRouter = require('./controllers/login')
const usersRouter = require('./controllers/users')
const middleware = require('./utils/middleware')

const app = express()

logger.info('connecting to', config.MONGODB_URI)

mongoose
    .connect(config.MONGODB_URI)
    .then(() => {
        logger.info('connected to MongoDB')
    })
    .catch((error) => {
        logger.error('error connection to MongoDB:', error.message)
    })

app.use(express.json())
app.use(middleware.requestLogger)
app.use(middleware.tokenExtractor)

app.use("/api/blogs", listRouter)
app.use('/api/login', loginRouter)
app.use('/api/users', usersRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app