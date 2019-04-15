var ImportExportView = Backbone.View.extend({
    breadcrumb: {},
    tillList: [],
    sequenceList: {},

    events: {
        'click .importItems': 'importItems',
        'click .importCustomers': 'importCustomers',
        'click .importEmployees': 'importEmployeeModal',
        'click #reset-employee-pay-type-deny': 'importEmployees',
        'click #reset-employee-pay-type-confirm': 'importEmployeesReset', 
        'click .importReset': 'importReset',
        'click .exportSales': 'openSequenceModal',
        'click .exportItems': 'exportItems',
        'click .sendSequence' : 'exportSequence'
    },

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.breadcrumb = options.breadcrumb;
        this.getTills();
    },

    render: function () {        
        var that = this;

        $(document).ready(function () {
            $('.tooltipped').tooltip({delay: 0});
            that.$el.find('select').formSelect();
        });

        App.breadCrumbToolTip = "Import or export various things to or from your accounting program";

        App.setBreadcrumbs(this.breadcrumb);

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

    checkAccess: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/check-access',
            data: {
                accessName: (App.IDS_IMPORT),
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

    getTills: function () {
        var that = this;
        var sessionToken = this.getCookie();
        //this.checkAccess();
        $.ajax({
            url: '/data/get-tills-list',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.tillList = data.results;
                that.getSequences();
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

    getSequences: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-sequences',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
               that.sequenceList = data.results; 
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
            }
        });

        var delayInMilliseconds = 1000; 
        
        setTimeout(function() {
            that.$el.html(that.template({
                sequences: that.sequenceList
            }));
          }, delayInMilliseconds);



        that.$el.find('select').formSelect();
    },

    openSequenceModal: function () {
        
        $('#import-sequence-modal').modal().modal('open');
    },

    importItems: function () {
        var that = this;
        var sessionToken = this.getCookie();

        $.ajax({
            url: '/data/import-items',
            type: 'POST',
            data: {
                token: sessionToken
            },

            success: function (data) {
                var success = false;
                if (typeof data.results !== 'undefined' && typeof data.results.success !== 'undefined') {
                    success = data.results.success;
                }

                M.toast({ html: '{Literal}Items Imported successfully{/Literal}' });
            },

            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {  
                    M.toast({ html: '{Literal}There was a problem importing items{/Literal}.' });
                }
            }
        });

        this.render();
    },

    importCustomers: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/import-customers',
            type: 'POST',
            data: {
                token: sessionToken
            },

            success: function (data) {
                var success = false;
                if (typeof data.results !== 'undefined' && typeof data.results.success !== 'undefined') {
                    success = data.results.success;
                }

                M.toast({ html: '{Literal}Customers Imported successfully{/Literal}' });
            },

            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem importing customers{/Literal}.' });
                }
            }
        });

        this.render();
    },

    importEmployeeModal: function () {
        $('#import-employee-modal').modal().modal('open');
    },

    importEmployees: function () {
        var sessionToken = this.getCookie();

        $.ajax({
            url: '/data/import-employees',
            type: 'POST',
            data: {
                resetOnImport: "false",
                token: sessionToken,
            },

            success: function (data) {
                var success = false;
                if (typeof data.results !== 'undefined' && typeof data.results.success !== 'undefined') {
                    success = data.results.success;
                }

                M.toast({ html: '{Literal}Employees Imported successfully{/Literal}' });
            },

            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem importing employees{/Literal}.' });
                }
            }
        });
        this.render();
    },

    importEmployeesReset: function () {
        var sessionToken = this.getCookie();

        $.ajax({
            url: '/data/import-employees',
            type: 'POST',
            data: {
                resetOnImport: "true",
                token: sessionToken,
            },

            success: function (data) {
                var success = false;
                if (typeof data.results !== 'undefined' && typeof data.results.success !== 'undefined') {
                    success = data.results.success;
                }

                M.toast({ html: '{Literal}Employees Imported successfully{/Literal}' });
            },

            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem importing employees{/Literal}.' });
                }
            }
        });
        this.render();
    },

    importReset: function () {
        var sessionToken = this.getCookie();
        
        $.ajax({
            url: '/data/import-reset',
            type: 'POST',
            data: {
                token: sessionToken,
            },

            success: function (data) {
                var success = false;
                if (typeof data.results !== 'undefined' && typeof data.results.success !== 'undefined') {
                    success = data.results.success;
                }

                M.toast({ html: '{Literal}Import reset successfully{/Literal}' });
            },

            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem resetting this import{/Literal}.' });
                }
            }
        });
        this.render();
    },

    exportSales: function () {
        var sessionToken = this.getCookie();
        
        $.ajax({
            url: '/data/export-sales',
            type: 'POST',
            data: {
                token: sessionToken,
            },

            success: function (data) {
                var success = false;
                if (typeof data.results !== 'undefined' && typeof data.results.success !== 'undefined') {
                    success = data.results.success;
                }

                M.toast({ html: '{Literal}Sales exported successfully{/Literal}' });
            },

            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem exporting sales{/Literal}.' });
                }
            }
        });
        this.render();
    },

    exportItems: function () {
        var sessionToken = this.getCookie();
        
        $.ajax({
            url: '/data/export-items',
            type: 'POST',
            data: {
                token: sessionToken
            },

            success: function (data) {
                var success = false;
                if (typeof data.results !== 'undefined' && typeof data.results.success !== 'undefined') {
                    success = data.results.success;
                }

                M.toast({ html: '{Literal}Items exported successfully{/Literal}' });
            },

            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem exporting items{/Literal}.' });
                }
            }
        });
        this.render();
    },

    exportSequence: function (e) {
        var element = $(e.currentTarget);
        var sequenceId = $(element).attr("data-id");
        var tillId = $(element).attr("till-id");

        var sessionToken = this.getCookie();

        $.ajax({
            url: '/data/export-sales',
            type: 'POST',
            data: {
                till: tillId,
                sequence: sequenceId,
                token: sessionToken
            },

            success: function (data) {
                var success = false;
                if (typeof data.results !== 'undefined' && typeof data.results.success !== 'undefined') {
                    success = data.results.success;
                }

                M.toast({ html: '{Literal}Sales exported successfully{/Literal}' });
            },

            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem exporting sales{/Literal}.' });
                }
            }
        });
        this.render();
    }
});
