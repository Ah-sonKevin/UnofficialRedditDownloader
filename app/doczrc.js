import path from 'path';
import webpackCfg from './webpack.config.js';

const changeConfig = config => {
    config.resolve.alias = {
        ...config.resolve.alias,
        ...webpackCfg.resolve.alias,
    };
    //changed some other settings here (specific loaders, etc)

    return config;
};

export default {
    modifyBundlerConfig: changeConfig,
};