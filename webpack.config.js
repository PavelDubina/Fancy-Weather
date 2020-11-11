let path = require('path')
module.exports = {
    entry: ['@babel/polyfill', './src/index.js'],
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'main.js'
    },
    module: {
        rules: [{
                test: /\.m?js$/,
                exclude: /node_modules/,
                loader: "babel-loader"
            }
        ]
    }
}