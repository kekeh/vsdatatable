/**
 * @ngdoc object
 * @name colResizer
 * @description colResizer directive implements column resize of the vsdatatable.
 */
vsdt.directive('colResizer', ['$compile', '$document', 'vsdtServ', function ($compile, $document, vsdtServ) {
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
                    colResizer = vsdtServ.getTemplate('templates/vsdtcolresizer.html');
                    colResizer.on('mousedown', onResizeStart);
                    element.css('background-clip', 'padding-box');
                    element.css('position', 'relative');
                    element.append($compile(colResizer)(scope));
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
