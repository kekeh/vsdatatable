angular.module('vsdatatable', [])

/**
 * @ngdoc object
 * @name vsdatatableConfig
 * @description Constants of the module.
 */
    .constant('vsdatatableConfig', {
        OVERLAY_SHOW_DELAY: 500,
        FILTER_EXECUTION_DELAY: 500,
        PAGINATOR_MAX_BTN_COUNT: 6,
        PAGINATOR_BTN_BACK: {id: 'b', label: 'back'},
        PAGINATOR_BTN_NEXT: {id: 'n', label: 'next'},
        PAGINATOR_BTN_FIRST: {id: 'f', label: 'first'},
        PAGINATOR_BTN_LAST: {id: 'l', label: 'last'},
        PAGINATOR_BTN_PREV_SET: {id: 'ps', label: '...'},
        PAGINATOR_BTN_NEXT_SET: {id: 'ns', label: '...'},
        PAGINATOR_EVENT: 'vsdatatable.paginatorEvent',
        FILTER_FOCUS_EVENT: 'vsdatatable.filterFocusEvent',
        SET_EXT_PAGINATION_DATA_EVENT: 'vsdatatable.setExtPaginationData',
        OPER_PHASE_BEGIN: 'BEGIN',
        OPER_PHASE_END: 'END',
        OPER_ADD: 'ADD',
        OPER_EDIT: 'EDIT',
        OPER_DELETE: 'DELETE',
        OPER_VIEW: 'VIEW',
        EXT_INIT: 'i',
        EXT_SORT: 's',
        EXT_FLT: 'f',
        EXT_BTN: 'b',
        FILTER_CONTAIN: 'contain',
        FILTER_EXACT: 'exact',
        ROW_SELECT: 'SELECT',
        ROW_DESELECT: 'DESELECT',
        COL_RESIZER_MIN_COL_WIDTH: 35,
        DEFAULT_ACTION_COL_WIDTH: 90,
        COLUMN_PROP_VALUE: 'COLUMN_PROP_VALUE',
        DOT_SEPARATOR: '.'
    })

/**
 * @ngdoc object
 * @name run
 * @description run adds the row extender template to the template cache.
 */
    .run(function ($templateCache) {
        $templateCache.put('rowExtender.html', '<td class="bodyCol" colspan="{{visibleColCount+1}}"><div ng-include src="template.path"></div></td>');
    })

/**
 * @ngdoc object
 * @name vsdatatableEvent
 * @description vsdatatableEvent provides one function which can be used to set pagination data to the
 * vsdatatable directive. This is used only when using pagination from external source (for example
 * from database).
 */
    .factory('vsdatatableEvent', ['vsdatatableConfig', function (vsdatatableConfig) {
        var factory = {};
        /**
         * @ngdoc function
         * @description External pagination function to the parent.
         * @name setExtPaginationData
         * @param $scope of the parent (caller)
         * @param data array of objects used in the vsdatatable. Array length is same as page size.
         * @param totalCount count of the items match the search criteria.
         */
        factory.setExtPaginationData = function ($scope, data, totalCount) {
            $scope.$broadcast(vsdatatableConfig.SET_EXT_PAGINATION_DATA_EVENT, {data: data, totalCount: totalCount});
        };
        return factory;
    }])

/**
 * @ngdoc object
 * @name vsdatatableService
 * @description vsdatatableService provides internal functions to the vsdatable directives.
 */
    .service('vsdatatableService', ['vsdatatableConfig', function (vsdatatableConfig) {
        var service = {};
        service.isUndefined = function (val) {
            return angular.isUndefined(val);
        };

        service.isEqual = function (a, b) {
            return angular.equals(a, b);
        };

        service.isObject = function (val) {
            return angular.isObject(val);
        };

        service.setFilterFocus = function (scope) {
            scope.$broadcast(vsdatatableConfig.FILTER_FOCUS_EVENT);
        };

        service.paginatorEvent = function (scope) {
            scope.$broadcast(vsdatatableConfig.PAGINATOR_EVENT);
        };
        return service;
    }])

