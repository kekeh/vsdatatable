angular.module('vsdatatable', [])

/**
 * @ngdoc object
 * @name vsdtConf
 * @description Constants of the vsdatatable module.
 */
    .constant('vsdtConf', {
        OVERLAY_SHOW_DELAY: 500,
        TOOLTIP_SHOW_DELAY: 500,
        TOOLTIP_CLOSE_DELAY: 1200,
        FILTER_EXECUTION_DELAY: 500,
        PAGINATOR_MAX_BTN_COUNT: 6,
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
        ROW_SELECT: 'SELECT',
        ROW_DESELECT: 'DESELECT',
        COL_RESIZER_MIN_COL_WIDTH: 35,
        DEFAULT_ACTION_COL_WIDTH: 90,
        COLUMN_PROP_VALUE: 'COLUMN_PROP_VALUE',
        DOT_SEPARATOR: '.',
        YEAR: 'yyyy',
        MONTH: 'mm',
        DAY: 'dd',
        DATES_SEPARATOR: ' - '
    })

/**
 * @ngdoc object
 * @name run
 * @description run adds the row extender template to the template cache.
 */
    .run(['$templateCache', function ($templateCache) {
        $templateCache.put('rowExtender.html', '<td class="bodyCol" colspan="{{visibleColCount+1}}"><div ng-include src="template.path"></div></td>');
    }])

/**
 * @ngdoc object
 * @name vsdtEvent
 * @description vsdtEvent provides one function which can be used to set pagination data to the
 * vsdatatable directive. This is used only when using pagination from external source (for example
 * from database).
 */
    .factory('vsdtEvent', ['vsdtConf', function (vsdtConf) {
        var vsdtf = {};
        /**
         * @ngdoc function
         * @description External pagination function to the parent. Called by the parent.
         * @name setExtPaginationData
         * @param $scope of the parent (caller)
         * @param data array of objects used in the vsdatatable. Array length is same as page size.
         * @param totalCount count of the items match the search criteria.
         */
        vsdtf.setExtPaginationData = function ($scope, data, totalCount) {
            $scope.$broadcast(vsdtConf.SET_EXT_PAGINATION_DATA_EVENT, {data: data, totalCount: totalCount});
        };
        return vsdtf;
    }])

/**
 * @ngdoc object
 * @name vsdtServ
 * @description vsdtServ provides internal functions to the vsdatable directives.
 */
    .service('vsdtServ', ['$http', '$templateCache', 'vsdtConf', function ($http, $templateCache, vsdtConf) {
        var vsdts = {};
        vsdts.isUndefined = function (val) {
            return angular.isUndefined(val);
        };

        vsdts.isEqual = function (a, b) {
            return angular.equals(a, b);
        };

        vsdts.isObject = function (val) {
            return angular.isObject(val);
        };

        vsdts.setFilterFocus = function (scope) {
            scope.$broadcast(vsdtConf.FILTER_FOCUS_EVENT);
        };

        vsdts.paginatorEvent = function (scope) {
            scope.$broadcast(vsdtConf.PAGINATOR_EVENT);
        };

        vsdts.getTemplate = function (name) {
            var p = $http.get(name, {cache: $templateCache}).success(function (resp) {
                return resp.data;
            });
            return p;
        };
        return vsdts;
    }])

