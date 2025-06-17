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

after(async () => {
    await mongoose.connection.close()
})