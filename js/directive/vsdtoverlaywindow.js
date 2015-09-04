/**
 * @ngdoc object
 * @name overlayWindow
 * @description overlayWindow directive implements overlay window to long values in the columns.
 */
vsdt.directive('overlayWindow', ['$compile', '$timeout', 'vsdtServ', function ($compile, $timeout, vsdtServ) {
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
                        overlay = vsdtServ.getTemplate('templates/vsdtoverlaywindow.html');
                        overlay.css('margin-top', '-20px');
                        overlay.css('margin-left', '14px');
                        overlay.text(attrs.overlayWindow);
                        element.append($compile(overlay)(scope));
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
}]);
