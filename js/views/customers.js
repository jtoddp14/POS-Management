var CustomersView = Backbone.View.extend({
    fullCollection: {},
    formModal: null,
    deletionModal: {},
    itemFullCollection: {},
    hasAccess: false,
    shownItems: [],
    customerRows: 3,
    customerColumns: 4,
    currentPageIndex: null,
    selectedPageIndex: 1,
    pages: 0,

    events: {
        'click .card-panel-entity': 'highlightCard',
        'click .edit-customers-trigger': 'editCustomers',
        'click #add-customers-button': 'addCustomers',
        'click .save-button': 'saveCustomers',
        'click .company-info-arrow-button2': 'companyInfo',
        'click .customer-info-button': 'customerInfo',
        'click .customer-advanced-details': 'companyInfo',
        'click .notes-arrow-button': 'customerNotes',
        'click .search-customers-button': 'searchCustomers',
        'click .pagination-trigger': 'handlePageClickEvent',
        'click #pagination-back': 'handlePageBackEvent',
        'click #pagination-forward': 'handlePageForwardEvent',
        'keyup #id' : 'validateForm',
        'keyup #first' : 'validateForm',
        'keyup #middle' : 'validateForm',
        'keyup #last' : 'validateForm',
        'keyup #phone' : 'validateForm',
        'keyup #address1' : 'validateForm',
        'keyup #address2' : 'validateForm',
        'keyup #city' : 'validateForm',
        'keyup #state' : 'validateForm',
        'keyup #zip' : 'validateForm',
        'keyup #companyName' : 'validateForm',
        'keyup #fax' : 'validateForm',
        'keyup #creditLimit' : 'validateForm',
        'keyup #discount' : 'validateForm',
        'keyup #balance' : 'validateForm',
        'keyup #notes' : 'validateForm',
        'keyup #searchText': 'enterToSearch'

    },

    breadcrumb: {},

    styles: [
        'ap-blue'
    ],

    customersStyleMapping: {},

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.customersFormTemplate = options.customersFormTemplate;
        this.breadcrumb = options.breadcrumb;
        this.collection = options.collection;
        this.israCardBuild = options.israCardBuild;
        this.listenTo(this.collection, 'reset', this.render);
        this.listenTo(this.collection, 'remove', this.render);
        this.listenTo(this.collection, 'add', this.render);
        this.model = options.model;
        this.initTaxCodes();
        this.initializePaginator();
        
    },

    render: function () {
        var that = this;
        
        this.$el.html(this.template({
            customers: that.collection.toJSON(),
        }));
        this.formModal = this.$el.find('#customers-form-modal').modal();

        $(document).ready(function(){
            $('.tooltipped').tooltip({delay: 0});
            $('.modal').modal(); 
            $('select').formSelect();      
            document.getElementById("searchText").focus();
        });

        App.breadCrumbToolTip = "Create, manage, and edit your customers";

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

        $('.tooltipped').tooltip();
        return this;
    },

    checkAccess: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/check-access',
            data: {
                accessName: (App.IDS_MODIFY_CUSTOMERS),
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

    searchCustomers: function () {
        var that = this;
        var searchText = this.$el.find('#searchText').val();
        var searchField = this.$el.find('#searchField').val();
        if (searchText == '') {
            this.collection.reset(this.fullCollection.models);
            M.toast({ html: '{Literal}Showing all customers{/Literal}...' });
            var delayInMilliseconds = 100; 
            setTimeout(function() {
                that.collection.reset(that.fullCollection.models);
                that.getCustomerTotalCount();
                that.cards = false;
                $("#customer-pagination").remove();
                $('#customerBlock').show();
            }, delayInMilliseconds);
        }

        else if (searchField == 1) {
            var filtered = this.fullCollection.byCustomerId(searchText);
            if (filtered.models.length > 0) {
                this.collection.reset(filtered.models);
                $("#searchField option[value=" + searchField + "]").attr('selected', '');

                this.shownCustomers = [];
                
                if (that.collection.length > 12) {
                    for (var i=0; i < 12; i++) {
                        this.shownCustomers.push(that.collection.models[i].attributes);
                    }
                    
                    that.renderPaginationChange(this.shownCustomers, { parentView: this });
                    that.renderPaginator(that.collection.length);
                }
                else {
                    that.getCustomerTotalCount();
                    that.cards = false;
                    $("#customer-pagination").remove();
                    $('#customerBlock').show();
                }
                $("select").formSelect();

                $('#customerBlock').show();
                $('#paginationBlock').show();
            }
            else {
                M.toast({ html: '{Literal}No search results found{/Literal}' }); 
                $("select").formSelect();
            }
        }
        else if (searchField == 2) {
            var filtered = this.fullCollection.byCustomerName(searchText);
            if (filtered.models.length > 0) {
                this.collection.reset(filtered.models);
                $("#searchField option[value=" + searchField + "]").attr('selected', '');

                this.shownCustomers = [];

                if (that.collection.length > 12) {
                    for (var i=0; i < 12; i++) {
                        this.shownCustomers.push(that.collection.models[i].attributes);
                    }
                    
                    that.renderPaginationChange(this.shownCustomers, { parentView: this });
                    that.renderPaginator(that.collection.length);
                }
                else {
                    that.getCustomerTotalCount();
                    that.cards = false;
                    $("#customer-pagination").remove();
                    $('#customerBlock').show();
                }
                $("select").formSelect();

                $('#customerBlock').show();
                $('#paginationBlock').show();
            }
            else {
                M.toast({ html: '{Literal}No search results found{/Literal}' }); 
                $("select").formSelect();
            }
        }
        else if (searchField == 3) {
            var filtered = this.fullCollection.byCustomerPhone(searchText);
            if (filtered.models.length > 0) {
                this.collection.reset(filtered.models);
                $("#searchField option[value=" + searchField + "]").attr('selected', '');

                this.shownCustomers = [];

                if (that.collection.length > 12) {
                    for (var i=0; i < 12; i++) {
                        this.shownCustomers.push(that.collection.models[i].attributes);
                    }
                    
                    that.renderPaginationChange(this.shownCustomers, { parentView: this });
                    that.renderPaginator(that.collection.length);
                }
                else {
                    that.getCustomerTotalCount();
                    that.cards = false;
                    $("#customer-pagination").remove();
                    $('#customerBlock').show();
                }
                $("select").formSelect();

                $('#customerBlock').show();
                $('#paginationBlock').show();
            }
            else {
                M.toast({ html: '{Literal}No search results found{/Literal}' }); 
                $("select").formSelect();
            }
        }
        else if (searchField == 4) {
            var filtered = this.fullCollection.byCustomerEmail(searchText);
            if (filtered.models.length > 0) {
                this.collection.reset(filtered.models);
                $("#searchField option[value=" + searchField + "]").attr('selected', '');

                this.shownCustomers = [];

                if (that.collection.length > 12) {
                    for (var i=0; i < 12; i++) {
                        this.shownCustomers.push(that.collection.models[i].attributes);
                    }
                    
                    that.renderPaginationChange(this.shownCustomers, { parentView: this });
                    that.renderPaginator(that.collection.length);
                }
                else {
                    that.getCustomerTotalCount();
                    that.cards = false;
                    $("#customer-pagination").remove();
                    $('#customerBlock').show();
                }
                $("select").formSelect();

                $('#customerBlock').show();
                $('#paginationBlock').show();
            }
            else {
                M.toast({ html: '{Literal}No search results found{/Literal}' }); 
                $("select").formSelect();
            }
        }
    },

    enterToSearch: function (e) {
        if (e.keyCode == 13) {
            this.$el.find(".search-customers-button").trigger("click");
        }
    }, 

    customerInfo: function () {
        $('#customer_info').show();  
        $('#company_info').hide(); 
        $('#customer_notes').hide();
    },

    companyInfo: function (){
        $('#customer_info').hide();  
        $('#company_info').show(); 
        $('#customer_notes').hide();
    },

    customerNotes: function (){
        $('#customer_info').hide();  
        $('#company_info').hide(); 
        $('#customer_notes').show();
    },

    initTaxCodes: function () {
        this.getTaxCodes();
    },

    getTaxCodes: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-vat-codes',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.taxCodes = data.results;
                that.renderTaxCodes(data.results);
                
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

    
    renderTaxCodes: function (data) {
        var that = this;
        for (var i = 0; i < data.length; i++) {
            var currentTaxCodeData = data[i];
        }
        this.getItemDiscount();
    },

    editCustomers: function (e) {
        if (this.hasAccess) {
            this.formModal = this.$el.find('#customers-form-modal').modal();
            var element = $(e.currentTarget);
            var id = $(element).attr('data-id');
            if (this.collection._byId[id].attributes.id !== null && this.collection._byId[id].attributes.id !== '') {
                this.customersFormView = new CustomersFormView({
                    template: this.customersFormTemplate,
                    model: this.collection._byId[id],
                    taxCodes: this.taxCodes,
                    customerDiscounts: this.customerDiscounts,
                    israCardBuild: this.israCardBuild
                });

                this.$el.find('#customers-form-modal').html(this.customersFormView.render().el);
                this.$el.find('select').formSelect();
                this.formModal.modal('open');
                
                M.textareaAutoResize($('#notes'));
            }
            else {
                M.toast({ html: '{Literal}There was a problem fetching data from the server{/Literal}' });
            }
        }
        else {
            M.toast({ html: '{Literal}You do not have access to edit customers{/Literal}' });
        }
    },

    addCustomers: function () {
        if (this.hasAccess) {
            this.formModal = this.$el.find('#customers-form-modal').modal();
            this.isCreateMode = true;
            var customers = new Customers();
            this.customersFormView = new CustomersFormView({
                template: this.customersFormTemplate,
                model: customers,
                taxCodes: this.taxCodes,
                customerDiscounts: this.customerDiscounts,
                israCardBuild: this.israCardBuild
            });
    
            this.$el.find('#customers-form-modal').html(this.customersFormView.render().el);
            this.$el.find('select').formSelect();
            this.$el.find("select[required]").css({
                display: "block", 
                position: 'absolute',
                visibility: 'hidden'
            });  
            this.formModal.modal('open');
    
            $('#id').prop('disabled', false);
        }
        else {
            M.toast({ html: '{Literal}You do not have access to edit customers{/Literal}' });
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

    initCustomers: function () {
        this.getCustomers();
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

    getCustomers: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-customers',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.checkAccess();
                that.generateCustomersStyleMapping(data.results);
                that.renderCustomers(data.results);
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem getting customers{/Literal}.' });
                }
            }
        });
    },

    renderCustomers: function (data) {
        var that = this;

        data.sort(function (a, b) {
            return a.last.toLowerCase() < b.last.toLowerCase() ? -1 : (a.last.toLowerCase() > b.last.toLowerCase() ? 1 : 0);
        });
        var collection = new CustomersCollection();
        for (var i = 0; i < data.length; i++) {
            var currentCustomers = data[i];
            currentCustomers.cardStyleClass = that.customersStyleMapping[data[i].id];
            collection.add(new Customers(currentCustomers));
        }
        that.fullCollection = collection;
        that.collection.reset(collection.models);
    },

    generateCustomersStyleMapping: function (data) {
        var customers = [];
        var totalStyles = this.styles.length;
        var currentStyle = 0;
        for (var i = 0; i < data.length; i++) {
            if (customers.indexOf(data[i].id) < 0) {
                customers.push(data[i].id);
                this.customersStyleMapping[data[i].id] = this.styles[currentStyle];
                if (currentStyle < totalStyles - 1) {
                    currentStyle++;
                } else {
                    currentStyle = 0;
                }
            }
        }
    },

    getFormValues: function () {
        var id = this.$el.find('#id').val();
        var first = this.$el.find('#first').val();
        if (this.israCardBuild) {
            var middle = null;
        }
        else {
            var middle = this.$el.find('#middle').val();
        }
        var last = this.$el.find('#last').val();
        var phone = this.$el.find('#phone').val();
        var email = this.$el.find('#email').val();
        var address1 = this.$el.find('#address1').val();
        var address2 = this.$el.find('#address2').val();
        var city = this.$el.find('#city').val();
        var state = this.$el.find('#state').val();
        var zip = this.$el.find('#zip').val();
        var companyName = this.$el.find('#companyName').val();
        var fax = this.$el.find('#fax').val();
        var taxable = this.$el.find('.taxable:checked').length > 0
        var creditLimit = this.$el.find('#creditLimit').val();
        var discount = this.$el.find('#discount').val();
        var taxCode = this.$el.find('#tax-form-dropdown option:selected').text();
        var balance = this.$el.find('#balance').val();
        var priceLevel = this.$el.find('#price-level-dropdown option:selected').text();
        var discountItemId = this.$el.find('#discountItemId').val();
        var dueDays = this.$el.find('#dueDays').val();
        var discountDays = this.$el.find('#discountDays').val();
        var uploaded = this.$el.find('#uploaded:checked').length > 0
        var notes = this.$el.find('#notes').val();

        var updatedModel = {
            id: id,
            first: first,
            middle: middle,
            last: last,
            phone: phone,
            email: email,
            address1: address1,
            address2: address2,
            city: city,
            state: state,
            zip: zip,
            companyName: companyName,
            fax: fax,
            taxable: taxable,
            creditLimit: creditLimit,
            discount: discount,
            taxCode: taxCode,
            balance: balance,
            priceLevel: priceLevel,
            notes: notes,
            discountItemId: discountItemId,
            dueDays: dueDays,
            discountDays: discountDays,
            uploaded: uploaded
        };
        this.customersFormView.model.set(updatedModel);
    },

    validateForm: function () {
        var valid = true;
        var validateCustomerName = this.$el.find("#first").val();
        if (validateCustomerName.trim().length < 1) {
            this.$el.find("#first").addClass("invalid");
            valid = false;
        }
        var iChars = "`~!@#$%^&*()_+=[]{}:;,<>./?*\\\'\"";
        var validateCustomerMiddleName = this.$el.find("#middle").val();
        var validateCustomerLastName = this.$el.find("#last").val();
        for (var i = 0; i < validateCustomerName.length; i++) {
            if (iChars.indexOf(validateCustomerName.charAt(i)) != -1) {
                this.$el.find("#first").addClass("invalid");
                valid = false;
                break;
            }
        }

        for (var i = 0; i < validateCustomerMiddleName.length; i++) {
            if (iChars.indexOf(validateCustomerMiddleName.charAt(i)) != -1) {
                this.$el.find("#middle").addClass("invalid");
                valid = false;
                break;
            }
        }

        for (var i = 0; i < validateCustomerLastName.length; i++) {
            if (iChars.indexOf(validateCustomerLastName.charAt(i)) != -1) {
                this.$el.find("#last").addClass("invalid");
                valid = false;
                break;
            }
        }
        
        var validateCustomerId = this.$el.find("#id").val();
        if (validateCustomerId.trim().length < 1) {
            this.$el.find("#id").addClass("invalid");
            valid = false;
        }
        else {
            var iChars = "`~!@#$%^&*()_+=[]{}:;,<>./?*\\\'\"";
            for (var i = 0; i < validateCustomerId.length; i++) {
                if (iChars.indexOf(validateCustomerId.charAt(i)) != -1) {
                    this.$el.find("#id").addClass("invalid");
                    valid = false;
                    break;
                }
            }
        }

        var validateTelephone = this.$el.find("#phone").val();
        var iChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ`~!@#$%^&*()_+=[]{}:;,<>./?*\\\'\"";
        for (var i = 0; i < validateTelephone.length; i++) {
            if (iChars.indexOf(validateTelephone.charAt(i)) != -1) {
                this.$el.find("#phone").addClass("invalid");
                valid = false;
                break;
            }
        }

        var validateAddress1 = this.$el.find("#address1").val();
        iChars = "`~!@#$%^&*()_+=[]{}:;,<>/?*\\\'\"";
        for (var i = 0; i < validateAddress1.length; i++) {
            if (iChars.indexOf(validateAddress1.charAt(i)) != -1) {
                this.$el.find("#address1").addClass("invalid");
                valid = false;
                break;
            }
        }

        var validateAddress2 = this.$el.find("#address2").val();
        iChars = "`~!@#$%^&*()_+=[]{}:;,<>/?*\\\'\"";
        for (var i = 0; i < validateAddress2.length; i++) {
            if (iChars.indexOf(validateAddress2.charAt(i)) != -1) {
                this.$el.find("#address2").addClass("invalid");
                valid = false;
                break;
            }
        }

        var validateState = this.$el.find("#state").val();
        iChars = "`~!@#$%^&*()_+=[]{}:;,<>./?*\\\'\"";
        for (var i = 0; i < validateState.length; i++) {
            if (iChars.indexOf(validateState.charAt(i)) != -1) {
                this.$el.find("#state").addClass("invalid");
                valid = false;
                break;
            }
        }

        var validateCity = this.$el.find("#city").val();
        iChars = "`~!@#$%^&*()_+=[]{}:;,<>./?*\\\'\"";
        for (var i = 0; i < validateCity.length; i++) {
            if (iChars.indexOf(validateCity.charAt(i)) != -1) {
                this.$el.find("#city").addClass("invalid");
                valid = false;
                break;
            }
        }

        var validateZip = this.$el.find("#zip").val();
        if (validateZip.indexOf("-") > -1 || validateZip.indexOf('e') > -1) {
            this.$el.find("#zip").addClass("invalid");
            valid = false;
        }

        var validateFax = this.$el.find("#fax").val();
        iChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ`~!@#$%^&*()_+=[]{}:;,<>./?*\\\'\"";
        for (var i = 0; i < validateFax.length; i++) {
            if (iChars.indexOf(validateFax.charAt(i)) != -1) {
                this.$el.find("#fax").addClass("invalid");
                valid = false;
                break;
            }
        }

        var validateCompanyName = this.$el.find("#companyName").val();
        iChars = "`~@$%^*()_+=[]{}:;,<>./?*\\\'\"";
        for (var i = 0; i < validateCompanyName.length; i++) {
            if (iChars.indexOf(validateCompanyName.charAt(i)) != -1) {
                this.$el.find("#companyName").addClass("invalid");
                valid = false;
                break;
            }
        }

        var validateCreditLimit = this.$el.find("#creditLimit").val();
        if (validateCreditLimit.indexOf("-") > -1 || validateCreditLimit.indexOf('e') > -1) {
            this.$el.find("#creditLimit").addClass("invalid");
            valid = false;
        }
        
        var validateBalance = this.$el.find("#balance").val();
        if (validateBalance.indexOf('e') > -1 || validateBalance > 9999999) {
            this.$el.find("#balance").addClass("invalid");
            valid = false;
        }

        var validateNotes = this.$el.find("#notes").val();
        iChars = "`~@^*_+=[]{};<>/?*\\\"";
        for (var i = 0; i < validateNotes.length; i++) {
            if (iChars.indexOf(validateNotes.charAt(i)) != -1) {
                this.$el.find("#notes").addClass("invalid");
                valid = false;
                break;
            }
        }
        return valid;
    },

    saveCustomers: function (){
        var customers;
        var that = this;
        var validation = this.validateForm();
        var updateCollection = that.collection;

        if(validation) {
            this.getFormValues();
            var sessionToken = this.getCookie();
            $.ajax({
                url: '/data/save-customer',
                data: {
                    customer: JSON.stringify(that.customersFormView.model.toJSON()),
                    token: sessionToken,
                    accessName: (App.IDS_MODIFY_CUSTOMERS)
                },
                dataType: 'json',
                type: 'POST',
    
                success: function (data) {
                    var success = false;
                    if (typeof data.results !== 'undefined' && typeof data.results.success !== 'undefined') {
                        success = data.results.success;
                    }
                    if (success !== null) {
                        that = (that.customersFormView.model);
                        updateCollection.add(that);

                        M.toast({ html: '{Literal}Customer updated successfully{/Literal}' });
                    }
                    else {
                        M.toast({ html: '{Literal}There was a problem updating this customer{/Literal}' });
                    }
                },
    
                error: function (e) {
                    if (e.status == 523) {
                        window.location.href = "#/log-in";
                        location.reload();
                    }
                    else {
                        M.toast({ html: '{Literal}There was a problem saving this customer{/Literal}' });
                
                    }
                }
            });

            this.render();
        }
        else {
            M.toast({ html: '{Literal}Some of the required fields are missing or invalid{/Literal}' });
        }
    },

    getItemDiscount: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-customer-discounts',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.customerDiscounts = data.results;
                that.renderDiscounts(data.results);
                
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem fetching discounts from the server{/Literal}' });
                }
            }
        });
    },

    
    renderDiscounts: function (data) {
        var that = this;
        for (var i = 0; i < data.length; i++) {
            var currentDiscount = data[i];
        }

        this.initCustomers();
    },

    initializePaginator: function () {
        this.getCustomerTotalCount();
    },

    renderPaginator: function (customerTotalCount) {
        $('.pagination-trigger').remove();

        this.pages = Math.ceil(1.0 * customerTotalCount / (this.customerRows * this.customerColumns));
        
        if (this.pages > 10 & this.selectedPageIndex > 5) {
            if (this.pages < this.selectedPageIndex + 6) {
                var start = this.selectedPageIndex - 4;
                var currentPageElement = $('<li class="waves-effect pagination-trigger" data-page="' + start + '"><a href="javascript:void(0)">' + start + '</a></li>');
                $("#pagination-back").after(currentPageElement);
                for (var i = this.selectedPageIndex - 3; i <= this.pages; i++) {
                    var lastElement = currentPageElement;
                    currentPageElement = $('<li class="waves-effect pagination-trigger" data-page="' + i + '"><a href="javascript:void(0)">' + i + '</a></li>');
                    if (this.selectedPageIndex === i) {
                        $(currentPageElement).addClass('active').addClass('ap-blue');
                    }
                    $(lastElement).after(currentPageElement);
                }
            }
            else {
                var start = this.selectedPageIndex - 4;
                var currentPageElement = $('<li class="waves-effect pagination-trigger" data-page="' + start + '"><a href="javascript:void(0)">' + start + '</a></li>');
                $("#pagination-back").after(currentPageElement);
                for (var i = this.selectedPageIndex - 3; i <= this.selectedPageIndex + 5; i++) {
                    var lastElement = currentPageElement;
                    currentPageElement = $('<li class="waves-effect pagination-trigger" data-page="' + i + '"><a href="javascript:void(0)">' + i + '</a></li>');
                    if (this.selectedPageIndex === i) {
                        $(currentPageElement).addClass('active').addClass('ap-blue');
                    }
                    $(lastElement).after(currentPageElement);
                }
            }
        } 
        else if (this.pages > 10 & this.selectedPageIndex < 6) {
            var currentPageElement = $('<li class="pagination-trigger" data-page="1"><a href="javascript:void(0)">1</a></li>');
            if (this.selectedPageIndex === 1) {
                $(currentPageElement).addClass('active').addClass('ap-blue');
            }
            $("#pagination-back").after(currentPageElement);
            for (var i = 2; i <= 10; i++) {
                var lastElement = currentPageElement;
                currentPageElement = $('<li class="waves-effect pagination-trigger" data-page="' + i + '"><a href="javascript:void(0)">' + i + '</a></li>');
                if (this.selectedPageIndex === i) {
                    $(currentPageElement).addClass('active').addClass('ap-blue');
                }
                $(lastElement).after(currentPageElement);
            }
        }
        else {
            var currentPageElement = $('<li class="pagination-trigger" data-page="1"><a href="javascript:void(0)">1</a></li>');
            if (this.selectedPageIndex === 1) {
                $(currentPageElement).addClass('active').addClass('ap-blue');
            }
            $("#pagination-back").after(currentPageElement);
            for (var i = 2; i <= this.pages; i++) {
                var lastElement = currentPageElement;
                currentPageElement = $('<li class="waves-effect pagination-trigger" data-page="' + i + '"><a href="javascript:void(0)">' + i + '</a></li>');
                if (this.selectedPageIndex === i) {
                    $(currentPageElement).addClass('active').addClass('ap-blue');
                }
                $(lastElement).after(currentPageElement);
            }
        }
        

        $("#customer-pagination").show();
    },

    handlePageBackEvent: function (e) {
        var element = $(e.currentTarget);
        if ($(element).hasClass('disabled') === false) {
            var currentPage = parseInt($("#customer-pagination").attr("data-current-page"));
            this.goToCustomerPage(this.selectedPageIndex - 1, -1);
        }
    },

    handlePageForwardEvent: function (e) {
        var element = $(e.currentTarget);
        if ($(element).hasClass('disabled') === false) {
            var currentPage = parseInt($("#customer-pagination").attr("data-current-page"));
            this.goToCustomerPage(this.selectedPageIndex + 1, -1);
        }
        
    },

    handlePageClickEvent: function (e) {
        var element = $(e.currentTarget);
        var selectedPage = parseInt($(element).attr('data-page'));

        var currentPage = parseInt($("#customer-pagination").attr("data-current-page"));
        this.goToCustomerPage(selectedPage, currentPage);
    },

    goToCustomerPage: function (selectedPage, currentPage) {
        var element = $(".pagination-trigger[data-page=" + selectedPage + "]");
        var offset = this.customerColumns * this.customerRows;
        var args = {
            selectedPage: selectedPage,
            element: element,
            parentView: this
        };
        this.selectedPageIndex = selectedPage;
        var nextPageCustomers = [];

        if (selectedPage * 12 > this.collection.length) {
            for (var i = (selectedPage * 12) - 12; i < this.collection.length; i++) {
                nextPageCustomers.push(this.collection.models[i].attributes);
            }
        }    
        else if (selectedPage * 12 < this.collection.length) {
            var showCustomers = selectedPage * 12;
            for (var i = showCustomers - 12; i < showCustomers; i++) {
                nextPageCustomers.push(this.collection.models[i].attributes);
            }
        }
       
        this.renderPaginationChange(nextPageCustomers, args);
        
    },
    
    renderPaginationChange: function (customers, args) {
        this.cards = true;
        var that = args.parentView;
        var selectedPage = args.selectedPage;
        var element = args.element;
        var customerCollection = new CustomersCollection();
        for (var i = 0; i < customers.length; i++) {
            customerCollection.add(new Customers({
                id: customers[i].id,
                first: customers[i].first,
                middle: customers[i].middle,
                last: customers[i].last,
                phone: customers[i].phone,
                email: customers[i].email,
                address1: customers[i].address1,
                address2: customers[i].address2,
                city: customers[i].city,
                state: customers[i].state,
                zip: customers[i].zip,
                companyName: customers[i].companyName,
                fax: customers[i].fax,
                taxable: customers[i].taxable,
                creditLimit: customers[i].creditLimit,
                discount: customers[i].discount,
                taxCode: customers[i].taxCode,
                balance: customers[i].balance,
                priceLevel: customers[i].priceLevel,
                notes: customers[i].notes,
                terms: customers[i].terms,
                discountItemId: customers[i].discountItemId,
                dueDays: customers[i].dueDays,
                discountDays: customers[i].discountDays,
                uploaded: customers[i].uploaded
            }));
        }

        this.$el.html(this.template({
            customers: customerCollection.toJSON(),
        }));

        this.renderPaginator(this.collection.length);

        $('.modal').modal();
        $('select').formSelect();
        $("#customer-pagination").attr("data-current-page", this.selectedPageIndex);
        if (this.collection.length > 12) {
            if (this.selectedPageIndex === 1 && this.fullCollection.length > this.collection.length) {
                $('#customerBlock').show();
                $('#paginationBlock').show();
                $("#pagination-back").addClass('disabled').removeClass('waves-effect');
                $("#pagination-forward").removeClass('disabled').addClass('waves-effect');
            } else if (this.selectedPageIndex === 1) {
                $("#pagination-back").addClass('disabled').removeClass('waves-effect');
                $("#pagination-forward").removeClass('disabled').addClass('waves-effect');
            } else if (this.selectedPageIndex === that.pages) {
                $('#customerBlock').show();
                $('#paginationBlock').show();
                $("#pagination-back").removeClass('disabled').addClass('waves-effect');
                $("#pagination-forward").addClass('disabled').removeClass('waves-effect');
            } else {
                $('#customerBlock').show();
                $('#paginationBlock').show();
                $("#pagination-back").removeClass('disabled').addClass('waves-effect');
                $("#pagination-forward").removeClass('disabled').addClass('waves-effect');
            }
        }
    },

    getCustomerTotalCount() {
        var count = this.collection.length;
        this.renderPaginator(count);
    }
});