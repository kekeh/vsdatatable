/**
 * @ngdoc object
 * @name vsdatatable
 * @description vsdatatable is main directive of the vsdatatable. Options is passed as an attribute to this
 * directive.
 */
vsdt.directive('vsdatatable', ['$compile', 'vsdtConf', 'vsdtServ', function ($compile, vsdtConf, vsdtServ) {
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
            var itemsChangeWatch = null;

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

            function itemsChangeIntWatchFn() {
                // Internal pagination
                scope.filteredItems = scope.options.data.items;
                scope.totalCount = scope.filteredItems.length;
                resetFilterAndSort(false);
                vsdtServ.paginatorEvent(scope);
            }

            function itemsChangeExtWatchFn(val) {
                // External pagination
                scope.filteredItems = val.items;
                scope.totalCount = val.totalCount;
                if (!vsdtServ.isEqual(extPendingOper, scope.config.EXT_BTN)
                    && !vsdtServ.isEqual(extPendingOper, scope.config.OPER_EDIT)
                    && !vsdtServ.isEqual(extPendingOper, scope.config.EXT_SORT)) {
                    vsdtServ.paginatorEvent(scope);
                }
                if (scope.options.busyIcon.visible) {
                    scope.busyIcon = false;
                }
            }

            function getTableRow(event) {
                // Returns table row based on the click of the row icon
                return angular.element(event.target).parent().parent();
            }

            function createRowExtender(rowElem) {
                removeRowExtender();
                rowExtender = vsdtServ.getTemplate('templates/vsdtrowextender.html');
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
                    itemsChangeWatch = scope.$watch('options.data.items.length', itemsChangeIntWatchFn);
                }
                else {
                    itemsChangeWatch = scope.$watchCollection('options.data.extItems', itemsChangeExtWatchFn);
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
                itemsChangeWatch();
                element.off('click', tableAreaClick);
            });

            init();
        }
    };
}]);
