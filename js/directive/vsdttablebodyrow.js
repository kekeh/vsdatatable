/**
 * @ngdoc object
 * @name tableBodyRow
 * @description tableBodyRow directive handles row clicks done by user. It also hover the row in case defined in
 * the configuration.
 */
vsdt.directive('tableBodyRow', ['vsdtServ', function (vsdtServ) {
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
}]);
