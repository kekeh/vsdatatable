/* 
*  Name: dpdaterangepicker 
*  Description: Date range picker - AngularJS reusable UI component 
*  Version: 0.1.1 
*  Author: kekeh 
*  Homepage: http://kekeh.github.io/dpdaterangepicker 
*  License: MIT 
*  Date: 2015-08-06 
*/ 
angular.module('template-dpdaterangepicker-0.1.1.html', ['templates/dpdaterangepicker.html']);

angular.module("templates/dpdaterangepicker.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/dpdaterangepicker.html",
    "<div class=\"dpdaterangepicker\" ng-style=\"{'width':width}\">\n" +
    "    <div class=\"vstooltip\" ng-show=\"showTooltip\" ng-mouseleave=\"showTooltip=false\"><span class=\"vstooltiptext\">{{selectedRangeTxt}}</span></div>\n" +
    "    <div class=\"dpselectiongroup\" ng-click=\"picker($event)\">\n" +
    "        <span class=\"dpselection\" ng-style=\"{'line-height': height}\" ng-click=\"picker($event)\" tooltip-window>{{selectedRangeTxt}}</span>\n" +
    "        <span class=\"dpselbtngroup\" ng-style=\"{'height': height}\">\n" +
    "            <button class=\"dpbtnclear\" ng-show=\"selectedRangeTxt.length > 0\" ng-click=\"clearSelection($event)\"><span class=\"icon icon-cross\"></span></button>\n" +
    "            <button class=\"dpbtnpicker\" ng-click=\"picker($event)\"><span class=\"icon icon-calendar\"></span></button>\n" +
    "        </span>\n" +
    "    </div>\n" +
    "    <div class=\"dpselector\" ng-if=\"showSelector\">\n" +
    "        <div class=\"dptitlearea\" ng-class=\"{'dptitlerangeok': rangeOk, 'dptitlerangenotok': !rangeOk}\">\n" +
    "            <div class=\"dptitleareatxt\">{{titleTxt}}</div>\n" +
    "        </div>\n" +
    "        <table class=\"dpheader\">\n" +
    "            <tr>\n" +
    "                <td>\n" +
    "                    <div style=\"float:left\">\n" +
    "                        <div class=\"dpheaderbtn\" ng-click=\"prevMonth()\"><span class=\"icon icon-left\"></span></div>\n" +
    "                        <div class=\"dpheadermonthtxt\" ng-bind=\"visibleMonth.monthTxt\"></div>\n" +
    "                        <div class=\"dpheaderbtn\" ng-click=\"nextMonth()\"><span class=\"icon icon-right\"></span></div>\n" +
    "                    </div>\n" +
    "                </td>\n" +
    "                <td>\n" +
    "                    <button class=\"dpheadertodaybtn\" ng-click=\"today()\">{{options.buttons.todayBtnText!==undefined?options.buttons.todayBtnText:cf.buttons.todayBtnText}}</button>\n" +
    "                </td>\n" +
    "                <td>\n" +
    "                    <div style=\"float:right\">\n" +
    "                        <div class=\"dpheaderbtn\" ng-click=\"prevYear()\"><span class=\"icon icon-left\"></span></div>\n" +
    "                        <div class=\"dpheaderyeartxt\" ng-bind=\"visibleMonth.year\"></div>\n" +
    "                        <div class=\"dpheaderbtn\" ng-click=\"nextYear()\"><span class=\"icon icon-right\"></span></div>\n" +
    "                    </div>\n" +
    "                </td>\n" +
    "            </tr>\n" +
    "        </table>\n" +
    "        <table class=\"dptable\">\n" +
    "            <thead><tr><th ng-repeat=\"d in weekDays track by $index\" ng-bind=\"d\"></th></tr></thead>\n" +
    "            <tbody>\n" +
    "                <tr ng-repeat=\"w in dates track by $index\">\n" +
    "                    <td ng-repeat=\"d in w track by $index\" ng-class=\"{'dpcurrmonth':d.cmo===cf.CURR_MONTH,'dpcurrday':d.currDay && (options.currDayHighlight!==undefined?options.currDayHighlight:cf.currDayHighlight),'dpselectedday':selectedDate.day===d.day && selectedDate.month===d.month && selectedDate.year===d.year && d.cmo===cf.CURR_MONTH}\" ng-click=\"cellClicked(d)\">\n" +
    "                        <span style=\"background-color:inherit\" ng-class=\"{'dpprevmonth':d.cmo===cf.PREV_MONTH,'dpcurrmonth':d.cmo===cf.CURR_MONTH,'dpnextmonth':d.cmo===cf.NEXT_MONTH,'dpsunday':d.sun && d.cmo===cf.CURR_MONTH && (options.sunHighlight!==undefined?options.sunHighlight:cf.sunHighlight)}\" ng-bind=\"d.day\"></span>\n" +
    "                    </td>\n" +
    "                </tr>\n" +
    "            </tbody>\n" +
    "        </table>\n" +
    "        <div class=\"dpfooterarea\">\n" +
    "            <button class=\"dpfooterbtn\" ng-class=\"{'dpbtndisable': !rangeOk}\" ng-disabled=\"!rangeOk\" ng-show=\"beginDateStep\" ng-click=\"toEndDate()\">{{options.buttons.nextBtnText!==undefined?options.buttons.nextBtnText:cf.buttons.nextBtnText}}</button>\n" +
    "            <button class=\"dpfooterbtn\" ng-show=\"!beginDateStep\" ng-click=\"toBeginDate()\">{{options.buttons.prevBtnText!==undefined?options.buttons.prevBtnText:cf.buttons.prevBtnText}}</button>\n" +
    "            <button class=\"dpfooterbtn\" ng-class=\"{'dpbtndisable': !rangeOk}\" ng-disabled=\"!rangeOk\" ng-show=\"!beginDateStep\" ng-click=\"accept()\">{{options.buttons.okBtnText!==undefined?options.buttons.okBtnText:cf.buttons.okBtnText}}</button>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module('dpdaterangepicker', ["template-dpdaterangepicker-0.1.1.html"])

/**
 * @ngdoc object
 * @name dpdaterangeConfig
 * @description dpdaterangeConfig the default values and the constants of the date picker.
 */
    .constant('dpdaterangeConfig', {
        // Configurable values with default value
        monthLabels: {
            1: 'Jan',
            2: 'Feb',
            3: 'Mar',
            4: 'Apr',
            5: 'May',
            6: 'Jun',
            7: 'Jul',
            8: 'Aug',
            9: 'Sep',
            10: 'Oct',
            11: 'Nov',
            12: 'Dec'
        },
        dayLabels: {
            su: 'Sun',
            mo: 'Mon',
            tu: 'Tue',
            we: 'Wed',
            th: 'Thu',
            fr: 'Fri',
            sa: 'Sat'
        },
        dateFormat: 'yyyy-mm-dd',
        buttons: {
            todayBtnText: 'Today',
            nextBtnText: 'Next',
            prevBtnText: 'Previous',
            okBtnText: 'OK'
        },
        beginDateText: 'begin date',
        endDateText: 'end date',
        sunHighlight: true,
        currDayHighlight: true,

        // Constants
        YEAR_CONST: 'yyyy',
        MONTH_CONST: 'mm',
        DATE_CONST: 'dd',
        PREV_MONTH: 1,
        CURR_MONTH: 2,
        NEXT_MONTH: 3,
        DATES_SEPARATOR: ' - ',
        TOOLTIP_SHOW_DELAY: 600,
        HEIGHT: '30px',
        WIDTH: '260px'
    })

/**
 * @ngdoc object
 * @name dpdaterangepicker
 * @description dpdaterangepicker is main directive of the component and it implements the date range picker.
 */
    .directive('dpdaterangepicker', ['$timeout', '$document', function ($timeout, $document) {
        return {
            restrict: 'EA',
            templateUrl: 'templates/dpdaterangepicker.html',
            scope: {
                ngModel: '=?',
                options: '='
            },
            controller: ['$scope', 'dpdaterangeConfig', function ($scope, dpdaterangeConfig) {
                $scope.cf = dpdaterangeConfig;
                $scope.showTooltip = false;
            }],
            link: function (scope, element, attrs) {
                scope.dates = [], scope.weekDays = [];
                scope.selectedRangeTxt = '', scope.titleTxt = '';
                scope.showSelector = false, scope.rangeOk = false, scope.beginDateStep = true;
                scope.selectedDate = {day: 0, month: 0, year: 0};
                scope.visibleMonth = {monthTxt: '', monthNbr: 0, year: 0};
                scope.width = scope.cf.WIDTH, scope.height = scope.cf.HEIGHT;

                var selectedBeginDate = {day: 0, month: 0, year: 0};
                var today = new Date();

                scope.prevMonth = function () {
                    // Previous month selected
                    var m = scope.visibleMonth.monthNbr;
                    var y = scope.visibleMonth.year;
                    if (m === 1) {
                        m = 12;
                        y--;
                    }
                    else {
                        m--;
                    }
                    scope.visibleMonth = {monthTxt: monthText(m), monthNbr: m, year: y};
                };

                scope.nextMonth = function () {
                    // Next month selected
                    var m = scope.visibleMonth.monthNbr;
                    var y = scope.visibleMonth.year;
                    if (m === 12) {
                        m = 1;
                        y++;
                    }
                    else {
                        m++;
                    }
                    scope.visibleMonth = {monthTxt: monthText(m), monthNbr: m, year: y};
                };

                scope.prevYear = function () {
                    // Previous year selected
                    scope.visibleMonth.year--;
                };

                scope.nextYear = function () {
                    // Next year selected
                    scope.visibleMonth.year++;
                };

                scope.today = function () {
                    // Today selected
                    var m = today.getMonth() + 1;
                    scope.visibleMonth = {monthTxt: monthText(m), monthNbr: m, year: today.getFullYear()};
                };

                scope.cellClicked = function (cell) {
                    // Cell clicked in the selector
                    if (cell.cmo === scope.cf.PREV_MONTH) {
                        // Previous month of day
                        scope.prevMonth();
                    }
                    else if (cell.cmo === scope.cf.CURR_MONTH) {
                        // Current month of day
                        handleSelect(cell);
                    }
                    else if (cell.cmo === scope.cf.NEXT_MONTH) {
                        // Next month of day
                        scope.nextMonth();
                    }
                };

                scope.toBeginDate = function () {
                    // Back to begin date selection
                    scope.selectedDate = selectedBeginDate;
                    scope.titleTxt = formatDate(selectedBeginDate);
                    scope.beginDateStep = true;
                    scope.rangeOk = true;
                };

                scope.toEndDate = function () {
                    // To end date selection
                    reset(!angular.isUndefined(scope.options.endDateText) ? scope.options.endDateText : scope.cf.endDateText, false);
                };

                scope.accept = function () {
                    // OK button clicked
                    scope.selectedRangeTxt = scope.titleTxt;
                    scope.showSelector = false;
                    notifyParent(selectedBeginDate, scope.selectedDate);
                };

                scope.picker = function (event) {
                    // Show or hide selector
                    event.stopPropagation();
                    scope.showSelector = !scope.showSelector;
                    if (scope.showSelector) {
                        // Reset values
                        reset(!angular.isUndefined(scope.options.beginDateText) ? scope.options.beginDateText : scope.cf.beginDateText, true);

                        var y = 0, m = 0;
                        // Initial selector month
                        if (scope.options.initSelectorMonth === undefined) {
                            y = today.getFullYear();
                            m = today.getMonth() + 1;
                        }
                        else {
                            y = scope.options.initSelectorMonth.year;
                            m = scope.options.initSelectorMonth.month;
                        }

                        // Set current month
                        scope.visibleMonth = {monthTxt: getMonthLabels()[m], monthNbr: m, year: y};

                        // Create current month
                        createMonth(m, y);
                    }
                };

                scope.clearSelection = function (event) {
                    // Clear selected range
                    event.stopPropagation();
                    scope.selectedRangeTxt = '';
                    scope.selectedDate = {day: 0, month: 0, year: 0};
                    notifyParent(scope.selectedDate, scope.selectedDate);
                };

                scope.$watch('visibleMonth', function (newVal, oldVal) {
                    // Listens the month and the year changes
                    if (newVal !== oldVal) {
                        createMonth(newVal.monthNbr, newVal.year);
                    }
                }, true);

                scope.$watch('ngModel', function (newVal, oldVal) {
                    // Listens the ngModel changes
                    if (newVal !== oldVal && newVal === '') {
                        scope.selectedRangeTxt = newVal;
                    }
                });

                function notifyParent(begin, end) {
                    if (scope.options.dateRangeSelectCb) {
                        scope.options.dateRangeSelectCb(
                            {day: begin.day, month: begin.month, year: begin.year, formatted: formatDate(begin)},
                            {day: end.day, month: end.month, year: end.year, formatted: formatDate(end)},
                            scope.selectedRangeTxt);
                    }
                    scope.ngModel = scope.selectedRangeTxt;
                }

                function reset(titleTxt, beginDateStep) {
                    scope.selectedDate = {day: 0, month: 0, year: 0};
                    scope.titleTxt = titleTxt;
                    scope.beginDateStep = beginDateStep;
                    scope.rangeOk = false;
                }

                function handleSelect(val) {
                    scope.selectedDate = {day: val.day, month: val.month, year: val.year};
                    if (scope.beginDateStep) {
                        scope.rangeOk = true;
                        scope.titleTxt = formatDate(val);
                        selectedBeginDate = angular.copy(scope.selectedDate);
                    }
                    else {
                        var b = new Date(selectedBeginDate.year, selectedBeginDate.month - 1, selectedBeginDate.day);
                        var e = new Date(scope.selectedDate.year, scope.selectedDate.month - 1, scope.selectedDate.day);
                        scope.rangeOk = b <= e;
                        scope.titleTxt = formatDate(selectedBeginDate) + scope.cf.DATES_SEPARATOR + formatDate(val);
                    }
                }

                function formatDate(val) {
                    if (val.day === 0 && val.month === 0 && val.year === 0) {
                        return '';
                    }
                    var fmt = angular.copy(!angular.isUndefined(scope.options.dateFormat) ? scope.options.dateFormat : scope.cf.dateFormat);
                    return fmt.replace(scope.cf.YEAR_CONST, val.year)
                        .replace(scope.cf.MONTH_CONST, preZero(val.month))
                        .replace(scope.cf.DATE_CONST, preZero(val.day));
                }

                function preZero(val) {
                    // Prepend zero if smaller than 10
                    return val < 10 ? '0' + val : val;
                }

                function monthText(m) {
                    // Returns mont as a text
                    return getMonthLabels()[m];
                }

                function monthStartIdx(y, m) {
                    // Month start index
                    var d = new Date();
                    d.setDate(1);
                    d.setMonth(m - 1);
                    d.setYear(y);
                    return d.getDay();
                }

                function daysInMonth(m, y) {
                    // Return number of days of current month
                    return new Date(y, m, 0).getDate();
                }

                function daysInPrevMonth(m, y) {
                    // Return number of days of the previous month
                    if (m === 1) {
                        m = 12;
                        y--;
                    }
                    else {
                        m--;
                    }
                    return daysInMonth(m, y);
                }

                function isCurrDay(d, m, y, cmo) {
                    // Check is a given date the current date
                    return d === today.getDate() && m === today.getMonth() + 1 && y === today.getFullYear() && cmo === 2;
                }

                function createMonth(m, y) {
                    scope.dates.length = 0;
                    var monthStart = monthStartIdx(y, m);
                    var dInThisM = daysInMonth(m, y);
                    var dInPrevM = daysInPrevMonth(m, y);

                    var dayNbr = 1;
                    var cmo = scope.cf.PREV_MONTH;
                    for (var i = 1; i < 7; i++) {
                        var week = [];
                        if (i === 1) {
                            // First week
                            var pm = dInPrevM - monthStart + 1;
                            // Previous month
                            for (var j = pm; j <= dInPrevM; j++) {
                                week.push({
                                    day: j,
                                    month: m,
                                    year: y,
                                    cmo: cmo,
                                    currDay: isCurrDay(j, m, y, cmo),
                                    sun: week.length === 0
                                });
                            }
                            cmo = scope.cf.CURR_MONTH;
                            // Current month
                            var daysLeft = 7 - week.length;
                            for (var j = 0; j < daysLeft; j++) {
                                week.push({
                                    day: dayNbr,
                                    month: m,
                                    year: y,
                                    cmo: cmo,
                                    currDay: isCurrDay(dayNbr, m, y, cmo),
                                    sun: week.length === 0
                                });
                                dayNbr++;
                            }
                        }
                        else {
                            // Rest of the weeks
                            for (var j = 1; j < 8; j++) {
                                if (dayNbr > dInThisM) {
                                    // Next month
                                    dayNbr = 1;
                                    cmo = scope.cf.NEXT_MONTH;
                                }
                                week.push({
                                    day: dayNbr,
                                    month: m,
                                    year: y,
                                    cmo: cmo,
                                    currDay: isCurrDay(dayNbr, m, y, cmo),
                                    sun: week.length === 0
                                });
                                dayNbr++;
                            }
                        }
                        scope.dates.push(week);
                    }
                }

                function onOutClick(event) {
                    if (!element[0].contains(event.target) && event.which === 1) {
                        // Clicked outside of the element - close the selector
                        if (scope.showSelector) {
                            scope.showSelector = false;
                        }
                        scope.$apply();
                    }
                }

                function getMonthLabels() {
                    return !angular.isUndefined(scope.options.monthLabels) ? scope.options.monthLabels : scope.cf.monthLabels;
                }

                function getDayLabels() {
                    return !angular.isUndefined(scope.options.dayLabels) ? scope.options.dayLabels : scope.cf.dayLabels;
                }

                scope.$on('$destroy', function () {
                    $document.off("click", onOutClick);
                });

                function init() {
                    // Selection element height/width
                    scope.height = !angular.isUndefined(attrs.height) ? attrs.height : scope.height;
                    scope.width = !angular.isUndefined(attrs.width) ? attrs.width : scope.width;

                    // Weekdays to calendar - check is sunday first day in configuration
                    var days = ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa'];
                    for (var i in days) {
                        scope.weekDays.push(getDayLabels()[days[i]]);
                    }

                    // Initial selected date range
                    if (scope.options.initSelectedDateRange !== undefined) {
                        scope.selectedRangeTxt = formatDate(scope.options.initSelectedDateRange.begin) +
                        scope.cf.DATES_SEPARATOR +
                        formatDate(scope.options.initSelectedDateRange.end);
                    }

                    // Register outside of element click event
                    $document.on("click", onOutClick);
                }

                $timeout(init);
            }
        };
    }])

/**
 * @ngdoc object
 * @name tooltipWindow
 * @description tooltipWindow directive implements the tooltip window.
 */
    .directive('tooltipWindow', ['$timeout', function ($timeout) {
        return {
            restrict: 'A',
            scope: false,
            link: function (scope, element, attrs) {
                function onMouseEnter() {
                    if (element[0].scrollWidth > element[0].offsetWidth) {
                        $timeout(function () {
                            scope.showTooltip = true;
                        }, scope.cf.TOOLTIP_SHOW_DELAY);
                    }
                }

                scope.$on('$destroy', function () {
                    element.off('mouseenter', onMouseEnter);
                });

                function init() {
                    element.on('mouseenter', onMouseEnter);
                }

                init();
            }
        };
    }]);