/**
 * @ngdoc object
 * @name vsdatatable
 * @description vsdatatable is main directive of the vsdatatable. Options is passed as an attribute to this
 * directive.
 */
    .directive('vsdatatable', ['$compile', '$templateCache', '$filter', 'vsdatatableConfig', 'vsdatatableService', function ($compile, $templateCache, $filter, vsdatatableConfig, vsdatatableService) {
        return {
            restrict: 'EA',
            templateUrl: 'templates/vsdatatable.html',
            scope: {
                options: '='
            },
            controller: ['$scope', function ($scope) {
                $scope.config = vsdatatableConfig;
                $scope.colInitDone = false;
                $scope.filteredItems = [];
                $scope.totalCount = 0;
                $scope.selectedRows = [];
                $scope.colTogglerShow = false;
            }],
            link: function (scope, element, attrs) {
                scope.filterFocus = false, scope.busyIcon = false;
                scope.sort = {col: '', reverse: false};
                scope.globalFilter = '';
                scope.columnFilter = {contain: {}, exact: {}};

                var extPendingOper = null;
                var rowExtender = null;
                var operObject = {};
                var filterFocusWatch = null;
                var filterChangeWatch = null;
                var itemsLengthWatch = null;

                var orderItems = $filter('orderBy');
                var filterItems = $filter('filter');

                scope.addRow = function () {
                    operObject = {
                        oper: scope.config.OPER_ADD,
                        dataOld: {},
                        dataNew: vsdatatableService.isUndefined(scope.options.templates.add.defaultValues) ? {} : angular.copy(scope.options.templates.add.defaultValues)
                    };
                    dataOperation(scope.config.OPER_PHASE_BEGIN);
                    scope.template = scope.options.templates.add;
                    var bodyElem = angular.element(element[0].querySelector('.tableRows .tableBody'));
                    createRowExtender(bodyElem);
                };

                scope.editRow = function (event, data) {
                    if (scope.checkEvent(event)) {
                        operObject = {oper: scope.config.OPER_EDIT, dataOld: data, dataNew: angular.copy(data)};
                        dataOperation(scope.config.OPER_PHASE_BEGIN);
                        scope.template = scope.options.templates.edit;
                        createRowExtender(getTableRow(event));
                    }
                };

                scope.deleteRow = function (event, data) {
                    if (scope.checkEvent(event)) {
                        operObject = {oper: scope.config.OPER_DELETE, dataOld: data, dataNew: {}};
                        dataOperation(scope.config.OPER_PHASE_BEGIN);
                        scope.template = scope.options.templates.delete;
                        createRowExtender(getTableRow(event));
                    }
                };

                scope.viewRow = function (event, data) {
                    if (scope.checkEvent(event)) {
                        operObject = {oper: scope.config.OPER_VIEW, dataOld: data, dataNew: {}};
                        dataOperation(scope.config.OPER_PHASE_BEGIN);
                        scope.template = scope.options.templates.view;
                        createRowExtender(getTableRow(event));
                    }
                };

                scope.acceptClicked = function () {
                    removeRowExtender();
                    if (!scope.extDataPagination) {
                        if (vsdatatableService.isEqual(operObject.oper, scope.config.OPER_ADD) || vsdatatableService.isEqual(operObject.oper, scope.config.OPER_DELETE)) {
                            scope.resetFilter();
                        }
                        dataOperation(scope.config.OPER_PHASE_END);
                        if (!vsdatatableService.isEqual(operObject.oper, scope.config.OPER_VIEW)) {
                            execFilter();
                        }
                    }
                    else {
                        dataOperation(scope.config.OPER_PHASE_END);
                        if (!vsdatatableService.isEqual(operObject.oper, scope.config.OPER_VIEW)) {
                            scope.paginationOperation(operObject.oper);
                        }
                    }
                    removeFromSelectedRows(operObject.dataOld);
                };

                scope.cancelClicked = function () {
                    removeRowExtender();
                };

                scope.sortByCol = function (event, col) {
                    event.stopPropagation();
                    if (scope.checkEvent(event)) {
                        scope.sort = vsdatatableService.isEqual(scope.sort.col, col) ? {
                            col: col,
                            reverse: !scope.sort.reverse
                        } : {col: col, reverse: false};
                        if (!scope.extDataPagination) {
                            if (vsdatatableService.isEqual(col, '')) {
                                execFilter();
                            }
                            execSort();
                        }
                        scope.paginationOperation(scope.config.EXT_SORT);
                    }
                };

                scope.notifyRowSelect = function (oper, data) {
                    if (!vsdatatableService.isUndefined(scope.options.row.rowSelectCb)) {
                        scope.options.row.rowSelectCb(oper, data);
                    }
                };

                scope.$on(scope.config.SET_EXT_PAGINATION_DATA_EVENT, function (event, value) {
                    // External pagination event contains paged data and total count
                    scope.filteredItems = value.data;
                    scope.totalCount = value.totalCount;

                    if (!vsdatatableService.isEqual(extPendingOper, scope.config.EXT_BTN)
                        && !vsdatatableService.isEqual(extPendingOper, scope.config.OPER_EDIT)
                        && !vsdatatableService.isEqual(extPendingOper, scope.config.EXT_SORT)) {
                        vsdatatableService.paginatorEvent(scope);
                    }

                    if (scope.options.busyIcon.visible) {
                        scope.busyIcon = false;
                    }
                });

                scope.getColumns = function () {
                    return scope.options.columns;
                };

                scope.getOperationDataObject = function () {
                    if (vsdatatableService.isEqual(operObject.oper, scope.config.OPER_ADD) || vsdatatableService.isEqual(operObject.oper, scope.config.OPER_EDIT)) {
                        return {oper: operObject.oper, data: operObject.dataNew};
                    }
                    else {
                        return {oper: operObject.oper, data: operObject.dataOld};
                    }
                };

                scope.getPropertyValue = function (obj, prop) {
                    if (vsdatatableService.isEqual(prop.indexOf(scope.config.DOT_SEPARATOR), -1)) {
                        return obj[prop];
                    }
                    // Nested object
                    var parts = prop.split(scope.config.DOT_SEPARATOR);
                    var tempVal = angular.copy(obj);
                    angular.forEach(parts, function (p) {
                        tempVal = tempVal[p];
                    });
                    return tempVal;
                };

                scope.getColumnStyle = function (obj, colOpt) {
                    if (!vsdatatableService.isUndefined(colOpt.rules)) {
                        // Get the column value, evaluate the rule and return the style class
                        var style = '';
                        for (var i in colOpt.rules) {
                            var val = scope.getPropertyValue(obj, colOpt.rules[i].prop);
                            var exp = angular.copy(colOpt.rules[i].expression.toString());
                            // Replace the prop names string to value string fron the expression
                            exp = exp.split(colOpt.rules[i].prop).join(val.toString());
                            if (scope.$eval(exp)) {
                                style = colOpt.rules[i].style;
                                break;
                            }
                        }
                        return style;
                    }
                };

                scope.paginationOperation = function (oper) {
                    if (scope.extDataPagination) {
                        if (scope.options.busyIcon.visible) {
                            scope.busyIcon = true;
                        }

                        extPendingOper = oper;

                        if (vsdatatableService.isEqual(oper, scope.config.OPER_ADD)
                            || vsdatatableService.isEqual(oper, scope.config.OPER_DELETE)
                            || vsdatatableService.isEqual(oper, scope.config.EXT_FLT)) {
                            // Reset paginator
                            scope.paginator.visiblePageIdx = 0;
                        }

                        // Notify parent
                        scope.options.data.extPaginationOperationCb(
                            {
                                columnFilter: scope.columnFilter,
                                globalFilter: scope.globalFilter,
                                page: scope.paginator.visiblePageIdx + 1,
                                pageSize: scope.pageSize.rows,
                                sort: scope.sort
                            });
                    }
                };

                scope.filterBtnClick = function (event) {
                    if (scope.checkEvent(event)) {
                        scope.filterFocus = !scope.filterFocus;
                        if (!scope.filterFocus) {
                            scope.resetFilter();
                        }
                    }
                };

                scope.executeFilter = function () {
                    if (!scope.extDataPagination) {
                        execFilter();
                        execSort();
                        vsdatatableService.paginatorEvent(scope);
                    }
                    else {
                        scope.paginationOperation(scope.config.EXT_FLT);
                    }
                };

                scope.resetFilter = function () {
                    scope.globalFilter = '';
                    resetColumnFilter(scope.columnFilter.contain);
                    resetColumnFilter(scope.columnFilter.exact);
                    if (!scope.options.filter.autoFilter.useAutoFilter) {
                        scope.executeFilter();
                    }
                };

                scope.checkEvent = function (event) {
                    return (vsdatatableService.isEqual(event.which, 1) || vsdatatableService.isEqual(event.which, 13)) && !scope.busyIcon;
                };

                var tableAreaClick = element.on("click", function (event) {
                    if (event.which === 1 && scope.colTogglerShow) {
                        scope.colTogglerShow = false;
                        scope.$apply();
                    }
                });

                function removeFromSelectedRows(data) {
                    if (vsdatatableService.isEqual(scope.options.row.selection, 1) || vsdatatableService.isEqual(scope.options.row.selection, 2)) {
                        var idx = scope.selectedRows.indexOf(data);
                        if (!vsdatatableService.isEqual(idx, -1)) {
                            scope.selectedRows.splice(idx, 1);
                            scope.notifyRowSelect(scope.config.ROW_DESELECT, data);
                        }
                    }
                }

                function resetColumnFilter(filterData) {
                    angular.forEach(filterData, function (v, k) {
                        filterData[k] = '';
                    });
                }

                function getFilterExpression(filterData) {
                    var exp = {};
                    angular.forEach(filterData, function (v, k) {
                        if (!vsdatatableService.isEqual(v, '')) {
                            exp[k] = v;
                        }
                    });
                    return exp;
                }

                function execFilter() {
                    scope.filteredItems = scope.options.data.items;
                    if (!vsdatatableService.isEqual(scope.globalFilter, '')) {
                        scope.filteredItems = filterItems(scope.filteredItems, scope.globalFilter);
                    }

                    var containFilter = getFilterExpression(scope.columnFilter.contain);
                    if (!vsdatatableService.isEqual(containFilter, {})) {
                        scope.filteredItems = filterItems(scope.filteredItems, containFilter);
                    }

                    var exactFilter = getFilterExpression(scope.columnFilter.exact);
                    if (!vsdatatableService.isEqual(exactFilter, {})) {
                        scope.filteredItems = filterItems(scope.filteredItems, exactFilter, function (a, b) {
                            return vsdatatableService.isEqual(a.toString(), b) || vsdatatableService.isEqual(b, '');
                        });
                    }
                    scope.totalCount = scope.filteredItems.length;
                }

                function execSort() {
                    if (!vsdatatableService.isEqual(scope.sort.col, '')) {
                        scope.filteredItems = orderItems(scope.filteredItems, scope.sort.col, scope.sort.reverse);
                    }
                }

                function initWatchers() {
                    if (scope.options.filter.global) {
                        filterFocusWatch = scope.$watch('filterFocus', filterFocusWatchFn);
                    }
                    if (scope.options.filter.global || scope.options.filter.column) {
                        var filterExp = createFilterExpression();
                        if (scope.options.filter.autoFilter.useAutoFilter) {
                            filterExp += 'globalFilter';
                            filterChangeWatch = scope.$watch(filterExp, filterChangeWatchFn);
                        }
                    }
                    if (!scope.extDataPagination) {
                        itemsLengthWatch = scope.$watch('options.data.items.length', itemsLengthWatchFn);
                    }
                }

                function createFilterExpression() {
                    var filterExp = '';
                    angular.forEach(scope.options.columns, function (col) {
                        if (!vsdatatableService.isUndefined(col.filter) && !vsdatatableService.isUndefined(col.filter.template)) {
                            filterExp += 'columnFilter.' + col.filter.match + scope.config.DOT_SEPARATOR + col.prop + ' + ';
                        }
                    });
                    return filterExp;
                }

                function filterFocusWatchFn(newVal, oldVal) {
                    if (!vsdatatableService.isEqual(newVal, oldVal) && newVal) {
                        vsdatatableService.setFilterFocus(scope);
                    }
                }

                function filterChangeWatchFn(newVal, oldVal) {
                    if (vsdatatableService.isObject(newVal) && vsdatatableService.isEqual(oldVal.contain, {}) && vsdatatableService.isEqual(oldVal.exact, {})) {
                        return;
                    }
                    if (!vsdatatableService.isEqual(newVal, oldVal)) {
                        scope.executeFilter();
                    }
                }

                function itemsLengthWatchFn() {
                    // Not external pagination
                    scope.filteredItems = scope.options.data.items;
                    scope.totalCount = scope.filteredItems.length;
                    reset(true, true);
                    vsdatatableService.paginatorEvent(scope);
                }

                function getTableRow(event) {
                    return angular.element(event.target).parent().parent();
                }

                function createRowExtender(rowElem) {
                    removeRowExtender();
                    rowExtender = angular.element($templateCache.get('rowExtender.html'));
                    if (vsdatatableService.isEqual(operObject.oper, scope.config.OPER_ADD)) {
                        rowElem.prepend(rowExtender);
                    }
                    else {
                        rowElem.after(rowExtender);
                    }
                    $compile(rowExtender)(scope);
                }

                function removeRowExtender() {
                    if (!vsdatatableService.isEqual(rowExtender, null)) {
                        rowExtender.remove();
                        rowExtender = null;
                    }
                }

                function dataOperation(phase) {
                    if (!vsdatatableService.isUndefined(scope.options.data.dataOperationCb)) {
                        scope.options.data.dataOperationCb(
                            phase, operObject.oper, operObject.dataOld,
                            vsdatatableService.isEqual(phase, scope.config.OPER_PHASE_BEGIN) ? {} : operObject.dataNew);
                    }
                }

                function reset(sort, filter) {
                    if (sort) {
                        scope.sort = {col: '', reverse: false};
                    }
                    if (filter) {
                        scope.resetFilter();
                    }
                }

                function initColumns() {
                    var width = 90 / scope.options.columns.length;
                    scope.visibleColCount = 0;
                    angular.forEach(scope.options.columns, function (col) {
                        scope.visibleColCount = vsdatatableService.isUndefined(col.visible) || col.visible ? scope.visibleColCount + 1 : scope.visibleColCount;
                        if (vsdatatableService.isUndefined(col.width)) {
                            col.width = {number: width, unit: '%'};
                        }
                    });
                }

                function init() {
                    scope.extDataPagination = scope.options.data.extDataPagination;
                    initWatchers();
                    initColumns();
                }

                scope.$on('$destroy', function () {
                    if (!vsdatatableService.isEqual(filterFocusWatch, null)) {
                        filterFocusWatch();
                    }
                    if (!vsdatatableService.isEqual(filterChangeWatch, null)) {
                        filterChangeWatch();
                    }
                    if (!vsdatatableService.isEqual(itemsLengthWatch, null)) {
                        itemsLengthWatch();
                    }
                    scope.$off(scope.config.SET_EXT_PAGINATION_DATA_EVENT);
                    element.off('click', tableAreaClick);
                });

                init();
            }
        };
    }])

