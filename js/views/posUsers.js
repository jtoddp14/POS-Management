var POSUsersView = Backbone.View.extend({
    fullCollection: {},
    userGroups: {},
    tills: {},
    formModal: null,
    hasAccess: false,

    events: {
        'change #user-group-filter': 'filterCards',
        'click .card-panel-entity': 'highlightCard',
        'click .edit-pos-user-trigger': 'editPosUser',
        'click #add-user-button': 'addPosUser',
        'click .save-button': 'savePosUser',
        'click .delete-button': 'deletionModal',
        'click #delete-pos-user-confirm': 'deletePosUser',
    },

    breadcrumb: {},

    styles: [
        'ap-blue',
        'ap-teal-light',
        'ap-light-purple'
    ],

    userGroupStyleMapping: {},

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.posUserFormTemplate = options.posUserFormTemplate;
        this.breadcrumb = options.breadcrumb;
        this.collection = options.collection;
        this.listenTo(this.collection, 'reset', this.render);
        this.listenTo(this.collection, 'remove', this.render);
        this.listenTo(this.collection, 'add', this.render);
        this.initPOSUsers();
    },

    render: function () {
        this.$el.html(this.template({
            posUsers: this.collection.toJSON(),
            userGroups: this.userGroups,
            tills: this.tills,
            isFoodService: App.serverInfo.isFoodService || false
        }));
        App.breadCrumbToolTip = "Create, manage, and edit users that will use the POS"; 
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
        this.renderUserGroupFilter();
        //$('select').formSelect();
        $('.tooltipped').tooltip();
        this.formModal = this.$el.find('#pos-user-form-modal').modal();
        return this;
    },

    editPosUser: function (e) {
        if (this.hasAccess) {
            var element = $(e.currentTarget);
            var userId = $(element).attr('data-id');
            var user = this.collection.get(userId);
            this.posUserFormView = new POSUserFormView({
                template: this.posUserFormTemplate,
                model: user,
                userGroups: this.userGroups,
                tills: this.tills,
                isFoodService: App.serverInfo.isFoodService || false
            });
    
            this.$el.find('#pos-user-form-modal').html(this.posUserFormView.render().el);
            this.$el.find('select').formSelect();
            this.formModal.modal('open');
        }
        else {
            M.toast({
            html: '{Literal}You do not have access to edit POS Users{/Literal}'
            });
        }
    },

    addPosUser: function () {
        if (this.hasAccess) {
            var user = new POSUser();
            this.posUserFormView = new POSUserFormView({
                template: this.posUserFormTemplate,
                model: user,
                userGroups: this.userGroups,
                tills: this.tills,
                isFoodService: App.serverInfo.isFoodService || false
            });

            this.$el.find('#pos-user-form-modal').html(this.posUserFormView.render().el);
            this.$el.find('select').formSelect();
            this.$el.find("select[required]").css({
                display: "block", 
                position: 'absolute',
                visibility: 'hidden'
            });  
            this.formModal.modal('open');
        }
        else {
            M.toast({
                html: '{Literal}You do not have access to add POS Users{/Literal}'
            });
        }
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

    initPOSUsers: function () {
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
                that.renderTills(data.results);
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

    renderTills: function (data) {
        var that = this;
        for (var i = 0; i < data.length; i++) {
            var currentTill = data[i];
        }
        that.getPOSUsers();
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
                that.renderPOSUsers(data.results);
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

    renderPOSUsers: function (data) {
        this.checkAccess();
        if (!this.hasAccess) {
            $('.add-user-button').hide();
            $('#add-user-button').hide();
        }
        var that = this;
        data.sort(function (a, b) {
            return a.id.toLowerCase() < b.id.toLowerCase() ? -1 : (a.id.toLowerCase() > b.id.toLowerCase() ? 1 : 0);
        });
        var collection = new POSUserCollection();
        for (var i = 0; i < data.length; i++) {
            var currentPOSUser = data[i];
            currentPOSUser.cardStyleClass = that.userGroupStyleMapping[data[i].group];
            collection.add(new POSUser(currentPOSUser));
        }
        that.fullCollection = collection;
        that.collection.reset(collection.models);
    },

    renderUserGroupFilter: function () {
        var userGroups = this.userGroups;
        
        Object.keys(userGroups).forEach(function(key, index) {
            // key: the name of the object key
            // index: the ordinal position of the key within the object 
            $("#user-group-filter").append(
                $('<option></option>').attr("value", key).text(userGroups[key])
            );
        });
        
        /*for (var i = 0; i < userGroups.length; i++) {
            $("#user-group-filter").append(
                $('<option></option>').attr("value", userGroups[i].id).text(userGroups[i].name)
            );
        }*/
        $("#user-group-filter").formSelect();
             
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

    checkAccess: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/check-access',
            data: {
                accessName: (App.IDS_USERS),
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


    filterCards: function (e) {
        var element = $(e.currentTarget);
        var selectedUserGroupId = $(element).val();
        if (selectedUserGroupId === '*') {
            this.collection.reset(this.fullCollection.models);
            $("#user-group-filter option").first().attr('selected', '');
        } else {
            var filtered = this.fullCollection.byUserGroupId(selectedUserGroupId);
            this.collection.reset(filtered.models);
            $("#user-group-filter option[value=" + selectedUserGroupId + "]").attr('selected', '');
        }
        
        $("select").formSelect();
    },

    deletionModal: function (e) {
        var that = this;
        var element = $(e.currentTarget);
        var posUserId = $(element).attr('data-id');
        $("#data-pos-user-id").val(posUserId);
        $('#delete-pos-user-modal').modal().modal('open');
    },

    deletePosUser: function(e) {
        var element = $(e.currentTarget);
        var posUserId = (this.posUserFormView.model.attributes.id);
        var that = this;
        var sessionToken = this.getCookie();
        var checkIfValid = this.deleteValidation();
        if (checkIfValid) {
            $.ajax({
                url: '/data/delete-pos-user',
                type: 'POST',
                data: {
                    token: sessionToken,
                    posUserId: posUserId,
                    accessName: (App.IDS_USERS),
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

                    M.toast({ html: '{Literal}POS User deleted successfully{/Literal}' });
                },

                error: function (e) {
                    if (e.status == 523) {
                        window.location.href = "#/log-in";
                        location.reload();
                    }
                    else {
                        M.toast({ html: '{Literal}There was a problem deleting this POS User please try again later{/Literal}.' });
                    }
                }
            });
            this.render();
        }
    },

    deleteValidation: function () {
        var valid = true;
        var validateOpenOrders = this.$el.find("#openOrderCount").val();
        if (validateOpenOrders > 0) {
            M.toast({ html: '{Literal}You cannot delete users with open orders{/Literal}.' });
            valid = false;
        }

        return valid;
    },

    validateForm: function () {
        var valid = true;

        var validateUsername = this.$el.find("#username").val();
        if (validateUsername.trim().length < 1) {
            this.$el.find("#username").addClass("invalid");
            valid = false;
        }
        else {
            var iChars = "`~!@#$%^&*()_+=[]{}:;,<>./?*\\\'\"";
            for (var i = 0; i < validateUsername.length; i++) {
                if (iChars.indexOf(validateUsername.charAt(i)) != -1) {
                    this.$el.find("#username").addClass("invalid");
                    valid = false;
                    break;
                }
            }
        }

        var validatePassword = this.$el.find("#password-reset").val();

        var iChars = "`~!@#$%^&*()_+=[]{}:,<>./*\\\'\"";
        if (validatePassword.trim().length < 1) {
            if (this.posUserFormView.model.attributes.passcode == "") {
                this.$el.find("#password-reset").addClass("invalid");
                valid = false;
            }
        }

        var passwordKeys = [];
        for (var i=0; i < this.collection.models.length; i++)
        {
            passwordKeys.push(this.collection.models[i].attributes.passcode);
        };
    
        for (var i = 0; i < passwordKeys.length; i++) {
            if (validatePassword == passwordKeys[i])
            {
                valid = false;
                M.toast({ html: '{Literal}Two users cannot have the same password{/Literal}' });
                break;
            }
        };

        return valid;
    },

    getFormValues: function () {
        var username = this.$el.find('#username').val();
        var serverId = this.$el.find('#serverId').val();
        if (serverId == "") {
            serverId = Math.floor(Math.random() * 10000) + 1;
        }
        var userGroup = this.$el.find('#user-group-form-dropdown option:selected').text();
        var till = this.$el.find('#auto-till-form-dropdown option:selected').text();
        var logOutTime = this.$el.find('#idle-timeout-form-dropdown option:selected').text();
        if (logOutTime == "Never") {
            logOutTime = "0";
        }
        else if (logOutTime === "5 Seconds") {
            logOutTime = "5";
        }
        else if (logOutTime == "10 Seconds") {
            logOutTime = "10";
        }
        else if (logOutTime == "30 Seconds") {
            logOutTime = "30";
        }
        else if (logOutTime == "1 Minute") {
            logOutTime = "60";
        }
        else if (logOutTime == "2 Minutes") {
            logOutTime = "120";
        }

        var openOrderCount = this.$el.find('#openOrderCount').val();
        if (openOrderCount == "") {
            openOrderCount = 0;
        }

        var passcode = this.$el.find('#password-reset').val();
        if (passcode.startsWith(";") && passcode.endsWith("?")) {
            passcode = passcode.substring(1, passcode.length()-1);
        }

        if (passcode == "" && this.posUserFormView.model.attributes.passcode != "") {
            passcode = this.posUserFormView.model.attributes.passcode;
        }
        if (this.isFoodService === true) {
            var server = this.$el.find('#server:checked').length > 0
            var driver = this.$el.find('#driver:checked').length > 0

            var updatedModel = {
                id: username,
                group: userGroup,
                serverId: serverId,
                till: till,
                isServer: server,
                isDriver: driver,
                logOutTime: logOutTime,
                passcode: passcode,
                openOrderCount: openOrderCount,
            }
        }
        else {
            var salesRep = this.$el.find('#salesRep:checked').length > 0

            var updatedModel = {
                id: username,
                group: userGroup,
                till: till,
                serverId: serverId,
                isServer: salesRep,
                isDriver: false,
                logOutTime: logOutTime,
                passcode: passcode,
                openOrderCount: openOrderCount,
            }
        }

        this.editedCollecton = new POSUserCollection();
        this.posUserFormView.model.set(updatedModel);
        this.editedCollecton.add(this.posUserFormView.model); 
    },

    savePosUser: function (){
        var posUser;
        var that = this;
        var validation = this.validateForm();
        var updateCollection = that.collection;

        var passcode = this.$el.find('#password-reset').val();
        if (passcode.startsWith(";") && passcode.endsWith("?")) {
            passcode = passcode.substring(1, passcode.length()-1);
        }

        if (passcode == "" && this.posUserFormView.model.attributes.passcode != "") {
            passcode = this.posUserFormView.model.attributes.passcode;
        }
        var totalNumericValues = 0;
        for(var i = 0; i < passcode.length; i++) {
            if (!isNaN(passcode.indexOf(i))) {
                totalNumericValues++;
            }
        }
        if (totalNumericValues != 4) {
            M.toast({ html: '{Literal}Passwords must contain 4 numeric values{/Literal}' });
        }
        else {
            if(validation) {
                this.getFormValues();
                var sessionToken = this.getCookie();
                $.ajax({
                    url: '/data/save-pos-user',
                    data: {
                        token: sessionToken,
                        accessName: (App.IDS_USERS),
                        user: JSON.stringify(that.posUserFormView.model.toJSON()),
                    },
                    dataType: 'json',
                    type: 'POST',

                    success: function (data) {
                        var success = false;
                        if (typeof data.results !== 'undefined' && typeof data.results.success !== 'undefined') {
                            success = data.results.success;
                        }
                        if (success !== null) {
                            that = (that.posUserFormView.model);
                            updateCollection.add(that);
                            
                            M.toast({ html: 'POS User updated successfully!' });
                        }
                    },

                    error: function (e) {
                        if (e.status == 523) {
                            window.location.href = "#/log-in";
                            location.reload();
                        }
                        else {
                            M.toast({ html: '{Literal}There was a problem updating this POS User please try again later{/Literal}.' });
                        }
                    }
                });

                this.render();
            }
        }
    },

});