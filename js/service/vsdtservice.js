/**
 * @ngdoc object
 * @name vsdtServ
 * @description vsdtServ provides internal functions to the vsdatable directives.
 */
vsdt.service('vsdtServ', ['$templateCache', 'vsdtConf', function ($templateCache, vsdtConf) {
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

    vsdts.getTemplate = function (tpl) {
        return angular.element($templateCache.get(tpl));
    };
    return vsdts;
}]);
