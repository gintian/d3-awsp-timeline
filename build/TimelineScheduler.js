///<reference path="DefinitelyTyped/d3/d3.d.ts" />
///<reference path="DefinitelyTyped/jquery/jquery.d.ts" />
///<reference path="DefinitelyTyped/underscore/underscore.d.ts" />
///<reference path="TimelineChart.ts" />
///<reference path="TimelineGroup.ts" />
///<reference path="Dimension.ts" />
/**
 * Timeline Scheduler
 *
 * @author Anthony S. Wu <anthony@ssetp.com>
 */
var TimelineScheduler = (function () {
    function TimelineScheduler(target, dimension, data, chart, grouping) {
        if (!target || !dimension || !chart || !grouping) {
            throw new Error("Unable to initialize class. ");
        }
        this.targetName = target;
        // Get target stem
        this.targetStem = TimelineScheduler.getStem(target);
        // Chart & Groups
        this.chart = chart;
        this.grouping = grouping;
        // Data
        this.aData = data;
        // Timeline scheduler dimension settings
        this.aDimension = dimension;
        // Begin to initialize root frame
        this.initGParent(target);
    }
    /**
     * Get stem of the target name, dispatch its front property such as . or #
     * @param targetName
     * @returns {string}
     */
    TimelineScheduler.getStem = function (targetName) {
        return targetName.replace("#", "").replace(".", "");
    };
    /**
     * Get dimension
     * @returns {Dimension}
     */
    TimelineScheduler.prototype.dimension = function () {
        return this.aDimension;
    };
    /**
     * Return selected target.
     * @returns {any}
     */
    TimelineScheduler.prototype.target = function () {
        return this.aTarget;
    };
    /**
     * Convert data based on a groupBy key.
     * @param data
     * @param groupBy
     * @returns {Dictionary<T[]>|Dictionary<TValue[]>|_.Dictionary<T[]>}
     */
    TimelineScheduler.processData = function (data, groupBy) {
        return _.groupBy(data, groupBy);
    };
    /**
     * Initialize G parent.
     * @param target
     */
    TimelineScheduler.prototype.initGParent = function (target) {
        this.aTarget = d3.select(target);
        this.aTarget.attr("class", TimelineScheduler.scheduleModuleClass).attr("style", "width: " + this.dimension().width() + "px; height: " + this.dimension().height() + "px;");
        var aTargetInner = this.aTarget.append("div");
        aTargetInner.attr("class", TimelineScheduler.scheduleInnerClass);
        // Draw them out!
        this.grouping.init(this.targetStem, aTargetInner, this.aData);
        this.chart.init(this.targetStem, aTargetInner, this.aData, this.grouping.dimension().width());
        // Scrolling
        $("." + TimelineChart.scrollableTimelineClass, this.targetName).on("scroll", function () {
            $("." + TimelineScheduler.listModuleClass, this.targetName).scrollTop($(this).scrollTop());
            $("." + TimelineScheduler.chartTimelineClass, this.targetName).scrollLeft($(this).scrollLeft());
        });
    };
    /**
     * Main renderer
     */
    TimelineScheduler.prototype.render = function () {
        this.grouping.drawData();
        this.chart.drawData();
    };
    TimelineScheduler.scheduleModuleClass = "scheduler-module";
    TimelineScheduler.scheduleInnerClass = "scheduler-inner";
    TimelineScheduler.listModuleClass = "list-module";
    TimelineScheduler.chartTimelineClass = "chart-timeline";
    return TimelineScheduler;
})();
