const { argv } = process
const build = argv[argv.length - 1] === 'build'
const { onRoute, beforeRoute } = require('./serve/index')
module.exports = {
    no_host: true,
    port: 8080,
    livereload: !build,
    build,
    gzip: true,
    buildFilter: pathname => !pathname || /^\/?(src|fonts)(\/.*)?/.test(pathname),
    middlewares: [
        {
            middleware: 'template',
            test: /index\.html?/
        }
    ],
    beforeRoute,
    onRoute,
    // output: require('path').join(__dirname, '../f2e-output')
}
