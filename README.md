# vsdatatable v. 0.0.3

**Simple single page datatable - AngularJS UI reusable component**

## Description
AngularJS directive which implements the datatable with many useful and configurable features.

### 1. virtualization
* only visible items are rendered in the browser.

### 2. paginator
* pagination from the external data source is also supported (for example database).
* configurable buttons
 - to first page
 - to previous page
 - to previous set of pages
 - to page numbered
 - to next set of pages
 - to next page
 - to last page
* configurable page size selector
* scrollbar is not supported

### 2. filtering
* built in global filter
* column filter can be optionally added by using a HTML template
* the global and the column filter works also if the data is paginated from the external data source
* contain and exact match can be used
* internal filtering uses AngularJS filter

### 3. sorting
* built in sorting by column
* sorting works also if the data is paginated from the external data source
* internal sorting uses AngularJS filter

### 4. row extender
* support for adding, editing, deleting and viewing data
* data manipulation is done inside the table by extending the row
* user of the vsdatatable is responsible to implement these HTML templates (add, edit, delete and view)
* the vsdatatable directive loads the template and extending the row when the user wants to manipulate the data

### 5. column toggler
* columns can be shown/hidden from the menu

### 6. column resize
* columns can resized

### 7. row selection
* enable or disable
* single or multiple selection is possible if enabled
* the selected row data is passed to the parent

### 8. responsive UI
* vsdatatable UI is responsive and scalable to different size of devices

### 9. tooltips
* tooltips are used to shown the string which are not fit to the column

### 10. touch and keyboard
* works with touch devices
* works with keyboard

### 11. accepts nested objects
* input object is array of objects (items)
* item of the array can contain nested objects

### 12. block the vsdatatable UI
* built in UI blocker in case of external pagination

### 13. column styles
* column styles can be added to the body columns
* styles are rendered if given expression rules are met


## Usage

* include the **vsdatatable-0.0.3.min.js** and the **vsdatatable-0.0.3.min.css** files into your project. See the **Build project** and the **Installation** chapters below.
```html
<script src="vsdatatable-0.0.3.min.js"></script>
<link href="vsdatatable-0.0.3.min.css" rel="stylesheet" type="text/css">
```
* inject the **vsdatatable** module into your application module.
```js
angular.module('vssampleapp', ['vsdatatable']);
```
* add **vsdatatable** HTML tag into your HTML file. See the **HTML example** chapter below.
* add needed Javascript code. See the **Javascript example** chapter below.

### HTML example
```html
<vsdatatable options="opt"></vsdatatable>
```

### Tags
| Tag  | Description | Mandatory | 
| :------------ |:---------------|:---------------|
| vsdatatable | vsdatatable tag | yes |


### Attributes
| Attribute | Description | Mandatory | 
| :------------ |:---------------|:---------------|
| options | vsdatatable option passed to the directive. See the **Options data** chapter below. | yes |


### Options data (an option attribute in the vsdatatable directive)

