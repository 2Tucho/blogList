const Blog = require("../models/blog")
const User = require("../models/user")

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

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map((blog) => blog.toJSON())
}

const usersInDb = async () => {
    const users = await User.find({})
    return users.map(u => u.toJSON())
}

module.exports = {
  initialBlogs,
  blogsInDb,
  usersInDb
}