var CardSetupView = Backbone.View.extend({
    events: {
        'click .credit-setup-arrow-button': 'creditCards',
        'click .gift-card-arrow-button': 'giftCards',
        'click .save-button': 'saveChanges',
        'click .card-setup-button': 'creditCards',
        'change #ccGateway' : 'chooseCCGateway',
        'change #gcGateway' : 'chooseGCGateway',
        'keyup #email' : 'validateForm',
        'keyup #group' : 'validateForm',
        'keyup #gcId' : 'validateForm',
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
            cardSetup: this.model.toJSON()
        }));
        
        App.breadCrumbToolTip = "Setup and manage credt card and gift card payment";
        
        var that = this;
        $(document).ready(function () {
            that.$el.find(".card-setup-button").trigger("click");
            that.$el.find('select').formSelect();
            App.setBreadcrumbs(that.breadcrumb);
            $('.tooltipped').tooltip({delay: 0});
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

        if (this.model.attributes.gateway == "TSYS") {
            $("#TSYSBlock").show();
        }
        else if (this.model.attributes.gateway == "SHVA" || this.model.attributes.gateway == "SHVA (WS)") {
            $("#SHVABlock").show();
        }

        if (this.model.attributes.giftGateway == "Heartland") {
            $("#HeartlandBlock").show();
        }

        return this;
    },

    getData: function() {
        this.getCardData();
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

    getCardData: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-card-setup',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.cardSetup = data.card_setup;
                that.model.set(data.card_setup);
                that.$el.find('#card-setup-form').show();
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

    creditCards: function () {
        $('.card-setup-button').hide();

        $('#card_setup').show();  
        $('#gift_cards').hide(); 
    },

    giftCards: function () {
        $('#card_setup').hide();  
        $('#gift_cards').show(); 
    },

    chooseCCGateway: function () {
        var ccGateway = this.$el.find('#ccGateway option:selected').text();
        if (ccGateway == "TSYS") {
            $('#TSYSBlock').show();
            $('#SHVABlock').hide();
        }
        else if (ccGateway == "SHVA" || ccGateway == "SHVA (WS)") {
            $('#SHVABlock').show();
            $('#TSYSBlock').hide();
        }
        else {
            $('#SHVABlock').hide();
            $('#TSYSBlock').hide();
        }
    },

    chooseGCGateway: function () {
        var gcGateway = this.$el.find('#gcGateway option:selected').text();
        if (gcGateway == "Heartland") {
            $('#HeartlandBlock').show();
        }
        else {
            $('#HeartlandBlock').hide();
        }
    },

    getFormValues: function () {
        var email = this.$el.find('#email').val();
        var ccGateway = this.$el.find('#ccGateway option:selected').text();

        var ccPassword = this.$el.find('#ccPassword').val();
        if (ccPassword == '') {
            ccPassword = this.model.attributes.merchantPassword;
        }

        var debugLog = this.$el.find('#debugLog:checked').length > 0;
        var processGratuities = this.$el.find('#processGratuities:checked').length > 0;
        var processAuthorizations = this.$el.find('#processAuthorizations:checked').length > 0;
        var gcGateway = this.$el.find('#gcGateway option:selected').text();
        
        var gcPassword = this.$el.find('#gcPassword').val();
        if (gcPassword == '') {
            gcPassword = this.model.attributes.giftCardPassword
        }
        var gcId = this.$el.find('#gcId').val();
        var gcGroup = this.$el.find('#gcGroup').val();
        
        var roomChargeOutlet = this.$el.find('#roomChargeOutlet').val();
        var isOpen247 = this.$el.find('#isOpen247:checked').length > 0;
        var shvaDataPath = this.$el.find('#shvaDataPath').val();
        var heartlandLicenseId = this.$el.find('#heartlandLicenseId').val();
        var heartlandSiteId = this.$el.find('#heartlandSiteId').val();
        var heartlandDeviceId = this.$el.find('#heartlandDeviceId').val();
        var merchantUser = this.$el.find('#merchantUser').val();
        var isShvaUSD = this.$el.find('#isShvaUSD:checked').length > 0;

        var updatedModel = {
            gateway: ccGateway,
            emailAddress: email,
            merchantPassword: ccPassword,
            debugLogging: debugLog,
            processGratuities: processGratuities,
            processPostAuth: processAuthorizations,
            giftGateway: gcGateway,
            giftCardPassword: gcPassword,
            giftCardUserId: gcId,
            giftCardGroup: gcGroup,
            isOpen247: isOpen247,
            roomChargeOutlet: roomChargeOutlet,
            shvaDataPath: shvaDataPath,
            heartlandLicenseId: heartlandLicenseId,
            heartlandSiteId: heartlandSiteId,
            heartlandDeviceId: heartlandDeviceId,
            merchantUser: merchantUser,
            isShvaUSD: isShvaUSD
        };

        return (new CardSetup(updatedModel)).toJSON();
    },

    validateForm: function () {
        var valid = true;

        var validateEmail = this.$el.find("#email").val();
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
        
        var validateGroup = this.$el.find("#gcGroup").val();
        var iChars = "`~!@#$%^&*()_+=[]{}:;,<>./?*\\\'\"";
        for (var i = 0; i < validateGroup.length; i++) {
            if (iChars.indexOf(validateGroup.charAt(i)) != -1) {
                this.$el.find("#gcGroup").addClass("invalid");
                valid = false;
                break;
            }
        }

        return valid;
    },

    saveChanges: function () {
        var cardSetup;
        var that = this;
        var validation = this.validateForm();
        if (validation) {
            var formData = this.getFormValues();
            var sessionToken = this.getCookie();
            $.ajax({
                url: '/data/save-card-setup',
                data: {
                    cardSettings: JSON.stringify(formData),
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
                        M.toast({ html: '{Literal}There was a problem saving card settings{/Literal}.' });
                    }
                }
            });
        } else {
            M.toast({html: '{Literal}Some of the required fields are missing or invalid{Literal}'});
        }
    }
});
