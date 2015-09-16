// Export chart to PNG or SVG

var React = require('react');
var update = React.addons.update;
var cx = React.addons.classSet;
var PropTypes = React.PropTypes;
var d3 = require("d3");

var Button = require("chartbuilder-ui").Button;
var saveSvgAsPng = require("save-svg-as-png");
var SVGExporter = require('../util/svg-exporter');

function outerHTML(el) {
	var outer = document.createElement("div");
	outer.appendChild(el);
	return outer.innerHTML;
}

/**
 * ### Buttons that allow the user to export a chart to an image or Svg.
 * @instance
 * @memberof editors
 */
var ChartExport = React.createClass({

	propTypes: {
		stepNumber: PropTypes.string,
		svgWrapperClassName: PropTypes.string.isRequired,
		sendBase64String: PropTypes.func
	},

	getInitialState: function() {
		return {
			enableSvgExport: true
		};
	},

	componentDidMount: function() {
		var enableSvgExport;
		var chartNode = null;

		// SVG output won't work on most non-Chrome browsers, so we try it first. If
		// `createSVGFile()` doesnt work we will disable svg download but still allow png.
		// TODO: figure out what exactly is breaking FF
		var chart = document
			.getElementsByClassName(this.props.svgWrapperClassName)[0]
			.getElementsByClassName("renderer-svg")[0];

		try {
			var svgHref = SVGExporter.createSVGFile(chart);
			enableSvgExport = true;
			chartNode = chart;
		} catch (e) {
			enableSvgExport = false;
		}

		this.setState({
			chartNode: chart,
			enableSvgExport: enableSvgExport
		});
	},

	componentWillReceiveProps: function(nextProps) {
		var chart = document
			.getElementsByClassName(this.props.svgWrapperClassName)[0]
			.getElementsByClassName("renderer-svg")[0];

		this.setState({ chartNode: chart });
	},

	_makeFilename: function(extension) {
		var filename = this.props.data.reduce(function(a, b, i) {
			if (a.length === 0) {
				return b.name;
			} else {
				return [a, b.name].join("_");
			}
		}, this.props.metadata.title);
		return [
			(filename + "_chartbuilder").replace(/\s/g, "_"),
			extension
		].join(".");
	},

	createSVGOutput: function(callback) {
		// updates the download links with the data-uris and download file names
		var filename = this._makeFilename("svg");
		//clone the svg so that the image creation and svg creation don't conflict
		return {
			download: filename,
			href: SVGExporter.createSVGFile(this.state.chartNode)
		};
	},

	downloadPNG: function() {
		filename = this._makeFilename("png");
		saveSvgAsPng.saveSvgAsPng(this.state.chartNode, filename, { scale: 2.0 });
	},

	downloadSVG: function() {
		var output = this.createSVGOutput();
		var a = document.createElement('a');
		a.download = output.download;
		a.href = output.href;
		document.body.appendChild(a);
		a.addEventListener("click", function(e) {
			a.parentNode.removeChild(a);
		});
		a.click();
	},

	setAdvancedOptionState: function() {
		this.setState({
			showAdvancedOptions: !this.state.showAdvancedOptions
		});
	},

	render: function() {
		var self = this;

		var chartExportButtons = [
			<Button
				key="png-export"
				className="export-button"
				onClick={this.downloadPNG}
				text="Download Image"
			/>
		];
		if (this.state.enableSvgExport) {
			chartExportButtons.push(
				<Button
					key="svg-export"
					className="export-button"
					onClick={this.downloadSVG}
					text="Download SVG"
				/>
			);
		}

		return (
			<div className="editor-options">
				<h2><span className="step-number">{this.props.stepNumber}</span><span>Export your chart</span></h2>
					<div className="export-button-wrapper">
						{chartExportButtons}
					</div>
			</div>
		);
	}
})

module.exports = ChartExport;
