///<reference path="DefinitelyTyped/d3/d3.d.ts" />
///<reference path="DefinitelyTyped/underscore/underscore.d.ts" />
///<reference path="DefinitelyTyped/jquery/jquery.d.ts" />
///<reference path="Dimension.ts" />
///<reference path="TimelineGroup.ts" />
/**
 * Represent chart part of scheduler
 */
var TimelineChart = (function () {
    /**
     * Constructor
     * @param dimension
     */
    function TimelineChart(dimension) {
        // Root DOM
        this.chartModuleDom = null;
        // Chart SVG, pointer to the actual SVG element.
        this.chartSvg = null;
        // Storing Row Height, injectable from method.
        this.rowHeight = 21;
        // Chart output range, default to 2400
        this.chartRange = 2400;
        // Business hours
        this.chartStart = null;
        this.chartEnd = null;
        // X Axis Format
        this.axisFormat = "%I:%M";
        this.tooltipClass = "tooltip";
        if (!dimension) {
            throw new Error("Dimension is not set. ");
        }
        this.aDimension = dimension;
        var date = new Date();
        var today = date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate();
        var start = new Date(today + " 00:00:00");
        var end = new Date(today + " 23:59:59");
        this.setBusinessHours(start, end);
    }
    TimelineChart.prototype.dimension = function () {
        return this.aDimension;
    };
    TimelineChart.prototype.setRowHeight = function (height) {
        this.rowHeight = height;
    };
    TimelineChart.prototype.height = function () {
        var defaultHeight = +this.dimension().height();
        return this.aHeight > defaultHeight ? this.aHeight : defaultHeight;
    };
    TimelineChart.prototype.width = function () {
        return this.dimension().width();
    };
    TimelineChart.prototype.setData = function (data) {
        this.aData = data;
    };
    TimelineChart.prototype.drawTimeline = function () {
        var xScale = this.xScale = this.updateXAxis();
        var xAxis = d3.svg.axis().scale(xScale).orient("top").ticks(d3.time.minutes, 30).tickSize(6).tickFormat(d3.time.format(this.axisFormat));
        this.timelineSvg.attr("width", this.chartRange).attr("class", "changed").append("g").attr("class", "axis").attr("transform", "translate(0, " + (TimelineChart.timelineHeight - 1) + ")").call(xAxis);
    };
    /**
     * Set up chart, timeline
     * @param moduleName
     * @param gParent
     * @param data
     * @param marginLeft
     */
    TimelineChart.prototype.init = function (moduleName, gParent, data, marginLeft) {
        this.gParent = gParent;
        this.moduleName = moduleName;
        this.aData = data;
        var theoreticalWidth = this.chartRange;
        var theoreticalHeight = this.aHeight = Object.keys(data).length * this.rowHeight;
        // `chart-module` DOM
        var chartModuleDom = this.gParent.append("div");
        chartModuleDom.attr("id", this.moduleName + "-chart").attr("class", "chart-module");
        chartModuleDom.attr("style", "height: " + this.dimension().height() + "px; margin-left: " + (marginLeft + 1) + "px;");
        // `chart-inner` DOM
        var chartInnerDom = chartModuleDom.append("div");
        chartInnerDom.attr("class", "chart-inner");
        // Timeline DOM
        var chartTimelineDom = chartInnerDom.append("div");
        chartTimelineDom.attr("class", "chart-timeline").attr("style", "height: " + TimelineChart.timelineHeight + "px; ");
        // Timeline SVG
        var timelineSvg = chartTimelineDom.append("svg");
        timelineSvg.attr("height", TimelineChart.timelineHeight);
        this.timelineSvg = timelineSvg;
        // Timeline Scrollable Div
        var chartScrollableDom = chartInnerDom.append("div");
        var remainingWidth = this.dimension().height() - TimelineChart.timelineHeight;
        chartScrollableDom.attr("class", TimelineChart.scrollableTimelineClass);
        chartScrollableDom.attr("style", "height: " + remainingWidth + "px");
        // Timeline Chart SVG
        var chartSvg = chartScrollableDom.append("svg");
        chartSvg.attr("width", theoreticalWidth).attr("height", theoreticalHeight);
        // Timeline Chart Grid
        var ticks = 24 * 2;
        var xGridScale = d3.scale.linear().domain([0, theoreticalWidth]).range([0, theoreticalWidth]);
        var xGrid = d3.svg.axis().scale(xGridScale).orient("bottom").ticks(ticks).tickFormat("").tickSize(-theoreticalWidth, 0);
        chartSvg.append("g").attr("class", "grid").attr("transform", "translate(0," + theoreticalWidth + ")").call(xGrid);
        // Tooltip
        this.tooltip = chartScrollableDom.append("div").attr("class", this.tooltipClass).style("opacity", 0);
        this.tooltipInner = this.tooltip.append("foreignObject").append("div").attr("class", "inner");
        this.chartModuleDom = chartModuleDom;
        this.chartSvg = chartSvg;
    };
    /**
     * This will re-calculate and update the current x axis scaling.
     * Shall be called, after changing business hours, or chart width.
     * @returns {d3.time.Scale<any, number>}
     */
    TimelineChart.prototype.updateXAxis = function () {
        var start = this.chartStart.getTime();
        var end = this.chartEnd.getTime();
        this.chartRange = (end - start) / 36000;
        this.xScale = d3.time.scale().domain([start, end]).range([0, this.chartRange]);
        return this.xScale;
    };
    TimelineChart.prototype.onMouseOver = function (svg, data, i) {
    };
    TimelineChart.prototype.onMouseOut = function (svg, data, i) {
    };
    TimelineChart.prototype.onClick = function (svg, data, i) {
    };
    TimelineChart.prototype.titleOnHover = function (svg, instance) {
    };
    /**
     * Draw actual data onto the chart!
     */
    TimelineChart.prototype.drawData = function () {
        var _this = this;
        // Timeline SVG timeline
        this.drawTimeline();
        // Update length
        this.chartSvg.attr("width", this.chartRange);
        var that = this;
        var baseG = this.chartSvg.append("g").attr("transform", "translate(0, 0)").attr("class", "node-chart");
        var g = baseG.selectAll("g").data(d3.values(this.aData));
        var rowHeight = this.rowHeight;
        var defFilter = baseG.append("defs").append("filter").attr({
            x: 0,
            y: 0,
            width: "200%",
            height: "200%",
            id: "f1"
        });
        defFilter.append("feOffset").attr({
            result: "offOut",
            "in": "SourceGraphic",
            dx: 2,
            dy: 7
        });
        defFilter.append("feGaussianBlur").attr({
            result: "blurOut",
            "in": "matrixOut",
            stdDeviation: 10
        });
        defFilter.append("feBlend").attr({
            "in": "SourceGraphic",
            in2: "blurOut",
            mode: "normal"
        });
        var gEnter = g.enter().append("g").attr("class", "chart-row").attr("transform", function (d, i) {
            return "translate(0, " + rowHeight * i + ")";
        }).attr("data-y", function (d, i) {
            return rowHeight * i;
        });
        var blockG = gEnter.selectAll("g").data(function (d, i) {
            return d;
        }).enter().append("g").attr("transform", function (d) {
            return "translate(" + _this.xScale(d.starting_time) + ", 0)";
        }).attr("class", "block").attr("data-x", function (d) {
            return _this.xScale(d.starting_time);
        }).on("mouseover", function (d, i) {
            that.onMouseOver(this, d, i);
        }).on("mouseout", function (d, i) {
            that.onMouseOut(this, d, i);
        }).on("click", function (d, i) {
            that.onClick(this, d, i);
        });
        blockG.append("rect").attr("fill", function (d) {
            return d.type.backgroundColor;
        }).attr("height", function (d) {
            return d.type.height;
        }).attr("width", function (d) {
            return _this.xScale(new Date(d.ending_time)) - _this.xScale(new Date(d.starting_time));
        }).attr("stroke-width", function (d) {
            return d.type.hasOwnProperty("strokeWidth") ? d.type.strokeWidth : 0;
        }).attr("stroke", function (d) {
            return d.type.hasOwnProperty("stroke") ? d.type.stroke : 0;
        }).attr("rx", function (d) {
            return d.type.hasOwnProperty("round") ? d.type.round : 0;
        }).attr("style", function (d) {
            var style = "";
            style += "stroke-opacity: " + (d.type.opacity / 2) + ";";
            style += "fill-opacity: " + d.type.opacity + ";";
            if (d.type.hasLabel) {
                style += "filter: url(#f1);";
            }
            return style;
        }).attr("y", function (d) {
            if (d.type.height < rowHeight) {
                return (rowHeight - d.type.height) / 2;
            }
        });
        // Title Box [Optional]
        // Insert a title into svg element to allow A tag-liked description box.
        // Override to make custom title box.
        var titleDesc = blockG.filter(function (d) {
            return !!(d.type.hasOwnProperty("hasLabel") && d.type.hasLabel === true);
        }).append("svg:title");
        this.titleOnHover(titleDesc, this);
        // Block Labeling
        blockG.filter(function (d) {
            return !!(d.type.hasOwnProperty("hasLabel") && d.type.hasLabel === true);
        }).append("text").text(that.labeling).attr("dx", function (d) {
            return d.type.hasOwnProperty("round") ? d.type.round + 3 : 3;
        }).attr("dy", function () {
            return rowHeight / 2;
        }).attr("style", function (d) {
            return "fill: " + d.type.foregroundColor + "; font-size: " + (d.type.hasOwnProperty("fontSize") ? d.type.fontSize : 12) + "px";
        }).attr("dominant-baseline", "central");
    };
    TimelineChart.prototype.clearAll = function () {
        this.chartSvg.selectAll("*").remove();
    };
    TimelineChart.prototype.clearNodes = function () {
        this.chartSvg.selectAll(".node-chart").remove();
    };
    TimelineChart.prototype.clearTimeline = function () {
        this.timelineSvg.selectAll("g").remove();
    };
    /**
     * Default data-binding on labels
     * @param d
     * @param i
     * @returns {any}
     */
    TimelineChart.prototype.labeling = function (d, i) {
        return d.place;
    };
    /**
     * Set domain for business hours to display in chart.
     * @param start
     * @param end
     */
    TimelineChart.prototype.setBusinessHours = function (start, end) {
        this.chartStart = start;
        this.chartEnd = end;
        // Update x axis scaling
        this.updateXAxis();
    };
    /**
     * Short form / Alias for setting daily business hours
     * @param date
     */
    TimelineChart.prototype.setDate = function (date) {
        var startTime = "00:00:00", endTime = "23:59:59";
        this.setBusinessHours(new Date(date + " " + startTime), new Date(date + " " + endTime));
    };
    /**
     * Get chart svg height.
     * If total # of rows don't make up the height of defined one, use the actual svg height,
     * otherwise use the defined one.
     * @returns {number}
     */
    TimelineChart.prototype.getChartSVGHeight = function () {
        var moduleHeight = +$("#" + this.moduleName).height();
        var svgHeight = +this.chartSvg.attr("height");
        return moduleHeight < svgHeight ? moduleHeight : svgHeight;
    };
    /**
     * Show tooltip of the current hovering object
     * Usage:
     *   instance.showTooltip(currentInstance).html(...) <- insert code
     * @returns {any}
     */
    TimelineChart.prototype.showTooltip = function (currentInstance) {
        var _this = this;
        this.tooltip.transition().duration(300).attr("style", function () {
            var currentRow = d3.select(currentInstance).select(function () {
                return this.parentNode;
            }).node();
            var currentHeight = _this.getChartSVGHeight();
            var currentY = +d3.select(currentRow).attr("data-y");
            var halfed = (currentY - $("." + TimelineChart.scrollableTimelineClass, "#" + _this.moduleName).scrollTop()) > (currentHeight / 2);
            // Calculate relative position of tooltip box
            var toolTipDom = _this.tooltip.node().getBoundingClientRect();
            var halfRowHeight = _this.rowHeight / 2;
            var halfBarHeight = (+d3.select(currentInstance).select("rect").attr("height")) / 2;
            var offset = halfed ? halfRowHeight - halfBarHeight - toolTipDom.height : halfRowHeight + halfBarHeight;
            return "opacity: 1; left: " + d3.select(currentInstance).attr("data-x") + "px; top: " + (+d3.select(currentRow).attr("data-y") + offset) + "px";
        });
        return this.tooltipInner;
    };
    /**
     * Hiding tooltip
     * @returns {any}
     */
    TimelineChart.prototype.hideTooltip = function () {
        this.tooltip.attr("style", function () {
            return "opacity: 0;";
        });
        return this.tooltipInner;
    };
    // Timeline CSS Class Name, used to do some jQuery stuff.
    TimelineChart.scrollableTimelineClass = "timeline-scrollable";
    // Timeline Div Height
    TimelineChart.timelineHeight = 21;
    return TimelineChart;
})();
