const Blog = require('../models/blog')

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

module.exports = {
  initialBlogs,
  blogsInDb,
}