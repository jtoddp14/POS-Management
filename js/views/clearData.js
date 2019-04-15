var ClearDataView = Backbone.View.extend({
    breadcrumb: {},
    tillList: [],
    tillsInUse: false,
    events: {
        'click .clearCustomers': 'clearCustomers',
        'click .clearItems': 'clearItems',
        'click .clearSales': 'clearSales',
        'click #clear-customers-confirm' : 'clearCustomersConfirm',
        'click #clear-items-confirm' : 'clearItemsConfirm',
        'click #clear-sales-confirm' : 'clearSalesConfirm',
        'click #open-clear-sales-confirm': 'validateDates'
    },

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.breadcrumb = options.breadcrumb;
        this.getTills();
    },

    render: function () {        
        var that = this;
        this.$el.html(this.template());

        App.breadCrumbToolTip = "Clear data from your database. Should only be done on the advice of AccuPOS Tech Support";

        
        $(document).ready(function() {
            $('.datepicker').datepicker();
            var elems = document.querySelectorAll('.datepicker');
            var instances = M.Datepicker.init(elems, {
                autoClose: true,
                container: 'body'
            });
            that.datepicker = instances;
            App.setBreadcrumbs(that.breadcrumb);
            $('.tooltipped').tooltip({delay: 0});
        });
        return this;
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

    getTills: function () {
        var that = this;
        var sessionToken = this.getCookie();
        this.checkAccess();
        $.ajax({
            url: '/data/get-tills-list',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.tillList = data.results;
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

    checkAccess: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/check-access',
            data: {
                accessName: (App.IDS_CLEAR_FILES),
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',

            success: function (data) {
                that.hasAccess = true;
            },

            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else if (e.responseJSON.hasAccess == false) {
                    that.hasAccess = false;
                }
            }
        });
    },

    checkTillsInUse: function () {
        var that = this;
        var sessionToken = this.getCookie();
        this.tillsInUse = false;

        for (var i = 0; i < that.tillList.length; i++) {
            var tillId = that.tillList[i]
            $.ajax({
                url: '/data/check-tills-in-use',
                data: {
                    token: sessionToken,
                    tillId: tillId
                },
                dataType: 'json',
                type: 'POST',
                success: function (data) {
                    
                },
                error: function (e) {
                    if (e.status == 523) {
                        window.location.href = "#/log-in";
                        location.reload();
                    }
                    else {
                        that.tillsInUse = true;
                    }
                }
            });
        }
    },

    checkOpenOrders: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/check-open-orders',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.openOrders = data;
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
    
    clearCustomers: function () {
        $('#clear-customers-modal').modal().modal('open');
    },

    clearItems: function () {
        $('#clear-items-modal').modal().modal('open');
    },
    
    clearSales: function () {
        $('#clear-sales-dates').modal().modal('open');
    },

    openClearSalesConfirm: function () {
        $('#clear-sales-modal').modal().modal('open');
    },

    validateDates: function () {
        var valid = true;

        var startDateValue = this.$el.find('#startDate').val();

        if (startDateValue === null || startDateValue === '') {
            this.$el.find('#startDate').addClass('invalid');
            valid = false;
        }

        if (valid) {
            this.openClearSalesConfirm();
        }
    },

    clearCustomersConfirm: function () {
        var that = this;
        var sessionToken = this.getCookie();
        var totalSuccess = 0;
        var sentMessage = false;
        if (this.hasAccess) {
            for (var i = 0; i < that.tillList.length; i++) {
                var tillId = that.tillList[i]
                $.ajax({
                    url: '/data/check-tills-in-use',
                    data: {
                        token: sessionToken,
                        tillId: tillId
                    },
                    dataType: 'json',
                    type: 'POST',
                    success: function (data) {
                        totalSuccess++;
                        if (totalSuccess == that.tillList.length - 1) {
                            $.ajax({
                                url: '/data/clear-customers',
                                type: 'POST',
                                data: {
                                    accessName: (App.IDS_CLEAR_FILES),
                                    token: sessionToken
                                },
                    
                                success: function (data) {
                                    var success = false;
                                    if (typeof data.results !== 'undefined' && typeof data.results.success !== 'undefined') {
                                        success = data.results.success;
                                    }
                    
                                    M.toast({ html: '{Literal}Customer list clear successfully{/Literal}' });
                                },
                    
                                error: function (e) {
                                    if (e.status == 523) {
                                        window.location.href = "#/log-in";
                                        location.reload();
                                    }
                                    else {  
                                        M.toast({ html: '{Literal}There was a problem clearing customer list{/Literal}.' });
                                    }
                                }
                            });
                        }
                    },
                    error: function (e) {
                        if (e.status == 523) {
                            window.location.href = "#/log-in";
                            location.reload();
                        }
                        else if (!sentMessage) {
                            M.toast({ html: '{Literal}You cannot clear customers while a till is in use{/Literal}.' });;
                            sentMessage = true;
                        }
                    }
                });
            }
        }
        else {
            M.toast({ html: '{Literal}You do not have access to clear data{/Literal}' });
        }

        this.render();
    },

    clearItemsConfirm: function () {
        var that = this;
        var sessionToken = this.getCookie();

        if (this.hasAccess) {
            var totalSuccess = 0;
            var sentMessage = false;
            for (var i = 0; i < that.tillList.length; i++) {
                var tillId = that.tillList[i]
                $.ajax({
                    url: '/data/check-tills-in-use',
                    data: {
                        token: sessionToken,
                        tillId: tillId
                    },
                    dataType: 'json',
                    type: 'POST',
                    success: function (data) {
                        totalSuccess++;
                        if (totalSuccess == that.tillList.length - 1) {
                            $.ajax({
                                url: '/data/check-open-orders',
                                data: {
                                    token: sessionToken
                                },
                                dataType: 'json',
                                type: 'POST',
                                success: function (data) {
                                    $.ajax({
                                        url: '/data/clear-items',
                                        type: 'POST',
                                        data: {
                                            accessName: (App.IDS_CLEAR_FILES),
                                            token: sessionToken
                                        },
                            
                                        success: function (data) {
                                            var success = false;
                                            if (typeof data.results !== 'undefined' && typeof data.results.success !== 'undefined') {
                                                success = data.results.success;
                                            }
                            
                                            M.toast({ html: '{Literal}Item list clear successfully{/Literal}' });
                                        },
                            
                                        error: function (e) {
                                            if (e.status == 523) {
                                                window.location.href = "#/log-in";
                                                location.reload();
                                            }
                                            else {
                                                M.toast({ html: '{Literal}There was a problem clearing item list{/Literal}.' });
                                            }
                                        }
                                    });
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
                    error: function (e) {
                        if (e.status == 523) {
                            window.location.href = "#/log-in";
                            location.reload();
                        }
                        else if (!sentMessage) {
                            M.toast({ html: '{Literal}You cannot clear items while a till is in use{/Literal}.' });;
                            sentMessage = true;
                        }
                    }
                });
            }
        }
        else {
            M.toast({ html: '{Literal}You do not have access to clear data{/Literal}' });
        }
        this.render();
    },

    clearSalesConfirm: function () {
        var startingDate = this.$el.find('#startDate').val() + ' 12:00 am';
        var sessionToken = this.getCookie();
        if (this.hasAccess) {
            $.ajax({
                url: '/data/clear-sales',
                type: 'POST',
                data: {
                    accessName: (App.IDS_CLEAR_FILES),
                    token: sessionToken,
                    startingDate: startingDate
                },
    
                success: function (data) {
                    var success = false;
                    if (typeof data.results !== 'undefined' && typeof data.results.success !== 'undefined') {
                        success = data.results.success;
                    }
    
                    M.toast({ html: '{Literal}Sales cleared successfully{/Literal}' });
                },
    
                error: function (e) {
                    if (e.status == 523) {
                        window.location.href = "#/log-in";
                        location.reload();
                    }
                    else {
                        M.toast({ html: '{Literal}There was a problem clearing sales{/Literal}.' });
                    }
                }
            });
        }
        else {
            M.toast({ html: '{Literal}You do not have access to clear data{/Literal}' });
        }
        this.render();
    },
});
