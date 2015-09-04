/**
 * @ngdoc object
 * @name colFilterTemplate
 * @description colFilterTemplate adds column filter (for example input box) to the each column defined in the configuration.
 */
vsdt.directive('colFilterTemplate', ['$compile', 'vsdtServ', function ($compile, vsdtServ) {
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
}]);
