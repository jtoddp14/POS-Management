var EmployeesView = Backbone.View.extend({
    fullCollection: {},
    userGroups: {},
    tills: {},
    formModal: null,
    hasAccess: false,
    payTypes: {},
    tills: {},
    userGroups: {},
    posUsers: {},
    employeePosUserArray: [],
    posUserArray: [],
    employeeArray: [],
    masterArray: [],

    events: {
        'click .card-panel-entity': 'highlightCard',
        'click .edit-employee-trigger': 'editEmployee',
        'click #add-employee-button': 'addEmployee',
        'click .save-button': 'saveEmployee',
        'click .delete-button': 'deletionModal',
        'click #delete-employee-confirm': 'deleteEmployee', 
    },

    breadcrumb: {},

    styles: [
        'ap-blue',
        'ap-teal-light',
        'ap-light-purple'
    ],

    employeeStyleMapping: {},
    userGroupStyleMapping: {},

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.employeesFormTemplate = options.employeesFormTemplate;
        this.breadcrumb = options.breadcrumb;
        this.collection = options.collection;
        this.listenTo(this.collection, 'reset', this.render);
        this.listenTo(this.collection, 'remove', this.render);
        this.listenTo(this.collection, 'add', this.render);

        if (App.serverInfo.hasAccuShift) {
            this.initPayTypes();
        }
        else {
            this.initPayTypes();
        }
    },

    render: function () {
        this.$el.html(this.template({
            employees: this.collection.toJSON(),
        }));
        App.breadCrumbToolTip = "Create, manage, and edit your employees"; 

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
        //$('select').formSelect();
        $('.tooltipped').tooltip();
        this.formModal = this.$el.find('#employees-form-modal').modal();
        this.masterArray = []
        return this;
    },

    editEmployee: function (e) {
        this.formModal = this.$el.find('#employees-form-modal').modal();
        var element = $(e.currentTarget);
        var userId = $(element).attr('data-id');
        var user = this.collection.get(userId);
        this.employeesFormView = new EmployeesFormView({
            template: this.employeesFormTemplate,
            model: user,
            payTypes: this.payTypes,
            tills: this.tills,
            userGroups: this.userGroups
        });
        this.$el.find('#employees-form-modal').html(this.employeesFormView.render().el);
        this.$el.find('select').formSelect();
        this.formModal.modal('open');
    },

    addEmployee: function () {
        var employee = new Employee();
        this.employeesFormView = new EmployeesFormView({
            template: this.employeesFormTemplate,
            model: employee,
            payTypes: this.payTypes,
            tills: this.tills,
            userGroups: this.userGroups
        });
        this.formModal = this.$el.find('#employees-form-modal').modal();
        this.$el.find('#employees-form-modal').html(this.employeesFormView.render().el);
        this.$el.find('select').formSelect();
        this.$el.find("select[required]").css({
            display: "block", 
            position: 'absolute',
            visibility: 'hidden'
        });  
        this.formModal.modal('open');
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

    initPayTypes: function () {
        this.getPayTypes();
    },

    getPayTypes: function () {
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
                that.getUserGroups();
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

    getUserGroups: function () {
        var parentView = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-user-groups',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                parentView.userGroups = transformObjectArrayToKeyValueObject(data.results, 'id', 'name');
                parentView.generateUserGroupStyleMapping(data.results);
                parentView.getTills();
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

    generateUserGroupStyleMapping: function (data) {
        var userGroups = [];
        var totalStyles = this.styles.length;
        var currentStyle = 0;
        for (var i = 0; i < data.length; i++) {
            if (userGroups.indexOf(data[i].id) < 0) {
                userGroups.push(data[i].id);
                this.userGroupStyleMapping[data[i].id] = this.styles[currentStyle];
                if (currentStyle < totalStyles - 1) {
                    currentStyle++;
                } else {
                    currentStyle = 0;
                }
            }
        }
    },

    getTills: function (parentView) {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-tills',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.tills = data.results;
                that.getPOSUsers();
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

    getPOSUsers: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-pos-users',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                for (var i = 0; i < data.results.length; i++) {
                    var autoTillId = data.results[i].till;                     
                    if (typeof that.tills !== 'undefined') {
                        var tills = that.tills.filter(
                            function (element) {
                                return element.id === tills;
                            }
                        );
                        if (tills.length > 0) {
                            data.results[i].tillName = tills[0].name;
                        } else {
                            data.results[i].tillName = 'N/A';    
                        }
                    } else {
                        data.results[i].tillName = 'N/A';
                    }
                }
                that.posUsers = data.results;
                that.initEmployees();
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

    initEmployees: function () {
        this.getEmployees();
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
                that.renderEmployees(data.results);
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    that.renderEmployees();
                }
            }
        });
    },

    renderEmployees: function (data) {
        var that = this;
        if (data == undefined) {
            data = this.posUsers;
        }
        
        if (data == this.posUsers) {
            data.sort(function (a, b) {
                return a.id.toLowerCase() < b.id.toLowerCase() ? -1 : (a.id.toLowerCase() > b.id.toLowerCase() ? 1 : 0);
            });
            for (var i = 0; i < that.posUsers.length; i++) {
                var posUserEmployeeModel = {
                    accountingId: "",
                    isPosUser: true,
                    isEmployee: false,
                    currentHours: 0,
                    employeeClass: "",
                    id: Math.floor(Math.random() * 1000) + 1  ,
                    isClockedIn: false,
                    manager: false,
                    name: "",
                    overtimeOver8: true,
                    payLevel1: "",
                    payLevel2: "",
                    payLevel3: "",
                    payLevel4: "",
                    payLevel5: "",
                    payLevel6: "",
                    payLevel7: "",
                    payLevel8: "",
                    payLevel9: "",
                    payLevel10: "",
                    payLevel11: "",
                    payLevel12: "",
                    payLevel13: "",
                    payLevel14: "",
                    payLevel15: "",
                    payLevel16: "",
                    payLevel17: "",
                    payLevel18: "",
                    payLevel19: "",
                    payLevel20: "",
                    payLevelNumber: 0,
                    group: that.posUsers[i].group, 
                    posUserId: that.posUsers[i].id,
                    isDriver: that.posUsers[i].isDriver,
                    isServer: that.posUsers[i].isServer,
                    logOutTime: that.posUsers[i].logOutTime,
                    openOrderCount: that.posUsers[i].openOrderCount,
                    passcode: that.posUsers[i].passcode,
                    serverId: that.posUsers[i].serverId,
                    till: that.posUsers[i].till,
                    tillName: that.posUsers[i].tillName,
                }
                that.masterArray.push(posUserEmployeeModel);
            }
        }
        else {
            data.sort(function (a, b) {
                return a.id.toLowerCase() < b.id.toLowerCase() ? -1 : (a.id.toLowerCase() > b.id.toLowerCase() ? 1 : 0);
            });
            for (var i = 0; i < that.posUsers.length; i++) {
                for (var j = 0; j < data.length; j++) {
                    if (that.posUsers[i].id == data[j].name) {
                        var posUserEmployeeModel = {
                            isPosUser: true,
                            isEmployee: true,
                            accountingId: data[j].accountingId,
                            currentHours: data[j].currentHours,
                            employeeClass: data[j].employeeClass,
                            isClockedIn: data[j].isClockedIn,
                            id: data[j].id,
                            manager: data[j].manager,
                            name: data[j].name,
                            overtimeOver8: data[j].overtimeOver8,
                            payLevel1: data[j].payLevel1,
                            payLevel2: data[j].payLevel2,
                            payLevel3: data[j].payLevel3,
                            payLevel4: data[j].payLevel4,
                            payLevel5: data[j].payLevel5,
                            payLevel6: data[j].payLevel6,
                            payLevel7: data[j].payLevel7,
                            payLevel8: data[j].payLevel8,
                            payLevel9: data[j].payLevel9,
                            payLevel10: data[j].payLevel10,
                            payLevel11: data[j].payLevel11,
                            payLevel12: data[j].payLevel12,
                            payLevel13: data[j].payLevel13,
                            payLevel14: data[j].payLevel14,
                            payLevel15: data[j].payLevel15,
                            payLevel16: data[j].payLevel16,
                            payLevel17: data[j].payLevel17,
                            payLevel18: data[j].payLevel18,
                            payLevel19: data[j].payLevel19,
                            payLevel20: data[j].payLevel20,
                            payLevelNumber: data[j].payLevelNumber,
                            group: that.posUsers[i].group, 
                            posUserId: that.posUsers[i].id,
                            isDriver: that.posUsers[i].isDriver,
                            isServer: that.posUsers[i].isServer,
                            logOutTime: that.posUsers[i].logOutTime,
                            openOrderCount: that.posUsers[i].openOrderCount,
                            passcode: that.posUsers[i].passcode,
                            serverId: that.posUsers[i].serverId,
                            till: that.posUsers[i].till,
                            tillName: that.posUsers[i].tillName,
                        }
    
                        that.masterArray.push(posUserEmployeeModel);
                    }
                }
            }
    
            for (var i = 0; i < that.posUsers.length; i++) {
                var foundEmployee = false;
                for (var j = 0; j < data.length; j++) {
                    if (that.posUsers[i].id == data[j].name) {
                        foundEmployee = true;
                    }
                }
                if (!foundEmployee) {
                    var posUserEmployeeModel = {
                        accountingId: "",
                        isPosUser: true,
                        isEmployee: false,
                        currentHours: 0,
                        employeeClass: "",
                        id: Math.floor(Math.random() * 1000) + 1  ,
                        isClockedIn: false,
                        manager: false,
                        name: "",
                        overtimeOver8: true,
                        payLevel1: "",
                        payLevel2: "",
                        payLevel3: "",
                        payLevel4: "",
                        payLevel5: "",
                        payLevel6: "",
                        payLevel7: "",
                        payLevel8: "",
                        payLevel9: "",
                        payLevel10: "",
                        payLevel11: "",
                        payLevel12: "",
                        payLevel13: "",
                        payLevel14: "",
                        payLevel15: "",
                        payLevel16: "",
                        payLevel17: "",
                        payLevel18: "",
                        payLevel19: "",
                        payLevel20: "",
                        payLevelNumber: 0,
                        group: that.posUsers[i].group, 
                        posUserId: that.posUsers[i].id,
                        isDriver: that.posUsers[i].isDriver,
                        isServer: that.posUsers[i].isServer,
                        logOutTime: that.posUsers[i].logOutTime,
                        openOrderCount: that.posUsers[i].openOrderCount,
                        passcode: that.posUsers[i].passcode,
                        serverId: that.posUsers[i].serverId,
                        till: that.posUsers[i].till,
                        tillName: that.posUsers[i].tillName,
                    }
                    that.masterArray.push(posUserEmployeeModel);
                }
            }
    
            for (var i = 0; i < data.length; i++) {
                var foundPosUser = false;
                for (var j = 0; j < that.posUsers.length; j++) {
                    if (that.posUsers[j].id == data[i].name) {
                        foundPosUser = true;
                    }
                }
                if (!foundPosUser) {
                    var posUserEmployeeModel = {
                        isPosUser: false,
                        isEmployee: true,
                        accountingId: data[i].accountingId,
                        currentHours: data[i].currentHours,
                        employeeClass: data[i].employeeClass,
                        isClockedIn: data[i].isClockedIn,
                        id: data[i].id,
                        manager: data[i].manager,
                        name: data[i].name,
                        overtimeOver8: data[i].overtimeOver8,
                        payLevel1: data[i].payLevel1,
                        payLevel2: data[i].payLevel2,
                        payLevel3: data[i].payLevel3,
                        payLevel4: data[i].payLevel4,
                        payLevel5: data[i].payLevel5,
                        payLevel6: data[i].payLevel6,
                        payLevel7: data[i].payLevel7,
                        payLevel8: data[i].payLevel8,
                        payLevel9: data[i].payLevel9,
                        payLevel10: data[i].payLevel10,
                        payLevel11: data[i].payLevel11,
                        payLevel12: data[i].payLevel12,
                        payLevel13: data[i].payLevel13,
                        payLevel14: data[i].payLevel14,
                        payLevel15: data[i].payLevel15,
                        payLevel16: data[i].payLevel16,
                        payLevel17: data[i].payLevel17,
                        payLevel18: data[i].payLevel18,
                        payLevel19: data[i].payLevel19,
                        payLevel20: data[i].payLevel20,
                        payLevelNumber: data[i].payLevelNumber,
                        group: "", 
                        posUserId: "",
                        isDriver: false,
                        isServer: false,
                        logOutTime: 0,
                        openOrderCount: '',
                        passcode: '',
                        serverId: '',
                        till: '',
                        tillName: '',
                    }
                }
    
                that.masterArray.push(posUserEmployeeModel);
            }
        }
        
        that.generateEmployeeStyleMapping(that.masterArray)

        var collection = new EmployeeCollection();
        for (var i = 0; i < that.masterArray.length; i++) {
            var currentEmployee = that.masterArray[i];
            collection.add(new Employee(currentEmployee));
        }

        that.fullCollection = collection;
        that.collection.reset(collection.models);
    },


    generateEmployeeStyleMapping: function (data) {
        var userGroups = [];
        var totalStyles = this.styles.length;
        var currentStyle = 0;
        for (var i = 0; i < data.length; i++) {
            if (userGroups.indexOf(data[i].id) < 0) {
                userGroups.push(data[i].id);
                this.employeeStyleMapping[data[i].id] = this.styles[currentStyle];
                if (currentStyle < totalStyles - 1) {
                    currentStyle++;
                } else {
                    currentStyle = 0;
                }
            }
        }
    },

    deletionModal: function (e) {
        var that = this;
        var element = $(e.currentTarget);
        var posUserId = $(element).attr('data-id');
        $("#data-employee-id").val(posUserId);
        $('#delete-employee-modal').modal().modal('open');
    },

    deleteEmployee: function(e) {
        var element = $(e.currentTarget);
        var posUserId = (this.employeesFormView.model.attributes.id);
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/delete-employee',
            type: 'POST',
            data: {
                employeeId: posUserId,
                token: sessionToken
            },
            method: 'POST',
            success: function (data) {
                var success = false;
                if (typeof data.results !== 'undefined' && typeof data.results.success !== 'undefined') {
                    success = data.results.success;
                }
                if (success !== null) {
                    that.collection.remove(posUserId);
                }

                M.toast({ html: '{Literal}Employee deleted successfully{/Literal}' });
            },

            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem deleting this Employee please try again later{/Literal}.' });
                }
            }
        });
        this.render();
    },

    validateForm: function () {
        var valid = true;

        var validateUsername = this.$el.find("#name").val();
        if (validateUsername.trim().length < 1) {
            this.$el.find("#name").addClass("invalid");
            valid = false;
        }
        else {
            var iChars = "`~!@#$%^&*()_+=[]{}:;,<>./?*\\\'\"";
            for (var i = 0; i < validateUsername.length; i++) {
                if (iChars.indexOf(validateUsername.charAt(i)) != -1) {
                    this.$el.find("#name").addClass("invalid");
                    valid = false;
                    break;
                }
            }
        }

        var validatePassword = this.$el.find("#password").val();

        var iChars = "`~!@#$%^&*()_+=[]{}:,<>./*\\\'\"";
        if (validatePassword.trim().length < 1) {
            if (this.employeesFormView.model.attributes.passcode == "") {
                this.$el.find("#password").addClass("invalid");
                valid = false;
            }
        }

        var passwordKeys = [];
        
        if (validatePassword != '') {
            for (var i=0; i < this.collection.models.length; i++)
            { 
                if (this.collection.models[i].attributes.passcode != this.employeesFormView.model.attributes.passcode) {
                    passwordKeys.push(this.collection.models[i].attributes.passcode);
                }
            };
        
            for (var i = 0; i < passwordKeys.length; i++) {
                if (validatePassword == passwordKeys[i])
                {
                    valid = false;
                    M.toast({ html: '{Literal}Two users cannot have the same password{/Literal}' });
                    break;
                }
            };
        }
        return valid;
    },

    getFormValues: function () {
        var name = this.$el.find('#name').val();

        var passcode = this.$el.find('#password').val();

        if (passcode == "") {
            if (this.employeesFormView.model.attributes.passcode != "") {
                passcode = this.employeesFormView.model.attributes.passcode;
            }
            else {
                passcode = this.employeesFormView.model.attributes.id;
            }
        }

        var till = this.$el.find('#auto-till-form-dropdown option:selected').text();

        var logOutTime = this.$el.find('#idle-timeout-form-dropdown option:selected').text();

        var payLevelNumber = document.getElementById("pay-level-dropdown").selectedIndex;

        var userGroup = this.$el.find('#user-group-form-dropdown option:selected').text();

        if (App.serverInfo.isFoodService) {
            var server = this.$el.find('#server:checked').length > 0;
            var driver = this.$el.find('#driver:checked').length > 0;
            var salesRep = this.$el.find('#server:checked').length > 0;
        }
        else {
            var server = this.$el.find('#server:checked').length > 0;
            var driver = false;
            var salesRep = this.$el.find('#server:checked').length > 0;
        }

        var payLevel1 = "";
        var payLevel1Check = this.$el.find('#payLevel1:checked').length > 0;
        if (payLevel1Check) {
            payLevel1 = "active"
        }

        var payLevel2 = "";
        var payLevel2Check = this.$el.find('#payLevel2:checked').length > 0;
        if (payLevel2Check) {
            payLevel2 = "active"
        }

        var payLevel3 = "";
        var payLevel3Check = this.$el.find('#payLevel3:checked').length > 0;
        if (payLevel3Check) {
            payLevel3 = "active"
        }

        var payLevel4 = "";
        var payLevel4Check = this.$el.find('#payLevel4:checked').length > 0;
        if (payLevel4Check) {
            payLevel4 = "active"
        }

        var payLevel5 = "";
        var payLevel5Check = this.$el.find('#payLevel5:checked').length > 0;
        if (payLevel5Check) {
            payLevel5 = "active"
        }

        var payLevel6 = "";
        var payLevel6Check = this.$el.find('#payLevel6:checked').length > 0;
        if (payLevel6Check) {
            payLevel6 = "active"
        }

        var payLevel7 = "";
        var payLevel7Check = this.$el.find('#payLevel7:checked').length > 0;
        if (payLevel7Check) {
            payLevel7 = "active"
        }

        var payLevel8 = "";
        var payLevel8Check = this.$el.find('#payLevel8:checked').length > 0;
        if (payLevel8Check) {
            payLevel8 = "active"
        }

        var payLevel9 = "";
        var payLevel9Check = this.$el.find('#payLevel9:checked').length > 0;
        if (payLevel9Check) {
            payLevel9 = "active"
        }

        var payLevel10 = "";
        var payLevel10Check = this.$el.find('#payLevel10:checked').length > 0;
        if (payLevel10Check) {
            payLevel10 = "active"
        }

        var payLevel11 = "";
        var payLevel11Check = this.$el.find('#payLevel11:checked').length > 0;
        if (payLevel11Check) {
            payLevel11 = "active"
        }

        var payLevel12 = "";
        var payLevel12Check = this.$el.find('#payLevel12:checked').length > 0;
        if (payLevel12Check) {
            payLevel12 = "active"
        }

        var payLevel13 = "";
        var payLevel13Check = this.$el.find('#payLevel13:checked').length > 0;
        if (payLevel13Check) {
            payLevel13 = "active"
        }

        var payLevel14 = "";
        var payLevel14Check = this.$el.find('#payLevel14:checked').length > 0;
        if (payLevel14Check) {
            payLevel14 = "active"
        }

        var payLevel15 = "";
        var payLevel15Check = this.$el.find('#payLevel15:checked').length > 0;
        if (payLevel15Check) {
            payLevel15 = "active"
        }

        var payLevel16 = "";
        var payLevel16Check = this.$el.find('#payLevel16:checked').length > 0;
        if (payLevel16Check) {
            payLevel16 = "active"
        }

        var payLevel17 = "";
        var payLevel17Check = this.$el.find('#payLevel17:checked').length > 0;
        if (payLevel17Check) {
            payLevel17 = "active"
        }
        
        var payLevel18 = "";
        var payLevel18Check = this.$el.find('#payLevel18:checked').length > 0;
        if (payLevel18Check) {
            payLevel18 = "active"
        }

        var payLevel19 = "";
        var payLevel19Check = this.$el.find('#payLevel19:checked').length > 0;
        if (payLevel19Check) {
            payLevel19 = "active"
        }

        var payLevel20 = "";
        var payLevel20Check = this.$el.find('#payLevel20:checked').length > 0;
        if (payLevel20Check) {
            payLevel20 = "active"
        }
        var manager = this.$el.find('#manager:checked').length > 0;
        var overtimeOver8 = this.$el.find('#overtimeOver8:checked').length > 0;

        if (App.serverInfo.isFoodService) {
            var updatedModel = {
                accountingId: this.employeesFormView.model.attributes.accountingId,
                currentHours: this.employeesFormView.model.attributes.currentHours,
                employeeClass: this.employeesFormView.model.attributes.employeeClass,
                isClockedIn: this.employeesFormView.model.attributes.isClockedIn,
                payLevelNumber: payLevelNumber,
                id: passcode,
                manager: manager,
                name: name,
                overtimeOver8: overtimeOver8,
                payLevel1:payLevel1,
                payLevel2: payLevel2,
                payLevel3: payLevel3,
                payLevel4: payLevel4,
                payLevel5: payLevel5,
                payLevel6: payLevel6,
                payLevel7: payLevel7,
                payLevel8: payLevel8,
                payLevel9: payLevel9,
                payLevel10: payLevel10,
                payLevel11: payLevel11,
                payLevel12: payLevel12,
                payLevel13: payLevel13,
                payLevel14: payLevel14,
                payLevel15: payLevel15,
                payLevel16: payLevel16,
                payLevel17: payLevel17,
                payLevel18: payLevel18,
                payLevel19: payLevel19,
                payLevel20: payLevel20,
                group: userGroup, 
                posUserId: name,
                isDriver: driver,
                isServer: server,
                logOutTime: logOutTime,
                openOrderCount: this.employeesFormView.model.attributes.openOrderCount,
                passcode: passcode,
                serverId: this.employeesFormView.model.attributes.serverId,
                till: till,
                tillName: this.employeesFormView.model.attributes.tillName,
            }
        }
        else {
            var updatedModel = {
                accountingId: this.employeesFormView.model.attributes.accountingId,
                currentHours: this.employeesFormView.model.attributes.currentHours,
                employeeClass: this.employeesFormView.model.attributes.employeeClass,
                isClockedIn: this.employeesFormView.model.attributes.isClockedIn,
                id: passcode,
                manager: manager,
                name: name,
                overtimeOver8: overtimeOver8,
                payLevel1:payLevel1,
                payLevel2: payLevel2,
                payLevel3: payLevel3,
                payLevel4: payLevel4,
                payLevel5: payLevel5,
                payLevel6: payLevel6,
                payLevel7: payLevel7,
                payLevel8: payLevel8,
                payLevel9: payLevel9,
                payLevel10: payLevel10,
                payLevel11: payLevel11,
                payLevel12: payLevel12,
                payLevel13: payLevel13,
                payLevel14: payLevel14,
                payLevel15: payLevel15,
                payLevel16: payLevel16,
                payLevel17: payLevel17,
                payLevel18: payLevel18,
                payLevel19: payLevel19,
                payLevel20: payLevel20,
                group: userGroup, 
                posUserId: name,
                isDriver: false,
                isServer: salesRep,
                logOutTime: logOutTime,
                openOrderCount: this.employeesFormView.model.attributes.openOrderCount,
                passcode: passcode,
                serverId: this.employeesFormView.model.attributes.serverId,
                till: till,
                tillName: this.employeesFormView.model.attributes.tillName,
            }
        }

        this.editedCollecton = new EmployeeCollection();
        this.employeesFormView.model.set(updatedModel);
        this.editedCollecton.add(this.employeesFormView.model); 
    },

    saveEmployee: function (){
        var validation = this.validateForm();
        var posUserSwitch = this.$el.find('#posUserSwitch:checked').length > 0;
        if(validation) {
            this.getFormValues();
            if (posUserSwitch) {
                this.savePOSUser();
            }
            else {
                this.sendEmployee();
            }
        }
    },

    savePOSUser: function () {
        var posUser;
        var that = this;
        var updateCollection = that.collection;
        var passcode = this.$el.find('#password').val();
        if (passcode.startsWith(";") && passcode.endsWith("?")) {
            passcode = passcode.substring(1, passcode.length()-1);
        }

        if (passcode == "" && this.employeesFormView.model.attributes.passcode != "") {
            passcode = this.employeesFormView.model.attributes.passcode;
        }
        var totalNumericValues = 0;
        for(var i = 0; i < passcode.length; i++) {
            if (!isNaN(passcode.indexOf(i))) {
                totalNumericValues++;
            }
        }
        if (totalNumericValues < 4) {
            M.toast({ html: '{Literal}Passwords must contain 4 numeric values{/Literal}' });
        }
        else {
            this.getFormValues();
            var sessionToken = this.getCookie();
            $.ajax({
                url: '/data/save-pos-user',
                data: {
                    user: JSON.stringify(that.employeesFormView.model.toJSON()),
                    token: sessionToken,
                    accessName: (App.IDS_USERS)
                },
                dataType: 'json',
                type: 'POST',

                success: function (data) {
                    var success = false;
                    if (typeof data.results !== 'undefined' && typeof data.results.success !== 'undefined') {
                        success = data.results.success;
                    }
                    if (App.hasAccuShift) {
                        that.sendEmployee();
                    }
                    else {
                        that = (that.employeesFormView.model);
                        updateCollection.add(that);
                        M.toast({ html: 'Employee updated successfully!' });
                        that.render();
                    }
                },

                error: function (e) {
                    if (e.status == 523) {
                        window.location.href = "#/log-in";
                        location.reload();
                    }
                    else {
                        M.toast({ html: '{Literal}There was a problem updating this Employee please try again later{/Literal}.' });
                    }
                }
            });
        }
    },

    sendEmployee: function () {
        var that = this;
        var sessionToken = this.getCookie();
        var updateCollection = that.collection;
        $.ajax({
            url: '/data/save-employee',
            data: {
                employee: JSON.stringify(that.employeesFormView.model.toJSON()),
                token: sessionToken,
            },
            dataType: 'json',
            type: 'POST',

            success: function (data) {
                var success = false;
                if (typeof data.results !== 'undefined' && typeof data.results.success !== 'undefined') {
                    success = data.results.success;
                }
                if (success !== null) {
                    that = (that.employeesFormView.model);
                    updateCollection.add(that);
                    
                    M.toast({ html: 'Employee updated successfully!' });
                }
            },

            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem updating this Employee please try again later{/Literal}.' });
                }
            }
        });

        this.render();
    }
});