/**
 * @ngdoc object
 * @name vsdatatable
 * @description vsdatatable is main directive of the vsdatatable. Options is passed as an attribute to this
 * directive.
 */
    .directive('vsdatatable', ['$compile', '$templateCache', 'vsdtConf', 'vsdtServ', function ($compile, $templateCache, vsdtConf, vsdtServ) {
        return {
            restrict: 'EA',
            templateUrl: 'templates/vsdatatable.html',
            scope: {
                options: '='
            },
            controller: ['$scope', function ($scope) {
                $scope.config = vsdtConf;
                $scope.colInitDone = false, $scope.colTogglerShow = false, $scope.busyIcon = false;
                $scope.filteredItems = [], $scope.selectedRows = [];
                $scope.totalCount = 0;
                $scope.sort = {col: '', reverse: false};
                $scope.globalFilter = '';
                $scope.columnFilter = {contain: {}, exact: {}, daterange: {}};
            }],
            link: function (scope, element, attrs) {
                var extPendingOper = null;
                var rowExtender = null;
                var operObject = {};
                var itemsLengthWatch = null;

                scope.addRow = function () {
                    operObject = {
                        oper: scope.config.OPER_ADD,
                        dataOld: {},
                        dataNew: vsdtServ.isUndefined(scope.options.templates.add.defaultValues) ? {} : angular.copy(scope.options.templates.add.defaultValues)
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
                    dataOperation(scope.config.OPER_PHASE_END);
                    if (!scope.extDataPagination && vsdtServ.isEqual(operObject.oper, scope.config.OPER_EDIT)) {
                        scope.execFilter();
                    }
                    else if (scope.extDataPagination && !vsdtServ.isEqual(operObject.oper, scope.config.OPER_VIEW)) {
                        scope.paginationOperation(operObject.oper);
                    }
                    deselectRow(operObject.dataOld);
                };

                scope.cancelClicked = function () {
                    removeRowExtender();
                };

                scope.notifyRowSelect = function (oper, data) {
                    if (!vsdtServ.isUndefined(scope.options.row.rowSelectCb)) {
                        scope.options.row.rowSelectCb(oper, data);
                    }
                };

                scope.$on(scope.config.SET_EXT_PAGINATION_DATA_EVENT, function (event, value) {
                    // External pagination event contains paged data and total count
                    scope.filteredItems = value.data;
                    scope.totalCount = value.totalCount;

                    if (!vsdtServ.isEqual(extPendingOper, scope.config.EXT_BTN) && !vsdtServ.isEqual(extPendingOper, scope.config.OPER_EDIT) && !vsdtServ.isEqual(extPendingOper, scope.config.EXT_SORT)) {
                        vsdtServ.paginatorEvent(scope);
                    }

                    if (scope.options.busyIcon.visible) {
                        scope.busyIcon = false;
                    }
                });

                scope.getColumns = function () {
                    return scope.options.columns;
                };

                scope.getOperationDataObject = function () {
                    if (vsdtServ.isEqual(operObject.oper, scope.config.OPER_ADD) || vsdtServ.isEqual(operObject.oper, scope.config.OPER_EDIT)) {
                        return {oper: operObject.oper, data: operObject.dataNew};
                    }
                    else {
                        return {oper: operObject.oper, data: operObject.dataOld};
                    }
                };

                scope.getPropertyValue = function (obj, prop) {
                    if (vsdtServ.isEqual(prop.indexOf(scope.config.DOT_SEPARATOR), -1)) {
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
                    if (!vsdtServ.isUndefined(colOpt.rules)) {
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
                    // External pagination
                    if (scope.extDataPagination) {
                        if (scope.options.busyIcon.visible) {
                            scope.busyIcon = true;
                        }

                        extPendingOper = oper;
                        if (vsdtServ.isEqual(oper, scope.config.OPER_ADD) || vsdtServ.isEqual(oper, scope.config.OPER_DELETE) || vsdtServ.isEqual(oper, scope.config.EXT_FLT)) {
                            // Reset paginator
                            scope.paginator.visiblePageIdx = 0;
                        }
                        if (vsdtServ.isEqual(oper, scope.config.OPER_ADD) || vsdtServ.isEqual(oper, scope.config.OPER_DELETE)) {
                            // Reset filter and sort - no refresh
                            resetFilterAndSort(false);
                        }

                        // Notify parent
                        scope.options.data.extPaginationOperationCb({
                            columnFilter: scope.columnFilter,
                            globalFilter: scope.globalFilter,
                            page: scope.paginator.visiblePageIdx + 1,
                            pageSize: scope.pageSize.rows,
                            sort: scope.sort
                        });
                    }
                };

                scope.checkEvent = function (event) {
                    // Mouse or enter key
                    return (vsdtServ.isEqual(event.which, 1) || vsdtServ.isEqual(event.which, 13)) && !scope.busyIcon;
                };

                var tableAreaClick = element.on("click", function (event) {
                    if (event.which === 1 && scope.colTogglerShow) {
                        scope.colTogglerShow = false;
                        scope.$apply();
                    }
                });

                function deselectRow(data) {
                    if (vsdtServ.isEqual(scope.options.row.selection, 1) || vsdtServ.isEqual(scope.options.row.selection, 2)) {
                        var idx = scope.selectedRows.indexOf(data);
                        if (!vsdtServ.isEqual(idx, -1)) {
                            scope.selectedRows.splice(idx, 1);
                            scope.notifyRowSelect(scope.config.ROW_DESELECT, data);
                        }
                    }
                }

                function resetFilterAndSort(refresh) {
                    scope.sort = {col: '', reverse: false};
                    scope.resetFilter(refresh);
                }

                function itemsLengthWatchFn() {
                    // Internal pagination
                    scope.filteredItems = scope.options.data.items;
                    scope.totalCount = scope.filteredItems.length;
                    resetFilterAndSort(false);
                    vsdtServ.paginatorEvent(scope);
                }

                function getTableRow(event) {
                    // Returns table row based on the click of the row icon
                    return angular.element(event.target).parent().parent();
                }

                function createRowExtender(rowElem) {
                    removeRowExtender();
                    rowExtender = angular.element($templateCache.get('rowExtender.html'));
                    if (vsdtServ.isEqual(operObject.oper, scope.config.OPER_ADD)) {
                        rowElem.prepend(rowExtender);
                    }
                    else {
                        rowElem.after(rowExtender);
                    }
                    $compile(rowExtender)(scope);
                }

                function removeRowExtender() {
                    if (!vsdtServ.isEqual(rowExtender, null)) {
                        rowExtender.remove();
                        rowExtender = null;
                    }
                }

                function dataOperation(phase) {
                    // Notify the parent if the data operation callback is defined
                    if (!vsdtServ.isUndefined(scope.options.data.dataOperationCb)) {
                        scope.options.data.dataOperationCb(
                            phase, operObject.oper, operObject.dataOld,
                            vsdtServ.isEqual(phase, scope.config.OPER_PHASE_BEGIN) ? {} : operObject.dataNew);
                    }
                }

                function init() {
                    scope.extDataPagination = scope.options.data.extDataPagination;
                    if (!scope.extDataPagination) {
                        itemsLengthWatch = scope.$watch('options.data.items.length', itemsLengthWatchFn);
                    }

                    var width = 90 / scope.options.columns.length;
                    scope.visibleColCount = 0;
                    angular.forEach(scope.options.columns, function (col) {
                        scope.visibleColCount = vsdtServ.isUndefined(col.visible) || col.visible ? scope.visibleColCount + 1 : scope.visibleColCount;
                        if (vsdtServ.isUndefined(col.width)) {
                            col.width = {number: width, unit: '%'};
                        }
                    });
                }

                scope.$on('$destroy', function () {
                    if (!vsdtServ.isEqual(itemsLengthWatch, null)) {
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
    .directive('colFilterTemplate', ['$compile', 'vsdtServ', function ($compile, vsdtServ) {
        return {
            restrict: 'A',
            scope: false,
            link: function (scope, element, attrs) {
                function init() {
                    var colOpt = scope.$eval(attrs.colFilterTemplate);
                    if (!vsdtServ.isUndefined(colOpt.filter) && !vsdtServ.isUndefined(colOpt.filter.template)
                        && !vsdtServ.isUndefined(colOpt.filter.match)) {
                        // Add the column filter template
                        var colTpl = angular.copy(colOpt.filter.template);
                        colTpl = colTpl.replace(scope.config.COLUMN_PROP_VALUE, 'columnFilter' + scope.config.DOT_SEPARATOR + colOpt.filter.match + scope.config.DOT_SEPARATOR + colOpt.prop + '"');
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
 * @description tableBodyRow directive handles row clicks done by user. It also hover the row in case defined in
 * the configuration.
 */
    .directive('tableBodyRow', ['vsdtServ', function (vsdtServ) {
        return {
            restrict: 'A',
            scope: false,
            link: function (scope, element, attrs) {
                scope.rowClicked = function (event, data) {
                    if (checkEvent(event)) {
                        var oper = scope.config.ROW_SELECT;
                        var idx = scope.selectedRows.indexOf(data);
                        if (scope.options.row.selection === 1 && vsdtServ.isEqual(idx, -1)) {
                            if (scope.selectedRows.length > 0) {
                                scope.notifyRowSelect(scope.config.ROW_DESELECT, scope.selectedRows[0]);
                            }
                            scope.selectedRows[0] = data;
                        }
                        else if (scope.options.row.selection === 1 && !vsdtServ.isEqual(idx, -1)) {
                            scope.selectedRows.splice(0, 1);
                            oper = scope.config.ROW_DESELECT;
                        }
                        else if (scope.options.row.selection === 2 && vsdtServ.isEqual(idx, -1)) {
                            scope.selectedRows.push(data);
                        }
                        else if (scope.options.row.selection === 2 && !vsdtServ.isEqual(idx, -1)) {
                            scope.selectedRows.splice(idx, 1);
                            oper = scope.config.ROW_DESELECT;
                        }
                        scope.notifyRowSelect(oper, data);
                    }
                };

                scope.isRowSelected = function (data) {
                    return !vsdtServ.isEqual(scope.selectedRows.indexOf(data), -1);
                };

                function checkEvent(event) {
                    return (vsdtServ.isEqual(event.which, 1) || vsdtServ.isEqual(event.which, 13))
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

                function init() {
                    if (scope.options.row.hover) {
                        element.on('mouseenter', onMouseEnter);
                        element.on('mouseleave', onMouseLeave);
                    }
                }

                init();
            }
        };
    }])

/**
 * @ngdoc object
 * @name tablePaginator
 * @description tablePaginator directive implements paginator.
 */
    .directive('tablePaginator', ['vsdtServ', function (vsdtServ) {
        return {
            restrict: 'A',
            scope: false,
            templateUrl: 'templates/vspaginator.html',
            link: function (scope, element, attrs) {
                scope.paginator = {visiblePageIdx: 0, pageFirstIdx: 0};
                scope.paginatorButtons = [], scope.disabledButtons = [];
                var initBtnCount = 0, filteredBtnCount = 0;

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
                    return vsdtServ.isEqual(val, scope.btnFirst)
                        || vsdtServ.isEqual(val, scope.btnPrev)
                        || vsdtServ.isEqual(val, scope.btnPrevSet)
                        || vsdtServ.isEqual(val, scope.btnNext)
                        || vsdtServ.isEqual(val, scope.btnNextSet)
                        || vsdtServ.isEqual(val, scope.btnLast);
                };

                scope.isDisabledBtn = function (val) {
                    return scope.isNavigateBtn(val) && !vsdtServ.isEqual(scope.disabledButtons.indexOf(val), -1);
                };

                scope.$on(scope.config.PAGINATOR_EVENT, function () {
                    reset();
                });

                function pageNavigated(val) {
                    if (vsdtServ.isEqual(val, scope.btnFirst)) {
                        toPage(0, val);
                    }
                    else if (vsdtServ.isEqual(val, scope.btnPrev)) {
                        if (vsdtServ.isEqual(scope.paginator.visiblePageIdx - scope.paginator.pageFirstIdx, 0)) {
                            toPage(scope.paginator.visiblePageIdx - filteredBtnCount, val);
                        }
                        else {
                            setPaginatorValues(scope.paginator.visiblePageIdx - 1, scope.paginator.pageFirstIdx);
                        }
                    }
                    else if (vsdtServ.isEqual(val, scope.btnPrevSet)) {
                        toPage(scope.paginator.pageFirstIdx - filteredBtnCount, val);
                    }
                    else if (vsdtServ.isEqual(val, scope.btnLast)) {
                        toPage(scope.totalPages - 1, val);
                    }
                    else if (vsdtServ.isEqual(val, scope.btnNext)) {
                        if (vsdtServ.isEqual(scope.paginator.visiblePageIdx - scope.paginator.pageFirstIdx, filteredBtnCount - 1)) {
                            toPage(scope.paginator.pageFirstIdx + filteredBtnCount, val);
                        }
                        else {
                            setPaginatorValues(scope.paginator.visiblePageIdx + 1, scope.paginator.pageFirstIdx);
                        }
                    }
                    else if (vsdtServ.isEqual(val, scope.btnNextSet)) {
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
                        if (vsdtServ.isEqual(val, scope.btnLast)) {
                            pageFirstIdx = visiblePageIdx - filteredBtnCount + 1;
                        }
                        else {
                            var checkedVal = checkMaxPageIdx(pageIdx);
                            pageFirstIdx = !vsdtServ.isEqual(checkedVal, pageIdx) ? checkedVal : pageIdx;
                        }
                    }
                    else if (pageIdx < scope.paginator.visiblePageIdx && !vsdtServ.isEqual(val, scope.btnFirst)) {
                        // Backward navigate
                        var checkedVal = checkMinPageIdx(pageIdx);
                        visiblePageIdx = pageIdx + filteredBtnCount - 1;
                        pageFirstIdx = !vsdtServ.isEqual(checkedVal, pageIdx) ? checkedVal : pageIdx;
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
                    if (scope.options.paginator.firstLastBtn.visible) {
                        scope.paginatorButtons.push(scope.btnFirst);
                    }
                    if (scope.options.paginator.prevNextBtn.visible) {
                        scope.paginatorButtons.push(scope.btnPrev);
                    }
                    if (scope.options.paginator.prevNextSetBtn.visible) {
                        scope.paginatorButtons.push(scope.btnPrevSet);
                    }

                    // Number buttons
                    for (var i = startIdx; i < filteredBtnCount + startIdx; i++) {
                        scope.paginatorButtons.push({id: i + 1, label: i + 1});
                    }

                    // Navigate forward buttons
                    if (scope.options.paginator.prevNextSetBtn.visible) {
                        scope.paginatorButtons.push(scope.btnNextSet);
                    }
                    if (scope.options.paginator.prevNextBtn.visible) {
                        scope.paginatorButtons.push(scope.btnNext);
                    }
                    if (scope.options.paginator.firstLastBtn.visible) {
                        scope.paginatorButtons.push(scope.btnLast);
                    }

                    // Set disabled buttons if needed
                    setDisabledButtons();
                }

                function setDisabledButtons() {
                    scope.disabledButtons.length = 0;
                    if (vsdtServ.isEqual(scope.paginator.visiblePageIdx, 0)) {
                        scope.disabledButtons.push(scope.btnFirst);
                        scope.disabledButtons.push(scope.btnPrev);
                    }
                    if (vsdtServ.isEqual(scope.paginator.pageFirstIdx, 0)) {
                        scope.disabledButtons.push(scope.btnPrevSet);
                    }
                    if (scope.paginator.pageFirstIdx + filteredBtnCount >= scope.totalPages) {
                        scope.disabledButtons.push(scope.btnNextSet);
                    }
                    if (scope.paginator.visiblePageIdx >= scope.totalPages - 1) {
                        scope.disabledButtons.push(scope.btnLast);
                        scope.disabledButtons.push(scope.btnNext);
                    }
                }

                function reset() {
                    calcTotalPages(scope.totalCount);
                    setPaginatorValues(0, 0);
                }

                function init() {
                    // Set labels of the paginator buttons
                    scope.btnPrev = {id: 'b', label: scope.options.paginator.prevNextBtn.labels[0]};
                    scope.btnNext = {id: 'n', label: scope.options.paginator.prevNextBtn.labels[1]};
                    scope.btnFirst = {id: 'f', label: scope.options.paginator.firstLastBtn.labels[0]};
                    scope.btnLast = {id: 'l', label: scope.options.paginator.firstLastBtn.labels[1]};
                    scope.btnPrevSet = {id: 'ps', label: scope.options.paginator.prevNextSetBtn.labels[0]};
                    scope.btnNextSet = {id: 'ns', label: scope.options.paginator.prevNextSetBtn.labels[1]};

                    scope.pageSizeOptions = scope.options.paginator.pageSizeOptions;
                    initBtnCount = scope.options.paginator.numberBtnCount > scope.config.PAGINATOR_MAX_BTN_COUNT ? scope.config.PAGINATOR_MAX_BTN_COUNT : scope.options.paginator.numberBtnCount;
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
 * @name captionBar
 * @description captionBar directive implements captionBar of the datatable.
 */
    .directive('captionBar', ['$filter', 'vsdtServ', function ($filter, vsdtServ) {
        return {
            restrict: 'A',
            scope: false,
            templateUrl: 'templates/vscaption.html',
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
    }])

/**
 * @ngdoc object
 * @name dateRangeFilter
 * @description dateRangeFilter filter which filters items by date range.
 */
    .filter("dateRangeFilter", function () {
        return function (items, key, from, to) {
            var result = [];
            angular.forEach(items, function (item) {
                var date = new Date(item[key]);
                if (date >= from && date <= to) {
                    result.push(item);
                }
            });
            return result;
        };
    })

/**
 * @ngdoc object
 * @name overlayWindow
 * @description overlayWindow directive implements overlay window to long values in the columns.
 */
    .directive('overlayWindow', ['$compile', '$timeout', 'vsdtServ', function ($compile, $timeout, vsdtServ) {
        return {
            restrict: 'A',
            scope: false,
            link: function (scope, element, attrs) {
                var overlay = null;
                var timer = null;

                scope.closeOverlay = function (event) {
                    event.stopPropagation();
                    onMouseLeave();
                };

                function onMouseEnter() {
                    if (element[0].scrollWidth > element[0].offsetWidth) {
                        timer = $timeout(function () {
                            vsdtServ.getTemplate('datatableoverlaywindow.html').then(function (tpl) {
                                overlay = angular.element(tpl.data);
                                overlay.css('margin-top', '-20px');
                                overlay.css('margin-left', '14px');
                                overlay.text(attrs.overlayWindow);
                                element.append($compile(overlay)(scope));
                            });
                        }, scope.config.OVERLAY_SHOW_DELAY);
                    }
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

                scope.$on('$destroy', function () {
                    element.off('mouseenter', onMouseEnter);
                    element.off('mouseleave', onMouseLeave);
                });

                function init() {
                    if (scope.options.showOverlay) {
                        element.on('mouseenter', onMouseEnter);
                        element.on('mouseleave', onMouseLeave);
                    }
                }

                init();
            }
        };
    }])

/**
 * @ngdoc object
 * @name vstooltip
 * @description vstooltip directive implements tooltips.
 */
    .directive('vstooltip', ['$compile', '$timeout', 'vsdtServ', function ($compile, $timeout, vsdtServ) {
        return {
            restrict: 'A',
            scope: false,
            link: function (scope, element, attrs) {
                var tooltip = null;
                var openTimer = null, closeTimer = null;

                function onMouseEnter() {
                    openTimer = $timeout(function () {
                        showTooltip();
                        closeTimer = $timeout(function () {
                            hideTooltip();
                        }, scope.config.TOOLTIP_CLOSE_DELAY, true);
                    }, scope.config.TOOLTIP_SHOW_DELAY, true);
                };

                function onMouseLeave() {
                    cancelTimer();
                    hideTooltip();
                }

                function showTooltip() {
                    vsdtServ.getTemplate('datatabletooltip.html').then(function (tpl) {
                        tooltip = angular.element(tpl.data);
                        tooltip.css('margin-left', element.prop('offsetLeft') + 'px');
                        tooltip.text(attrs.vstooltip);
                        element.append($compile(tooltip)(scope));
                    });
                }

                function hideTooltip() {
                    if (!angular.equals(tooltip, null)) {
                        tooltip.remove();
                        tooltip = null;
                    }
                }

                function cancelTimer() {
                    $timeout.cancel(openTimer);
                    $timeout.cancel(closeTimer);
                }

                scope.$on('$destroy', function () {
                    element.off('mouseenter', onMouseEnter);
                    element.off('mouseleave', onMouseLeave);
                });

                function init() {
                    if (scope.options.showTooltips) {
                        element.on('mouseenter', onMouseEnter);
                        element.on('mouseleave', onMouseLeave);
                    }
                }

                init();
            }
        };
    }])

/**
 * @ngdoc object
 * @name colResizer
 * @description colResizer directive implements column resize of the vsdatatable.
 */
    .directive('colResizer', ['$compile', '$document', 'vsdtServ', function ($compile, $document, vsdtServ) {
        return {
            restrict: 'A',
            scope: false,
            link: function (scope, element, attrs) {
                var startPos = 0, nextElem = 0, currWidth = 0, nextWidth = 0, headerWidth = 0;
                var colResizer = null;

                function onResizeStart(event) {
                    event.preventDefault();
                    startPos = event.clientX;
                    nextElem = element.next();
                    if (!vsdtServ.isEqual(nextElem.prop('id'), 'headerColAction')) {
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
                        // Create column resizer
                        vsdtServ.getTemplate('datatablecolresizer.html').then(function (tpl) {
                            colResizer = angular.element(tpl.data);
                            colResizer.on('mousedown', onResizeStart);
                            element.css('background-clip', 'padding-box');
                            element.css('position', 'relative');
                            element.append($compile(colResizer)(scope));
                        });
                    }
                    if (scope.colInitDone) {
                        resetColumnsWidth();
                    }
                }

                scope.$on('$destroy', function () {
                    colResizer.off('mousedown', onResizeStart);
                    resetColumnsWidth();
                });

                init();
            }
        };
    }]);