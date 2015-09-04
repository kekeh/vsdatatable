/**
 * @ngdoc object
 * @name colToggleMenu
 * @description colToggleMenu directive implements column toggle menu.
 */
vsdt.directive('colToggleMenu', function () {
    return {
        restrict: 'A',
        scope: false,
        templateUrl: 'templates/vsdtcoltogglemenu.html',
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
});
