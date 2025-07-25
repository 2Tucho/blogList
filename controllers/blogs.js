const listsRouter = require("express").Router()
const jwt = require("jsonwebtoken")
const Blog = require("../models/blog")
const User = require("../models/user")
const middleware = require("../utils/middleware")

const getTokenFrom = request => {
    const authorization = request.get("authorization")
    if (authorization && authorization.startsWith("Bearer ")) {
        return authorization.replace("Bearer ", "")
    }
    return null
}

listsRouter.get("/", async (request, response) => {
    const blogs = await Blog
        .find({}).populate("user", { username: 1, name: 1 })

    response.json(blogs)

})

listsRouter.get("/:id", async (request, response) => {
    const blog = await Blog.findById(request.params.id)
    if (blog) {
        response.json(blog)
    } else {
        response.status(404).end()
    }
})

listsRouter.post("/", middleware.tokenExtractor, async (request, response) => {
    const body = request.body
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    const user = await User.findById(decodedToken.id)

    const blog = new Blog({
        title: body.title,
        author: user.name,
        url: body.url,
        likes: body.likes,
        user: user.id
    })

    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.status(201).json(savedBlog)
})

listsRouter.delete("/:id", async (request, response) => {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)

    const user = await User.findById(decodedToken.id)
    const blog = await Blog.findById(request.params.id)

    if (blog.user.toString() === user.id.toString()) {
        await Blog.findByIdAndDelete(request.params.id)
        user.blogs = user.blogs.filter(b => b !== request.params.id)
        await user.save()
        response.status(204).end()
    } else {
        response.status(401).json({ error: "invalid operation" })
    }
})

listsRouter.put("/:id", async (request, response) => {
    const updatedBlog = await Blog.findByIdAndUpdate(
        request.params.id,
        request.body, //{ request.body.likes } si solamente quisiese actualizar los likes
        { new: true, runValidators: true }
    )
    if (updatedBlog) {
        response.json(updatedBlog)
    } else {
        response.status(404).end()
    }
})

module.exports = listsRouter