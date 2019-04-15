var PayPeriodsView = Backbone.View.extend({
    fullCollection: {},
    formModal: null,
    deletionModal: {},
    itemsAutocomplete: {},
    editedCollecton: {},
    sentItems: 0,
    badDates: [],
    payPeriodInfo: {},
    employees: {},
    payTypes: {},
   
    prefillState: false,

    paymentTypeMapping: {},

    events: {
        'click #listFormat' : 'showListView',
        'click #calendarFormat' : 'showCalender',
        'click .fc-day' : 'clickDate',
        'click .fc-event-container' : 'clickDate2',
        'click .tableRow': 'openPayPeriod',
        'click .save-button': 'saveInventoryAdjustments',
        'click .delete-button': 'deletionModal',
        'click #delete-inventory-adjustments-confirm': 'deleteInventoryAdjustments',
        'keyup #itemSearch': 'searchItemBySearchTerm',
        'click .add-item': 'addInventoryAdjustments',
        'click .update-inventory-adjustments' : 'updateInventoryAdjustments',
        'keyup qtyAdjusted' : 'validateForm',
        'click #advance-pay-period-button': 'showAdvancePayPeriod',
        'click #cancel-advance-pay-period': 'hideAdvancePayPeriod',
        'click #advance-pay-period-confirm' : 'advancePayPeriod',
        'click #edit-pay-period-button': 'showEditPayPeriodInfo',
        'click #cancel-pay-period-info': 'hideEditPayPeriodInfo',
        'click #save-pay-period-info-confirm': 'savePayPeriodInfo',
    },

    breadcrumb: {},

    styles: [
        'ap-blue',
        '#31619e'
    ],

    inventoryStyleMapping: {},

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.payPeriodsFormTemplate = options.payPeriodsFormTemplate; 
        this.breadcrumb = options.breadcrumb;
        this.collection = options.collection;
        this.listenTo(this.collection, 'reset', this.render);
        this.listenTo(this.collection, 'remove', this.render);
        this.listenTo(this.collection, 'add', this.render);
        this.model = options.model;
        this.initPayPeriods();
    },

    render: function () {
        var that = this;
        this.$el.html(this.template({
            payPeriods: this.collection.toJSON(),
            payPeriodInfo: that.payPeriodInfo
        }));

        
        var that = this;

        App.breadCrumbToolTip = "Set individual quantities of items that you have in stock";
        $(document).ready(function(){
            $('.fixed-action-btn').floatingActionButton();
            $('select').formSelect();
            var elems = document.querySelectorAll('.datepicker');
            var instances = M.Datepicker.init(elems, {
                autoClose: true,
                container: 'body'    
            });

            var today = new Date();

            $('.modal').modal();
            that.itemMapping = {};
            that.itemQtyMapping = {}
            $('#calendar').fullCalendar({
                header: {
                    left: 'prev,next today',
                    center: 'title',
                    right: ''
                },
                dayRender: function (date, cell) {
                    var periodEnd = new Date(that.payPeriodInfo.periodEnd);
                    var periodEndDate = new Date();
                    periodEndDate.setDate(periodEnd.getDate());
                    
                    var periodStartDate = new Date();
                    periodStartDate.setDate(periodEndDate.getDate() - (that.payPeriodInfo.periodDuration));

                    if (date.toDate().getTime() >= periodStartDate.getTime() && date.toDate().getTime() < periodEndDate.getTime()) {
                        if (cell.css("background-color") != "rgb(252, 248, 227)") {
                            cell.css("background-color", "#97CAEB");
                        }  

                        var individualDates = [];
                        for (var i = 0; i < that.badDates.length; i++) {
                            individualDates.push(that.badDates[i]);
                        }

                        let unique = [...new Set(individualDates)];

                        for (var t = 0; t < unique.length; t++){
                            var thisDate = new Date(unique[t]);
                            if (date.toDate().getDate() === unique[t].getDate() && thisDate.getMonth() == date.toDate().getMonth()) {
                                var event={id:1 , title: 'Errors Found', start: date.toDate()};
                                $('#calendar').fullCalendar( 'renderEvent', event, false);
                            }
                        }
                    }
                },
                eventClick: function (calEvent, jsEvent, view) { 
                    that.payPeriodsFormView = new PayPeriodsFormView({
                        template: that.payPeriodsFormTemplate,
                        chosenDate: moment(calEvent.start).format('YYYY-MM-DD'),
                        collection: that.collection,
                        employees: that.employees,
                        payTypes: that.payTypes
                    });

                    that.$el.find('#pay-periods-form-modal').html(that.payPeriodsFormView.render().el);
                    that.formModal.modal('open');

                },
                eventColor: "#ff0000",
                defaultDate: today,
                displayEventTime: false,
                eventStartEditable: false,
                editable: true,
                //selectable: true
            });
        });
            
        App.setBreadcrumbs(this.breadcrumb);

        $(document).on('keydown', 'input, select', function(e) {
            var self = $(this)
              , form = self.parents('form:eq(0)')
              , focusable
              , next
              ;
            if (e.keyCode == 13) {
                that.$el.find(".save-button").trigger("click");
                return false;
            }
        });

        $('.tooltipped').tooltip();
        this.formModal = this.$el.find('#pay-periods-form-modal').modal();
        return this;
    },

    showListView: function () {
        $('#calendar').hide();
        $('#listFormat').hide();
        $('#calendarFormat').show();
        $('#listView').show();
    },

    showCalender: function () {
        $('#calendar').show();
        $('#listFormat').show();
        $('#calendarFormat').hide();
        $('#listView').hide();
    },

    openPayPeriod: function (e) {
        var element = $(e.currentTarget);
        var id = $(element).attr('data-id');
    },

    clickDate: function (e) {
        var that = this;
        var chosenDate = e.currentTarget.dataset.date;
        this.payPeriodsFormView = new PayPeriodsFormView({
            template: this.payPeriodsFormTemplate,
            chosenDate: chosenDate,
            collection: this.collection,
            employees: this.employees,
            payTypes: this.payTypes
        });

        this.$el.find('#pay-periods-form-modal').html(this.payPeriodsFormView.render().el);
        this.formModal.modal('open');
    },

    clickDate2: function (e) {
        var that = this;
    },

    highlightCard: function (e) {
        this.$el.find('.edit').hide();
        this.$el.find('.card-panel-entity').removeClass('active');
        var element = $(e.currentTarget);
        var selected = $(element).attr('data-selected') === '1';
        
        if (selected) {
            $(element).removeAttr('data-selected');
            $(element).removeClass('active');
            $(element).find('.edit').hide();
        } else {
            $(element).removeAttr('data-selected');
            $(element).attr('data-selected', '1');
            $(element).find('.edit').show();
            $(element).addClass('active');
        }
    },

    showAdvancePayPeriod: function () {
        var payPeriodFormModal = this.$el.find('#advance-pay-period-modal').modal();
        payPeriodFormModal.modal('open');
    },

    hideAdvancePayPeriod: function () {
        $('#advance-pay-period-modal').hide();
    },

    advancePayPeriod: function () {
        var that = this;
        var sessionToken = this.getCookie();

        $.ajax({
            url: '/data/advance-pay-period',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                M.toast({
                    html: '{Literal}Pay Period Advanced Successfully{/Literal}' 
                });
                location.reload();
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({
                        html: '{Literal}There was a problem fetching data from the server{/Literal}'
                    });
                }
            }
        });
    },

    showEditPayPeriodInfo: function () {
        var editPayPeriodFormModal = this.$el.find('#edit-pay-period-modal').modal();
        editPayPeriodFormModal.modal('open');
    },
    
    hideEditPayPeriodInfo: function () {
        $('#edit-pay-period-modal').hide();
    },

    savePayPeriodInfo: function () {
        var that = this;
        var sessionToken = this.getCookie();

        var hoursBeforeOT = this.$el.find('#hoursBeforeOT').val();
        var periodDuration = this.$el.find('#periodDuration').val();
        var weekEndDay = this.$el.find('#weekEndDay option:selected').text();
        var weekStartDay = this.$el.find('#weekStartDay option:selected').text();
        var periodEnd = this.$el.find('#periodEnd').val();
        var periodStart = this.$el.find('#periodEnd').val();

        var periodStart = new Date(periodEnd);
        periodStart.setDate(periodStart.getDate() - periodDuration);

        var d = new Date(periodEnd),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();
        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;
    
        periodEnd = [year, month, day].join('-');

        var d = new Date(periodStart),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();
        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;
    
        periodStart = [year, month, day].join('-');

        periodEnd = periodEnd + ' 00:00:01.0';
        periodStart = periodStart + ' 23:59:59.0';

        var updatedModel = {
            hoursBeforeOT: hoursBeforeOT,
            periodDuration: periodDuration,
            weekEndDay: weekEndDay,
            weekStartDay: weekStartDay,
            periodEnd: periodEnd,
            periodStart: periodStart
        };

        if (updatedModel != undefined) {
            this.payPeriodInfo = updatedModel;

            $.ajax({
                url: '/data/save-pay-period-info',
                data: {
                    token: sessionToken,
                    payPeriodInfo: JSON.stringify(updatedModel),
                },
                dataType: 'json',
                type: 'POST',
                success: function (data) {
                    M.toast({
                        html: '{Literal}Pay Period Settings Save Successfully{/Literal}' 
                    });
                    location.reload();
                },
                error: function (e) {
                    if (e.status == 523) {
                        window.location.href = "#/log-in";
                        location.reload();
                    }
                    else {
                        M.toast({
                            html: '{Literal}There was a problem fetching data from the server{/Literal}'
                        });
                    }
                }
            });
        }
    },

    initPayPeriods: function () {
        this.getEmployees();
        this.getPayLevels();
        this.getPayPeriods();
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

    getPayLevels: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-pay-types',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                for ( var key in data.results ) {
                    if (data.results[key] != "") {
                        that.payTypes[key] = data.results[key];
                    }
                }
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem fetching item types from the server{/Literal}' });
                }
            }
        });
    },

    getEmployees: function () {
        var that = this;
        var sessionToken = this.getCookie();

        $.ajax({
            url: '/data/get-employees',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.employees = (data.results);
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({
                        html: '{Literal}There was a problem fetching POS Users from the server{/Literal}'
                    });
                }
            }
        });
    },

    getPayPeriods: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-pay-period',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.payPeriodInfo = data.payPeriodInfo;
                that.generatePayPeriodStyleMapping(data.payPeriods);
                that.renderPayPeriods(data.payPeriods);
                
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({
                        html: '{Literal}There was a problem fetching data from the server{/Literal}'
                    });
                }
            }
        });
    },

    renderPayPeriods: function (data) {
        var that = this;
        data.sort(function (a, b) {
            return a.employeeId.toLowerCase() < b.employeeId.toLowerCase() ? -1 : (a.employeeId.toLowerCase() > b.employeeId.toLowerCase() ? 1 : 0);
        });
        var collection = new PayPeriodsCollection();
        for (var i = 0; i < data.length; i++) {
            var currentInventoryAdjustments = data[i];
            currentInventoryAdjustments.cardStyleClass = that.inventoryStyleMapping[data[i].id];
            var timeIn = new Date(data[i].in);
            var timeOut = new Date(data[i].out);
            if (isNaN(timeIn.getTime())) {
                that.badDates.push(timeOut);
            }
            else if (isNaN(timeOut.getTime())) {
                that.badDates.push(timeIn);
            }
            else if (isNaN(timeOut.getTime()) < isNaN(timeIn.getTime())) {
                that.badDates.push(timeOut);
            }
            collection.add(new PayPeriods(currentInventoryAdjustments));
        }
        that.fullCollection = collection;
        that.collection.reset(collection.models);

        var test = [];
        var foundId = false;
        for (var i = 0; i < this.collection.models.length; i++) {
            for (var j = 0; j < test.length; j++) {
                if (this.collection.models[i].attributes.employeeId == test[j]) {
                    foundId = true;
                }
            }
            if (!foundId) {
                $('#payPeriodTable').append('<tr class="tableRow" data-id="' + this.collection.models[i].attributes.employeeId + '"><td class="employeeId">' + this.collection.models[i].attributes.employeeId + '</td><td class="accountingId">' + this.collection.models[i].attributes.accountingId + '</td> <td class="name">' + this.collection.models[i].attributes.employeeName + '</td> <td class="inOut">' + this.collection.models[i].attributes.in + ' / ' +  this.collection.models[i].attributes.out + '</td> <td class="payLevel">' + this.collection.models[i].attributes.payLevel + '</td> <td class="total">' + this.collection.models[i].attributes.total + '</td> </tr>');
                test.push(this.collection.models[i].attributes.employeeId);
            }
            foundId = false;
        }
    },

    generatePayPeriodStyleMapping: function (data) {
        var inventory = [];
        var totalStyles = this.styles.length;
        var currentStyle = 0;
        for (var i = 0; i < data.length; i++) {
            if (inventory.indexOf(data[i].employee) < 0) {
                inventory.push(data[i].employee);
                this.inventoryStyleMapping[data[i].employee] = this.styles[currentStyle];
                if (currentStyle < totalStyles - 1) {
                    currentStyle++;
                } else {
                    currentStyle = 0;
                }
            }
        }
    },

    getFormValues: function () {
        var id = this.InventoryAdjustmentsFormView.$el.find('#id').val();
        var description = this.InventoryAdjustmentsFormView.$el.find('#description').val();
        var qtyOnHand = this.InventoryAdjustmentsFormView.$el.find('#qtyOnHand').val();
        var total = this.InventoryAdjustmentsFormView.$el.find('#total').val();
        
        var updatedModel = {
            id: id,
            description: description,
            qtyOnHand: qtyOnHand,
            total: total,
        };
        this.editedCollecton = new InventoryAdjustmentsCollection();
        this.InventoryAdjustmentsFormView.model.set(updatedModel);
        this.editedCollecton.add(this.InventoryAdjustmentsFormView.model); 
    },

    validateForm: function () {
        var valid = true;

        var validateQtyAdjusted = this.$el.find("#qtyAdjusted").val();
        if (validateQtyAdjusted.trim().length < 1) {
            this.$el.find("#qtyAdjusted").addClass("invalid");
            valid = false;
        }
        else if (validateQtyAdjusted.indexOf("-") > -1 || validateQtyAdjusted.indexOf('e') > -1) {
            this.$el.find("#qtyAdjusted").addClass("invalid");
            valid = false;
        }
        else if (validateQtyAdjusted > 999999) {
            this.$el.find("#qtyAdjusted").addClass("invalid");
            valid = false;
        }

        return valid;
    },

    deletionModal: function (e) {
        var that = this;
        var element = $(e.currentTarget);
        var inventoryId = $(element).attr('data-id');
        $("#delete-inventory-adjustments-id").val(inventoryId);
        $('#delete-inventory-adjustments-modal').modal().modal('open');
    },

    deleteInventoryAdjustments: function(e) {
        var element = $(e.currentTarget);
        var inventoryId = $(element).attr("data-inventory-adjustments-id");
        this.collection.remove(inventoryId);
        this.render();
    },

    saveInventoryAdjustments: function (){
        var that = this;
        var validation = this.validateForm();
        var updateCollection = that.collection;
        if (validation) {
            var sessionAddition = $('#qtyAdjusted').val();
            var session = document.getElementById('total');
    
            var totalNonParsed = Number(sessionAddition)
            var twoDecimalTotal = Number.parseFloat(totalNonParsed).toFixed(2);
            session.value =  twoDecimalTotal;
        }

        $('#select-type-modal').modal().modal('close');

        if(validation) { 
            this.getFormValues();
            that = (that.InventoryAdjustmentsFormView.model);
            updateCollection.add(that);

            this.render();
        }
    },

    updateInventoryAdjustments: function () { 
        var inventory;
        var that = this;
        var updateCollection = that.collection;
        var sessionToken = this.getCookie();
        for (var i=0; i < that.collection.length; i++) {
            $.ajax({
                url: '/data/save-adjustment-session',
                data: {
                    itemCount: that.collection.models[i].attributes.total,
                    itemCountId: (that.collection.models[i].id),
                    token: sessionToken,
                    password: sessionToken
                },
                dataType: 'json',
                type: 'POST',

                success: function (data) {
                    if (data.success) {
                        var success = false;
                        if (typeof data.results !== 'undefined' && typeof data.results.success !== 'undefined') {
                            success = data.results.success;
                        }
                        that.sentItems++;
                        if (that.sentItems == that.collection.length) {
                            M.toast({ html: '{Literal}Settings saved successfully{/Literal}' });
                        }
                    }
                    else {
                        M.toast({ html: '{Literal}There was a problem saving inventory items{/Literal}' });
                    }

                },

                error: function (e) {
                    if (e.status == 523) {
                        window.location.href = "#/log-in";
                        location.reload();
                    }
                    else {
                        M.toast({ html: '{Literal}There was a problem saving this inventory item{/Literal}' });
                    }
                }
            });
        }

        this.render();
    }
});