/**
 * @ngdoc object
 * @name filterFocus
 * @description filterFocus is directive which set focus to the global filter input box when the filter icon is clicked.
 */
    .directive('filterFocus', ['$timeout', function ($timeout) {
        return {
            restrict: 'A',
            scope: false,
            link: function (scope, element, attrs) {
                scope.$on(scope.config.FILTER_FOCUS_EVENT, function () {
                    $timeout(function () {
                        element[0].focus();
                    });
                });

                scope.$on('$destroy', function () {
                    scope.$off(scope.config.FILTER_FOCUS_EVENT);
                });
            }
        };
    }])

/**
 * @ngdoc object
 * @name colFilterTemplate
 * @description colFilterTemplate adds column filter (for example input box) to the each column defined in the configuration.
 */
    .directive('colFilterTemplate', ['$compile', 'vsdatatableService', 'vsdatatableConfig', function ($compile, vsdatatableService, vsdatatableConfig) {
        return {
            restrict: 'A',
            scope: false,
            link: function (scope, element, attrs) {
                function init() {
                    var colOpt = scope.$eval(attrs.colFilterTemplate);
                    if (!vsdatatableService.isUndefined(colOpt.filter) && !vsdatatableService.isUndefined(colOpt.filter.template)
                        && !vsdatatableService.isUndefined(colOpt.filter.match)) {
                        // Add column filter
                        var colTpl = angular.copy(colOpt.filter.template);
                        colTpl = colTpl.replace(vsdatatableConfig.COLUMN_PROP_VALUE, 'columnFilter' + scope.config.DOT_SEPARATOR + colOpt.filter.match + scope.config.DOT_SEPARATOR + colOpt.prop + '"');
                        var elem = angular.element(colTpl);
                        $compile(elem)(scope);
                        element.append(elem);
                    }
                }

                init();
            }
        };
    }])

