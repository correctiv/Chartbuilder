if (process.env.NODE_ENV == "dev") {
	// Include React as a global variable if we are in dev environment.
	// This makes the app useable with React dev tools
	global.React = require("react");
}

var React = require("react");
var chartConfig = require("./charts/chart-config");
var defaultInput = require("./config/default-input");
var ChartServerActions = require("./actions/ChartServerActions");
var Chartbuilder = require("./components/Chartbuilder.jsx");
var dataBySeries = require("./util/parse-data-by-series");

global.createChartBuilder = function(container, options) {

	var model;
	if (options.model) {
		model = options.model;
	} else {
		model = chartConfig.xy.defaultProps;
	}
	if (options.data) {
		var res = dataBySeries(options.data);
		model.chartProps.input = res.input;
	} else {
		model.chartProps.input = {
			raw: '',
			status: "EMPTY",
			valid: false
		};
	}
	ChartServerActions.receiveModel(model);

	var chartbuilder = <Chartbuilder
		showMobilePreview={false}
	/>

	React.render(chartbuilder, container);
	return chartbuilder;
};
