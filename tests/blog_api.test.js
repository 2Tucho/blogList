const { test, after, beforeEach } = require("node:test")
const assert = require("node:assert")
const Blog = require("../models/blog")
const mongoose = require("mongoose")
const supertest = require("supertest")
const helper = require('./test_helper')
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

after(async () => {
    await mongoose.connection.close()
})