/**
 * @ngdoc object
 * @name tableBodyRow
 * @description tableBodyRow directive handles row clicks done by user. It also hove the row in case defined in
 * the configuration.
 */
    .directive('tableBodyRow', ['vsdatatableService', function (vsdatatableService) {
        return {
            restrict: 'A',
            scope: false,
            link: function (scope, element, attrs) {
                if (scope.options.row.hover) {
                    element.on('mouseenter', onMouseEnter);
                    element.on('mouseleave', onMouseLeave);
                }

                scope.rowClicked = function (event, data) {
                    if (checkEvent(event)) {
                        var oper = scope.config.ROW_SELECT;
                        var idx = scope.selectedRows.indexOf(data);
                        if (scope.options.row.selection === 1 && vsdatatableService.isEqual(idx, -1)) {
                            if (scope.selectedRows.length > 0) {
                                scope.notifyRowSelect(scope.config.ROW_DESELECT, scope.selectedRows[0]);
                            }
                            scope.selectedRows[0] = data;
                        }
                        else if (scope.options.row.selection === 1 && !vsdatatableService.isEqual(idx, -1)) {
                            scope.selectedRows.splice(0, 1);
                            oper = scope.config.ROW_DESELECT;
                        }
                        else if (scope.options.row.selection === 2 && vsdatatableService.isEqual(idx, -1)) {
                            scope.selectedRows.push(data);
                        }
                        else if (scope.options.row.selection === 2 && !vsdatatableService.isEqual(idx, -1)) {
                            scope.selectedRows.splice(idx, 1);
                            oper = scope.config.ROW_DESELECT;
                        }
                        scope.notifyRowSelect(oper, data);
                    }
                };

                scope.isRowSelected = function (data) {
                    return !vsdatatableService.isEqual(scope.selectedRows.indexOf(data), -1);
                };

                function checkEvent(event) {
                    return (vsdatatableService.isEqual(event.which, 1) || vsdatatableService.isEqual(event.which, 13))
                        && (scope.options.row.selection === 1 || scope.options.row.selection === 2);
                }

                function onMouseEnter() {
                    element.addClass('hoverRow');
                }

                function onMouseLeave() {
                    element.removeClass('hoverRow');
                }

                scope.$on('$destroy', function () {
                    if (scope.options.row.hover) {
                        element.off('mouseenter', onMouseEnter);
                        element.off('mouseleave', onMouseLeave);
                    }
                });
            }
        };
    }])

