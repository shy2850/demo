const path = require('path')
const { existsSync, statSync, writeFileSync, appendFileSync } = require('fs')
const uploadDir = path.join(__dirname, '../../uploadDir')
let fileLoaded = {}

// 根据md5获取进度
const md5Valid = url => {
    const md5 = url.split('?')[1]
    const filepath = path.join(uploadDir, md5)
    if (existsSync(filepath)) {
        // 如果找到文件，就获取目前文件大小，以备传给前端对比完整文件大小
        const loaded = statSync(filepath).size
        return fileLoaded[md5] = loaded
    } else {
        return 0
    }
}
const postFile = (req, resp) => new Promise((resolve, reject) => {
    let chuncks = []
    const md5 = req.url.split('?')[1]
    const filepath = path.join(uploadDir, md5)
    req.on('data', data => {
        // 文件大小超出限制
        fileLoaded[md5] = (fileLoaded[md5] | 0) + data.length
        if (fileLoaded[md5] > 20 * 1024 * 1024) {
            resolve({
                error: 'max filesize is 20 * 1024 * 1024'
            })
            return
        }
        if (existsSync(filepath)) {
            appendFileSync(filepath, data)
        } else {
            // writeFileSync执行一次以后就以追加的方式写文件
            writeFileSync(filepath, data)
        }
    }).on('end', () => {
        resolve({})
    }).on('error', err => {
        reject(err)
    })
})

module.exports = (req, resp) => {
    const { method, url } = req
    switch (method.toUpperCase()) {
        case 'GET':
            return {
                loaded: md5Valid(url)
            }
        case 'POST':
            return postFile(req, resp)
    }
}