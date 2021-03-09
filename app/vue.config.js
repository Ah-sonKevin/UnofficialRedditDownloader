const path = require("path");
const { HOST, PORT } = require("./src/info/serverInfo");

module.exports = {
	devServer: {
		proxy: {
			"^/api": {
				target: `${process.env.HOST}:${process.env.HOST_PORT}`,
				changeOrigin: true,
			},
		},
	},
	chainWebpack: (config) => {
		config.resolve.alias.set(
			"@managerComponents",
			path.resolve(__dirname, "src/components/ManagerComponents"),
		);
		config.resolve.alias.set(
			"@homeComponents",
			path.resolve(__dirname, "src/components/HomeComponents"),
		);
		config.resolve.alias.set("@", path.resolve(__dirname, "src"));
	},
	pluginOptions: {
		webpackBundleAnalyzer: {
			openAnalyzer: false,
		},
	},
};