/**
 * @ngdoc object
 * @name tablePaginator
 * @description tablePaginator directive implements paginator.
 */
    .directive('tablePaginator', ['vsdatatableService', function (vsdatatableService) {
        return {
            restrict: 'A',
            scope: false,
            templateUrl: 'templates/vspaginator.html',
            link: function (scope, element, attrs) {
                scope.paginator = {visiblePageIdx: 0, pageFirstIdx: 0};
                scope.paginatorButtons = [];
                scope.disabledButtons = [];
                var initBtnCount = 0;
                var filteredBtnCount = 0;

                scope.pageSizeButtonClick = function (value) {
                    scope.pageSize = scope.pageSizeOptions[scope.pageSizeOptions.indexOf(value)];
                    reset();

                    if (scope.extDataPagination) {
                        scope.paginationOperation(scope.config.EXT_BTN);
                    }
                };

                scope.paginatorBtnClick = function (val, idx) {
                    if (!scope.isDisabledBtn(val)) {
                        if (scope.isNavigateBtn(val)) {
                            pageNavigated(val);
                        }
                        else {
                            setPaginatorValues(val.id - 1, scope.paginator.pageFirstIdx, idx - 2);
                        }

                        if (scope.extDataPagination) {
                            scope.paginationOperation(scope.config.EXT_BTN);
                        }
                    }
                };

                scope.isNavigateBtn = function (val) {
                    return vsdatatableService.isEqual(val, scope.config.PAGINATOR_BTN_FIRST)
                        || vsdatatableService.isEqual(val, scope.config.PAGINATOR_BTN_BACK)
                        || vsdatatableService.isEqual(val, scope.config.PAGINATOR_BTN_PREV_SET)
                        || vsdatatableService.isEqual(val, scope.config.PAGINATOR_BTN_NEXT)
                        || vsdatatableService.isEqual(val, scope.config.PAGINATOR_BTN_NEXT_SET)
                        || vsdatatableService.isEqual(val, scope.config.PAGINATOR_BTN_LAST);
                };

                scope.isDisabledBtn = function (val) {
                    return scope.isNavigateBtn(val) && !vsdatatableService.isEqual(scope.disabledButtons.indexOf(val), -1);
                };

                scope.$on(scope.config.PAGINATOR_EVENT, function () {
                    reset();
                });

                function pageNavigated(val) {
                    if (vsdatatableService.isEqual(val, scope.config.PAGINATOR_BTN_FIRST)) {
                        toPage(0, val);
                    }
                    else if (vsdatatableService.isEqual(val, scope.config.PAGINATOR_BTN_BACK)) {
                        if (vsdatatableService.isEqual(scope.paginator.visiblePageIdx - scope.paginator.pageFirstIdx, 0)) {
                            toPage(scope.paginator.visiblePageIdx - filteredBtnCount, val);
                        }
                        else {
                            setPaginatorValues(scope.paginator.visiblePageIdx - 1, scope.paginator.pageFirstIdx);
                        }
                    }
                    else if (vsdatatableService.isEqual(val, scope.config.PAGINATOR_BTN_PREV_SET)) {
                        toPage(scope.paginator.pageFirstIdx - filteredBtnCount, val);
                    }
                    else if (vsdatatableService.isEqual(val, scope.config.PAGINATOR_BTN_LAST)) {
                        toPage(scope.totalPages - 1, val);
                    }
                    else if (vsdatatableService.isEqual(val, scope.config.PAGINATOR_BTN_NEXT)) {
                        if (vsdatatableService.isEqual(scope.paginator.visiblePageIdx - scope.paginator.pageFirstIdx, filteredBtnCount - 1)) {
                            toPage(scope.paginator.pageFirstIdx + filteredBtnCount, val);
                        }
                        else {
                            setPaginatorValues(scope.paginator.visiblePageIdx + 1, scope.paginator.pageFirstIdx);
                        }
                    }
                    else if (vsdatatableService.isEqual(val, scope.config.PAGINATOR_BTN_NEXT_SET)) {
                        toPage(scope.paginator.pageFirstIdx + filteredBtnCount, val);
                    }
                }

                function calcTotalPages(itemCount) {
                    scope.totalPages = Math.ceil(itemCount / scope.pageSize.rows);
                }

                function toPage(pageIdx, val) {
                    var visiblePageIdx = 0, pageFirstIdx = 0;
                    if (pageIdx > scope.paginator.visiblePageIdx) {
                        // Forward navigate
                        visiblePageIdx = pageIdx;
                        if (vsdatatableService.isEqual(val, scope.config.PAGINATOR_BTN_LAST)) {
                            pageFirstIdx = visiblePageIdx - filteredBtnCount + 1;
                        }
                        else {
                            var checkedVal = checkMaxPageIdx(pageIdx);
                            pageFirstIdx = !vsdatatableService.isEqual(checkedVal, pageIdx) ? checkedVal : pageIdx;
                        }
                    }
                    else if (pageIdx < scope.paginator.visiblePageIdx && !vsdatatableService.isEqual(val, scope.config.PAGINATOR_BTN_FIRST)) {
                        // Backward navigate
                        var checkedVal = checkMinPageIdx(pageIdx);
                        visiblePageIdx = pageIdx + filteredBtnCount - 1;
                        pageFirstIdx = !vsdatatableService.isEqual(checkedVal, pageIdx) ? checkedVal : pageIdx;
                    }
                    setPaginatorValues(visiblePageIdx, pageFirstIdx);
                }

                function setPaginatorValues(visiblePageIdx, pageFirstIdx) {
                    scope.paginator = {visiblePageIdx: visiblePageIdx, pageFirstIdx: pageFirstIdx};
                    setPaginatorButtons();
                }

                function checkMaxPageIdx(value) {
                    return value + filteredBtnCount > scope.totalPages ? scope.totalPages - filteredBtnCount : value;
                }

                function checkMinPageIdx(value) {
                    return value < 0 ? 0 : value;
                }

                function setPaginatorButtons() {
                    filteredBtnCount = scope.totalPages > initBtnCount ? initBtnCount : scope.totalPages;
                    var startIdx = scope.paginator.visiblePageIdx !== scope.paginator.pageFirstIdx ? scope.paginator.pageFirstIdx : scope.paginator.visiblePageIdx;
                    scope.paginatorButtons.length = 0;

                    // Navigate back buttons
                    if (scope.options.paginator.allNavBtnVisible) {
                        scope.paginatorButtons.push(scope.config.PAGINATOR_BTN_FIRST);
                    }
                    if (scope.options.paginator.pageNavBtnVisible) {
                        scope.paginatorButtons.push(scope.config.PAGINATOR_BTN_BACK);
                    }
                    if (scope.options.paginator.setNavBtnVisible) {
                        scope.paginatorButtons.push(scope.config.PAGINATOR_BTN_PREV_SET);
                    }

                    // Number buttons
                    for (var i = startIdx; i < filteredBtnCount + startIdx; i++) {
                        scope.paginatorButtons.push({id: i + 1, label: i + 1});
                    }

                    // Navigate forward buttons
                    if (scope.options.paginator.setNavBtnVisible) {
                        scope.paginatorButtons.push(scope.config.PAGINATOR_BTN_NEXT_SET);
                    }
                    if (scope.options.paginator.pageNavBtnVisible) {
                        scope.paginatorButtons.push(scope.config.PAGINATOR_BTN_NEXT);
                    }
                    if (scope.options.paginator.allNavBtnVisible) {
                        scope.paginatorButtons.push(scope.config.PAGINATOR_BTN_LAST);
                    }

                    // Set disabled buttons if needed
                    setDisabledButtons();
                }

                function setDisabledButtons() {
                    scope.disabledButtons.length = 0;
                    if (vsdatatableService.isEqual(scope.paginator.visiblePageIdx, 0)) {
                        scope.disabledButtons.push(scope.config.PAGINATOR_BTN_FIRST);
                        scope.disabledButtons.push(scope.config.PAGINATOR_BTN_BACK);
                    }
                    if (vsdatatableService.isEqual(scope.paginator.pageFirstIdx, 0)) {
                        scope.disabledButtons.push(scope.config.PAGINATOR_BTN_PREV_SET);
                    }
                    if (scope.paginator.pageFirstIdx + filteredBtnCount >= scope.totalPages) {
                        scope.disabledButtons.push(scope.config.PAGINATOR_BTN_NEXT_SET);
                    }
                    if (scope.paginator.visiblePageIdx >= scope.totalPages - 1) {
                        scope.disabledButtons.push(scope.config.PAGINATOR_BTN_LAST);
                        scope.disabledButtons.push(scope.config.PAGINATOR_BTN_NEXT);
                    }
                }

                function reset() {
                    calcTotalPages(scope.totalCount);
                    setPaginatorValues(0, 0);
                }

                function init() {
                    scope.pageSizeOptions = scope.options.paginator.pageSizeOptions;
                    initBtnCount = scope.options.paginator.buttonCount > scope.config.PAGINATOR_MAX_BTN_COUNT ?
                        scope.config.PAGINATOR_MAX_BTN_COUNT : scope.options.paginator.buttonCount;
                    var idx = 0;
                    for (var i in scope.pageSizeOptions) {
                        if (scope.pageSizeOptions[i].hasOwnProperty('default') && angular.equals(scope.pageSizeOptions[i].default, true)) {
                            idx = i;
                            break;
                        }
                    }
                    scope.pageSize = scope.pageSizeOptions[idx];
                    reset();
                }

                scope.$on('$destroy', function () {
                    scope.$off(scope.config.PAGINATOR_EVENT);
                });

                init();
            }
        };
    }])

