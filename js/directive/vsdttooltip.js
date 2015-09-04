/**
 * @ngdoc object
 * @name vstooltip
 * @description vstooltip directive implements tooltips.
 */
vsdt.directive('vstooltip', ['$compile', '$timeout', 'vsdtServ', function ($compile, $timeout, vsdtServ) {
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
                tooltip = vsdtServ.getTemplate('templates/vsdttooltip.html');
                tooltip.css('margin-left', element.prop('offsetLeft') + 'px');
                tooltip.text(attrs.vstooltip);
                element.append($compile(tooltip)(scope));
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
}]);
