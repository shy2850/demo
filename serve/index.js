const {
    Route,
    out: {
        JsonOut,
        JsonpOut,
        ServerSent
    }
} = require('f2e-serve')
const stars = require('./stars/store')
const { commit_sourcemap_path } = require('./sourcemap')

const route = new Route()
route.on('stars.get', JsonpOut(stars.get))
route.on('stars.set', JsonpOut(stars.set))
route.on('commit_sourcemap_path', commit_sourcemap_path)

exports.onRoute = (pathname, req, resp, memory) => {
    try {
        return route.execute(pathname, req, resp, memory)
    } catch (error) {
        JsonOut(() => ({ error: error.toString() }))(req, resp)
        return false
    }
}

// if need update
const beforeRoute = new Route()
beforeRoute.on('upload.file', JsonOut(require('./upload')))

exports.beforeRoute = (pathname, req, resp, memory) => {
    try {
        return beforeRoute.execute(pathname, req, resp, memory)
    } catch (error) {
        JsonOut(() => ({ error: error.toString() }))(req, resp)
        return false
    }
}