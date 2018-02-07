const { getClientIP } = require('../utils')
let COUNT_MAP = {
    views: 0,
    favs: 0,
    collects: 0
}
let IP_MAP = {
    views: {},
    favs: {},
    collects: {}
}

const get = (req) => {
    let ip = getClientIP(req)
    let result = Object.assign({}, COUNT_MAP)
    Object.keys(COUNT_MAP).map(param => {
        result[param] = {
            count: COUNT_MAP[param],
            ensured: !!IP_MAP[param][ip]
        }
    })
    return result
}
exports.get = get
exports.set = req => {
    let ip = getClientIP(req)
    let param = req.data.param
    if (!IP_MAP[param]) {
        return { error: 'param needed!' }
    } else if (IP_MAP[param][ip]){
        IP_MAP[param][ip] = false
        COUNT_MAP[param]--
    } else {
        console.log(ip)
        IP_MAP[param][ip] = true
        COUNT_MAP[param]++
    }
    return get(req)
}