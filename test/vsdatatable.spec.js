describe('vsdatatable', function () {
    var elm, scope;

    beforeEach(module('vsdatatable'));

    beforeEach(inject(function ($rootScope, $compile) {
        scope = $rootScope;

        // Header column filter templates
        var colInputFilterTemplate =
            '<div class="columnTemplate">' +
            '<input type="text" class="inputField" ng-click="$event.stopPropagation();" ng-model="COLUMN_PROP_VALUE" ng-model-options="{debounce:500}" placeholder="Type filter...">' +
            '</div>';

        var colSelectCarFeaturesFilterTemplate =
            '<div class="columnTemplate">' +
            '<select class="selectMenu" ng-click="$event.stopPropagation();" ng-model="COLUMN_PROP_VALUE" ng-options="features.value as features.label for features in [{label: \'Choose\', value:undefined},{label: \'Set 1\', value:\'1\'},{label: \'Set 2\', value:\'2\'},{label: \'Set 3\', value:\'3\'}]"></select>' +
            '</div>';

        // callback onDataOperation
        var onDataOperation = function (phase, operation, dataOld, dataNew) {
            console.log('*** PARENT - onDataOperation: phase: ', phase, ' - operation: ', operation, ' - dataOld: ', dataOld, ' - dataNew: ', dataNew);
        };

        // callback onRowSelect
        var onRowSelect = function (operation, rowData) {
            console.log('*** PARENT - onRowSelect - operation: ', operation, ' - rowData: ', rowData);
        };

        // Configuration of the vsdatatable
        scope.opt = {
            data: {
                items: generateData(),
                dataOperationCb: onDataOperation,
                extDataPagination: false
            },
            caption: {
                text: 'vsdatatable example'
            },
            busyIcon: {         // Currently this works only if the extDataPagination is true
                visible: false,
                text: 'Loading data...'
            },
            showTooltips: true,
            showOverlay: true,
            headerVisible: true,
            columnResize: true,
            columns: [
                {
                    prop: 'id',
                    label: 'Id number',
                    sorting: false,
                    filter: {template: colInputFilterTemplate, match: 'contain'},
                    width: {number: 5, unit: '%'},
                    visible: false
                },
                {
                    prop: 'car.price',  // Value from second level (property price from the car object)
                    label: 'Car.price',
                    textAlign: 'right',
                    sorting: true,
                    filter: {template: colInputFilterTemplate, match: 'contain'},
                    width: {number: 10, unit: '%'},
                    visible: true
                },
                {
                    prop: 'car.features',  // Value from second level (property class from the car object)
                    label: 'Car.features',
                    textAlign: 'center',
                    sorting: true,
                    filter: {template: colSelectCarFeaturesFilterTemplate, match: 'exact'},
                    width: {number: 10, unit: '%'},
                    visible: true
                },
                {
                    prop: 'car.age',
                    label: 'Car.age',
                    textAlign: 'right',
                    sorting: true,
                    filter: {template: colInputFilterTemplate, match: 'contain'},
                    width: {number: 10, unit: '%'},
                    visible: true
                },
            ],
            row: {
                selection: 1, // 0=No, 1=Single, 2=Multiple
                rowSelectCb: onRowSelect,
                hover: true
            },
            columnToggler: {
                visible: true,
                btnTooltip: 'Select columns',
                menuTitle: 'Columns'
            },
            filter: {
                global: true,
                column: true,
                autoFilter: {
                    useAutoFilter: true,
                    filterDelay: 600
                },
                globalPlaceholder: 'Type filter...',
                showFilterBtnTooltip: 'Show filter',
                hideFilterBtnTooltip: 'Hide filter',
                filterBtn: {
                    visible: true,
                    filterBtnTooltip: 'Filter'
                }
            },
            paginator: {
                visible: true,
                numberBtnCount: 3,
                prevNextBtn: {
                    visible: true,
                    labels: ['back', 'next']
                },
                prevNextSetBtn: {
                    visible: true,
                    labels: ['...', '...']
                },
                firstLastBtn: {
                    visible: true,
                    labels: ['first', 'last']
                },
                pageSizeOptions: [
                    {label: '4', rows: 4, default: false},
                    {label: '7', rows: 7, default: true},
                    {label: '15', rows: 15, default: false},
                    {label: '20', rows: 20, default: false}],
                pageSizeTxt: 'Page size: ',
                totalItemsTxt: 'Total: '
            },
            useTemplates: true,
            actionColumnText: 'Action',
            templates: {
                add: {
                    path: '',
                    actionBtnShow: true,
                    btnTooltip: 'Add',
                    defaultValues: {car: {features: 1}, active: false}
                },
                edit: {path: '', actionBtnShow: true, btnTooltip: 'Edit'},
                delete: {path: '', actionBtnShow: true, btnTooltip: 'Delete'},
                view: {path: '', actionBtnShow: true, btnTooltip: 'View'}
            }
        };

        elm = angular.element('<vsdatatable options="opt"></vsdatatable>');

        $compile(elm)(scope);
        scope.$digest();

    }));

    function generateData() {
        var jsonData = [];
        for (var i = 0; i < 50; i++) {
            var pr = price(300000, 10000);
            var item = {
                id: i + 1,
                car: {
                    price: pr,
                    features: pr <= 100000 ? 1 : pr <= 200000 ? 2 : 3,
                    age: Math.round((Math.random() * 58) + 1)
                }
            };
            jsonData.push(item);
        }

        return jsonData;
    }

    function price(max, min) {
        var b = Math.round((Math.random() * max) + min) + '.' + Math.round((Math.random() * 99) + 1).toString();
        return parseFloat(b);
    }


    it('caption', function () {
        expect(elm[0].querySelectorAll('.caption').length).toBe(1);
    });

    it('captionColToggler', function () {
        expect(elm[0].querySelectorAll('.captionColToggler').length).toBe(1);
    });

    it('captionTitle', function () {
        expect(elm[0].querySelectorAll('.captionTitle').length).toBe(1);
    });

    it('captionTitle span', function () {
        var tElem = elm[0].querySelectorAll('.captionTitle span');
        expect(angular.element(tElem).text()).toEqual('vsdatatable example');
    });

    it('captionFilter', function () {
        expect(elm[0].querySelectorAll('.captionFilter').length).toBe(1);
    });

    it('captionFilter input', function () {
        expect(elm[0].querySelectorAll('.captionFilter input').length).toBe(1);
    });

    it('captionFilter input placeholder', function () {
        var tElem = elm[0].querySelectorAll('.captionFilter input');
        expect(angular.element(tElem).attr('placeholder')).toEqual('Type filter...');
    });

    it('captionFilter span', function () {
        expect(elm[0].querySelectorAll('.captionFilter span').length).toBe(3);
    });

    it('tableRows tableHeader headerRow', function () {
        expect(elm[0].querySelectorAll('.tableRows .tableHeader .headerRow').length).toBe(1);
    });

    it('tableRows tableHeader headerRow th', function () {
        expect(elm[0].querySelectorAll('.tableRows .tableHeader .headerRow th').length).toBe(4);
    });

    it('tableRows tableHeader headerRow headerCol sortColIcon', function () {
        expect(elm[0].querySelectorAll('.tableRows .tableHeader .headerCol .sortColIcon').length).toBe(3);
    });

    it('tableRows headerColAction span', function () {
        var tElem = elm[0].querySelectorAll('.tableRows .headerColAction span');
        expect(angular.element(tElem).text()).toEqual('Action');
    });

    it('tableRows headerColAction addItemIcon', function () {
        expect(elm[0].querySelectorAll('.tableRows .headerColAction .addItemIcon').length).toBe(1);
    });


    it('tableRows tableBody bodyRow', function () {
        expect(elm[0].querySelectorAll('.tableRows .tableBody .bodyRow').length).toBe(7);
    });

    it('tableRows tableBody bodyCol', function () {
        expect(elm[0].querySelectorAll('.tableRows .tableBody .bodyCol').length).toBe(28);
    });

    it('tableRows tableBody bodyColAction', function () {
        expect(elm[0].querySelectorAll('.tableRows .tableBody .bodyColAction').length).toBe(7);
    });

    it('tableRows tableBody bodyColAction icon-edit', function () {
        expect(elm[0].querySelectorAll('.tableRows .tableBody .bodyColAction .icon-edit').length).toBe(7);
    });

    it('tableRows tableBody bodyColAction icon-clear', function () {
        expect(elm[0].querySelectorAll('.tableRows .tableBody .bodyColAction .icon-clear').length).toBe(7);
    });

    it('tableRows tableBody bodyColAction icon-view', function () {
        expect(elm[0].querySelectorAll('.tableRows .tableBody .bodyColAction .icon-view').length).toBe(7);
    });


    it('tableFooter', function () {
        expect(elm[0].querySelectorAll('.tableFooter').length).toBe(1);
    });

    it('paginator', function () {
        expect(elm[0].querySelectorAll('.paginator').length).toBe(1);
    });

    it('paginator paginatorTxt', function () {
        expect(elm[0].querySelectorAll('.paginator .paginatorTxt').length).toBe(2);
        var tElem = elm[0].querySelectorAll('.paginator .paginatorTxt');
        expect(angular.element(tElem).text()).toEqual('Total: Page size: ');
    });

    it('paginator paginatorTotalNbr', function () {
        expect(elm[0].querySelectorAll('.paginator .paginatorTotalNbr').length).toBe(1);
        var tElem = elm[0].querySelectorAll('.paginator .paginatorTotalNbr');
        expect(angular.element(tElem).text()).toEqual('50');
    });

    it('paginator paginatorPagesNbr', function () {
        expect(elm[0].querySelectorAll('.paginator .paginatorPagesNbr').length).toBe(1);
        var tElem = elm[0].querySelectorAll('.paginator .paginatorPagesNbr');
        expect(angular.element(tElem).text()).toEqual('(1/8)');
    });

    it('paginator paginatorBtn', function () {
        expect(elm[0].querySelectorAll('.paginator .paginatorBtn').length).toBe(13);
    });

    it('paginator selectedPaginatorBtn', function () {
        expect(elm[0].querySelectorAll('.paginator .selectedPaginatorBtn').length).toBe(2);
        var tElem = elm[0].querySelectorAll('.paginator .selectedPaginatorBtn');
        expect(angular.element(tElem[0]).text().trim()).toEqual('1');
        expect(angular.element(tElem[1]).text().trim()).toEqual('7');
    });

    it('paginator paginatorBtnPageSize', function () {
        expect(elm[0].querySelectorAll('.paginator .paginatorBtnPageSize').length).toBe(4);
        var tElem = elm[0].querySelectorAll('.paginator .paginatorBtnPageSize');
        expect(angular.element(tElem[0]).text().trim()).toEqual('4');
        expect(angular.element(tElem[1]).text().trim()).toEqual('7');
        expect(angular.element(tElem[2]).text().trim()).toEqual('15');
        expect(angular.element(tElem[3]).text().trim()).toEqual('20');
    });

    it('colTogglerMenu', function () {
        expect(elm[0].querySelectorAll('.colTogglerMenu').length).toBe(1);
    });

    it('colTogglerMenu colTogglerTitleTxt', function () {
        expect(elm[0].querySelectorAll('.colTogglerMenu .colTogglerTitleTxt').length).toBe(1);
        var tElem = elm[0].querySelectorAll('.colTogglerMenu .colTogglerTitleTxt');
        expect(angular.element(tElem).text().trim()).toEqual('Columns');
    });

    it('colTogglerMenu colTogglerCloseIcon', function () {
        expect(elm[0].querySelectorAll('.colTogglerMenu .colTogglerCloseIcon').length).toBe(1);
    });

    it('colTogglerMenu colTogglerMenuItem', function () {
        expect(elm[0].querySelectorAll('.colTogglerMenu .colTogglerMenuItem').length).toBe(4);
    });

    it('colTogglerMenu colTogglerMenuItemTxt', function () {
        expect(elm[0].querySelectorAll('.colTogglerMenu .colTogglerMenuItemTxt').length).toBe(4);
        var tElem = elm[0].querySelectorAll('.colTogglerMenu .colTogglerMenuItemTxt');
        expect(angular.element(tElem[0]).text().trim()).toEqual('Id number');
        expect(angular.element(tElem[1]).text().trim()).toEqual('Car.price');
        expect(angular.element(tElem[2]).text().trim()).toEqual('Car.features');
        expect(angular.element(tElem[3]).text().trim()).toEqual('Car.age');
    });

    it('colTogglerMenu colTogglerMenuItemIcon', function () {
        expect(elm[0].querySelectorAll('.colTogglerMenu .colTogglerMenuItemIcon').length).toBe(4);
    });
});