/**
 * @ngdoc object
 * @name colToggleMenu
 * @description colToggleMenu directive implements column toggle menu.
 */
    .directive('colToggleMenu', function () {
        return {
            restrict: 'A',
            scope: false,
            templateUrl: 'templates/vscoltogglemenu.html',
            link: function (scope, element, attrs) {
                scope.colTogglerShowClicked = function (event) {
                    if (scope.checkEvent(event)) {
                        scope.colTogglerShow = !scope.colTogglerShow;
                    }
                };

                scope.colToggleMenuClicked = function (event, col) {
                    if (scope.checkEvent(event)) {
                        scope.visibleColCount = col.visible ? scope.visibleColCount - 1 : scope.visibleColCount + 1;
                        col.visible = !col.visible;
                        scope.colInitDone = true;
                    }
                };
            }
        };
    })

/**
 * @ngdoc object
 * @name overlayWindow
 * @description overlayWindow directive implements overlay window (tooltip).
 */
    .directive('overlayWindow', ['$compile', '$timeout', function ($compile, $timeout) {
        return {
            restrict: 'A',
            scope: false,
            link: function (scope, element, attrs) {
                var overlay = null;
                var timer = null;

                element.on('mouseenter', onMouseEnter);
                element.on('mouseleave', onMouseLeave);

                scope.$on('$destroy', function () {
                    element.off('mouseenter', onMouseEnter);
                    element.off('mouseleave', onMouseLeave);
                });

                scope.closeOverlay = function () {
                    onMouseLeave();
                };

                function onMouseEnter() {
                    var obj = scope.$eval(attrs.overlayWindow);
                    timer = $timeout(function () {
                        if (!obj.overflow) {
                            overlay = angular.element('<div class="overlay" style="margin-left:' + (element.prop('offsetLeft')) + 'px;">' + obj.text + '</div>');
                        }
                        else if (element[0].scrollWidth > element[0].offsetWidth) {
                            overlay = angular.element('<div class="overlay" ng-click="closeOverlay()" >' + obj.text + '</div>');
                        }
                        if (!angular.equals(overlay, null)) {
                            element.append(overlay);
                            $compile(overlay)(scope);
                        }
                    }, scope.config.OVERLAY_SHOW_DELAY);
                }

                function onMouseLeave() {
                    cancelTimer();
                    if (!angular.equals(overlay, null)) {
                        overlay.remove();
                        overlay = null;
                    }
                }

                function cancelTimer() {
                    $timeout.cancel(timer);
                    timer = null;
                }
            }
        };
    }])

