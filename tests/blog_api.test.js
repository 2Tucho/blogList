const { test, after, beforeEach, describe } = require("node:test")
const assert = require("node:assert")
const Blog = require("../models/blog")
const bcrypt = require("bcrypt")
const mongoose = require("mongoose")
const supertest = require("supertest")
const helper = require("./test_helper")
const app = require("../app")
const User = require("../models/user")

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

    assert.strictEqual(response.body.length, helper.initialBlogs.length)
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

test("update the number of likes for a blog post", async () => {
    const getBlogs = await helper.blogsInDb()
    const blogToUpdate = getBlogs[0]

    await api
        .get(`/api/blogs/${blogToUpdate.id}`)
        .expect(200)

    await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send({ likes: 30000 })
        .expect(200)
    
    const blogsAtEnd = await helper.blogsInDb()
    assert.notStrictEqual(blogToUpdate.likes, blogsAtEnd[0].likes);
})

describe("when there is initially one user in db", () => {
    beforeEach(async () => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash("sekret", 10)
        const user = new User({ username: "root", passwordHash })

        await user.save()
    })

    test("creation succeeds with a fresh username", async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: "mluukkai",
            name: "Matti Luukkainen",
            password: "salainen",
        }

        await api
            .post("/api/users")
            .send(newUser)
            .expect(201)
            .expect("Content-Type", /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

        const usernames = usersAtEnd.map(u => u.username)
        assert(usernames.includes(newUser.username))
    })

    test("creation fails with proper statuscode and message if username already taken", async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: "root",
            name: "Superuser",
            password: "salainen",
        }

        const result = await api
            .post("/api/users")
            .send(newUser)
            .expect(400)
            .expect("Content-Type", /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        assert(result.body.error.includes("expected `username` to be unique"))

        assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })
})

describe("tests for exercise 4.16", () => {
    test("creation fails without username", async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            name: "Superuser",
            password: "salainen",
        }

        const result = await api
            .post("/api/users")
            .send(newUser)
            .expect(400)
            .expect("Content-Type", /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        assert(result.body.error.includes("Path `username` is required"))

        assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })

    test("creation fails without password", async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: "root",
            name: "Superuser",
        }

        const result = await api
            .post("/api/users")
            .send(newUser)
            .expect(400)
            .expect("Content-Type", /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        assert(result.body.error.includes("`password` is required"))

        assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })

    test("creation fails when username's length is less than 3", async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: "rt",
            name: "Superuser",
            password: "salainen",
        }

        const result = await api
            .post("/api/users")
            .send(newUser)
            .expect(400)
            .expect("Content-Type", /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        assert(result.body.error.includes("is shorter than the minimum allowed length (3)"))

        assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })

    test("creation fails when password's length is less than 3", async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: "root",
            name: "Superuser",
            password: "sl",
        }

        const result = await api
            .post("/api/users")
            .send(newUser)
            .expect(400)
            .expect("Content-Type", /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        assert(result.body.error.includes("is shorter than the minimum allowed length (3)"))

        assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })
})

after(async () => {
    await mongoose.connection.close()
})