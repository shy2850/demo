const path = require('path')
const { existsSync, readFileSync, writeFileSync, appendFileSync } = require('fs')
const uploadDir = path.join(__dirname, '../../uploadDir')
let fileLoaded = {}

const md5Valid = url => {
    const md5 = url.split('?')[1]
    const filepath = path.join(uploadDir, md5)
    if (existsSync(filepath)) {
        const loaded = readFileSync(filepath).buffer.byteLength
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
        if (existsSync(filepath)) {
            appendFileSync(filepath, data)
        } else {
            writeFileSync(filepath, data)
        }
        fileLoaded[md5] = (fileLoaded[md5] | 0) + data.length
        if (fileLoaded[md5] > 20 * 1024 * 1024) {
            reject(new Error('max filesize is 20 * 1024 * 1024'))
            req.abort()
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