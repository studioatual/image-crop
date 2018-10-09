const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'app.js',
        path: path.resolve(__dirname, 'dist')
    },
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: true,
        port: 9000
    },
    mode: 'development',
    watch: true,
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: ['stage-0']
                }
            }
        ]
    },
    resolve: {
        alias: {
          '@': path.join(__dirname, 'src')
        },
        extensions: ['*', '.js']
    },
    externals: {
        path: "commonjs path"
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Simple Image Crop',
            template: 'src/index.html',
            filename: 'index.html'
        })
    ]
}