/**
 * @ngdoc object
 * @name dateRangeFilter
 * @description dateRangeFilter filter which filters items by date range.
 */
vsdt.filter("dateRangeFilter", function () {
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
});
