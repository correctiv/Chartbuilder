
SVGExporter = {
  createSVGFile: function(chart) {
		// Returns a valid svg string representing the chart that can be opened in graphics software

		// retrieve the current size
		var size = chart.getBoundingClientRect();
		var scale_factor = 2;

		chart = this._addIDsForIllustrator(chart);

		// get a useable SVG string using SVG Crowbar
		var svg_content = this.createSVGContent(chart);

		// set the width of the svg in pixels for output
		var svg_string = svg_content.source[0]
			.split('width="100%"').join('width="'+size.width*scale_factor+'"')
			.split('height="100%"').join('height="'+size.height*scale_factor+'"');

		return "data:text/svg," + svg_string;
	},

	embedCSS: function(type) {
		if (type == "add") {
			d3.selectAll("." + this.props.svgWrapperClassName)
				.append("style")
				.attr("type","text/css")
				.html("\n<![CDATA["+this.styleStringify(document.styleSheets)+"]]>\n");
		}
		else {
			d3.selectAll("." + this.props.svgWrapperClassName + " style").remove();
		}
	},

	styleStringify: function(styleSheets) {
		var sheet, style_strings = [], rules, rule;

		for (var i = styleSheets.length - 1; i >= 0; i--) {
			sheet = styleSheets[i];
			if (sheet) {
				if (sheet.rules !== undefined) {
					rules = sheet.rules;
				}
				else {
					rules = sheet.cssRules;
				}

				for (var j = rules.length - 1; j >= 0; j--) {
					if (rules[j].style) {
						rule = this._cleanRulesForIllustrator(rules[j]);
						style_strings.unshift(rule.cssText);
					}
				}
			}
		}

		return style_strings.join("\n");
	},

	_cleanRulesForIllustrator: function(rule) {
		// Adobe Illustrator freaks out with certain style declarations this strips those out
		var styleDec = rule.style;
		var pd;
		for (var i = styleDec.length - 1; i >= 0; i--) {
			orig_prop = styleDec[i];
			orig_dec = styleDec[orig_prop];

			pd = {
				prop: orig_prop,
				dec: orig_dec
			};

			pd = this._cleanRuleOfExtraFonts(pd);

			rule.style[pd.prop] = pd.dec;

			rule.cssText = rule.cssText.split(orig_prop + ":" + orig_dec + ";")
										.join(pd.prop + ":" + pd.dec + ";");
		}

		return rule;
	},

	_addIDsForIllustrator: function(node) {
		var chart = d3.select(node);
		var classAttr = "";

		chart
			.attr("id","chartbuilder-export")
			.selectAll("g")
			.attr("id",function(d,i){
				try {
					classAttr = this.getAttribute("class").split(" ");
					return classAttr.join("::") + (classAttr == "tick" ? "::" + this.textContent : "");
				}
				catch(e) {
					return null;
				}
			});

		return chart[0][0];
	},

	_cleanRuleOfExtraFonts: function(pd) {
		// Adobe Illustrator freaks out with fallback fonts, remove fallback fonts
		if(pd.prop == "font-family") {
			pd.dec = pd.dec.split(",")[0];
		}

		return {"prop":pd.prop,"dec":pd.dec};
	},

	createSVGContent: function(svg) {
		/*
			Copyright (c) 2013 The New York Times

			Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
			The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

			SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
		*/

		//via https://github.com/NYTimes/svg-crowbar

		var prefix = {
			xmlns: "http://www.w3.org/2000/xmlns/",
			xlink: "http://www.w3.org/1999/xlink",
			svg: "http://www.w3.org/2000/svg"
		};

		var doctype = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';

		svg.setAttribute("version", "1.1");

		var defsEl = document.createElement("defs");
		svg.insertBefore(defsEl, svg.firstChild); //TODO   .insert("defs", ":first-child")

		var styleEl = document.createElement("style");
		defsEl.appendChild(styleEl);
		styleEl.setAttribute("type", "text/css");

		// removing attributes so they aren't doubled up
		svg.removeAttribute("xmlns");
		svg.removeAttribute("xlink");

		// These are needed for the svg
		if (!svg.hasAttributeNS(prefix.xmlns, "xmlns")) {
			svg.setAttributeNS(prefix.xmlns, "xmlns", prefix.svg);
		}

		if (!svg.hasAttributeNS(prefix.xmlns, "xmlns:xlink")) {
			svg.setAttributeNS(prefix.xmlns, "xmlns:xlink", prefix.xlink);
		}

		//TODO atually get the styles
		var styles = "";

		var source = (new XMLSerializer()).serializeToString(svg).replace('</style>', '<![CDATA[' + this.styleStringify(document.styleSheets) + ']]></style>');

		return {svg: svg, source: [doctype + source]};
	}
};

module.exports = SVGExporter;
