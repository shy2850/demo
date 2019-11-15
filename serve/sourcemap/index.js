const H = {
    http: require('http'),
    https: require('https'),
}
const fs = require('fs')
const path = require('path')
const url = require('url')
const MemoryTree = require("memory-tree").default
const sourceMapResolve = require("source-map-resolve")
const { execSync } = require('child_process')

const getInfo = (_url) => new Promise((resolve, reject) => {
    const h = /^https\:\/\//.test(_url) ? H.https : H.http
    try {
        h.get(_url, function (res) {
            let data = []
            res.on('data', d => data.push(d))
            res.on('end', function () {
                const body = Buffer.concat(data).toString()
                resolve(body)
            }).on('error', reject)
        }).on('error', reject)
    } catch (e) {
        reject(e)
    }
})


exports.commit_sourcemap_path = (req, resp) => {
    const _url = req.data.url
    const { host, pathname, href } = url.parse(_url)
    const root = path.join(__dirname, `../../uploadDir/${host}`)
    if (!fs.existsSync(root)) {
        fs.mkdirSync(root)
    }
    const mem = MemoryTree({
        root,
        dest: root
    })

    const reject = e => resp.end('error')
    getInfo(_url)
    .then(code => {
        sourceMapResolve.resolve(code, pathname, function (p, cb) {
            getInfo(url.resolve(href, p)).then(body => cb(null, body)).catch(cb)
        }, function (e, result) {
            if (e || !result) {
                reject(e)
            } else {
                const { sourcesResolved, sourcesContent } = result
                sourcesResolved.map((pathname, i) => {
                    mem.store._set(pathname, sourcesContent[i])
                })
                mem.output().then(() => {
                    execSync(`zip -r ${root}.zip ${root}`)
                    fs.createReadStream(`${root}.zip`).pipe(resp)
                }).catch(reject)
            }
        })
    })
        .catch(reject)
    return false
}