/**
 * @ngdoc object
 * @name tablePaginator
 * @description tablePaginator directive implements paginator.
 */
vsdt.directive('tablePaginator', ['vsdtServ', function (vsdtServ) {
    return {
        restrict: 'A',
        scope: false,
        templateUrl: 'templates/vsdtpaginator.html',
        link: function (scope, element, attrs) {
            scope.paginator = {visiblePageIdx: 0, pageFirstIdx: 0};
            scope.paginatorButtons = [], scope.disabledButtons = [];
            var initBtnCount = 0, filteredBtnCount = 0;

            scope.pageSizeButtonClick = function (value) {
                scope.pageSize = scope.pageSizeOptions[scope.pageSizeOptions.indexOf(value)];
                reset();

                if (scope.extDataPagination) {
                    scope.paginationOperation(scope.config.EXT_BTN);
                }
            };

            scope.paginatorBtnClick = function (val, idx) {
                if (!scope.isDisabledBtn(val)) {
                    if (scope.isNavigateBtn(val)) {
                        pageNavigated(val);
                    }
                    else {
                        setPaginatorValues(val.id - 1, scope.paginator.pageFirstIdx, idx - 2);
                    }

                    if (scope.extDataPagination) {
                        scope.paginationOperation(scope.config.EXT_BTN);
                    }
                }
            };

            scope.isNavigateBtn = function (val) {
                return vsdtServ.isEqual(val, scope.btnFirst)
                    || vsdtServ.isEqual(val, scope.btnPrev)
                    || vsdtServ.isEqual(val, scope.btnPrevSet)
                    || vsdtServ.isEqual(val, scope.btnNext)
                    || vsdtServ.isEqual(val, scope.btnNextSet)
                    || vsdtServ.isEqual(val, scope.btnLast);
            };

            scope.isDisabledBtn = function (val) {
                return scope.isNavigateBtn(val) && !vsdtServ.isEqual(scope.disabledButtons.indexOf(val), -1);
            };

            scope.$on(scope.config.PAGINATOR_EVENT, function () {
                reset();
            });

            function pageNavigated(val) {
                if (vsdtServ.isEqual(val, scope.btnFirst)) {
                    toPage(0, val);
                }
                else if (vsdtServ.isEqual(val, scope.btnPrev)) {
                    if (vsdtServ.isEqual(scope.paginator.visiblePageIdx - scope.paginator.pageFirstIdx, 0)) {
                        toPage(scope.paginator.visiblePageIdx - filteredBtnCount, val);
                    }
                    else {
                        setPaginatorValues(scope.paginator.visiblePageIdx - 1, scope.paginator.pageFirstIdx);
                    }
                }
                else if (vsdtServ.isEqual(val, scope.btnPrevSet)) {
                    toPage(scope.paginator.pageFirstIdx - filteredBtnCount, val);
                }
                else if (vsdtServ.isEqual(val, scope.btnLast)) {
                    toPage(scope.totalPages - 1, val);
                }
                else if (vsdtServ.isEqual(val, scope.btnNext)) {
                    if (vsdtServ.isEqual(scope.paginator.visiblePageIdx - scope.paginator.pageFirstIdx, filteredBtnCount - 1)) {
                        toPage(scope.paginator.pageFirstIdx + filteredBtnCount, val);
                    }
                    else {
                        setPaginatorValues(scope.paginator.visiblePageIdx + 1, scope.paginator.pageFirstIdx);
                    }
                }
                else if (vsdtServ.isEqual(val, scope.btnNextSet)) {
                    toPage(scope.paginator.pageFirstIdx + filteredBtnCount, val);
                }
            }

            function calcTotalPages(itemCount) {
                scope.totalPages = Math.ceil(itemCount / scope.pageSize.rows);
            }

            function toPage(pageIdx, val) {
                var visiblePageIdx = 0, pageFirstIdx = 0;
                if (pageIdx > scope.paginator.visiblePageIdx) {
                    // Forward navigate
                    visiblePageIdx = pageIdx;
                    if (vsdtServ.isEqual(val, scope.btnLast)) {
                        pageFirstIdx = visiblePageIdx - filteredBtnCount + 1;
                    }
                    else {
                        var checkedVal = checkMaxPageIdx(pageIdx);
                        pageFirstIdx = !vsdtServ.isEqual(checkedVal, pageIdx) ? checkedVal : pageIdx;
                    }
                }
                else if (pageIdx < scope.paginator.visiblePageIdx && !vsdtServ.isEqual(val, scope.btnFirst)) {
                    // Backward navigate
                    var checkedVal = checkMinPageIdx(pageIdx);
                    visiblePageIdx = pageIdx + filteredBtnCount - 1;
                    pageFirstIdx = !vsdtServ.isEqual(checkedVal, pageIdx) ? checkedVal : pageIdx;
                }
                setPaginatorValues(visiblePageIdx, pageFirstIdx);
            }

            function setPaginatorValues(visiblePageIdx, pageFirstIdx) {
                scope.paginator = {visiblePageIdx: visiblePageIdx, pageFirstIdx: pageFirstIdx};
                setPaginatorButtons();
            }

            function checkMaxPageIdx(value) {
                return value + filteredBtnCount > scope.totalPages ? scope.totalPages - filteredBtnCount : value;
            }

            function checkMinPageIdx(value) {
                return value < 0 ? 0 : value;
            }

            function setPaginatorButtons() {
                filteredBtnCount = scope.totalPages > initBtnCount ? initBtnCount : scope.totalPages;
                var startIdx = scope.paginator.visiblePageIdx !== scope.paginator.pageFirstIdx ? scope.paginator.pageFirstIdx : scope.paginator.visiblePageIdx;
                scope.paginatorButtons.length = 0;

                // Navigate back buttons
                if (scope.options.paginator.firstLastBtn.visible) {
                    scope.paginatorButtons.push(scope.btnFirst);
                }
                if (scope.options.paginator.prevNextBtn.visible) {
                    scope.paginatorButtons.push(scope.btnPrev);
                }
                if (scope.options.paginator.prevNextSetBtn.visible) {
                    scope.paginatorButtons.push(scope.btnPrevSet);
                }

                // Number buttons
                for (var i = startIdx; i < filteredBtnCount + startIdx; i++) {
                    scope.paginatorButtons.push({id: i + 1, label: i + 1});
                }

                // Navigate forward buttons
                if (scope.options.paginator.prevNextSetBtn.visible) {
                    scope.paginatorButtons.push(scope.btnNextSet);
                }
                if (scope.options.paginator.prevNextBtn.visible) {
                    scope.paginatorButtons.push(scope.btnNext);
                }
                if (scope.options.paginator.firstLastBtn.visible) {
                    scope.paginatorButtons.push(scope.btnLast);
                }

                // Set disabled buttons if needed
                setDisabledButtons();
            }

            function setDisabledButtons() {
                scope.disabledButtons.length = 0;
                if (vsdtServ.isEqual(scope.paginator.visiblePageIdx, 0)) {
                    scope.disabledButtons.push(scope.btnFirst);
                    scope.disabledButtons.push(scope.btnPrev);
                }
                if (vsdtServ.isEqual(scope.paginator.pageFirstIdx, 0)) {
                    scope.disabledButtons.push(scope.btnPrevSet);
                }
                if (scope.paginator.pageFirstIdx + filteredBtnCount >= scope.totalPages) {
                    scope.disabledButtons.push(scope.btnNextSet);
                }
                if (scope.paginator.visiblePageIdx >= scope.totalPages - 1) {
                    scope.disabledButtons.push(scope.btnLast);
                    scope.disabledButtons.push(scope.btnNext);
                }
            }

            function reset() {
                calcTotalPages(scope.totalCount);
                setPaginatorValues(0, 0);
            }

            function init() {
                // Set labels of the paginator buttons
                scope.btnPrev = {id: 'b', label: scope.options.paginator.prevNextBtn.labels[0]};
                scope.btnNext = {id: 'n', label: scope.options.paginator.prevNextBtn.labels[1]};
                scope.btnFirst = {id: 'f', label: scope.options.paginator.firstLastBtn.labels[0]};
                scope.btnLast = {id: 'l', label: scope.options.paginator.firstLastBtn.labels[1]};
                scope.btnPrevSet = {id: 'ps', label: scope.options.paginator.prevNextSetBtn.labels[0]};
                scope.btnNextSet = {id: 'ns', label: scope.options.paginator.prevNextSetBtn.labels[1]};

                scope.pageSizeOptions = scope.options.paginator.pageSizeOptions;
                initBtnCount = scope.options.paginator.numberBtnCount > scope.config.PAGINATOR_MAX_BTN_COUNT ? scope.config.PAGINATOR_MAX_BTN_COUNT : scope.options.paginator.numberBtnCount;
                var idx = 0;
                for (var i in scope.pageSizeOptions) {
                    if (scope.pageSizeOptions[i].hasOwnProperty('default') && angular.equals(scope.pageSizeOptions[i].default, true)) {
                        idx = i;
                        break;
                    }
                }
                scope.pageSize = scope.pageSizeOptions[idx];
                reset();
            }

            scope.$on('$destroy', function () {
                scope.$off(scope.config.PAGINATOR_EVENT);
            });

            init();
        }
    };
}]);
