var ReportsView = Backbone.View.extend({
    sequenceRows: 3,
    sequenceColumns: 4,
    pages: 0,
    sequenceTilesTemplate: null,
    bySequence: false,
    prefillState: false,
    itemMapping: {},
    resetReportsMapping: {},
    selectedTill: "",
    i18n: function() {
        return {
            cancel: '{Literal}Cancel{/Literal}',
            clear: '{Literal}Clear{/Literal}',
            done: '{Literal}Done{/Literal}',
            previousMonth: App.rtl ? '›' : '‹',
            nextMonth: App.rtl ? '‹' : '›',
            months: [
                '{Literal}January{/Literal}',
                '{Literal}February{/Literal}',
                '{Literal}March{/Literal}',
                '{Literal}April{/Literal}',
                '{Literal}May{/Literal}',
                '{Literal}June{/Literal}',
                '{Literal}July{/Literal}',
                '{Literal}August{/Literal}',
                '{Literal}September{/Literal}',
                '{Literal}October{/Literal}',
                '{Literal}November{/Literal}',
                '{Literal}December{/Literal}'
            ],
            monthsShort: [
                '{Literal}Jan{/Literal}',
                '{Literal}Feb{/Literal}',
                '{Literal}Mar{/Literal}',
                '{Literal}Apr{/Literal}',
                '{Literal}May{/Literal}',
                '{Literal}Jun{/Literal}',
                '{Literal}Jul{/Literal}',
                '{Literal}Aug{/Literal}',
                '{Literal}Sep{/Literal}',
                '{Literal}Oct{/Literal}',
                '{Literal}Nov{/Literal}',
                '{Literal}Dec{/Literal}'
            ],
            weekdays: [
                '{Literal}Sunday{/Literal}',
                '{Literal}Monday{/Literal}',
                '{Literal}Tuesday{/Literal}',
                '{Literal}Wednesday{/Literal}',
                '{Literal}Thursday{/Literal}',
                '{Literal}Friday{/Literal}',
                '{Literal}Saturday{/Literal}'
            ],
            weekdaysShort: [
                '{Literal}Sun{/Literal}',
                '{Literal}Mon{/Literal}',
                '{Literal}Tue{/Literal}',
                '{Literal}Wed{/Literal}',
                '{Literal}Thu{/Literal}',
                '{Literal}Fri{/Literal}',
                '{Literal}Sat{/Literal}'
            ],
            weekdaysAbbrev: [
                '{Literal}Su{/Literal}',
                '{Literal}M{/Literal}',
                '{Literal}T{/Literal}',
                '{Literal}W{/Literal}',
                '{Literal}T{/Literal}',
                '{Literal}F{/Literal}',
                '{Literal}S{/Literal}'
            ]
        }
    },

    events: {
        'change .report-by-selector': 'toggleReportBySelector',
        'click .pagination-trigger': 'handlePageClickEvent',
        'click #pagination-back': 'handlePageBackEvent',
        'click #pagination-forward': 'handlePageForwardEvent',
        'click #sequence-modal-accept': 'applySequenceSelection',
        'click .run-report': 'runReport',
        'change select': 'validateSelect',
        'change #report-category': 'changeReportCategory',
        'change #report-type': 'changeReportType',
        'change #date-range-preset': 'prefillRangePreset',
        'click .autocomplete-content li': 'selectItemFromAutocompleteList',
        'keyup #user-search-autocomplete': 'searchUserBySearchTerm',
        'keyup #customer-search-autocomplete': 'searchCustomerBySearchTerm',
        'keyup #item-type-search-autocomplete': 'searchItemTypeBySearchTerm',
        'keyup #customer-type-search-autocomplete': 'searchCustomerTypeBySearchTerm',
        'keyup #reset-report-autocomplete': 'searchResetReportBySearchTerm',
        'keyup #adjustment-session-search-autocomplete': 'searchAdjustmentSessionsBySearchTerm',
        'click #signatures-modal-trigger': 'validateAndOpenSingatureModal',
        'click .signature-order-row': 'getOrderSignature',
        'change #report-start-time': 'checkIfEmptyStartDate',
        'change #report-end-time': 'checkIfEmptyEndDate',
        'click #signature-dismiss': 'dismissSignaturesModal',
        'click #signature-ok': 'saveSignaturesModal',
        'change #whole-day-time': 'toggleWholeDay'
    },

    breadcrumb: {},
    chartRendered: false,
    chartDataColors: [
        '#d1d1d1',
        '#a156c4',
        '#ebc143',
        '#8097a2',
        '#39c7c1'
    ],
    dataColorIndex: 0,
    labeledDataColors: {},

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template, {
            isFoodService: App.serverInfo.isFoodService
        });
        this.sequenceTilesTemplate = options.sequenceTilesTemplate;
        this.breadcrumb = options.breadcrumb;

        this.sequenceCollection = new SequenceCollection();
        this.sequenceTilesView = options.sequenceTilesView;

        this.initializeSequenceModal();
        
    },

    dismissSignaturesModal: function () {
        this.signatureModal.close();
    },
 
    saveSignaturesModal: function () {
        if (!this.selectedSignatureOrder) {
            M.toast({html: '{Literal}Please select a signature first or click Cancel to dismiss{/Literal}'});
        } else {
            this.signatureModal.close();
        }
    },

    render: function () {
        this.$el.html(this.template({
            isFoodService: App.serverInfo.isFoodService
        }));
        App.breadCrumbToolTip = "Run various reports on your POS, such as an individual transaction or a list of your items"; 
        App.setBreadcrumbs(this.breadcrumb);
        $('.tooltipped').tooltip();
        var that = this;
        
        $(document).ready(function () {
            that.initStartDateTimePickers();
            that.initEndDateTimePickers();
            that.$el.find('#date-range-preset').val("0");
            that.prefillRangePreset({ currentTarget: that.$el.find('#date-range-preset') });
            that.initAutoComplete();

            that.$el.find('#items-autocomplete-placeholder input').keyup(function () {
                that.searchItemBySearchTerm(this);
            });

            that.initSignatureModal();
            that.$el.find('#date-range-preset').formSelect();
        });

        return this;
    },


    initSignatureModal: function () {
        var elems = document.querySelector('#signatures-modal');
        this.signatureModal = M.Modal.init(elems, {});
    },

    validateAndOpenSingatureModal: function () {
        this.$el.find('.signature-img-wrapper').html("");
        if (!this.selectedStartTime || !this.selectedEndTime) {
            M.toast({html: '{Literal}A start time and an end time must be selected first{/Literal}'});
        }
        else if (this.selectedEndTime.getTime() < this.selectedStartTime.getTime()) {
            M.toast({html: '{Literal}The end date cannot be sooner than the start date{/Literal}'});
        } else {
            this.getSignatureOrders();
        }
    },

    checkIfEmptyStartDate: function () {
        var value = this.$el.find('#report-start-time').val();
        if (value.trim() === '') {
            this.selectedStartTime = null;
        }
    },

    checkIfEmptyEndDate: function () {
        var value = this.$el.find('#report-end-time').val();
        if (value.trim() === '') {
            this.selectedEndTime = null;
        }
    },

    toggleWholeDay: function () {
        var checked = this.$el.find('#whole-day-time:checked').length > 0;
        if (checked) {
            var momentStart = moment(this.selectedStartTime).hour(0).minute(0);
            var momentEnd = moment(this.selectedEndTime).hour(23).minute(59);
            this.$el.find('#report-start-timepicker').attr('disabled', '');
            this.$el.find('#report-end-timepicker').attr('disabled', '');
            this.$el.find('#report-start-timepicker').val(momentStart.format('hh:mma'));
            this.$el.find('#report-end-timepicker').val(momentEnd.format('hh:mma'));
        
        } else {
            this.$el.find('#report-start-timepicker').removeAttr('disabled');
            this.$el.find('#report-end-timepicker').removeAttr('disabled');
        }
    },

    initAutoComplete: function () {
        var baseOptions = {
            minLength: 1,
            limit: 20,
            sortFunction: function (a, b, inputString) {
                return a.indexOf(inputString) - b.indexOf(inputString);
            }
        };
        var that = this;
        var itemOptions = _.extend({
            onAutocomplete: function (selection) { 
                if (!that.itemSearchAutocompleteSelection) {
                    that.itemSearchAutocompleteSelection = [];
                }
                that.itemSearchAutocompleteSelection.push(that.itemMapping[selection]); 
            }
        }, baseOptions);
        var userOptions = _.extend({
            onAutocomplete: function (selection) { that.userSearchAutocompleteSelection = selection; } 
        }, baseOptions);
        var customerOptions = _.extend({
            onAutocomplete: function (selection) { that.customerSearchAutocompleteSelection = that.customerMapping[selection]; } 
        }, baseOptions);
        var itemTypeOptions = _.extend({
            onAutocomplete: function (selection) { that.itemTypeSearchAutocompleteSelection = selection; } 
        }, baseOptions);
        var customerTypeOptions = _.extend({
            onAutocomplete: function (selection) { that.customerTypeSearchAutocompleteSelection = selection; }
        }, baseOptions);
        var adjustmentSessionOptions = _.extend({
            onAutocomplete: function (selection) { that.adjustmentSessionSearchAutocompleteSelection = selection; }
        }, baseOptions);

        var resetReportOptions = _.extend({
            onAutocomplete: function (selection) { that.resetReportSearchAutocompleteSelection = selection; }
        }, baseOptions);
        
        //this.itemSearchAutocomplete = M.Autocomplete.init(document.querySelector('#item-search-autocomplete'), itemOptions);
        var chipCallback = function (a, b) {
                
            that.selectedItems = [];
            
            var data = [];
            $.each(this.chipsData, function (key, value) {
                data.push(that.itemMapping[value.tag]);
            });
            that.selectedItems = data;
        };
        this.itemSearchAutocomplete = M.Chips.init(document.querySelector('#item-search-autocomplete'), {
            autocompleteOptions: itemOptions,
            onChipAdd: chipCallback,
            onChipDelete: chipCallback,
            placeholder: '{Literal}Filter by items{/Literal}',
            secondaryPlaceholder: '+{Literal}Item{/Literal}',
        });

        this.userSearchAutocomplete = M.Autocomplete.init(document.querySelector('#user-search-autocomplete'), userOptions);
        this.customerSearchAutocomplete = M.Autocomplete.init(document.querySelector('#customer-search-autocomplete'), customerOptions);
        this.itemTypeSearchAutocomplete = M.Autocomplete.init(document.querySelector('#item-type-search-autocomplete'), itemTypeOptions);
        this.customerTypeSearchAutocomplete = M.Autocomplete.init(document.querySelector('#customer-type-search-autocomplete'), customerTypeOptions);
        this.adjustmentSessionSearchAutocompleteSelection = M.Autocomplete.init(document.querySelector('#adjustment-session-search-autocomplete'), customerTypeOptions);
        this.resetReportSearchAutocomplete = M.Autocomplete.init(document.querySelector('#reset-report-autocomplete'), resetReportOptions);
    },

    searchUserBySearchTerm: function(e) {
        var element = $(e.currentTarget);
        var searchTerm = $(element).val();
        var that = this;
        if (searchTerm.trim().length > 0) {
            if (this.timer) {
                clearTimeout(this.timer);
            }
            this.timer = setTimeout(function() {
                that.getUsersBySearchTerm(searchTerm);
            }, 300);
        }
    },

    searchItemBySearchTerm: function(element) { 
        var searchTerm = $(element).val();
        var that = this;
        if (searchTerm.trim().length > 0) {
            if (this.timer) {
                clearTimeout(this.timer);
            }
            this.timer = setTimeout(function() {
                that.getItemsBySearchTerm(searchTerm);
            }, 300);
        }
    },

    searchCustomerBySearchTerm: function(e) {
        var element = $(e.currentTarget);
        var searchTerm = $(element).val();
        var that = this;
        if (searchTerm.trim().length > 0) {
            if (this.timer) {
                clearTimeout(this.timer);
            }
            this.timer = setTimeout(function() {
                that.getCustomersBySearchTerm(searchTerm);
            }, 300);
        }
    },

    searchResetReportBySearchTerm: function(e) {
        var element = $(e.currentTarget);
        var searchTerm = $(element).val();
        var that = this;
        if (searchTerm.trim().length > 0) {
            if (this.timer) {
                clearTimeout(this.timer);
            }
            this.timer = setTimeout(function() {
                that.getResetReportsBySearchTerm(searchTerm);
            }, 300);
        }
    },

    searchItemTypeBySearchTerm: function(e) {
        var element = $(e.currentTarget);
        var searchTerm = $(element).val();
        var that = this;
        if (searchTerm.trim().length > 0) {
            if (this.timer) {
                clearTimeout(this.timer);
            }
            this.timer = setTimeout(function() {
                that.getItemTypesBySearchTerm(searchTerm);
            }, 300);
        }
    },

    searchCustomerTypeBySearchTerm: function(e) {
        var element = $(e.currentTarget);
        var searchTerm = $(element).val();
        var that = this;
        if (searchTerm.trim().length > 0) {
            if (this.timer) {
                clearTimeout(this.timer);
            }
            this.timer = setTimeout(function() {
                that.getCustomerTypesBySearchTerm(searchTerm);
            }, 300);
        }
    },

    searchAdjustmentSessionsBySearchTerm: function(e) {
        var element = $(e.currentTarget);
        var searchTerm = $(element).val();
        var that = this;
        if (searchTerm.trim().length > 0) {
            if (this.timer) {
                clearTimeout(this.timer);
            }
            this.timer = setTimeout(function() {
                that.getAdjustmentSessionsBySearchTerm(searchTerm);
            }, 300);
        }
    },

    selectItemFromAutocompleteList: function (e) {
        var element = $(e.currentTarget);
    },

    getUsersBySearchTerm: function(searchTerm) {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-users-by-search-term',
            data: {
                searchTerm: searchTerm,
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                var results = data.results;
                var items = {};
                for (var i = 0; i < results.length; i++) {
                    items[results[i].value] = null;
                }
                that.userSearchAutocomplete.updateData(items);
                that.userSearchAutocomplete.open();
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
            }
        });
    },

    getSignatureOrders: function () {
        var amountFrom = null;
        var amountTo = null;
        var startingDate = moment(this.selectedStartTime).format('YYYY-MM-DD HH:mm');
        var endingDate = moment(this.selectedEndTime).format('YYYY-MM-DD HH:mm');
        this.$el.find('.signature-modal-trigger-preloader').addClass('active');
        this.$el.find('#signatures-modal-trigger').attr('disabled', '');
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-orders-with-signatures',
            data: {
                amountFrom: amountFrom,
                amountTo: amountTo,
                startingDate: startingDate,
                endingDate: endingDate,
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                var orders = data.results;
                that.$el.find('#signatures-modal-trigger').removeAttr('disabled');
                that.$el.find('.signature-modal-trigger-preloader').removeClass('active');
                that.renderSignatureOrders(orders);
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    that.$el.find('#signatures-modal-trigger').removeAttr('disabled');
                    that.$el.find('.signature-modal-trigger-preloader').removeClass('active');
                }
            }
        });
    },

    renderSignatureOrders: function (orders) {
        var preloaderHtml = this.$el.find(".preloader-template").html();
        var tableContent = this.$el.find('#signatures-modal').find('tbody');
        $(tableContent).html('');
        if (orders.length > 0) {
            for (var i = 0; i < orders.length; i++) {
                var order = orders[i];
                var row = $('<tr>');
                $(row).attr('data-order-id', order.tenderId).addClass('signature-order-row');
                var cell = $('<td>');
                $(cell).html(order.receiptDate);
                $(row).append(cell);
                cell = $('<td>');
                $(cell).html(order.receiptTime);
                $(row).append(cell);
                cell = $('<td>');
                $(cell).html(order.server);
                $(row).append(cell);
                cell = $('<td>');
                $(cell).html(order.orderNumber);
                $(row).append(cell);
                cell = $('<td>');
                $(cell).html(order.receiptAmount);
                $(row).append(cell);
                cell = $('<td>');
                $(cell).html(order.reference);
                $(row).append(cell);
                cell = $('<td>');
                cell.append(preloaderHtml);
                $(row).append(cell);
                $(tableContent).append(row);
            }
        } else {
            var row = $('<tr>');
            var cell = $('<td colspan="7">');
            var noDataMessage = $('<div>').addClass('no-data-message').addClass('center-align');
            $(noDataMessage).html('There are no relevant orders to show in the selected time range.');
            cell.append(noDataMessage);
            $(row).append(cell);
            $(tableContent).append(row);
        }
        this.signatureModal.open();
    },

    getOrderSignature: function (e) {
        
        var element = $(e.currentTarget);
        $(element).find('.preloader-wrapper').addClass('active');
        var orderId = $(element).attr("data-order-id");
        var that = this;
        that.$el.find('.signature-img-wrapper').html("");
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-signature-by-order',
            data: {
                tenderId: orderId,
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.selectedSignatureOrder = orderId;
                var html = $('<div class="ap-badge">Order #' + orderId + '&nbsp</div>');
                that.$el.find('.selected-signature-text').html(html);
                var imagePath = data.imagePath;
                var img = $('<img>');
                $(img).attr('src', '/img/' + imagePath);
                $(img).addClass('signature');

                $(element).find('.preloader-wrapper').removeClass('active');
                that.$el.find('.signature-img-wrapper').append(img);
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    $(element).find('.preloader-wrapper').removeClass('active');
                }
            }
        });
    },

    getCustomersBySearchTerm: function(searchTerm) {
        this.customerMapping = {};
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-customers-by-search-term',
            data: {
                searchTerm: searchTerm,
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                var results = data.results;
                var items = {};
                for (var i = 0; i < results.length; i++) {
                    items[results[i].value] = null;
                    that.customerMapping[results[i].value] = results[i].id;
                }
                that.customerSearchAutocomplete.updateData(items);
                that.customerSearchAutocomplete.open();
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
            }
        });
    },

    getItemTypesBySearchTerm: function(searchTerm) {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-item-types-by-search-term',
            data: {
                searchTerm: searchTerm,
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                var results = data.results;
                var items = {};
                for (var i = 0; i < results.length; i++) {
                    items[results[i]] = null;
                }
                that.itemTypeSearchAutocomplete.updateData(items);
                that.itemTypeSearchAutocomplete.open();
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
            }
        });
    },

    getAdjustmentSessionsBySearchTerm: function (searchTerm) {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-adjustment-sessions-by-search-term',
            data: {
                searchTerm: searchTerm,
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                var results = data.results;
                var items = {};
                for (var i = 0; i < results.length; i++) {
                    items[results[i]] = null;
                }
                that.adjustmentSessionSearchAutocompleteSelection.updateData(items);
                that.adjustmentSessionSearchAutocompleteSelection.open();
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
            }
        });
    },

    getCustomerTypesBySearchTerm: function(searchTerm) {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-customer-types-by-search-term',
            data: {
                searchTerm: searchTerm,
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                var results = data.results;
                var items = {};
                for (var i = 0; i < results.length; i++) {
                    items[results[i]] = null;
                }
                that.customerTypeSearchAutocomplete.updateData(items);
                that.customerTypeSearchAutocomplete.open();
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
            }
        });
    },

    getResetReportsBySearchTerm: function(searchTerm) {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-reset-reports',
            data: {
                searchTerm: searchTerm,
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                var results = data.results;
                var items = {};
                for (var i = 0; i < results.length; i++) {
                    var endDate = moment(results[i].start).format('YYYY-MM-DD');
                    var till = results[i].till;
                    var sequence = results[i].id;
                    items['Till ' + till + ' / #' + sequence + ' / ' + endDate] = null;
                    
                    that.resetReportsMapping['Till ' + till + ' / #' + sequence + ' / ' + endDate] = { till: till, sequence: sequence };
                }
                that.resetReportSearchAutocomplete.updateData(items);
                that.resetReportSearchAutocomplete.open();
                
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
            }
        });
    },

    getItemsBySearchTerm: function(searchTerm) {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-items-by-search-term',
            data: {
                searchTerm: searchTerm,
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                var results = data.results;
                var items = {};
                for (var i = 0; i < results.length; i++) {
                    items[results[i].itemDescription] = null;
                    that.itemMapping[results[i].itemDescription] = results[i].itemCode;
                }
                that.itemSearchAutocomplete.autocomplete.updateData(items);
                that.itemSearchAutocomplete.autocomplete.open();
                
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
            }
        });
    },

    validateReport: function () {
        var valid = true;
        var reportCategory = this.$el.find('#report-category').val();
        var reportSettings = this.getReportSettingsByCategoryAndType(reportCategory, this.reportType);
        var reportFilters = reportSettings.length > 0 ? reportSettings[0].filters : [];
        
        var reportStartDateValue = this.$el.find('#report-start-time').val();
        var reportEndDateValue = this.$el.find('#report-end-time').val();
        var reportStartTimeValue = this.$el.find('#report-start-timepicker').val();
        var reportEndTimeValue = this.$el.find('#report-end-timepicker').val();



        if (reportCategory === null || reportCategory === '') {
            this.$el.find('#report-category').closest('.select-wrapper').addClass('invalid');
            valid = false;
        }
        var reportType = this.$el.find('#report-type').val();
        if (reportType === null || reportType === '') {
            this.$el.find('#report-type').closest('.select-wrapper').addClass('invalid');
            valid = false;
        }

        if (this.bySequence === false) {
            if (reportFilters.indexOf('timeRange') > -1) {
                var reportStartTime = this.$el.find('#report-start-time').val();
                if (reportStartDateValue === null || reportStartDateValue === '') {
                    this.$el.find('#report-start-time').addClass('invalid');
                    valid = false;
                }
                var reportEndTime = this.$el.find('#report-end-time').val();
                if (reportEndDateValue === null || reportEndDateValue === '') {
                    this.$el.find('#report-end-time').addClass('invalid');
                    valid = false;
                }
                if (reportStartTimeValue === null || reportStartTimeValue === '') {
                    this.$el.find('#report-start-timepicker').addClass('invalid');
                    valid = false;
                }
                if (reportEndTimeValue === null || reportEndTimeValue === '') {
                    this.$el.find('#report-end-timepicker').addClass('invalid');
                    valid = false;
                }
                if (valid) {
                    if (typeof this.selectedStartTime !== 'undefined' && typeof this.selectedEndTime !== 'undefined') {
                        if (this.selectedStartTime.getTime() > this.selectedEndTime.getTime()) {
                            M.toast({html: '{Literal}The end date cannot be sooner than the start date{/Literal}'});
                            valid = false;
                        }
                    }
                }
            }
        } else {
            if (reportFilters.indexOf('sequence') > -1) {
                var selectedSequence = this.$el.find('#selected-sequence').attr('data-value');
                if (selectedSequence === null || selectedSequence === '' || selectedSequence.length === 0) {
                    this.$el.find('#sequence-error-msg').show();
                    valid = false;
                }
            }
        }

        return valid;
    },

    prefillRangePreset: function (e) {
        this.prefillState = true;
        var element = $(e.currentTarget);
        var delta = parseInt($(element).val());

        var now = new Date();
        if (delta !== 1) {
            now.setHours(23);
            now.setMinutes(59);
        }
        var endDate = moment(now);
        var startDate;
        if (delta === 0) {
            startDate = moment(now).hour(0).minute(0);
            endDate = moment(now).hour(23).minute(59);
        } else if (delta === 7) {
            startDate = moment(now).subtract(1, 'week').add(1, 'day').hour(0).minute(0);
        } else if (delta === 30) {
            startDate = moment(now).subtract(1, 'month').add(1, 'day').hour(0).minute(0);
        } else if (delta === 90) {
            startDate = moment(now).subtract(3, 'month').add(1, 'day').hour(0).minute(0);
        }
        this.reportStartDatePicker.setDate(startDate.toDate());
        this.reportEndDatePicker.setDate(endDate.toDate());
        
        this.$el.find('#report-start-time').val(startDate.format('YYYY-MM-DD'));
        this.$el.find("label[for='report-start-time']").addClass('active');
        this.$el.find('#report-end-time').val(endDate.format('YYYY-MM-DD'));
        this.$el.find("label[for='report-end-time']").addClass('active');

        this.$el.find('#report-start-timepicker').val(startDate.format('hh:mma'));
        this.$el.find("label[for='report-start-timepicker']").addClass('active');
        this.$el.find('#report-end-timepicker').val(endDate.format('hh:mma'));
        this.$el.find("label[for='report-end-timepicker']").addClass('active');
        
        
        this.selectedStartTime = startDate.toDate();
        this.selectedEndTime = endDate.toDate();
        
        this.prefillState = false;
    },

    runReport: function () {
        if (this.validateReport()) {
            var request = this.generateReport();
            if (request.valid) {
                var reportTypeSettings = request.reportTypeSettings;
                var filters = request.filterValues;
                this.openReportWindowWithPostRequest('/data/' + reportTypeSettings.action, filters);
    //            M.toast({
    //                html: '{Literal}Validation succeeded{/Literal}'
    //            });
   //         } else {
   //             M.toast({
   //                 html: '{Literal}Validation failed{/Literal}...'
   //             });
            }
            
        } else {
            var errorToastHtml = '{Literal}Some of the required fields are missing{/Literal}'
            M.toast({
                html: errorToastHtml
            });
        }
    },

    openReportWindowWithPostRequest: function (winURL, params) {
        var winName='AccoPOS Report';
        var windowoption='resizable=yes,height=768,width=1024,location=0,menubar=0,scrollbars=1';
        var form = document.createElement("form");
        var sessionToken = this.getCookie();
        form.setAttribute("method", "post");
        form.setAttribute("token", sessionToken);
        form.setAttribute("action", winURL);
        form.setAttribute("target", winName);  
        for (var i in params) {
            if (params.hasOwnProperty(i)) {
                var input = document.createElement('input');
                input.type = 'text';
                input.name = i;
                input.value = params[i];
                form.appendChild(input);
            }
        }
        document.body.appendChild(form);
        window.open('', winName, windowoption);
        form.target = winName;
        form.submit();
        document.body.removeChild(form);           
    },

    generateReport: function () {
        var hasFilter = function (filters, filter) {
            return filters.indexOf(filter) > -1;
        };
        var filterValues = {};
        var category = this.$el.find("#report-category").val();
        var reportTypeSettings = this.getReportSettingsByCategoryAndType(category, this.reportType);
        var valid = true;
        if (reportTypeSettings.length > 0) {
            reportTypeSettings = reportTypeSettings[0];
            if (reportTypeSettings.action !== '') {
                var action = reportTypeSettings.action;
                var filters = reportTypeSettings.filters;
                if (hasFilter(filters, 'timeRange') && !this.bySequence) {
                    valid = this.validateTimeTange();
                    if (valid) {
                        filterValues = _.extend({
                            fromDate: moment(this.selectedStartTime).format('YYYY-MM-DD HH:mm'),
                            toDate: moment(this.selectedEndTime).format('YYYY-MM-DD HH:mm')
                        }, filterValues);
                    } else {
                        // invalidate
                        alert("Dates validation error");
                    }
                } 
                
                if (hasFilter(filters, 'sequence') && this.bySequence) {
                    filterValues = _.extend({
                        sequence: this.selectedSequence
                    }, filterValues);
                }

                if (hasFilter(filters, 'till') && this.bySequence) {
                    filterValues = _.extend({
                        till: this.selectedTill
                    }, filterValues);
                }
                else if (hasFilter(filters, 'till') && !this.bySequence) {
                    filterValues = _.extend({
                        till: ""
                    }, filterValues);
                }

                if (hasFilter(filters, 'signature')) {
                    valid = this.validateSignature();
                    if (valid) {
                        filterValues = _.extend({
                            receiptId: this.selectedSignatureOrder
                        }, filterValues);       
                    } else {
                        // invalidate
                        alert("Signature validation error");
                    }
                }
                if (hasFilter(filters, 'item')) {
                    if (typeof this.selectedItems !== 'undefined' && this.selectedItems !== null && this.selectedItems.length > 0) {
                        filterValues = _.extend({
                            itemCodes: this.selectedItems.join(';')
                        }, filterValues);
                    }
                }
                if (hasFilter(filters, 'user')) {
                    if (typeof this.selectedUser !== 'undefined' && this.selectedUser !== null && this.selectedUser.length > 0) {
                        filterValues = _.extend({
                            selectedUserName: this.$el.find('#user-search-autocomplete').val()
                        }, filterValues);
                    }
                }
                if (hasFilter(filters, 'adjustmentSession')) {
                    filterValues = _.extend({
                        sessionID: this.$el.find('#adjustment-session-search-autocomplete').val(),
                        selectedRow: 0
                    }, filterValues);
                }
                
                if (hasFilter(filters, 'exportToExcel')) {
                    filterValues = _.extend({
                        exportToExcel: this.$el.find('#export-to-xlsx:checked').length > 0
                    }, filterValues);
                }
                if (hasFilter(filters, 'showGraphs')) {
                    filterValues = _.extend({
                        showGraphs: this.$el.find('#show-graphs:checked').length > 0
                    }, filterValues);
                }
                if (hasFilter(filters, 'resetReport')) {
                    if (typeof this.resetReportSearchAutocompleteSelection === 'undefined' || this.resetReportSearchAutocompleteSelection === null) {
                        valid = false;
                    } else {
                        var value = this.resetReportSearchAutocompleteSelection;
                        var mapped = this.resetReportsMapping[value];
                        if (typeof mapped !== 'undefined' && mapped !== null) {
                            filterValues = _.extend({
                                sequence: mapped.sequence,
                                till: mapped.till
                            }, filterValues);
                        }
                    }
                }
            }
        }
        return {
            valid: valid,
            reportTypeSettings: reportTypeSettings,
            filterValues: filterValues
        };
    },

    validateTimeTange: function() {
        var valid = false;
        valid = typeof this.selectedStartTime !== 'undefined' && this.selectedStartTime !== null;
        valid = typeof this.selectedEndTime !== 'undefined' && this.selectedEndTime !== null;
        return valid;
    },

    validateSignature: function() {
        return typeof this.selectedSignatureOrder !== 'undefined' && this.selectedSignatureOrder !== null;
    },

    validateSelect: function (e) {
        var element = $(e.currentTarget);
        $(element).closest('.select-wrapper').removeClass('invalid');
    },

    initStartDateTimePickers: function () {
        /**
         * 0 = beginning point
         * 1 = date picked
         * 2 = hour picked
         * 3 = minute picked
         */
        this.startDateTimeProgress = 0;
        var reportStartDatePickerElement = document.querySelector('#report-start-time');
        var reportStartTimePickerElement = document.querySelector('#report-start-timepicker');
        var that = this;
        this.reportStartTimePicker = M.Timepicker.init(reportStartTimePickerElement, {
            autoClose: true,
            defaultTime: '00:00',
            
            onSelect: function(hour, minute) {
                that.startDateTimeProgress = that.startDateTimeProgress === 2 ? 3 : 2;
                hour += (this.amOrPm === 'PM' ? 12 : 0);            
                that.selectedStartTime.setHours(hour);
                that.selectedStartTime.setMinutes(minute);
                //$('#report-start-time').val(moment(that.selectedStartTime).format('YYYY-MM-DD hh:mma'));
                that.$el.find('.report-link-column a').removeClass('preset-selected');
            },
            onOpenStart: function () {
                this.$el.find('.timepicker-close').each(function () {
                    if ($(this).html() === 'Ok') {
                        $(this).hide();
                    }
                });
            },
            onCloseStart: function() {
                if (that.startDateTimeProgress !== 3) {
                    var previousValue = $('#report-start-time').attr("data-previous");
                    if (previousValue !== null && previousValue !== '') {
                        
                    } else {
                        
                        $("label[for='report-start-time']").removeClass('active');
                        $('#report-start-time').val($('#report-start-time').attr("data-previous"));
                    }
                }
                that.startDateTimeProgress = 0;
            }
        });
        this.reportStartDatePicker = M.Datepicker.init(reportStartDatePickerElement, {
            autoClose: true,
            format: 'yyyy-mm-dd',
            i18n: that.i18n(),
            isRTL: App.rtl,
            firstDay: App.rtl ? 0 : 1,
            onSelect: function(date) {
                if (!that.prefillState) {
                    that.selectedStartTime = date;
                    that.selectedStartTime.setHours(0);
                    that.startDateTimeProgress = 1;
                }
            },
            onOpen: function () {
                $('#report-start-time').attr("data-previous", $('#report-start-time').val());
            }
        });
    },

    initEndDateTimePickers: function () {
        /**
         * 0 = beginning point
         * 1 = date picked
         * 2 = hour picked
         * 3 = minute picked
         */
        this.endDateTimeProgress = 0;
        var reportEndDatePickerElement = document.querySelector('#report-end-time');
        var reportEndTimePickerElement = document.querySelector('#report-end-timepicker');
        var that = this;
        this.reportEndTimePicker = M.Timepicker.init(reportEndTimePickerElement, {
            autoClose: true,
            defaultTime: '00:00',
            onSelect: function(hour, minute) {
                that.endDateTimeProgress = that.endDateTimeProgress === 2 ? 3 : 2;
                hour += (this.amOrPm === 'PM' ? 12 : 0);
                that.selectedEndTime.setHours(hour);
                that.selectedEndTime.setMinutes(minute);
                //$('#report-end-time').val(moment(that.selectedEndTime).format('YYYY-MM-DD hh:mma'));
                that.$el.find('.report-link-column a').removeClass('preset-selected');
            },
            onOpenStart: function () {
                this.$el.find('.timepicker-close').each(function () {
                    if ($(this).html() === 'Ok') {
                        $(this).hide();
                    }
                });
            },
            onCloseStart: function() {
                if (that.endDateTimeProgress !== 3) {
                    var previousValue = $('#report-end-time').attr("data-previous");
                    if (previousValue !== null && previousValue !== '') {
                        
                    } else {
                        $("label[for='report-end-time']").removeClass('active');
                        $('#report-end-time').val($('#report-end-time').attr("data-previous"));
                    }
                }
                that.endDateTimeProgress = 0;
            }
        });
        this.reportEndDatePicker = M.Datepicker.init(reportEndDatePickerElement, {
            autoClose: true,
            format: 'yyyy-mm-dd',
            i18n: that.i18n(),
            isRTL: App.rtl,
            firstDay: App.rtl ? 0 : 1,
            onSelect: function(date) {
                if (!that.prefillState) {
                    that.selectedEndTime = date;
                    that.selectedEndTime.setHours(23);
                    that.endDateTimeProgress = 1;
                }
            },
            onOpen: function () {
                $('#report-end-time').attr("data-previous", $('#report-end-time').val());
            }
        });
    },

    initializePaginator: function () {
        this.getSequencesTotalCount();
    },

    renderPaginator: function (sequencesTotalCount) {
        $('.pagination-trigger').remove();
        if (sequencesTotalCount > this.sequenceRows * this.sequenceColumns) {

            this.pages = Math.ceil(1.0 * sequencesTotalCount / (this.sequenceRows * this.sequenceColumns));
            var currentPageElement = $('<li class="active ap-blue pagination-trigger" data-page="1"><a href="javascript:void(0)">1</a></li>');
            $("#pagination-back").after(currentPageElement);
            for (var i = 2; i <= this.pages; i++) {
                var lastElement = currentPageElement;
                currentPageElement = $('<li class="waves-effect pagination-trigger" data-page="' + i + '"><a href="javascript:void(0)">' + i + '</a></li>');
                $(lastElement).after(currentPageElement);
            }
            $("#sequence-pagination").show();
        } else {
            $("#sequence-pagination").hide();
        }
    },

    applySequenceSelection: function () {
        var selectedSequence = $("#selected-sequence").val();
        if (selectedSequence === null || selectedSequence === '') {
            M.toast({
                html: '{Literal}No Sequence was selected{/Literal}'
            });
        } else {
            $("#selected-sequence").val('');
            $("#selected-sequence").attr('data-value', selectedSequence);

            for (var i = 0; i < this.sequencesTotal; i++) {
                if (this.sequenceCollection.models[i] != undefined ) {
                    if (this.sequenceCollection.models[i].attributes.id == selectedSequence) {
                        this.selectedTill = this.sequenceCollection.models[i].attributes.till
                    }
                }
            }
            this.selectedSequence = selectedSequence;
            //this.selectedTill = $("#selected-sequence").attr('data-value', selectedSequence);
            $("#selected-sequence").html('<div class="ap-badge">Sequence #' + selectedSequence + '&nbsp</div>');
            this.$el.find('#sequence-error-msg').hide();
            M.Modal.getInstance($("#sequence-modal")).close();
        }
    },

    handlePageBackEvent: function (e) {
        var element = $(e.currentTarget);
        if ($(element).hasClass('disabled') === false) {
            var currentPage = parseInt($("#sequence-pagination").attr("data-current-page"));
            this.goToSequencePage(currentPage - 1, -1);
        }
    },

    handlePageForwardEvent: function (e) {
        var element = $(e.currentTarget);
        if ($(element).hasClass('disabled') === false) {
            var currentPage = parseInt($("#sequence-pagination").attr("data-current-page"));
            this.goToSequencePage(currentPage + 1, -1);
        }
    },

    handlePageClickEvent: function (e) {
        var element = $(e.currentTarget);
        var selectedPage = parseInt($(element).attr('data-page'));

        var currentPage = parseInt($("#sequence-pagination").attr("data-current-page"));
        this.goToSequencePage(selectedPage, currentPage);
    },

    goToSequencePage: function (selectedPage, currentPage) {

        if (selectedPage !== currentPage) {
            $("#selected-sequence").val('');
            var element = $(".pagination-trigger[data-page=" + selectedPage + "]");
            $('.pagination-trigger')
                .removeClass('ap-blue')
                .removeClass('active')
                .addClass('waves-effect');
            var offset = this.sequenceColumns * this.sequenceRows;
            var start = offset * (selectedPage - 1);
            var args = {
                selectedPage: selectedPage,
                element: element,
                parentView: this
            };
            this.getSequences(offset, selectedPage, this.renderPaginationChange, args);
        }
    },

    renderPaginationChange: function (sequences, args) {
        var that = args.parentView;
        var selectedPage = args.selectedPage;
        var element = args.element;
        var sequenceCollection = new SequenceCollection();
        for (var i = 0; i < sequences.length; i++) {
            sequenceCollection.add(new Sequence({
                id: sequences[i].id,
                till: sequences[i].till,
                startTime: sequences[i].start,
                endTime: sequences[i].end
            }));
        }
        $("#sequence-pagination").attr("data-current-page", selectedPage);
        that.sequenceTilesView.collection.reset(sequenceCollection.models);
        $(element).addClass('active').addClass('ap-blue').removeClass('waves-effect');
        if (selectedPage === 1) {
            $("#pagination-back").addClass('disabled').removeClass('waves-effect');
            $("#pagination-forward").removeClass('disabled').addClass('waves-effect');
        } else if (selectedPage === that.pages) {
            $("#pagination-back").removeClass('disabled').addClass('waves-effect');
            $("#pagination-forward").addClass('disabled').removeClass('waves-effect');
        } else {
            $("#pagination-back").removeClass('disabled').addClass('waves-effect');
            $("#pagination-forward").removeClass('disabled').addClass('waves-effect');
        }
        $("#sequence-modal-preloader").hide();
    },

    toggleReportBySelector: function () {
        var selectedValue = $(".report-by-selector:checked").val();
        if (selectedValue === 'by-date-time') {
            this.$el.find("#by-sequence-fields").hide();
            this.$el.find("#by-time-fields").show();
            $('a[data-filter-class="conditional-report-filter"][data-filter="timeRange"]').parent().show();
            this.bySequence = false;
        } else if (selectedValue === 'by-sequence') {
            $('a[data-filter-class="conditional-report-filter"][data-filter="timeRange"]').parent().hide();
            this.$el.find("#by-sequence-fields").show();
            this.$el.find("#by-time-fields").hide();
            this.bySequence = true;
            //M.Modal.getInstance($("#sequence-modal")).open();
        }
    },

    initializeSequenceModal: function () {
        $("#sequence-modal-preloader").hide();
        this.initializePaginator();
        var sequencesPerPage = this.sequenceColumns * this.sequenceRows;
        var sequences = this.getSequences(sequencesPerPage, 1, this.renderSequenceModal, { parentView: this });
    },

    renderSequenceModal: function (sequences, args) {
        var that = args.parentView;
        that.sequenceCollection = new SequenceCollection();
        for (var i = 0; i < sequences.length; i++) {
            that.sequenceCollection.add(new Sequence({
                id: sequences[i].id,
                till: sequences[i].till,
                startTime: sequences[i].start,
                endTime: sequences[i].end
            }));
        }
        
        if (typeof that.sequenceTilesTemplate === 'undefined' || that.sequenceTilesTemplate === null) {
            $.get("templates/sequenceTiles.html").done(function (sequenceTilesTemplate) {
                that.sequenceTilesTemplate = sequenceTilesTemplate;
                that.sequenceTilesView = new SequenceTilesView({
                    template: that.sequenceTilesTemplate,
                    collection: that.sequenceCollection
                });
                $("#sequences-wrapper").html(that.sequenceTilesView.render().el);
            });
        } else {
            that.sequenceTilesView = new SequenceTilesView({
                template: that.sequenceTilesTemplate,
                collection: that.sequenceCollection
            });
            $("#sequences-wrapper").html(that.sequenceTilesView.render().el);
        }
        $("#sequence-modal-preloader").hide();

    },
    
    getCookie: function() {
        var nameEQ = "sessionCookie" + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
    },


    getSequences: function (pageSize, pageNumber, callback, callbackArgs) {
        $("#sequence-modal-preloader").show();
        $("#sequences-wrapper").hide();
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-sequences',
            data: {
                offset: pageSize,
                pageNumber: pageNumber,
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                $("#sequence-modal-preloader").hide();
                $("#sequences-wrapper").show();
                callback(data.results, callbackArgs);
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    $("#sequences-wrapper").show();
                    $("#sequence-modal-preloader").hide();
                    M.toast({
                        html: '{Literal}There was a problem fetching the sequences from the server{/Literal}'
                    });
                }
            }
        });
    },

    getSequencesTotalCount: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-sequence-total-count',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                var count = data.results;
                that.sequencesTotal = count;
                that.renderPaginator(count);
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
            }
        });
    },

    changeReportCategory: function (e) {
        var element = $(e.currentTarget);
        var category = $(element).val();
        var reportTypes = this.getReportTypes()[category];
        var typeSelect = this.$el.find('#report-type');
        $(typeSelect).html("");
        $(typeSelect).removeAttr('disabled');
        var option = $('<option>');
        $(option).attr('disabled', '');
        $(option).attr('selected', '');
        $(option).html('{Literal}Select a Type{/Literal}');
        $(option).val('');
        $(typeSelect).append(option);
        var selectedReportType;
        for (var i = 0; i < reportTypes.length; i++) {
            var reportType = reportTypes[i];
            if (App.serverInfo.isFoodService || !reportType.hideOnRetail) {
                option = $('<option>');
                $(option).val(reportType.value);
                $(option).html(reportType.label);
                $(option).attr('data-category', category);
                $(typeSelect).append(option);
            }
        }
        $(typeSelect).formSelect();
    },

    getReportSettingsByCategoryAndType: function (category, reportType) {
        if (typeof this.getReportTypes()[category] === 'undefined') {
            return [];
        }
        return this.getReportTypes()[category].filter(function(e) {
            return e.value === reportType;
        });
    },

    changeReportType: function (e) {
        var element = $(e.currentTarget).find(':selected');
        var category = $(element).attr('data-category');
        this.reportType = $(element).val();
        this.sequenceFilterEnabled = true;
        var that = this;
        var reportTypeSettings = this.getReportSettingsByCategoryAndType(category, this.reportType);
        if (reportTypeSettings.length === 1) {
            reportTypeSettings = reportTypeSettings[0];
            var selectors = [
                'input[data-filter-class="conditional-report-filter"]:not(:checkbox)',
                'input[data-filter-class="conditional-report-filter"].whole-day',
                'input[data-filter-class="conditional-report-filter"].form-switch-settings',
                'div.chips',
                'select[data-filter-class="conditional-report-filter"]',
                'a[data-filter-class="conditional-report-filter"]'
            ];
            var excelOrCharts = false;
            this.$el.find(selectors.join(',')).each(function () {
                var currentFilterType = $(this).attr('data-filter');
                if (reportTypeSettings.filters.indexOf(currentFilterType) < 0) {
                    
                    if ($(this).hasClass('hide-filter') || $(this).attr('id') === 'date-range-preset') {
                       
                        if ($(this).hasClass("form-switch")) {
                            if (!excelOrCharts) {
                                $(this).parent().parent().parent().hide();
                            }
                            $(this).parent().parent().hide();
                        } else if ($(this).hasClass('whole-day') || $(this).hasClass('form-switch-settings')) {
                            $(this).parent().parent().hide();
                        } else if ($(this).attr('id') === 'date-range-preset') {
                            $(this).formSelect();
                            $(this).parent().parent().hide();
                        } else {
                            $(this).parent().hide();
                        }
                    }
                    $(this).attr('disabled', '');
                    if ($(this).attr('id') === 'by-sequence-radio-button') {
                        that.sequenceFilterEnabled = false;
                    }
                } else {     
                    if ($(this).hasClass('hide-filter') || $(this).attr('id') === 'date-range-preset') {
                        if ($(this).hasClass("form-switch")) {
                            excelOrCharts = true;
                            $(this).parent().parent().parent().show();
                            $(this).parent().parent().show();
                        } else if ($(this).hasClass('whole-day') || $(this).hasClass('form-switch-settings')) {
                            $(this).parent().parent().show();
                        } else if ($(this).attr('id') === 'date-range-preset') {
                            $(this).removeAttr('disabled');
                            $(this).formSelect();
                            $(this).parent().parent().show();
                        } else {
                            $(this).parent().show();
                        }
                    }
                    $(this).removeAttr('disabled');
                }
            });
            this.toggleWholeDay();
            if (!that.sequenceFilterEnabled) {
                this.$el.find("#by-date-time-radio-button").prop("checked", true);
                this.toggleReportBySelector();
                $('#viewByBlock').hide();
            }
            else {
                $('#viewByBlock').show();
            }
        }
    },

    getReportTypes: function () {
        var full = (location.port ? ':'+location.port: '');

        return {
            general: [{
                    value: 'reset-reports',
                    action: 'generate-reset-report',
                    label: '{Literal}Reset Reports{/Literal}',
                    hideOnRetail: false,
                    filters: ['exportToExcel', 'showGraphs', 'resetReport']
                },
                {
                    value: 'z-out-summary-report',
                    label: '{Literal}Z-Out Summary Report{/Literal}',
                    action: 'generate-z-out-summary-report',
                    hideOnRetail: false,
                    filters: ['timeRange', 'sequence', 'exportToExcel', 'showGraphs', 'till']
                },
                /*{
                    value: 'comps-by-reason-report',
                    label: '{Literal}Comps by Reason Report{/Literal}',
                    action: 'generate-comps-by-reason-report',
                    hideOnRetail: true,
                    filters: ['timeRange', 'sequence', 'exportToExcel']
                },*/
                {
                    value: 'gratuity-report',
                    label: '{Literal}Gratuity Report{/Literal}',
                    action: 'generate-gratuity-report',
                    hideOnRetail: true,
                    filters: ['timeRange', 'sequence', 'exportToExcel', 'user', 'till']
                },
                {
                    value: 'sales-tax-report',
                    label: '{Literal}Sales Tax Report{/Literal}',
                    action: 'generate-sales-tax-report',
                    hideOnRetail: true,
                    filters: ['timeRange', 'sequence', 'exportToExcel', 'till']
                },
                /*{
                    value: 'gift-card-detail-report',
                    label: '{Literal}Gift Card Detail Report{/Literal}',
                    action: 'report-not-supported',
                    hideOnRetail: true,
                    filters: ['giftCardNumber']
                },*/
            ],
            transactions: [{
                    value: 'all-transactions',
                    label: '{Literal}All Transactions{/Literal}',
                    action: 'generate-all-transactions-report',
                    hideOnRetail: false,
                    filters: ['timeRange', 'sequence', 'exportToExcel', 'till']
                },
                {
                    value: 'with-voids',
                    label: '{Literal}With Voids{/Literal}',
                    action: 'generate-transactions-with-voids-report',
                    hideOnRetail: false,
                    filters: ['timeRange', 'sequence', 'exportToExcel', 'till']
                },
                {
                    value: 'cancelled',
                    label: '{Literal}Cancelled{/Literal}',
                    action: 'generate-cancelled-transactions-report',
                    hideOnRetail: false,
                    filters: ['timeRange', 'sequence', 'exportToExcel', 'till']
                },
                {
                    value: 'discounted',
                    label: '{Literal}Discounted{/Literal}',
                    action: 'generate-transactions-with-discounts-report',
                    hideOnRetail: false,
                    filters: ['timeRange', 'sequence', 'exportToExcel', 'till']
                },
                {
                    value: 'with-comp-reasones',
                    label: '{Literal}With Comp Reasons{/Literal}',
                    action: 'generate-comps-by-reason-report',
                    hideOnRetail: true,
                    filters: ['timeRange', 'sequence', 'exportToExcel', 'till']
                },
                {
                    value: 'with-comp-by-user',
                    label: '{Literal}With Comp by User{/Literal}',
                    action: 'generate-transactions-with-comp-by-user',
                    hideOnRetail: true,
                    filters: ['timeRange', 'sequence', 'exportToExcel', 'showGraphs', 'user', 'till']
                },
                {
                    value: 'credit-cards',
                    label: '{Literal}Credit Cards{/Literal}',
                    action: 'generate-credit-card-transactions-report',
                    hideOnRetail: false,
                    filters: ['timeRange', 'sequence', 'exportToExcel', 'till']
                },
                {
                    value: 'by-customer',
                    label: '{Literal}By Customer{/Literal}',
                    action: 'generate-transactions-by-customer-report',
                    hideOnRetail: false,
                    filters: ['timeRange', 'sequence', 'exportToExcel', 'customer', 'till'], 
                },
                {
                    value: 'accounts-receivable',
                    label: '{Literal}Accounts Receivable{/Literal}',
                    action: 'generate-accounts-receivable-transactions-report',
                    hideOnRetail: false,
                    filters: ['timeRange', 'sequence', 'exportToExcel', 'till']
                }
            ],
            sales: [{
                    value: 'by-item-summary',
                    label: '{Literal}By Item Summary{/Literal}',
                    action: 'generate-sales-by-item-summary-report',
                    hideOnRetail: false,
                    filters: ['timeRange', 'sequence', 'exportToExcel', 'item', 'till']
                },
                {
                    value: 'by-type',
                    label: '{Literal}By Type{/Literal}',
                    action: 'generate-sales-by-type-report',
                    hideOnRetail: false,
                    filters: ['timeRange', 'sequence', 'exportToExcel', 'showGraphs', 'itemType', 'till']
                },
                {
                    value: 'by-hour',
                    label: '{Literal}By Hour{/Literal}',
                    action: 'generate-sales-by-hour-report',
                    hideOnRetail: false,
                    filters: ['timeRange', 'sequence', 'exportToExcel', 'showGraphs', 'till']
                },
                {
                    value: 'by-hour-per-day',
                    label: '{Literal}By Hour Per Day{/Literal}',
                    action: 'generate-sales-by-hour-per-day-report',
                    hideOnRetail: false,
                    filters: ['timeRange', 'sequence', 'exportToExcel', 'showGraphs', 'till']
                },
                {
                    value: 'by-types-by-hour',
                    label: '{Literal}By Types and Hour{/Literal}',
                    action: 'generate-sales-by-type-and-hour-report',
                    hideOnRetail: false,
                    filters: ['timeRange', 'sequence', 'exportToExcel', 'till']
                },
                {
                    value: 'top-10-items-by-hour',
                    label: '{Literal}Top 10 Items by Hour{/Literal}',
                    action: 'generate-sales-top-10-items-by-hour-report',
                    hideOnRetail: false,
                    filters: ['timeRange', 'sequence', 'exportToExcel', 'till']
                },
                {
                    value: 'by-user',
                    label: '{Literal}By User{/Literal}',
                    action: 'generate-sales-by-user-report',
                    hideOnRetail: false,
                    filters: ['timeRange', 'sequence', 'showGraphs', 'till']
                },
                {
                    value: 'by-user-by-type',
                    label: '{Literal}By User and Type{/Literal}',
                    action: 'generate-sales-by-user-and-type-report',
                    hideOnRetail: false,
                    filters: ['timeRange', 'sequence', 'exportToExcel', 'till']
                },
                {
                    value: 'server-summary',
                    label: App.serverInfo.isFoodService ? '{Literal}Server Summary{/Literal}' : 
                        '{Literal}Sales Rep. Summary{/Literal}',
                    action: 'generate-sales-server-summary-report',
                    hideOnRetail: false,
                    filters: ['timeRange', 'sequence', 'exportToExcel', 'showGraphs', 'user', 'till']
                },
                {
                    value: 'by-customer-summary',
                    label: '{Literal}By Customer Summary{/Literal}',
                    action: 'generate-sales-by-customer-summary-report',
                    hideOnRetail: false,
                    filters: ['timeRange', 'sequence', 'exportToExcel', 'customer', 'till']
                },
                {
                    value: 'by-item-category',
                    label: '{Literal}By Item Category{/Literal}',
                    action: 'generate-sales-by-item-category-report',
                    hideOnRetail: false,
                    filters: ['timeRange', 'sequence', 'exportToExcel', 'showGraphs', 'itemCategory', 'till']
                },
                {
                    value: 'by-customer-type',
                    label: '{Literal}By Customer Type{/Literal}',
                    action: 'generate-sales-by-customer-type-report',
                    hideOnRetail: false,
                    filters: ['timeRange', 'sequence', 'exportToExcel', 'showGraphs', 'customerType', 'till']
                }
            ],
            list: [{
                    value: 'customers-list',
                    label: '{Literal}Customers List{/Literal}',
                    action: 'generate-customers-list-report',
                    hideOnRetail: false,
                    filters: []
                },
                {
                    value: 'active-sale-prices',
                    label: '{Literal}Active Sale Prices{/Literal}',
                    action: 'generate-active-sale-prices-list-report',
                    hideOnRetail: false,
                    filters: []
                },
                {
                    value: 'loyalty-program',
                    label: '{Literal}Loyalty Program{/Literal}',
                    action: 'generate-loyalty-program-list-report',
                    hideOnRetail: true,
                    filters: []
                }
            ],
            inventory: [{
                    value: 'items-list',
                    label: '{Literal}Items List{/Literal}',
                    action: 'generate-items-list-report',
                    hideOnRetail: false,
                    filters: []
                },
                {
                    value: 'stock-items',
                    label: '{Literal}Stock Items{/Literal}',
                    action: 'generate-stock-items-report',
                    hideOnRetail: false,
                    filters: ['adjustmentSession']
                },
                {
                    value: 'inventory-counts',
                    label: '{Literal}Inventory Counts{/Literal}',
                    action: 'generate-inventory-counts-report',
                    hideOnRetail: false,
                    filters: []
                },
                {
                    value: 'inventory-adjustments',
                    label: '{Literal}Inventory Adjustments{/Literal}',
                    action: 'generate-inventory-adjustments-report',
                    hideOnRetail: false,
                    filters: ['adjustmentSession']
                },
                {
                    value: 'inventory-transaction',
                    label: '{Literal}Inventory Transaction{/Literal}',
                    action: 'generate-inventory-transaction-report',
                    hideOnRetail: false,
                    filters: ['timeRange', 'item']
                }
            ],
            cloudData: [{
                    value: 'sales-by-item-type',
                    label: '{Literal}Sales by Item Type{/Literal}',
                    action: '',
                    hideOnRetail: true,
                    filters: ['timeRange', 'showGraphs', 'itemType']
                },
                {
                    value: 'sales-by-item-category',
                    label: '{Literal}Sales by Item Category{/Literal}',
                    action: '',
                    hideOnRetail: true,
                    filters: ['timeRange', 'showGraphs', 'itemCategory']
                },
                {
                    value: 'sales-with-comps',
                    label: '{Literal}Sales with Comps{/Literal}',
                    action: '',
                    hideOnRetail: true,
                    filters: ['timeRange', 'showGraphs']
                },
                {
                    value: 'sales-with-discounts',
                    label: '{Literal}Sales with Discounts{/Literal}',
                    action: '',
                    hideOnRetail: true,
                    filters: ['timeRange', 'showGraphs']
                },
                {
                    value: 'sales-by-hour',
                    label: '{Literal}Sales by Hour{/Literal}',
                    action: '',
                    hideOnRetail: true,
                    filters: ['timeRange', 'showGraphs']
                },
                {
                    value: 'tender-total-summary',
                    label: '{Literal}Tender Total Summary{/Literal}',
                    action: '',
                    hideOnRetail: true,
                    filters: ['timeRange', 'showGraphs']
                },
                {
                    value: 'food-service-statistics',
                    label: '{Literal}Food Service Statistics{/Literal}',
                    action: '',
                    hideOnRetail: true,
                    filters: ['timeRange', 'showGraphs']
                }
            ]
        };
    }
});