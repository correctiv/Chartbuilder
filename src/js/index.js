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
var SVGExporter = require('./util/svg-exporter');

global.createChartBuilder = function(container, options) {

	var model;
	if (options.model) {
		model = options.model;
	} else {
		model = chartConfig.xy.defaultProps;
		model.metadata.credit = "";
	}
	if (options.data) {
		var res = dataBySeries(options.data);
		model.chartProps.input = res.input;
	} else {
		model.chartProps.input = {
			raw: 'date\tJuice\tTravel\n2000-01-01\t106.3\t49.843099\n2000-02-01\t106.0\t49.931931\n2000-03-01\t105.4\t61.478163',
			status: "VALID",
			valid: true
		};
	}
	ChartServerActions.receiveModel(model);

	var chartbuilder = <Chartbuilder
		showMobilePreview={false}
	/>

	React.render(chartbuilder, container);
	return {
		chartbuilder: chartbuilder,
		SVGExporter: SVGExporter
	};
};
