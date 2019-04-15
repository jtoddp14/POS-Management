var ReceiptSettingsView = Backbone.View.extend({
    events: {
        'click .receipt-info-button': 'receiptInfo',
        'click .receipt-info-arrow-button': 'receiptInfo',
        'click .email-receipts-arrow-button1': 'emailReceipts',
        'click .email-receipts-arrow-button2': 'emailReceipts',
        'click .customer-arrow-button': 'customerInfo',
        'click .receipt-info-arrow-button2' : 'receiptInfo2',
        'click .receipt-info-customer-arrow-button' : 'receiptInfo2',
        'click .receipt-info-email-arrow-button' : 'emailReceipts',
        'click .save-button': 'saveChanges',
        'change #offerEmail': 'toggleOfferEmailReceipt',
        'keyup #companyName' : 'validateForm',
        'keyup #city' : 'validateForm',
        'keyup #address1' : 'validateForm',
        'keyup #address2' : 'validateForm',
        'keyup #city' : 'validateForm',
        'keyup #zip' : 'validateForm',
        'keyup #telephone' : 'validateForm',
        'keyup #email' : 'validateForm',
        'keyup #savingMessage' : 'validateForm'
    },

    breadcrumb: {},

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.breadcrumb = options.breadcrumb;
        this.model = options.model;
        this.listenTo(this.model, 'change', this.render);
        this.getReceiptSettings();
    },

    render: function () {
        var that = this;
        this.$el.html(this.template({
            receiptSettings: this.model.toJSON()
        }));
        App.breadCrumbToolTip = "Choose information that will appear on physical or emailed receipts"; 
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
        var that = this;
        $(document).ready(function () {
            that.$el.find(".receipt-info-button").trigger("click");
            that.$el.find('select').formSelect();
            that.$el.find('input[type="text"],input[type="number"],input[type="email"],input[type="password"],textarea').each(function () {
                var element = $(this);
                var value = $(element).val();
                if (value !== '') {
                    $(element).siblings('label').addClass('active');
                }
            });
            M.textareaAutoResize(that.$el.find('#invoiceMessage'));
            M.textareaAutoResize(that.$el.find('#savingMessage'));
            that.toggleOfferEmailReceipt();
        });
        $('.tooltipped').tooltip();
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

    getReceiptSettings: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-receipt-settings',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.model.set(data);
                that.$el.find('#receipt-settings-wrapper').show();
            },

            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    App.showToast('{Literal}There was a problem fetching receipt settings{/Literal}');
                }
            }
        });
    },

    toggleOfferEmailReceipt: function () {
        var offerEmail = this.$el.find('#offerEmail:checked').length > 0;
        if (offerEmail) {
            this.$el.find('.offer-email-receipt').show();
        } else {
            this.$el.find('.offer-email-receipt').hide();
        }
    },

    receiptInfo: function () {
        $('.receipt-info-button').hide();

        $('#receipt_info').show();  
        $('#email_receipts').hide(); 
        $('#customer_info').hide();

        $('.email-receipts-arrow-button2').show();
        $('.receipt-info-arrow-button').hide();
        $('.customer-arrow-button').hide(); 
    },

    emailReceipts: function (){
        $('#receipt_info').hide();  
        $('#email_receipts').show(); 
        $('#customer_info').hide();

        $('.email-receipts-arrow-button2').hide();
        $('.email-receipts-arrow-button1').hide();
        $('.receipt-info-arrow-button').hide();
        $('.receipt-info-arrow-button2').hide();
        $('.customer-arrow-button').show();
    },

    customerInfo: function (){
        $('#receipt_info').hide();  
        $('#email_receipts').hide(); 
        $('#customer_info').show();
        
        $('.email-receipts-arrow-button1').hide();
        $('.receipt-info-arrow-button2').show();
        $('.receipt-info-arrow-button').hide();
        $('.customer-arrow-button').hide();
    },

    receiptInfo2: function () {
        $('.receipt-info-button').hide();

        $('#receipt_info').show();  
        $('#email_receipts').hide(); 
        $('#customer_info').hide();

        $('.email-receipts-arrow-button2').show();
        $('.receipt-info-arrow-button').hide();
        $('.customer-arrow-button').hide(); 
        $('.receipt-info-arrow-button2').hide();
    },

    getFormValues: function () {
        var companyName = this.$el.find('#companyName').val();
        var city = this.$el.find('#city').val();
        var email = this.$el.find('#email').val();
        var address1 = this.$el.find('#address1').val();
        var stateOrProvince = this.$el.find('#state').val();
        var zip = this.$el.find('#zip').val();
        var invoiceMessage = this.$el.find('#invoiceMessage').val();
        var savingMessage = this.$el.find('#savingMessage').val();
        var address2 = this.$el.find('#address2').val();
        var telephone = this.$el.find('#telephone').val();
        var fax = this.$el.find('#fax').val();
        var dateTimeFormat = this.$el.find('#datetimeformat').val();
        var offerEmail = this.$el.find('#offerEmail:checked').length > 0;

        var emailServer = this.$el.find('#emailServer').val();
        var emailAccount = this.$el.find('#emailAccount').val();
        var emailPort = this.$el.find('#emailPort').val();
        var emailPassword = this.$el.find('#emailPassword').val();
        if (emailPassword == "") {
            emailPassword = this.model.attributes.email_receipts.emailPassword;
        }   
        var emailSubject = this.$el.find('#emailSubject').val();

        var customerName = this.$el.find('#customerName:checked').length > 0;
        var customerContact = this.$el.find('#customerContact:checked').length > 0;
        var customerPhone = this.$el.find('#customerPhone:checked').length > 0;
        var customerCompName = this.$el.find('#customerCompName:checked').length > 0;
        var alwaycustomerAddresssGrat = this.$el.find('#customerAddress:checked').length > 0;
        var printItemDescriptionAndSku = this.$el.find('#printItemDescriptionAndSku:checked').length > 0;

        var updatedModel = {
            receipt_info: {
                name: companyName,
                city: city,
                emailOrWebsite: email,
                addressLine1: address1,
                state: stateOrProvince,
                zip: zip,
                invoiceMessage: invoiceMessage,
                savingMessage: savingMessage,
                addressLine2: address2,
                telephone: telephone,
                faxNumber: fax,
                dateTimeFormat: dateTimeFormat,
                printItemDescriptionAndSku: printItemDescriptionAndSku
            },
            email_receipts: {
                offerEmail: offerEmail,
                emailServer: emailServer,
                emailAccount: emailAccount,
                emailPort: emailPort,
                emailPassword: emailPassword,
                emailSubject: emailSubject,
            },
            customer_info: {
                customerName: customerName,
                customerContact: customerContact,
                customerPhone: customerPhone,
                customerCompanyName: customerCompName,
                customerAddress: alwaycustomerAddresssGrat,
            }
        };
        return updatedModel;
        
    },

    validateForm: function () {
        var valid = true;
        var validateCompanyName = this.$el.find("#companyName").val();
        if (validateCompanyName.trim().length < 1) {
            this.$el.find("#companyName").addClass("invalid");
            valid = false;
        }
        else {
            var iChars = "`~@$%^*()_+=[]{}:;,<>./?*\\\'\"";
            for (var i = 0; i < validateCompanyName.length; i++) {
                if (iChars.indexOf(validateCompanyName.charAt(i)) != -1) {
                    this.$el.find("#companyName").addClass("invalid");
                    valid = false;
                    break;
                }
            }
        }

        var validateCity = this.$el.find("#city").val();
        var iChars = "`~!@#$%^&*()_+=[]{}:;,<>./?*\\\'\"";
        for (var i = 0; i < validateCity.length; i++) {
            if (iChars.indexOf(validateCity.charAt(i)) != -1) {
                this.$el.find("#city").addClass("invalid");
                valid = false;
                break;
            }
        }
        

        var validateAddress1 = this.$el.find("#address1").val();
        if (validateAddress1.trim().length < 1) {
            this.$el.find("#address1").addClass("invalid");
            valid = false;
        }
        else {
            var iChars = "`~!@#$%^&*()_+=[]{}:;,<>/?*\\\'\"";
            for (var i = 0; i < validateAddress1.length; i++) {
                if (iChars.indexOf(validateAddress1.charAt(i)) != -1) {
                    this.$el.find("#address1").addClass("invalid");
                    valid = false;
                    break;
                }
            }
        }

        
        var validateAddress2 = this.$el.find("#address2").val();
        var iChars = "`~!@#$%^&*()_+=[]{}:;,<>/?*\\\'\"";
        for (var i = 0; i < validateAddress2.length; i++) {
            if (iChars.indexOf(validateAddress2.charAt(i)) != -1) {
                this.$el.find("#address2").addClass("invalid");
                valid = false;
                break;
            }
        }

        var validateState = this.$el.find("#state").val();
        var iChars = "`~!@#$%^&*()_+=[]{}:;,<>./?*\\\'\"";
        for (var i = 0; i < validateState.length; i++) {
            if (iChars.indexOf(validateState.charAt(i)) != -1) {
                this.$el.find("#state").addClass("invalid");
                valid = false;
                break;
            }
        }

        var validateZip = this.$el.find("#zip").val();
        if (validateZip.indexOf("-") > -1 || validateZip.indexOf('e') > -1) {
            this.$el.find("#zip").addClass("invalid");
            valid = false;
        }

        var validateTelephone = this.$el.find("#telephone").val();
        if (validateTelephone.trim().length < 1) {
            this.$el.find("#telephone").addClass("invalid");
            valid = false;
        }
        else {
            var iChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ`~!@#$%^&*_+=[]{}:;,<>./?*\\\'\"";
            for (var i = 0; i < validateTelephone.length; i++) {
                if (iChars.indexOf(validateTelephone.charAt(i)) != -1) {
                    this.$el.find("#telephone").addClass("invalid");
                    valid = false;
                    break;
                }
            }
        }

        return valid;
    },

    saveChanges: function (){
        var sessionToken = this.getCookie();
        var receiptSettings;
        var that = this;
        var validation = this.validateForm();
        
        if (validation) {
            var formValues = this.getFormValues();
            $.ajax({
                url: '/data/save-receipt-settings',
                data: {
                    token: sessionToken,
                    receiptSettings: JSON.stringify(formValues),
                },
                crossDomain: true,
                dataType: 'json',
                type: 'POST',
                success: function (data) {
                    var success = false;
                    if (typeof data.results !== 'undefined' && typeof data.results.success !== 'undefined') {
                        success = data.results.success;
                    }
                    App.showToast('{Literal}Settings saved successfully{/Literal}');
                },
                error: function (e) {
                    if (e.status == 523) {
                        window.location.href = "#/log-in";
                        location.reload();
                    }
                    else {
                        App.showToast('{Literal}There was a problem saving receipt settings{/Literal}');
                    }
                }
            });
        }
        else {
            App.showToast('{Literal}Some of the required fields are missing or invalid{/Literal}');
        }
    }
});