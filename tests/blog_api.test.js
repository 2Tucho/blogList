const { test, after, beforeEach } = require("node:test")
const assert = require("node:assert")
const Blog = require("../models/blog")
const mongoose = require("mongoose")
const supertest = require("supertest")
const helper = require("./test_helper")
const app = require("../app")

const api = supertest(app)

beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
})

test("blogs are returned as json", async () => {
    const response = await api.get("/api/blogs")
    await api
        .get("/api/blogs")
        .expect("Content-Type", /application\/json/)

    assert.strictEqual(response.body.length, initialBlogs.length)
})

test("unique identifier property of the blog posts is named id", async () => {
    const blogs = await helper.blogsInDb()
    blogs.forEach((blog) => {
        assert.notStrictEqual(blog.id, undefined);
        assert.strictEqual(blog._id, undefined);
    });
})

test("a new blog is added", async () => {
    const newBlog = {
        title: "Las maravillas de la programación",
        author: "Un muy reputado desarrollador",
        url: "www.programareslomejor.com",
        likes: 36
    }

    await api
        .post("/api/blogs")
        .send(newBlog)
        .expect(201)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

    const titles = blogsAtEnd.map((b) => b.title)
    assert(titles.includes("Las maravillas de la programación"))
})

test("if the number of likes isn't specified it is 0 by default", async () => {
    const newBlog = {
        title: "Las maravillas de la programación",
        author: "Un muy reputado desarrollador",
        url: "www.programareslomejor.com"
    }

    await api
        .post("/api/blogs")
        .send(newBlog)
        .expect(201)

    const blogAdded = await helper.blogsInDb()
    assert.strictEqual(blogAdded[blogAdded.length - 1].likes, 0)
})

test("if the title is not defined it responds with a code 400", async () => {
    const newBlog = {
        author: "Un muy reputado desarrollador",
        url: "www.programareslomejor.com",
        likes: 49
    }

    await api
        .post("/api/blogs")
        .send(newBlog)
        .expect(400)
})

test("if the url is not defined it responds with a code 400", async () => {
    const newBlog = {
        title: "Las maravillas de la programación",
        author: "Un muy reputado desarrollador",
        likes: 49
    }

    await api
        .post("/api/blogs")
        .send(newBlog)
        .expect(400)
})

test("a blog is deleted by its id", async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    const titles = blogsAtEnd.map((b) => b.titles)
    assert(!titles.includes(blogToDelete.title))

    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
})

after(async () => {
    await mongoose.connection.close()
})