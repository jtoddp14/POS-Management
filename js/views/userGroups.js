var UserGroupsView = Backbone.View.extend({
    fullCollection: {},
    posPermissions: {},
    managementPermissions: {},
    id: "",
    hasAccess: false,
    isAdd: false,

    events: {
        'click .add-user-group-button': 'addUserGroup',
        'change #permission-type-selector': 'changePermissionType',
        'change #user-group-selector': 'changeUserGroup',
        'click .update-button': 'handleUpdateClick',
        'click .delete-button': 'handleDeleteClick',
        'click .confirm-deletion': 'handleConfirmDeletion',
        'click .confirm-cancellation': 'handleConfirmCancellation'
    },

    breadcrumb: {},

    isCreateMode: false,

    userGroupStyleMapping: {},

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.userGroupFormTemplate = options.userGroupFormTemplate;
        this.breadcrumb = options.breadcrumb;
        this.collection = options.collection;
        this.listenTo(this.collection, 'reset', this.render);
        this.listenTo(this.collection, 'remove', this.render);
        this.listenTo(this.collection, 'add', this.render);
        this.initUserGroups();
    },

    render: function () {
        that = this;
        this.$el.html(this.template({
            userGroups: this.collection.toJSON(),
            isFoodService: App.serverInfo.isFoodService || false
        }));
        $("#permission-type-selector").formSelect();
        $("#user-group-selector").formSelect();
        App.breadCrumbToolTip = "Set POS and Management permissions for your POS users"; 
        App.setBreadcrumbs(this.breadcrumb);
        $(document).on('keydown', 'input, select', function(e) {
            var self = $(this)
              , form = self.parents('form:eq(0)')
              , focusable
              , next
              ;
            if (e.keyCode == 13) {
                focusable = form.find('input,a,select,button,select').filter(':visible');
                next = focusable.eq(focusable.index(this)+1);
                if (next.length) {
                    next.focus();
                } else {
                    form.submit();
                }
                return false;
            }
        });
        this.deleteModal = this.$el.find('.delete-modal').modal();
        this.cancelModal = this.$el.find('.cancel-modal').modal();
        $('.tooltipped').tooltip();
        return this;
    },

    changePermissionType: function (e) {
        var element = $(e.currentTarget);
        var selectedOption = $(element).find(":selected").val();
        
        if (selectedOption === 'pos') {
            this.$el.find('.management-switches').hide();
            this.$el.find('.pos-switches').show();
        } else if (selectedOption === 'management') {
            this.$el.find('.pos-switches').hide();
            this.$el.find('.management-switches').show();
        }
    },

    addUserGroup: function () {
        if (this.hasAccess) {
            this.isCreateMode = true;
            this.$el.find('.delete-button').html('CANCEL');
            this.$el.find('.update-button').html('CREATE');
            
            this.$el.find('.select-group-tooltip').hide();
            this.$el.find('.select-group-form').hide();
            this.$el.find('.create-group-title').show();
            var userGroup = new UserGroup();
            this.userGroupFormView = new UserGroupFormView({
                template: this.userGroupFormTemplate,
                model: userGroup,
                userGroups: this.collection,
                isFoodService: App.serverInfo.isFoodService || false
            });
            this.isAdd = true;
            this.$el.find('#user-group-form').html(this.userGroupFormView.render().el);
            $("#permission-type-selector").formSelect();
            $("#user-group-selector").formSelect();
        }
        else {
            M.toast({ html: '{Literal}You do not have access to add user groups{/Literal}' });
        }
    },

    changeUserGroup: function (e) {
        var element = $(e.currentTarget);
        var userGroupId =$(element).find(":selected").val();
        var userGroup = this.collection.get(userGroupId);
        this.userGroupFormView.model = userGroup;
        this.$el.find('#user-group-form').html(this.userGroupFormView.render().el);
    },

    initUserGroups: function () {
        this.getUserGroups();
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

    getUserGroups: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-user-groups',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.renderUserGroups(data.results);
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

    renderUserGroups: function (data) {
        this.checkAccess();
        var that = this;
        data.sort(function (a, b) {
            return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : 0);
        });
        var collection = new UserGroupCollection();
        for (var i = 0; i < data.length; i++) {
            var currentUserGroup = data[i];
            collection.add(new UserGroup(currentUserGroup));
        }
        that.fullCollection = collection;
        that.collection.reset(collection.models);
        that.renderForm();
    },

    renderForm: function () {
        var userGroup = this.collection.first();
        this.userGroupFormView = new UserGroupFormView({
            template: this.userGroupFormTemplate,
            model: userGroup,
            userGroups: this.collection,
            isFoodService: App.serverInfo.isFoodService || false
        });
        this.$el.find('#user-group-form').html(this.userGroupFormView.render().el);
        $("#permission-type-selector").formSelect();
        $("#user-group-selector").formSelect();
    },

    checkAccess: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/check-access',
            data: {
                accessName: (App.IDS_GROUPS),
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

    getFormValues: function () {
        this.userGroupFormView.model.attributes.id = this.$el.find('#id').val();
        this.userGroupFormView.model.attributes.name = this.$el.find('#username').val();

        this.userGroupFormView.model.attributes.posPermissions.allowSplittingChecks = {
            allowed: this.$el.find('#allowSplittingChecks:checked').length > 0,
            name: "Allow Splitting Checks"
        }

        this.userGroupFormView.model.attributes.posPermissions.cancelSales = {
            allowed: this.$el.find('#cancelSales:checked').length > 0,
            name: "Cancel sales"
        }

        this.userGroupFormView.model.attributes.posPermissions.changePrices = {
            allowed: this.$el.find('#posChangePrices:checked').length > 0,
            name: "Change Prices"
        }

        if (App.serverInfo.foodService) {
            this.userGroupFormView.model.attributes.posPermissions.changeServer = {
                allowed: this.$el.find('#posChangeServer:checked').length > 0,
                name: "Change Server"
            }
        }
        else {
            this.userGroupFormView.model.attributes.posPermissions.changeServer = {
                allowed: false,
                name: "Change Server"
            }
        }

        if (!App.serverInfo.foodService) {
            this.userGroupFormView.model.attributes.posPermissions.changeSalesReps = {
                allowed: this.$el.find('#posChangeServer:checked').length > 0,
                name: "Change Sales Reps"
            }
        }
        else {
            this.userGroupFormView.model.attributes.posPermissions.changeSalesReps = {
                allowed: false,
                name: "Change Sales Reps"
            }   
        }

        if (!App.serverInfo.foodService) {
            this.userGroupFormView.model.attributes.posPermissions.changeSalesRep = {
                allowed: this.$el.find('#posChangeServer:checked').length > 0,
                name: "Change Sales Reps"
            }
        }
        else {
            this.userGroupFormView.model.attributes.posPermissions.changeSalesRep = {
                allowed: false,
                name: "Change Sales Reps"
            }   
        }

        this.userGroupFormView.model.attributes.posPermissions.editReopenedOrders = {
            allowed: this.$el.find('#editReopenedOrders:checked').length > 0,
            name: "Edit Reopened Orders"
        }
        
        this.userGroupFormView.model.attributes.posPermissions.exitPointOfSaleProgram = {
            allowed: this.$el.find('#exitPointOfSaleProgram:checked').length > 0,
            name: "Exit Point of Sale Program"
        }

        this.userGroupFormView.model.attributes.posPermissions.loadAllOrders = {
            allowed: this.$el.find('#loadAllOrders:checked').length > 0,
            name: "Load All Orders"
        }

        this.userGroupFormView.model.attributes.posPermissions.logInTillInUse = {
            allowed: this.$el.find('#logInTillInUse:checked').length > 0,
            name: "Log in till in use"
        }

        this.userGroupFormView.model.attributes.posPermissions.makeRefund = {
            allowed: this.$el.find('#makeRefund:checked').length > 0,
            name: "Make Refund"
        }
        
        this.userGroupFormView.model.attributes.posPermissions.makeReturns = {
            allowed: this.$el.find('#makeReturns:checked').length > 0,
            name: "Make Returns"
        }

        this.userGroupFormView.model.attributes.posPermissions.makeSales = {
            allowed: this.$el.find('#makeSales:checked').length > 0,
            name: "Make Sales"
        }

        this.userGroupFormView.model.attributes.posPermissions.makeVoids = {
            allowed: this.$el.find('#makeVoids:checked').length > 0,
            name: "Make Voids"
        }

        this.userGroupFormView.model.attributes.posPermissions.noSale = {
            allowed: this.$el.find('#noSale:checked').length > 0,
            name: "No Sale"
        }

        this.userGroupFormView.model.attributes.posPermissions.overrideCreditLimit = {
            allowed: this.$el.find('#overrideCreditLimit:checked').length > 0,
            name: "Override Credit Limit"
        }

        this.userGroupFormView.model.attributes.posPermissions.overrideRequiredGuestCount = {
            allowed: this.$el.find('#overrideRequiredGuestCount:checked').length > 0,
            name: "Override Required Guest Count"
        }
       
        this.userGroupFormView.model.attributes.posPermissions.readCashTills = {
            allowed: this.$el.find('#posReadCashTills:checked').length > 0,
            name: "Read Cash Tills"
        }

        this.userGroupFormView.model.attributes.posPermissions.reopenClosedSales = {
            allowed: this.$el.find('#reopenClosedSales:checked').length > 0,
            name: "Reopen Closed Sales"
        }

        this.userGroupFormView.model.attributes.posPermissions.resetCashTills = {
            allowed: this.$el.find('#posResetCashTills:checked').length > 0,
            name: "Reset Cash Tills"
        }

        this.userGroupFormView.model.attributes.posPermissions.resetCurrentTill = {
            allowed: this.$el.find('#posResetCurrentTill:checked').length > 0,
            name: "Reset Current Till"
        }

        this.userGroupFormView.model.attributes.managementPermissions.accushiftManagement = {
            allowed: this.$el.find('#accuShiftManagement:checked').length > 0,
            name: "AccuShift Management"
        }
      
        this.userGroupFormView.model.attributes.managementPermissions.addDeleteItems = {
            allowed: this.$el.find('#addDeleteItems:checked').length > 0,
            name: "Add/Delete Items"
        }
       
        this.userGroupFormView.model.attributes.managementPermissions.addEditCashTills = {
            allowed: this.$el.find('#addEditCashTills:checked').length > 0,
            name: "Add/Edit Cash Tills"
        }

        this.userGroupFormView.model.attributes.managementPermissions.addEditTaxingAuthorities = {
            allowed: this.$el.find('#mgmtAddEditTaxingAuthorities:checked').length > 0,
            name: "Add/Edit Taxing Authorities"
        }

        this.userGroupFormView.model.attributes.posPermissions.addRemoveTax = {
            allowed: this.$el.find('#posAddEditTaxingAuthorities:checked').length > 0,
            name: "Add/Remove Tax"
        }
        
        this.userGroupFormView.model.attributes.managementPermissions.addEditUserGroups = {
            allowed: this.$el.find('#addEditUserGroups:checked').length > 0,
            name: "Add/Edit User Groups"
        }

        this.userGroupFormView.model.attributes.managementPermissions.addEditUsers = {
            allowed: this.$el.find('#addEditUsers:checked').length > 0,
            name: "Add/Edit Users"
        }

        this.userGroupFormView.model.attributes.managementPermissions.adjustInventory = {
            allowed: this.$el.find('#adjustInventory:checked').length > 0,
            name: "Adjust Inventory"
        }

        this.userGroupFormView.model.attributes.managementPermissions.cardsMerchantSetup = {
            allowed: this.$el.find('#cardsMerchantSetup:checked').length > 0,
            name: "Cards/Merchant Setup"
        }

        this.userGroupFormView.model.attributes.managementPermissions.changeCurrencyConversionRate = {
            allowed: this.$el.find('#changeCurrencyConversionRate:checked').length > 0,
            name: "Change Currency Conversion Rate"
        }

        this.userGroupFormView.model.attributes.managementPermissions.changeCustomerInformation = {
            allowed: this.$el.find('#mgmtChangeCustomerInformation:checked').length > 0,
            name: "Change Customer Information"
        }

        this.userGroupFormView.model.attributes.managementPermissions.changeItems = {
            allowed: this.$el.find('#changeItems:checked').length > 0,
            name: "Change Items"
        }
       
        this.userGroupFormView.model.attributes.managementPermissions.changeSystemSettings = {
            allowed: this.$el.find('#changeSystemSettings:checked').length > 0,
            name: "Change System Settings"
        }
       
        this.userGroupFormView.model.attributes.managementPermissions.clearCashTills = {
            allowed: this.$el.find('#clearCashTills:checked').length > 0,
            name: "Clear Cash Tills"
        }

        this.userGroupFormView.model.attributes.managementPermissions.clearDataFiles = {
            allowed: this.$el.find('#clearDataFiles:checked').length > 0,
            name: "Clear Data Files"
        }
       
        this.userGroupFormView.model.attributes.managementPermissions.exportFiles = {
            allowed: this.$el.find('#exportFiles:checked').length > 0,
            name: "Export Files"
        }
        
        this.userGroupFormView.model.attributes.managementPermissions.foodServiceComps = {
            allowed: this.$el.find('#foodServiceComps:checked').length > 0,
            name: "Food Service Comps"
        }

        this.userGroupFormView.model.attributes.managementPermissions.importFiles = {
            allowed: this.$el.find('#importFiles:checked').length > 0,
            name: "Import Files"
        }
        
        this.userGroupFormView.model.attributes.managementPermissions.manage = {
            allowed: this.$el.find('#manage:checked').length > 0,
            name: "Manage"
        }
        
        this.userGroupFormView.model.attributes.managementPermissions.readCashTills = {
            allowed: this.$el.find('#mgmtReadCashTills:checked').length > 0,
            name: "Read Cash Tills"
        }

        this.userGroupFormView.model.attributes.managementPermissions.receiveInventory = {
            allowed: this.$el.find('#receiveInventory:checked').length > 0,
            name: "Receive Inventory"
        }
        
        this.userGroupFormView.model.attributes.managementPermissions.resetCashTills = {
            allowed: this.$el.find('#mgmtResetCashTills:checked').length > 0,
            name: "Reset Cash Tills"
        }

        this.userGroupFormView.model.attributes.managementPermissions.resetCurrentTill = {
            allowed: this.$el.find('#mgmtResetCurrentTill:checked').length > 0,
            name: "Reset Current Till"
        }

        this.userGroupFormView.model.attributes.managementPermissions.isracardDashboard = {
            allowed: this.$el.find('#isracardDashboard:checked').length > 0,
            name: "ISRACard Dashboard"
        }
        //settleCreditCardBatches = this.$el.find('#settleCreditCardBatches:checked').length > 0;

        this.posPermissions =  this.userGroupFormView.model.attributes.posPermissions;
        this.managementPermissions =  this.userGroupFormView.model.attributes.managementPermissions;
        this.id = this.userGroupFormView.model.attributes.id;

        this.sendToServer();
    },

    sendToServer: function() {
        managementPermissions = this.managementPermissions
        if (this.isAdd) {
            this.id = this.$el.find("#username").val();
            this.isAdd = false;
        }
        var that = this;
        sessionToken = this.getCookie();
        id = that.id;
        
        $.ajax({
            url: '/data/update-user-group',
            data: {
                token: sessionToken,
                accessName: (App.IDS_GROUPS),
                id: id,
                posPermissions: JSON.stringify(that.posPermissions),
                managementPermissions: JSON.stringify(that.managementPermissions),
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                var success = false;
                if (typeof data.results !== 'undefined' && typeof data.results.success !== 'undefined') {
                    success = data.results.success;
                }
                if (success !== null) {
                    //that = (that.companyInfoFormView.model);
                }
                sessionToken = "";
                M.toast({ html: '{Literal}Settings saved successfully{/Literal}' });
                that.initUserGroups();
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem saving this user group{/Literal}' });
                }
                sessionToken = "";
            }
        });
    },

    handleUpdateClick: function () {
        if (this.hasAccess) {
            var userGroup;
            var formValues = this.getFormValues();
        }
        else {
            M.toast({ html: '{Literal}You do not have access to edit user groups{/Literal}' });
        }

    },

    validateForm: function() {

    },

    handleDeleteClick: function () {
        if (this.isCreateMode) {
            $(this.cancelModal).modal('open');
        } else {
            $(this.deleteModal).modal('open');
        }
    },
    
    handleConfirmDeletion: function () {
        this.$el.find('.confirm-deletion').addClass('disabled');
        var that = this;
        var sessionToken = this.getCookie();
        if (!that.userGroupFormView.model.get('id') == "ADMIN") {
            $.ajax({
                url: '/data/delete-user-group',
                data: {
                    userGroupId: that.userGroupFormView.model.get('id'),
                    token: sessionToken,
                    accessName: (App.IDS_GROUPS)
                },
                dataType: 'json',
                type: 'POST',
                success: function (data) {
                    var success = false;
                    if (typeof data.results !== 'undefined' && typeof data.results.success !== 'undefined') {
                        success = data.results.success;
                    }
                    if (success) {
                        that.isCreateMode = false;
                        that.collection.remove(that.userGroupFormView.model);
                        that.$el.find('.confirm-deletion').removeClass('disabled');
                        $(that.deleteModal).modal('close');
                        that.userGroupFormView.model = that.collection.first();
                        that.$el.find('#user-group-form').html(that.userGroupFormView.render().el);
                        M.toast({ html: '{Literal}User group deleted successfully{/Literal}' });
                    } else {
                        M.toast({ html: '{Literal}There was a problem deleting this user group{/Literal}' });
                    }
                },
                error: function (e) {
                    if (e.status == 523) {
                        window.location.href = "#/log-in";
                        location.reload();
                    }
                    else {
                        M.toast({ html: '{Literal}There was a problem deleting this user group{/Literal}.' });
                    }
                }
            });
        }
        else {
            $(this.deleteModal).modal('close');
            M.toast({ html: '{Literal}Admin Group can not be removed{/Literal}.' });
        }

        this.$el.find('.confirm-deletion').removeClass('disabled');
    },

    handleConfirmCancellation: function () {
        this.userGroupFormView.model = this.collection.first();
        this.$el.find('#user-group-form').html(this.userGroupFormView.render().el);
        this.isCreateMode = false;
        this.$el.find('.delete-button').html('DELETE');
        this.$el.find('.update-button').html('UPDATE');
        
        this.$el.find('.select-group-tooltip').show();
        this.$el.find('.select-group-form').show();
        this.$el.find('.create-group-title').hide();
        $(this.cancelModal).modal('close');
    }
});