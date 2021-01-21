const path = require('path');

module.exports = {
    devServer: {
        proxy: {
            '^/api': {
                target: 'http://localhost:3080',
                changeOrigin: true,
            }
        }
    },
        chainWebpack: config => {
        config.resolve.alias.set('@managerComponents', path.resolve(__dirname, 'src/components/ManagerComponents'));
        config.resolve.alias.set('@', path.resolve(__dirname, 'src'));
    },

    
};