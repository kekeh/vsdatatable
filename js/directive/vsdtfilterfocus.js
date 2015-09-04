/**
 * @ngdoc object
 * @name filterFocus
 * @description filterFocus is directive which set focus to the global filter input box when the filter icon is clicked.
 */
vsdt.directive('filterFocus', ['$timeout', function ($timeout) {
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
}]);
