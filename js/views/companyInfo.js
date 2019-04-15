var CompanyInfoView = Backbone.View.extend({
    events: {
        'click .company-info-button': 'registration',
        'click .company-info-arrow-button': 'companyInfo',
        'click .company-info-arrow-button2' : 'creditCard',
        'click .credit-card-arrow-button': 'creditCard',
        'click .credit-card-arrow-button2': 'creditCard',
        'click .registration-arrow-button': 'registration',
        'click .company-info-arrow-right-button': 'companyInfo',
        'click .accounting-integration-arrow-button1': 'accountingIntegration',
        'click .accounting-integration-arrow-button2': 'accountingIntegration',
        'click .save-button': 'saveChanges',
        'keyup #transactionNumber' : 'validateForm',
        'keyup #priceLimit' : 'validateForm',
        'keyup #invoiceNumber' : 'validateForm',
        'keyup #quantityLimit' : 'validateForm',
        'keyup #siteName' : 'validateForm',
        'keyup #classExports' : 'validateForm',
        'click .agreement-button' : 'openAgreement',
        'click #agreeCheckbox' : 'enableSerialNumber'
    },

    data: {},
    breadcrumb: {},

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.breadcrumb = options.breadcrumb;
        this.model = options.model;
        this.hasAccounting = options.hasAccounting;
        this.taxCodes = [];
        this.listenTo(this.model, 'change', this.render);
        this.getData();
    },

    render: function () {    
        this.$el.html(this.template({
            companyInfo: this.model.toJSON(),
            taxCodes: this.taxCodes,
            hasAccounting: this.hasAccounting
        }));

        App.breadCrumbToolTip = "Set POS and Management settings";
        
        App.setBreadcrumbs(this.breadcrumb);

        var that = this;
        $(document).ready(function () {
            $('.tooltipped').tooltip({delay: 0});
            that.$el.find(".company-info-button").trigger("click");
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
        return this;
    },

    getData: function() {
        this.getTaxCodesData();
    },

    getTaxCodesData: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-tax-codes',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.taxCodes = data.results;
                that.getCompanyInfoData();
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem fetching tax codes from the server{/Literal}' });
                }
            }
        });
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

    getCompanyInfoData: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-company-info',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.companyInfo = data;
                
                that.getSystemSettings();
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

    getSystemSettings: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-system-settings',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.companyInfo.countryCode = data.countryCode;
                if (data.businessType == "true") {
                    that.companyInfo.businessType = "RT"
                }
                else {
                    that.companyInfo.businessType = "FS"
                }
                that.companyInfo.countryCode = data.countryCode;
                if (data.reportDirection == "true") {
                    that.companyInfo.reportDirection = "Yes"
                }
                else {
                    that.companyInfo.reportDirection = "No"
                }
                that.model.set(that.companyInfo);

                that.$el.find('#company-info-form').show();
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

    companyInfo: function () {
        $('.company-info-button').hide();

        $('#company_info').show();  
        $('#accounting_integration').hide(); 
        $('#credit_card').hide();
        $('#registration').hide();
    },

    accountingIntegration: function () {
        $('#company_info').hide();  
        $('#accounting_integration').show(); 
        $('#credit_card').hide();
        $('#registration').hide();
    },

    creditCard: function (){
        $('#company_info').hide();  
        $('#accounting_integration').hide(); 
        $('#credit_card').show();
        $('#registration').hide();
    },

    registration: function () {
        $('#company_info').hide();  
        $('#accounting_integration').hide(); 
        $('#credit_card').hide();
        $('#registration').show();
    },

    openAgreement: function () {
        var full = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '');
        window.open(full + "/license_files/license.html");
        $("#agreeCheckbox").removeAttr('disabled');
    },

    enableSerialNumber: function () {
        if (!$("#agreeCheckbox").hasClass('disabled')) {
            $("#serialNumber").removeAttr('disabled');
        }
    },

    getFormValues: function () {
        var transactionNumber = this.$el.find('#transactionNumber').val();
        var priceLimit = this.$el.find('#priceLimit').val();
        var dayStart = this.$el.find('#day-start-form-dropdown').val();
        var invoiceNumber = this.$el.find('#invoiceNumber').val();
        var quantityLimit = this.$el.find('#quantityLimit').val();
        var defaultTax = this.$el.find('#default-tax-form-dropdown option:selected').text();

        var tenderSummaryAccount = this.$el.find('#tenderSummaryAccount').val();
        var siteName = this.$el.find('#siteName').val();
        var sendTips = this.$el.find('.sendTips:checked').length > 0;
        var classExports = this.$el.find('#classExports').val();
        
        var creditSlip = this.$el.find('#credit-slip-dropdown option:selected').text();
        var gratHandling = this.$el.find('.gratHandling:checked').length > 0;
        var autoGrat = this.$el.find('#autoGrat').val();
        var defaultPrice = this.$el.find('#default-price-form-dropdown option:selected').text();
        var alwaysInclude = this.$el.find('.alwaysInclude:checked').length > 0;

        var serialNumber = this.$el.find('#serialNumber').val();
        var countryCode = this.$el.find('#countryCode option:selected').text();
        var businessType = this.$el.find('#businessType option:selected').text();
        var reportDirection = this.$el.find('#reportDirection').val();

        if (reportDirection == "0") {
            reportDirection = true;
        }
        else {
            reportDirection = false;
        }

        if (this.hasAccounting && App.israCardBuild) {
            var updatedModel = {
                company_info: {
                    transactionNumber: transactionNumber,
                    priceLimit: priceLimit,
                    dayStart: dayStart,
                    invoiceNumber: invoiceNumber,
                    quantity: quantityLimit,
                    taxCode: defaultTax
                },
                accounting_integration: {
                    tenderSummary: tenderSummaryAccount,
                    siteName: siteName,
                    sendTips: sendTips,
                    classSales: classExports
                },
                credit_card: {
                    slipLimit: creditSlip,
                    gratuityHandling: gratHandling,
                    gratutityInclusion: autoGrat,
                    defaultPrice: defaultPrice,
                    alwaysInclude: alwaysInclude
                },
                serialNumber: serialNumber,
                countryCode: "IL",
                businessType: "RT",
                reportDirection: true
            };
        }
        else if (this.hasAccounting && !App.israCardBuild) {
            var updatedModel = {
                company_info: {
                    transactionNumber: transactionNumber,
                    priceLimit: priceLimit,
                    dayStart: dayStart,
                    invoiceNumber: invoiceNumber,
                    quantity: quantityLimit,
                    taxCode: defaultTax
                },
                accounting_integration: {
                    tenderSummary: tenderSummaryAccount,
                    siteName: siteName,
                    sendTips: sendTips,
                    classSales: classExports
                },
                credit_card: {
                    slipLimit: creditSlip,
                    gratuityHandling: gratHandling,
                    gratutityInclusion: autoGrat,
                    defaultPrice: defaultPrice,
                    alwaysInclude: alwaysInclude
                },
                serialNumber: serialNumber,
                countryCode: countryCode,
                businessType: businessType,
                reportDirection: reportDirection
            };
        }
        else if (!this.hasAccounting && !App.israCardBuild) {
            var updatedModel = {
                company_info: {
                    transactionNumber: transactionNumber,
                    priceLimit: priceLimit,
                    dayStart: dayStart,
                    invoiceNumber: invoiceNumber,
                    quantity: quantityLimit,
                    taxCode: defaultTax
                },
                accounting_integration: {
                    tenderSummary: null,
                    siteName: null,
                    sendTips: null,
                    classSales: null
                },
                credit_card: {
                    slipLimit: creditSlip,
                    gratuityHandling: gratHandling,
                    gratutityInclusion: autoGrat,
                    defaultPrice: defaultPrice,
                    alwaysInclude: alwaysInclude
                },
                serialNumber: serialNumber,
                countryCode: countryCode,
                businessType: businessType,
                reportDirection: reportDirection
            };
        }
        else if (!this.hasAccounting && App.israCardBuild) {
            var updatedModel = {
                company_info: {
                    transactionNumber: transactionNumber,
                    priceLimit: priceLimit,
                    dayStart: dayStart,
                    invoiceNumber: invoiceNumber,
                    quantity: quantityLimit,
                    taxCode: defaultTax
                },
                accounting_integration: {
                    tenderSummary: null,
                    siteName: null,
                    sendTips: null,
                    classSales: null
                },
                credit_card: {
                    slipLimit: creditSlip,
                    gratuityHandling: gratHandling,
                    gratutityInclusion: autoGrat,
                    defaultPrice: defaultPrice,
                    alwaysInclude: alwaysInclude
                },
                serialNumber: serialNumber,
                countryCode: "IL",
                businessType: "RT",
                reportDirection: true
            };
        }

        return (new CompanyInfo(updatedModel)).toJSON();
    },

    validateForm: function () {
        var valid = true;
        
        var validateTransactionNumber = this.$el.find("#transactionNumber").val();
        if (validateTransactionNumber.trim().length < 1 || validateTransactionNumber < 1 || validateTransactionNumber > 999999999 || validateTransactionNumber.indexOf("-") > -1 || validateTransactionNumber.indexOf('e') > -1) {
            this.$el.find("#transactionNumber").addClass("invalid");
            valid = false;
        }
        
        var validatePriceLimit = this.$el.find("#priceLimit").val();
        if (validatePriceLimit.trim().length < 1 || validatePriceLimit < 1 || validatePriceLimit > 99999 || validatePriceLimit.indexOf("-") > -1 || validatePriceLimit.indexOf('e') > -1) {
            this.$el.find("#priceLimit").addClass("invalid");
            valid = false;
        }
        
        var validateInvoiceNumber = this.$el.find("#invoiceNumber").val();
        if (validateInvoiceNumber.trim().length < 1 || validateInvoiceNumber < 1 || validateInvoiceNumber > 999999999 || validateInvoiceNumber.indexOf("-") > -1 || validateInvoiceNumber.indexOf('e') > -1) {
            this.$el.find("#invoiceNumber").addClass("invalid");
            valid = false;
        }
        
        var validateQuantityLimit = this.$el.find("#quantityLimit").val();
        if (validateQuantityLimit.trim().length < 1 || validateQuantityLimit < 1 || validateQuantityLimit > 99999 || validateQuantityLimit.indexOf("-") > -1 || validateQuantityLimit.indexOf('e') > -1) {
            this.$el.find("#quantityLimit").addClass("invalid");
            valid = false;
        }

        var validateAutoGrat = this.$el.find("#autoGrat").val();
        if (validateAutoGrat < 0 || validateAutoGrat > 99999 || validateAutoGrat.indexOf("-") > -1 || validateAutoGrat.indexOf('e') > -1) {
            this.$el.find("#autoGrat").addClass("invalid");
            valid = false;
        }

        var validateSiteName = this.$el.find("#siteName").val();
        var iChars = "<>#%{}|^~[]`\"";
        for (var i = 0; i < validateSiteName.length; i++) {
            if (iChars.indexOf(validateSiteName.charAt(i)) != -1) {
                this.$el.find("#siteName").addClass("invalid");
                valid = false;
                break;
            }
        }
      
        var validateTenderSummary = this.$el.find("#tenderSummaryAccount").val();
        var iChars = "`~!@#$%^&*()_+=[]{}:;,<>./?*\\\'\"";
        for (var i = 0; i < validateTenderSummary.length; i++) {
            if (iChars.indexOf(validateTenderSummary.charAt(i)) != -1) {
                this.$el.find("#tenderSummaryAccount").addClass("invalid");
                valid = false;
                break;
            }
        }
        
        var validateClassExports = this.$el.find("#classExports").val();
        var iChars = "`~!@#$%^&*()_+=[]{}:;,<>./?*\\\'\"";
        for (var i = 0; i < validateClassExports.length; i++) {
            if (iChars.indexOf(validateClassExports.charAt(i)) != -1) {
                this.$el.find("#classExports").addClass("invalid");
                valid = false;
                break;
            }
        }

        var validateSerialNumber = this.$el.find("#serialNumber").val();

        if (validateSerialNumber.trim().length < 1) {
            this.$el.find("#serialNumber").addClass("invalid");
            valid = false;
        }
        else {
            var iChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ`~!@#$%^&*()_+=[]{}:;,<>./?*\\\'\"";
            for (var i = 0; i < validateSerialNumber.length; i++) {
                if (iChars.indexOf(validateSerialNumber.charAt(i)) != -1) {
                    this.$el.find("#serialNumber").addClass("invalid");
                    valid = false;
                    break;
                }
            }
        }
        return valid;
    },

    saveChanges: function () {
        var companyInfo;
        var that = this;
        var validation = this.validateForm();
        if (validation) {
            var formData = this.getFormValues();
            this.saveSystemSettings(formData);
            var sessionToken = this.getCookie();
            $.ajax({
                url: '/data/save-company-info',
                data: {
                    companyInfo: JSON.stringify(formData),
                    token: sessionToken
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

                    M.toast({ html: '{Literal}Settings saved successfully{/Literal}' });
                },

                error: function (e) {
                    if (e.status == 523) {
                        window.location.href = "#/log-in";
                        location.reload();
                    }
                    else {
                        M.toast({ html: '{Literal}There was a problem saving company information settings{/Literal}.' });
                    }
                }
            });
        } else {
            M.toast({html: '{Literal}Some of the required fields are missing or invalid{Literal}'});
        }
    },

    saveSystemSettings: function (formData) {
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/save-system-settings',
            data: {
                countryCode: formData.countryCode,
                businessType: formData.businessType,
                reportDirection: formData.reportDirection,
                token: sessionToken
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
                    M.toast({ html: '{Literal}There was a problem saving company information settings{/Literal}.' });
                }
            }
        });
    }
});
