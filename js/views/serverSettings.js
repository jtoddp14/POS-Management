var ServerSettingsView = Backbone.View.extend({
    events: {
        'click .main-settings-button': 'mainSettings',
        'click .save-button': 'saveChanges'
    },

    breadcrumb: {},

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.serverSettingsFormTemplate = options.serverSettingsFormTemplate;
        this.breadcrumb = options.breadcrumb;
        this.collection = options.collection;
        this.model = options.model;
        this.listenTo(this.collection, 'save', this.render);
    },

    render: function () {
        this.$el.html(this.template({
            serverSettings: this.collection.toJSON(),
        }));

        this.renderForm();

        App.setBreadcrumbs(this.breadcrumb);
        var that = this;
        $(document).ready(function () {
            that.$el.find( ".main-settings-button" ).trigger( "click" );
        });
        
        return this;
    },

    mainSettings: function () {
        $('.main-settings-button').hide();

        $('#main_settings').show();  
    },

    renderForm: function () {
        var serverSettingsModel = new ServerSettings();
        if (typeof this.serverSettingsFormView === 'undefined' || this.serverSettingsFormView === null) {
            this.serverSettingsFormView = new ServerSettingsFormView({
                template: this.serverSettingsFormTemplate,
                model: serverSettingsModel
            });
        }
        this.$el.find('#server-settings-form').html(this.serverSettingsFormView.render().el);
    },

    getFormValues: function () {
        var countryCode = this.$el.find('#country-code-form-dropdown').val();
        var debug = this.$el.find('#debug:checked').length > 0;
        var removeFood = this.$el.find('#removeFood:checked').length > 0;
        var socketPort = this.$el.find('#socketPort').val();
        var secureLogin = this.$el.find('#secureLogin:checked').length > 0;
        var reportsLR = this.$el.find('#reportsLR:checked').length > 0;
        var tipsTenderCode = this.$el.find('#tips-tender-form-dropdown').val();
        var autoUpdate = this.$el.find('#autoUpdate:checked').length > 0;
        var databaseDriver = this.$el.find('#database-driver-form-dropdown').val();
        var verifyOrder = this.$el.find('#verifyOrder:checked').length > 0;
        var databasePath = this.$el.find('#databasePath').val();
        var clearCustomerClose = this.$el.find('#clearCustomerClose:checked').length > 0;
        var backupFolder = this.$el.find('#backupFolder').val();
        var accessFolder = this.$el.find('#accessFolder').val();
        var taxCalc = this.$el.find('#tax-calc-form-dropdown').val();
        var carryoutTax = this.$el.find('#carryoutTax:checked').length > 0;

        var tempModel = new ServerSettings();

        var updatedModel = {
            main_settings: {
                countryCode: countryCode,
                debug: debug,
                removeFood: removeFood,
                socketPort: socketPort,
                secureLogin: secureLogin,
                reportsLR: reportsLR,
                tipsTenderCode: tipsTenderCode,
                autoUpdate: autoUpdate,
                databaseDriver: databaseDriver,
                verifyOrder: verifyOrder,
                databasePath: databasePath,
                clearCustomerClose: clearCustomerClose,
                backupFolder: backupFolder,
                accessFolder: accessFolder,
                taxCalc: taxCalc,
                carryoutTax: carryoutTax
            },
        };
        this.serverSettingsFormView.model.set(updatedModel);
    },

    validateForm: function () {
        var valid = true;
        var validateSocketPort = this.$el.find("#socketPort").val();
        if (validateSocketPort.trim().length < 1) {
            this.$el.find("#socketPort").addClass("invalid");
            valid = false;
        }

        var validateDatabasePath = this.$el.find("#databasePath").val();
        if (validateDatabasePath.trim().length < 1) {
            this.$el.find("#databasePath").addClass("databasePath");
            valid = false;
        }

        var validateBackupFolder = this.$el.find("#backupFolder").val();
        if (validateBackupFolder.trim().length < 1) {
            this.$el.find("#backupFolder").addClass("invalid");
            valid = false;
        }

        return valid;
    },

    saveChanges: function (){
        var serverSettings;
        var that = this;
        var validation = this.validateForm();

        if(validation) {
            this.getFormValues();

            $.ajax({
                url: '/data/save-server-settings',
                data: {
                    serverSettings: JSON.stringify(that.serverSettingsFormView.model.toJSON())
                },
                dataType: 'json',
                type: 'POST',
                
                success: function (data) {
                    var success = false;
                    if (typeof data.results !== 'undefined' && typeof data.results.success !== 'undefined') {
                        success = data.results.success;
                    }
                    if (success !== null) {
                        that.collection.add(that.serverSettingsFormView.model);
                    }

                    M.toast({ html: 'Settings saved successfully' });
                },

                error: function (e) {
                    M.toast({ html: 'There was a problem saving server settings, please try again later.' });
                }
            });
        }

        else {
            M.toast({html: 'Some of the required fields are missing or invalid,<br/>please review errors'});
        }
    }
});