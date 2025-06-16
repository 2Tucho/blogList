const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const Blog = require("../models/blog")
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

const initialBlogs = [
    {
        title: "Hablemos de rol",
        author: "Marta Hernandez",
        url: "www.hablemosderol.com",
        likes: 45
    },
    {
        title: "Pokemon TCG para tof@s",
        author: "Adrian Hernandez",
        url: "www.pokemontcgparatodes.com",
        likes: 120
    },
]

beforeEach(async () => {
    await Blog.deleteMany({})
    let blogObject = new Blog(initialBlogs[0])
    await blogObject.save()
    blogObject = new Blog(initialBlogs[1])
    await blogObject.save()
})

test('blogs are returned as json', async () => {
    const response = await api.get('/api/blogs')
    await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.length, initialBlogs.length)
})

after(async () => {
    await mongoose.connection.close()
})