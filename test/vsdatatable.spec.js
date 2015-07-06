describe('vsdatatable', function() {
    var elm, scope;

    beforeEach(module('vsdatatable'));

    beforeEach(inject(function($rootScope, $compile, vsdatatableEvent) {
        scope = $rootScope;

        eventapi = vsdatatableEvent;

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
                visible: true,
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
                    {label: '4', rows: 4},
                    {label: '7', rows: 7, default: true},
                    {label: '15', rows: 15},
                    {label: '20', rows: 20}],
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


    it('is caption', function () {
        expect(elm[0].querySelectorAll('.caption').length).toBe(1);
    });

    it('is captionColToggler', function () {
        expect(elm[0].querySelectorAll('.captionColToggler').length).toBe(1);
    });

    it('is captionTitle', function () {
        expect(elm[0].querySelectorAll('.captionTitle').length).toBe(1);
    });

    it('is captionTitle span', function () {
        var tElem = elm[0].querySelectorAll('.captionTitle span');
        expect(angular.element(tElem).text()).toEqual('vsdatatable example');
    });

    it('is captionFilter', function () {
        expect(elm[0].querySelectorAll('.captionFilter').length).toBe(1);
    });

    it('is captionFilter input', function () {
        expect(elm[0].querySelectorAll('.captionFilter input').length).toBe(1);
    });

    it('is captionFilter input placeholder', function () {
        var tElem = elm[0].querySelectorAll('.captionFilter input');
        expect(angular.element(tElem).attr('placeholder')).toEqual('Type filter...');
    });

    it('is captionFilter span', function () {
        expect(elm[0].querySelectorAll('.captionFilter span').length).toBe(2);
    });

    it('is tableRows tableHeader headerRow', function () {
        expect(elm[0].querySelectorAll('.tableRows .tableHeader .headerRow').length).toBe(1);
    });

    it('is tableRows tableHeader headerRow th', function () {
        expect(elm[0].querySelectorAll('.tableRows .tableHeader .headerRow th').length).toBe(4);
    });

    it('is tableRows tableHeader headerRow headerCol sortColIcon', function () {
        expect(elm[0].querySelectorAll('.tableRows .tableHeader .headerCol .sortColIcon').length).toBe(3);
    });

    it('is tableRows headerColAction span', function () {
        var tElem = elm[0].querySelectorAll('.tableRows .headerColAction span');
        expect(angular.element(tElem).text()).toEqual('Action');
    });

    it('is tableRows headerColAction addItemIcon', function () {
        expect(elm[0].querySelectorAll('.tableRows .headerColAction .addItemIcon').length).toBe(1);
    });





});

