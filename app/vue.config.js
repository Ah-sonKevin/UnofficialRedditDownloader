const path = require("path");
import { HOST, PORT } from "./src/helper/serverInfo";

module.exports = {
	devServer: {
		proxy: {
			"^/api": {
				target: `${HOST}:${PORT}`,
				changeOrigin: true,
			},
		},
	},
	chainWebpack: config => {
		config.resolve.alias.set(
			"@managerComponents",
			path.resolve(__dirname, "src/components/ManagerComponents"),
		);
		config.resolve.alias.set("@", path.resolve(__dirname, "src"));
	},
	pluginOptions: {
		webpackBundleAnalyzer: {
			openAnalyzer: false,
		},
	},
};
