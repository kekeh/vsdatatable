/**
 * @ngdoc object
 * @name captionBar
 * @description captionBar directive implements captionBar of the datatable.
 */
vsdt.directive('captionBar', ['$filter', 'vsdtServ', function ($filter, vsdtServ) {
    return {
        restrict: 'A',
        scope: false,
        templateUrl: 'templates/vsdtcaption.html',
        link: function (scope, element, attrs) {
            scope.filterFocus = false;
            var filterChangeWatch = null;
            var filterFocusWatch = null;
            var orderItems = $filter('orderBy');
            var filterItems = $filter('filter');
            var filterDateRange = $filter('dateRangeFilter');
            var refreshFlag = true;

            scope.filterBtnClick = function (event) {
                if (scope.checkEvent(event)) {
                    scope.filterFocus = !scope.filterFocus;
                    if (!scope.filterFocus) {
                        scope.resetFilter(true);
                    }
                }
            };

            scope.execFilterAndSort = function () {
                if (!scope.extDataPagination) {
                    scope.execFilter();
                    execSort();
                    vsdtServ.paginatorEvent(scope);
                }
                else {
                    scope.paginationOperation(scope.config.EXT_FLT);
                }
            };

            scope.resetFilter = function (refresh) {
                refreshFlag = refresh;
                scope.globalFilter = '';
                resetColumnFilter(scope.columnFilter.contain);
                resetColumnFilter(scope.columnFilter.exact);
                resetColumnFilter(scope.columnFilter.daterange);
                if (!scope.options.filter.autoFilter.useAutoFilter && refresh) {
                    scope.execFilterAndSort();
                }
            };

            scope.sortByCol = function (event, col) {
                event.stopPropagation();
                if (scope.checkEvent(event)) {
                    if (vsdtServ.isEqual(scope.sort.col, col)) {
                        scope.sort.reverse = !scope.sort.reverse;
                    }
                    else {
                        scope.sort.reverse = false;
                    }
                    scope.sort.col = col;
                    if (!scope.extDataPagination) {
                        if (vsdtServ.isEqual(col, '')) {
                            scope.execFilter();
                        }
                        execSort();
                    }
                    scope.paginationOperation(scope.config.EXT_SORT);
                }
            };

            scope.execFilter = function () {
                scope.filteredItems = scope.options.data.items;
                if (!vsdtServ.isEqual(scope.globalFilter, '')) {
                    scope.filteredItems = filterItems(scope.filteredItems, scope.globalFilter);
                }

                var containFilter = getFilterExpression(scope.columnFilter.contain);
                if (!vsdtServ.isEqual(containFilter, {})) {
                    scope.filteredItems = filterItems(scope.filteredItems, containFilter);
                }

                var exactFilter = getFilterExpression(scope.columnFilter.exact);
                if (!vsdtServ.isEqual(exactFilter, {})) {
                    scope.filteredItems = filterItems(scope.filteredItems, exactFilter, function (a, b) {
                        return vsdtServ.isEqual(a.toString(), b) || vsdtServ.isEqual(b, '');
                    });
                }

                var drFilter = getFilterExpression(scope.columnFilter.daterange);
                if (!vsdtServ.isEqual(drFilter, {})) {
                    angular.forEach(drFilter, function (v, k) {
                        var dates = v.split(scope.config.DATES_SEPARATOR);
                        if (vsdtServ.isEqual(dates.length, 2) && vsdtServ.isEqual(dates[0].length, 10) && vsdtServ.isEqual(dates[1].length, 10)) {
                            var fmt = getDateFormat(k);
                            scope.filteredItems = filterDateRange(scope.filteredItems, k, createDate(dates[0], fmt), createDate(dates[1], fmt));
                        }
                    });
                }

                scope.totalCount = scope.filteredItems.length;
            };

            function getDateFormat(prop) {
                for (var i in scope.options.columns) {
                    if (vsdtServ.isEqual(scope.options.columns[i].prop, prop)) {
                        return scope.options.columns[i].filter.dateFormat;
                    }
                }
            }

            function createDate(dateStr, fmt) {
                fmt = fmt.toLowerCase();
                var y = fmt.indexOf(scope.config.YEAR);
                var m = fmt.indexOf(scope.config.MONTH);
                var d = fmt.indexOf(scope.config.DAY);
                return new Date(parseInt(dateStr.substring(y, y + 4)), parseInt(dateStr.substring(m, m + 2)) - 1, parseInt(dateStr.substring(d, d + 2)));
            }

            function getFilterExpression(filterData) {
                var exp = {};
                angular.forEach(filterData, function (v, k) {
                    if (!vsdtServ.isEqual(v, '')) {
                        exp[k] = v;
                    }
                });
                return exp;
            }

            function execSort() {
                if (!vsdtServ.isEqual(scope.sort.col, '')) {
                    scope.filteredItems = orderItems(scope.filteredItems, scope.sort.col, scope.sort.reverse);
                }
            }

            function filterChangeWatchFn(newVal, oldVal) {
                if (vsdtServ.isObject(newVal) && vsdtServ.isEqual(oldVal.contain, {}) && vsdtServ.isEqual(oldVal.exact, {})) {
                    return;
                }
                if (!vsdtServ.isEqual(newVal, oldVal) && refreshFlag) {
                    scope.execFilterAndSort();
                }
                refreshFlag = true;
            }

            function filterFocusWatchFn(newVal, oldVal) {
                if (!vsdtServ.isEqual(newVal, oldVal) && newVal) {
                    vsdtServ.setFilterFocus(scope);
                }
            }

            function createFilterExpression() {
                var filterExp = '';
                angular.forEach(scope.options.columns, function (col) {
                    if (!vsdtServ.isUndefined(col.filter) && !vsdtServ.isUndefined(col.filter.template)) {
                        filterExp += 'columnFilter.' + col.filter.match + scope.config.DOT_SEPARATOR + col.prop + ' + ';
                    }
                });
                return filterExp;
            }

            function resetColumnFilter(filterData) {
                angular.forEach(filterData, function (v, k) {
                    filterData[k] = '';
                });
            }

            function init() {
                if (scope.options.filter.global || scope.options.filter.column) {
                    var filterExp = createFilterExpression();
                    if (scope.options.filter.autoFilter.useAutoFilter) {
                        filterExp += 'globalFilter';
                        filterChangeWatch = scope.$watch(filterExp, filterChangeWatchFn);
                    }
                }
                if (scope.options.filter.global) {
                    filterFocusWatch = scope.$watch('filterFocus', filterFocusWatchFn);
                }
            }

            scope.$on('$destroy', function () {
                if (!vsdtServ.isEqual(filterChangeWatch, null)) {
                    filterChangeWatch();
                }
                if (!vsdtServ.isEqual(filterFocusWatch, null)) {
                    filterFocusWatch();
                }
            });

            init();

        }
    };
}]);

