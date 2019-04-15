var IntegrationsView = Backbone.View.extend({
    events: {
        'click .integration-arrow-button': 'integration',
        'click .cloud-arrow-button': 'cloud',
        'click .save-button': 'saveChanges',
        'click .integrations-setup-button': 'integration',
        'click #hasAd2POS': 'showAd2POS',
        'click #hasAccounting': 'showAccounting',
        'click #hasComo': 'showComo',
        'click #accuposCloudSync': 'showAccuposCloudSync',
        'click #hasAd2POS': 'showAd2POS',
        'change #integratorType' : 'chooseIntegratorType',
    },

    data: {},
    breadcrumb: {},

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.breadcrumb = options.breadcrumb;
        this.model = options.model;
        this.listenTo(this.model, 'change', this.render);
        this.getData();
    },

    render: function () {    
        this.$el.html(this.template({
            integrations: this.model.toJSON()
        }));
        App.breadCrumbToolTip = "Setup or change programs that interact with your POS";
        App.setBreadcrumbs(this.breadcrumb);

        var that = this;
        $(document).ready(function () {
            $('.tooltipped').tooltip({delay: 0});
            that.$el.find(".integrations-setup-button").trigger("click");
            that.$el.find('select').formSelect();
        });
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

        if (this.model.attributes.hasAccounting) {
            $("#accountingBlock1").show();
            $("#accountingBlock2").show();
        }

        if (this.model.attributes.hasComo) {
            $("#comoBlock1").show();
            $("#comoBlock2").show();
        }

        if (this.model.attributes.accuposCloudSync) {
            $("#cloudBlock").show();
        }

        if (this.model.attributes.hasAd2POS) {
            $("#ad2posBlock").show();
        }

        if (this.model.attributes.integratorType == "AccuServerSageLiveIntegrator") {
            $("#sageLiveBlock").show();
        }
        else if (this.model.attributes.integratorType == "Quickbooks Online") {
            $("#qbBlock").show();
            $("#qboBlock").show();
        }
        else {
            $("#qbBlock").show();
            $("#qbdesktopBlock").show();
        }

        return this;
    },

    getData: function() {
        this.getIntegrationsData();
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

    getIntegrationsData: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-integration-setup',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.integrations = data;
                that.model.set(data);
                that.$el.find('#integrations-form').show();
            },
            error: function (e) {

                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem retrieving data from the server{/Literal}.' });
                }
            }
        });
    },

    integration: function () {
        $('.integrations-setup-button').hide();

        $('#integrations').show();  
        $('#cloud').hide(); 
    },

    cloud: function () {
        $('#integrations').hide();  
        $('#cloud').show(); 
    },

    showAd2POS: function () {
        var hasAd2POS = this.$el.find('#hasAd2POS:checked').length > 0;
        if (hasAd2POS) {
            $("#ad2posBlock").show();
        }
        else {
            $("#ad2posBlock").hide();
        }
    },
    
    showAccounting: function() {
        var hasAccounting = this.$el.find('#hasAccounting:checked').length > 0;
        if (hasAccounting) {
            $("#accountingBlock1").show();
            $("#accountingBlock2").show();
        }
        else {
            $("#accountingBlock1").hide();
            $("#accountingBlock2").hide();
        }
    },

    showComo: function() {
        var hasComo = this.$el.find('#hasComo:checked').length > 0;
        if (hasComo) {
            $("#comoBlock1").show();
            $("#comoBlock2").show();
        }
        else {
            $("#comoBlock1").hide();
            $("#comoBlock2").hide();
        }
    },

    showAccuposCloudSync: function() {
        var accuposCloudSync = this.$el.find('#accuposCloudSync:checked').length > 0;
        if (accuposCloudSync) {
            $("#cloudBlock").show();
        }
        else {
            $("#cloudBlock").hide();
        }
    },

    showAd2POS: function() {
        var hasAd2POS = this.$el.find('#hasAd2POS:checked').length > 0;
        if (hasAd2POS) {
            $("#ad2posBlock").show();
        }
        else {
            $("#ad2posBlock").hide();
        }
    },

    chooseIntegratorType: function () {
        var integratorType = this.$el.find('#integratorType option:selected').text();
        if (integratorType == "Standard") {
            $("#qbBlock").show();
            $("#qbdesktopBlock").show();
            $("#qboBlock").hide();
            $("#sageLiveBlock").hide();
        }
        else if (integratorType == "Sage Live") {
            $("#sageLiveBlock").show();
            $("#qbBlock").hide();
            $("#qbdesktopBlock").hide();
            $("#qboBlock").hide();
        }
        else if (integratorType == "Quickbooks Online") {
            $("#qbBlock").show();
            $("#qbdesktopBlock").hide();
            $("#qboBlock").show();
            $("#sageLiveBlock").hide();
        }
    },

    getFormValues: function () {
        var exportImportFolder = this.$el.find('#exportImportFolder').val();
        var integratorType = this.$el.find('#integratorType option:selected').text();
        var hasAccounting = this.$el.find('#hasAccounting:checked').length > 0;
        var skipItems = this.$el.find('#skipItems:checked').length > 0;
        var summarizeCash = this.$el.find('#summarizeCash:checked').length > 0;
        var updateItemPrices =  this.$el.find('#updateItemPrices:checked').length > 0;
        var location = this.$el.find('#location').val();
        var accountingMerchantId = this.$el.find('#accountingMerchantId').val();
        var hasComo = this.$el.find('#hasComo:checked').length > 0;
        var creditsOrPoints = this.$el.find('#creditsOrPoints option:selected').text();
        if (creditsOrPoints == "Credits") {
            creditsOrPoints = false;
        }
        else {
            creditsOrPoints = true;
        }
        var useOneConnection = this.$el.find('#useOneConnection:checked').length > 0;
        var accuposCloudSync = this.$el.find('#accuposCloudSync:checked').length > 0;
        var cloudMerchantId = this.$el.find('#cloudMerchantId').val();
        var hasAd2POS = this.$el.find('#hasAd2POS:checked').length > 0;
        var secure = this.$el.find('#secure:checked').length > 0;
        var hasRegional = this.$el.find('#hasRegional:checked').length > 0;
        var updateItemTypesYesNo = this.$el.find('#updateItemTypesYesNo:checked').length > 0;
        var useAutomatedTaxYesNo = this.$el.find('#updateItemTypesYesNo:checked').length > 0;

        this.exportImportFolder = exportImportFolder;
        this.integratorType = integratorType;
        this.hasAccounting = hasAccounting;
        this.skipItems = skipItems;
        this.summarizeCash = summarizeCash;
        this.updateItemPrices = updateItemPrices;
        this.location = location;
        this.accountingMerchantId = accountingMerchantId;
        this.hasComo = hasComo;
        this.creditsOrPoints = creditsOrPoints;
        this.useOneConnection = useOneConnection;
        this.accuposCloudSync = accuposCloudSync;
        this.cloudMerchantId = cloudMerchantId;
        this.hasAd2POS = hasAd2POS;
        this.secure = secure;
        this.hasRegional = hasRegional;
        this.updateItemTypesYesNo = updateItemTypesYesNo;
        this.useAutomatedTaxYesNo = useAutomatedTaxYesNo;

        return ""
    },

    validateForm: function () {
        var valid = true;

        /*var validateEmail = this.$el.find("#email").val();
        var iChars = "<>#%{}|^~[]`\"";
        for (var i = 0; i < validateEmail.length; i++) {
            if (iChars.indexOf(validateEmail.charAt(i)) != -1) {
                this.$el.find("#email").addClass("invalid");
                valid = false;
                break;
            }
        }

        var validateGCId = this.$el.find("#gcId").val();
        var iChars = "`~!@#$%^&*()_+=[]{}:;,<>./?*\\\'\"";
        for (var i = 0; i < validateGCId.length; i++) {
            if (iChars.indexOf(validateGCId.charAt(i)) != -1) {
                this.$el.find("#gcId").addClass("invalid");
                valid = false;
                break;
            }
        }
        
        var validateGroup = this.$el.find("#group").val();
        var iChars = "`~!@#$%^&*()_+=[]{}:;,<>./?*\\\'\"";
        for (var i = 0; i < validateGroup.length; i++) {
            if (iChars.indexOf(validateGroup.charAt(i)) != -1) {
                this.$el.find("#group").addClass("invalid");
                valid = false;
                break;
            }
        }*/

        return valid;
    },

    saveChanges: function () {
        var integrations;
        var that = this;
        var validation = this.validateForm();
        if (validation) {
            var formData = this.getFormValues();
            var sessionToken = this.getCookie();
            $.ajax({
                url: '/data/save-integration-setup',
                data: {
                    integrations: JSON.stringify(formData),
                    exportImportFolder: this.exportImportFolder,
                    integratorType: this.integratorType,
                    hasAccounting: this.hasAccounting,
                    skipItems: this.skipItems,
                    summarizeCash: this.summarizeCash,
                    updateItemPrices: this.updateItemPrices,
                    location: this.location,
                    accountingMerchantId: this.accountingMerchantId,
                    hasComo: this.hasComo,
                    creditsOrPoints: this.creditsOrPoints,
                    useOneConnection: this.useOneConnection,
                    accuposCloudSync: this.accuposCloudSync,
                    cloudMerchantId: this.cloudMerchantId,
                    hasAd2POS: this.hasAd2POS,
                    secure: this.secure,
                    hasRegional: this.hasRegional,
                    updateItemTypesYesNo: this.updateItemTypesYesNo,
                    useAutomatedTaxYesNo: this.useAutomatedTaxYesNo,
                    token: sessionToken
                },
                dataType: 'json',
                type: 'POST',
                
                success: function (data) {
                    var success = false;
                    if (typeof data.results !== 'undefined' && typeof data.results.success !== 'undefined') {
                        success = data.results.success;
                    }

                    M.toast({ html: '{Literal}Settings saved successfully{/Literal}' });
                },

                error: function (e) {
                    if (e.status == 523) {
                        window.location.href = "#/log-in";
                        location.reload();
                    }
                    else {
                        M.toast({ html: '{Literal}There was a problem saving integration settings{/Literal}.' });
                    }
                }
            });
        } else {
            M.toast({html: '{Literal}Some of the required fields are missing or invalid{Literal}'});
        }
    }
});