* The **sampleapp.js** file contain example configuration. The file is [here](https://github.com/kekeh/vsdatatable/blob/master/examples/sampleapp.js)

| Attribute | Description | Values | Mandatory |
| :------------ |:---------------|:---------------|:---------------|
| **data** | Object which contain sub properties. | See below. | yes |
| data.**items** | Array of data shown in the vsdatable. Contains all items. This is used when **not** using external pagination. | array of objects | Depends on is external pagination used. yes/no |
| data.**dataOperationCb** | Data operation (add, edit, delete or view) callback. The function is called twice (OPER_PHASE_BEGIN and OPER_PHASE_END) during one operation. | function. See the **dataOperationCb** chapter below. | no |
| data.**extDataPagination** | Boolean indicating is external or internal data pagination used. If **true** the data is paged from external source and the function **vsdatatableEvent.setExtPaginationData** is used. If **false** the all data is given with the data.**items** property.| true/false | yes |
| data.**extPaginationOperationCb** | Data pagination callback used only if the previous property is **true**. | function. See the **extPaginationOperationCb** chapter below. | no |
| **caption** | Object which contain sub properties. | See below. | yes |
| caption.**visible** | Is vsdatatable caption visible or not. | true or false | yes |
| caption.**text** | Caption text. | User defined text. | no |
| **busyIcon** | Object which contain sub properties. | See below. | yes |
| busyIcon.**visible** | Is busy icon visible or not. Busy icon works only if external pagination is used. The **data.extDataPagination** is **true**. The busy icon blocks the vsdatatable UI during data load. | true or false | yes |
| busyIcon.**text** | Busy icon text. | User defined text. | yes |
| **showTooltips** | Is tooltips shown or not. | true or false | yes |
| **showOverlay** | Is overlay shown or not. Overlay pops up if the width of the column is not enough to the value of the column. | true or false | yes |
| **headerVisible** | Is vsdatatable header visible or not. | true or false | yes |
| **columnResize** | Is column resize enable ot not. | true or false | yes |
| **columns** | Array of objects defining the columns of the vsdatatable. | See the **column configuration object** chapter below. | yes |
| **row** | Object which contain sub properties. | See below. | yes |
| row.**selection** | Is row selection enabled or not. | 0=No selection enabled, 1=Single row selection enabled or 2=Multiple row selection enabled | yes |
| row.**rowSelectCb** | Row selection callback. | function. See the **rowSelectCb** chapter below. | no |
| row.**hover** | Is row hover enabled or not when the mouse is over the row. | true or false | no |
| **columnToggler** | Object which contain sub properties. | See below. | yes |
| row.**visible** | Is column toggler menu visible or not. | true or false | yes |
| row.**btnTooltip** | Column toggler button tooltip. | text | yes |
| row.**menuTitle** | Column toggler menu title. | text | yes |
| **filter** | Object which contain sub properties. | See below. | yes |
| filter.**global** | Is global filter enabled or not. | true or false | yes |
| filter.**column** | Is column filter enabled or not. See the **column configuration object** chapter about the **filter** property. | true or false | yes |
| **filter.autoFilter** | Object which contain sub properties. | See below. | yes |
| filter.autoFilter.**useAutoFilter** | Is auto filter used or not. Auto filter call automatically filter when user types text to filter box after the defined delay. See next property. | true or false | yes |
| filter.autoFilter.**filterDelay** | Delay in millisecond. When the user stop typing filter is execute automatically after this time. | number | yes if the previous property is true |
| filter.**globalPlaceholder** | Global filter input box placeholder text. | text | yes |
| filter.**showFilterBtnTooltip** | Show filter button tooltip. | text | yes |
| filter.**hideFilterBtnTooltip** | Show filter button tooltip. | text | yes |
| **filter.filterBtn** | Object which contain sub properties. | See below. | yes |
| filter.filterBtn.**visible** | Is filter button visible or not. | true or false | yes |
| filter.filterBtn.**filterBtnTooltip** | Filter button tooltip. | text | yes |
| **paginator** | Object which contain sub properties. | See below. | yes |
| paginator.**visible** | Is paginator visible or not. | true or false | yes |
| paginator.**numberBtnCount** | Number button count in the paginator. Maximum is 6. | number | yes |
| paginator.**prevNextBtn** | Object which contain sub properties. | See below. | yes |
| paginator.prevNextBtn.**visible** | Is previous page and next page buttons visible in the paginator or not. | true or false | yes |
| paginator.prevNextBtn.**labels** | Array of two strings. Labels (visible in UI) of the buttons. | strings | yes 
| paginator.**prevNextSetBtn** | Object which contain sub properties. | See below. | yes |
| paginator.prevNextSetBtn.**visible** | Is previous set of pages and next set of pages buttons visible in the paginator or not. | true or false | yes |
| paginator.prevNextSetBtn.**labels** | Array of two strings. Labels (visible in UI) of the buttons. | strings | yes |
| paginator.**firstLastBtn** | Object which contain sub properties. | See below. | yes |
| paginator.firstLastBtn.**visible** | Is first page and last page buttons visible in paginator or not. | true or false | yes |
| paginator.firstLastBtn.**labels** | Array of two strings. Labels (visible in UI) of the buttons. | strings | yes |
| paginator.**pageSizeOptions** | Array of objects defining the page size options of the vsdatatable. | See the **page size options** chapter below. | yes |
| paginator.**pageSizeTxt** | Visible text near the page size selection buttons. | text | yes |
| paginator.**totalItemsTxt** | Visible text near the total item count number. | text | yes |
| **useTemplates** | Is templates used or not. | true or false | yes |
| **actionColumnText** | Action column header text. Action column contain buttons to add, edit, delete and view operations. See below **templates** property. | text | no |
| **templates** | Object which contain sub properties. | See below. | no |
| **templates** | Object containing objects which each define template configuration. | See the **template configuration object** chapter below. | no |



#### dataOperationCb

Example of the function. See description of the parameters below the example.

```js
var onDataOperation = function (phase, operation, dataOld, dataNew) {
    if (phase === vsdatatableConfig.OPER_PHASE_END && operation === vsdatatableConfig.OPER_ADD) {
    }
    else if (phase === vsdatatableConfig.OPER_PHASE_END && operation === vsdatatableConfig.OPER_EDIT) {
    }
    else if (phase === vsdatatableConfig.OPER_PHASE_END && operation === vsdatatableConfig.OPER_DELETE) {
    }
    else if (phase === vsdatatableConfig.OPER_PHASE_END && operation === vsdatatableConfig.OPER_VIEW) {
    }
};
```

| Function | Parameters | Description | 
| :------------ |:---------------|:---------------|
| dataOperationCb | phase (begin or end), operation (add, edit, delete or view), dataOld, dataNew  | Called when the user start and end the operation. |

##### Parameters
* phase - vsdatatableConfig.OPER_PHASE_BEGIN or vsdatatableConfig.OPER_PHASE_END.
* operation - vsdatatableConfig.OPER_ADD, vsdatatableConfig.OPER_EDIT, vsdatatableConfig.OPER_DELETE or vsdatatableConfig.OPER_VIEW.
* dataOld - the old data of the row if the data has changed during the operation.
* dataNew - the new data of the row if the data has changed during the operation.



#### extPaginationOperationCb

Example of the function. See description of the parameters below the example.

```js
var onPaginationOperation = function (paginationOpt) {
};
```

| Function | Parameters | Description | 
| :------------ |:---------------|:---------------|
| extPaginationOperationCb | paginationOpt | Called if external pagination is used and the used do pagination operation (page size change, visible page change, filtering change or sorting change) in the UI. |

##### Parameters
* paginationOpt - JSON object containing the pagination options.



#### column configuration object

Example of the column configuration. See description of the properties below the example.

```js
{
    prop: 'car.price',
    label: 'Car price',
    textAlign: 'right',
    sorting: true,
    filter: {template: colInputFilterTemplate, match: 'contain'},
    width: {number: 14, unit: '%'},
    visible: true,
    rules: [
        {style: 'carPriceStyleGreen', prop: 'car.price', expression: 'car.price >= 150000 && car.price <= 250000'},
        {style: 'carPriceStyleRed', prop: 'car.price', expression: 'car.price < 30000'},
        {style: 'carPriceStyleRed', prop: 'car.age', expression: 'car.age > 50'}
    ]
}
```

| Property | Description | 
| :------------ |:---------------|
| prop | Column name. Same as property the name in the data JSON. |
| label | Visible column name. |
| textAlign | Column text alignment (left, center or right). |
| sorting | Is column sorting used (true or false). Adds sortinh icon to the column header. |
| filter | Column filter. HTML template is needed. Each filter template must contain this **ng-model="COLUMN_PROP_VALUE"**. See example **column filter template** of the input box filter below. Also type of match needs to defined. It can be **exact** or **contain** |
| width | Width of the column. Contains number and unit. Unit can be **%** or **px** |
| visible | Is column initially visible or not.(true or false) If this is false the user can later toggle column visible from the column toggle menu. |
| rules | Array of objects. Each object contains the style definition to the column. If array has more than on object, first style of match is used and the rest styles are ignored.|
| rules.style | CSS class name containing the style definitions of the column. |
| rules.prop | Property name used in the rule. Same value have to be also in the expression property. Property can be also other property than the column property. See the example above (car.age). |
| rules.expression | Expression which can be evaluated using the $eval() function. |


##### column filter template

```html
<div class="columnTemplate">
<input type="text" class="inputField" ng-click="$event.stopPropagation();" ng-model="COLUMN_PROP_VALUE" 
        ng-model-options="{debounce:600}" placeholder="Type filter...">
</div>
```



#### rowSelectCb

Example of the function. See description of the parameters below the example.

```js
var onRowSelect = function (operation, rowData) {
};
```

| Function | Parameters | Description | 
| :------------ |:---------------|:---------------|
| rowSelectCb | operation and rowData | Called when the user selects row(s) from the UI. |

##### Parameters
* operation - vsdatatableConfig.SELECT or vsdatatableConfig.DESELECT.
* rowData - JSON object containing the selected/deselected row data.



#### page size options

Example of the configuration of the page size options. See description of the properties below the example.

```js
pageSizeOptions: [
    {label: '4', rows: 4},
    {label: '7', rows: 7, default: true},
    {label: '15', rows: 15},
    {label: '20', rows: 20}]
```

| Property | Description | 
| :------------ |:---------------|
| label | Visible label on the page size selection button. |
| rows | How many row(s) is visible when the button is selected. This is number value. |
| default | Default value when the vsdatatable is loaded. The value can be true or false. |



#### template configuration object

Example of the configuration of the template options. See description of the properties below the example. 
The **templates** can contain **add**, **edit**, **delete** or **view** templates. The template configuration is an
object which contain properties **path**, **actionBtnShow** and **btnTooltip**. The **add** configuration can contain also the 
**defaultValues** property.

```js
templates: {
    add: {path: 'partials/template/add_edit.html', actionBtnShow: true, btnTooltip: 'Add', defaultValues: {car: {class: 1}, active: false}},
    edit: {path: 'partials/template/add_edit.html', actionBtnShow: true, btnTooltip: 'Edit'},
    delete: {path: 'partials/template/view_delete.html', actionBtnShow: true, btnTooltip: 'Delete'},
    view: {path: 'partials/template/view_delete.html', actionBtnShow: true, btnTooltip: 'View'}
}
```

| Property | Description | 
| :------------ |:---------------|
| path | Path to the HTML template. |
| actionBtnShow | Is the action button visible in the action column. |
| btnTooltip | Action button tooltip. |
| defaultValues | Object containing the default values of the **add** operation. |

### Javascript example
```js
var sampleapp = angular.module('vssampleapp', ['vsdatatable']);
sampleapp.controller('vsDatatableCtrl', function ($scope, vsdatatableConfig, vsdatatableEvent) {
```

By injecting the **vsdatatableConfig** the parent can change some of the default configuration values of the vsdatatable.
By injecting the **vsdatatableEvent** the parent can send pagination data to the vsdatatable. This method is used only 
if the data is paginated from external data source and the parent handles paging, filtering and sorting.

Example of the function. See description of the parameters below the example.

```js
vsdatatableEvent.setExtPaginationData($scope, pagedItems, totalItems);
```

| Function | Parameters | Description | 
| :------------ |:---------------|:---------------|
| setExtPaginationData | $scope, pagedItems, totalItems | Set external paginated dat to the vsdatatable. |

## Parameters
* $scope - sender scope
* pagedItems - array of objects viewed in the table. Size of the array is one page in the vsdatatable.
* totalItems - number of total items match to the search criteria.

## Demo
In the **examples** folder of this project has the sample application and the online demo is [here](http://kekeh.github.io/vsdatatable)

## Dependencies
Depends on AngularJS. Implemented using the AngularJS version 1.3.15. No other dependencies.

## Build project
* Build can be done by executing the **grunt** command. It creates the **dist/debug** and the **dist/min** folders and put files to these folders.
```js
grunt
```

## Installation
* Installation can be done using the **bower**. It installs files from the **dist/debug** and the **dist/min** folders. Needed CSS and javascript files are located in these folders.
```js
bower install vsdatatable
```

## Compatibility (tested with)
* IE 9+
* Firefox 36.0.4
* Google Chrome 41.0.2272.101
* Opera 28.0
* Safari 5.1

## Licence
* License: MIT

## Author
* Author: kekeh
