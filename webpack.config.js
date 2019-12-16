const fs = require('fs');
module.exports = {
    devServer: {
        host: '0.0.0.0', // you can change this ip with your ip
        port: 8080,       // ssl defult port number
        inline: true,
        historyApiFallback: true,
        publicPath: '/',
        contentBase: './dist',
        disableHostCheck: true,
        clientLogLevel: "error" | "info" | "trace",
        https: {
            key: fs.readFileSync('./private.key'),
            cert: fs.readFileSync('./private.crt'),
            ca: fs.readFileSync('./private.pem')
        }
    }
};