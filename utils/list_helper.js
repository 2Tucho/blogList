const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    let count = 0
    for (let i = 0; i < blogs.length; i++) {
        count += blogs[i].likes
    }
    return count
}

const favoriteBlog = (blogs) => {
    let likesArr = []
    for (let i = 0; i < blogs.length; i++) {
        likesArr.push(blogs[i].likes)
    }
    let maxLikes = Math.max(...likesArr)
    let finalBlog = blogs.filter(elem => elem.likes === maxLikes)[0]
    const { _id, url, __v, ...res } = finalBlog
    return res
}

const mostBlogs = (blogs) => {
    const count = {}
    for (let i = 0; i < blogs.length; i++) {
        const author = blogs[i].author
        if (count[author]) {
            count[author]++
        } else {
            count[author] = 1
        }
    }

    let topAuthor = ""
    let maxBlogs = 0

    for (const author in count) {
        if (count[author] > maxBlogs) {
            topAuthor = author;
            maxBlogs = count[author]
        }
    }

    return { author: topAuthor, blogs: maxBlogs }
}

const mostLikes = (blogs) => {
    const likesCount = {};

    for (let i = 0; i < blogs.length; i++) {
        const author = blogs[i].author;
        const likes = blogs[i].likes;

        if (likesCount[author]) {
            likesCount[author] += likes;
        } else {
            likesCount[author] = likes;
        }
    }

    let topAuthor = "";
    let maxLikes = 0;

    for (const author in likesCount) {
        if (likesCount[author] > maxLikes) {
            topAuthor = author;
            maxLikes = likesCount[author];
        }
    }

    return { author: topAuthor, likes: maxLikes };
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}