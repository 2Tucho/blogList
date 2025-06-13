const dummy = (blogs) => {
    return 1
}

const totalLikes = (blog) => {
    let count = 0
    for (let i = 0; i < blog.length; i++) {
        count += blog[i].likes
    }
    return count
}

module.exports = {
    dummy,
    totalLikes
}