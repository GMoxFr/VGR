const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
    transpileDependencies: true,
    publicPath: '/',
    configureWebpack: {
        module: {
            rules: [
                {
                    test: /config.*config\.js$/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: 'config.js'
                            },
                        }
                    ]
                }
            ]
        }
    }
})