/**
 * @ngdoc object
 * @name colResizer
 * @description colResizer directive implements column resize of the vsdatatable.
 */
    .directive('colResizer', ['$compile', '$document', 'vsdatatableService', function ($compile, $document, vsdatatableService) {
        return {
            restrict: 'A',
            scope: false,
            link: function (scope, element, attrs) {
                var startPos = 0, nextElem = 0, currWidth = 0, nextWidth = 0, headerWidth = 0;

                function onResizeStart(event) {
                    event.preventDefault();
                    startPos = event.clientX;
                    nextElem = element.next();
                    if (!vsdatatableService.isEqual(nextElem.prop('id'), 'headerColAction')) {
                        currWidth = element.prop('offsetWidth');
                        nextWidth = nextElem.prop('offsetWidth');
                        headerWidth = element.parent().prop('offsetWidth');

                        // Register events
                        $document.on('mousemove', onResizeMove);
                        $document.on('mouseup', onResizeEnd);
                        setCursor('col-resize');
                    }
                }

                function onResizeMove(event) {
                    // if newPos > 0 move id forward - if newPos < 0 move is backward
                    var newPos = event.clientX - startPos;
                    var newCurrWidth = currWidth + newPos;
                    var newNextWidth = nextWidth - newPos;
                    if (newPos > 0 && newNextWidth < scope.config.COL_RESIZER_MIN_COL_WIDTH) {
                        return;
                    }
                    else if (newPos < 0 && newCurrWidth < scope.config.COL_RESIZER_MIN_COL_WIDTH) {
                        return;
                    }
                    // Change to the percent value
                    element.css('width', (newCurrWidth / headerWidth * 100) + '%');
                    nextElem.css('width', (newNextWidth / headerWidth * 100) + '%');
                }

                function onResizeEnd() {
                    // Deregister events
                    $document.off('mousemove', onResizeMove);
                    $document.off('mouseup', onResizeEnd);
                    setCursor('default');
                }

                function setCursor(type) {
                    $document.prop('body').style.cursor = type;
                }

                function colDefaultWidth() {
                    var colSpace = 100 - (scope.config.DEFAULT_ACTION_COL_WIDTH / element.parent().prop('offsetWidth') * 100);
                    return colSpace / scope.visibleColCount;
                }

                function resetColumnsWidth() {
                    var width = colDefaultWidth();
                    angular.forEach(scope.options.columns, function (col) {
                        if (col.visible) {
                            col.width = {number: width, unit: '%'};
                        }
                    });
                }

                function init() {
                    if (scope.options.columnResize) {
                        // Column resizer styles
                        var style = 'position:absolute;border:1px solid transparent;background-color:transparent;top:0;bottom:0;right:0;width:6px;cursor:col-resize;';
                        var colResizer = angular.element('<div class="colresizer" ng-click="$event.stopPropagation()" style="' + style + '"></div>');
                        colResizer.on('mousedown', onResizeStart);
                        element.css('background-clip', 'padding-box');
                        element.css('position', 'relative');
                        element.append(colResizer);
                        $compile(colResizer)(scope);
                    }
                    if (scope.colInitDone) {
                        resetColumnsWidth();
                    }
                }

                scope.$on('$destroy', function () {
                    var colResizer = element[0].querySelector('.colresizer');
                    angular.element(colResizer).off('mousedown', onResizeStart);
                    resetColumnsWidth();
                });

                init();
            }
        };
    }]);