var SalesTaxesFormView = Backbone.View.extend({
    fullCollection: [], 
    id: "",
    rate:  0,
    glAccount: "",
    taxAuth: 0,
    taxCode: "",

    events: {
        'click .edit-taxAuth1-trigger': 'editTaxAuth1',
        'click .edit-taxAuth2-trigger': 'editTaxAuth2',
        'click .edit-taxAuth3-trigger': 'editTaxAuth3',
        'click .edit-taxAuth4-trigger': 'editTaxAuth4',
        'click .edit-taxAuth5-trigger': 'editTaxAuth5',
        'click .save-authority-button': 'saveTaxAuthority',
        'click .delete-authority-button': 'deletionModal',
        'click #delete-tax-authority-confirm': 'deleteTaxAuthority'
    },

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.model = options.model;
        this.taxes = options.taxes;
        this.getTaxAuthority();
    },

    render: function () {
        var that = this;
        this.$el.detach();
        this.$el.html(this.template({
            salesTaxes: this.model.toJSON(),
        }));

        $(document).ready(function() {
            $('.tooltipped').tooltip();
        });
        return this;
    },

    editTaxAuth1: function () {
        var notBlank = false;

        for (var i = 0; i < this.fullCollection.length; i++) {
            if (this.fullCollection[i].id.toUpperCase() == this.model.attributes.taxAuth1.toUpperCase()) {
                this.openFormModal(this.fullCollection[i]);
                notBlank = true;
            }
        }

        if (!notBlank) {
            this.openBlankFormModal();
        }

        this.taxAuth = 1;
    },

    editTaxAuth2: function () {
        var notBlank = false;

        for (var i = 0; i < this.fullCollection.length; i++) {
            if (this.fullCollection[i].id.toUpperCase() == this.model.attributes.taxAuth2.toUpperCase()) {
                this.openFormModal(this.fullCollection[i]);
                notBlank = true;
            }
        }

        if (!notBlank) {
            this.openBlankFormModal();
        }

        this.taxAuth = 2;
    },

    editTaxAuth3: function () {
        var notBlank = false;

        for (var i = 0; i < this.fullCollection.length; i++) {
            if (this.fullCollection[i].id.toUpperCase() == this.model.attributes.taxAuth3.toUpperCase()) {
                this.openFormModal(this.fullCollection[i]);
                notBlank = true;
            }
        }

        if (!notBlank) {
            this.openBlankFormModal();
        }

        this.taxAuth = 3;
    },

    editTaxAuth4: function () {
        var notBlank = false;

        for (var i = 0; i < this.fullCollection.length; i++) {
            if (this.fullCollection[i].id.toUpperCase() == this.model.attributes.taxAuth4.toUpperCase()) {
                this.openFormModal(this.fullCollection[i]);
                notBlank = true;
            }
        }

        if (!notBlank) {
            this.openBlankFormModal();
        }

        this.taxAuth = 4;
    },

    editTaxAuth5: function () {
        var notBlank = false;

        for (var i = 0; i < this.fullCollection.length; i++) {
            if (this.fullCollection[i].id.toUpperCase() == this.model.attributes.taxAuth5.toUpperCase()) {
                this.openFormModal(this.fullCollection[i].attributes);
                notBlank = true;
            }
        }

        if (!notBlank) {
            this.openBlankFormModal();
        }

        this.taxAuth = 5;
    },

    openFormModal: function (taxAuthority) {
        var id = document.getElementById('id');
        var rate = document.getElementById('rate');
        var glAccount = document.getElementById('glAccount');

        if (taxAuthority.id != undefined) {
            id.value = taxAuthority.id;
        }
        else {
            id.value = "";
        }

        if (taxAuthority.rate != undefined) {
            rate.value = taxAuthority.rate;
        }
        else {
            rate.value = "";
        }

        if (taxAuthority.glAccount != undefined) {
            glAccount.value = taxAuthority.glAccount;
        }
        else {
            glAccount.value = "";
        }

        this.formModal = this.$el.find('#tax-authority-modal').modal();
        this.formModal.modal('open');
    },

    openBlankFormModal: function () {
        var id = document.getElementById('id');
        var rate = document.getElementById('rate');
        var glAccount = document.getElementById('glAccount');

        id.value = "";
        rate.value = "";
        glAccount.value = "";

        this.formModal = this.$el.find('#tax-authority-modal').modal();
        this.formModal.modal('open');
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

    getTaxAuthority: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-tax-authorities',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.renderSalesAuthorities(data.results);
                
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

    renderSalesAuthorities: function (data) {
        var that = this;
        data.sort(function (a, b) {
            return a.id.toLowerCase() < b.id.toLowerCase() ? -1 : (a.id.toLowerCase() > b.id.toLowerCase() ? 1 : 0);
        });
        var collection =[];
        for (var i = 0; i < data.length; i++) {
            var currentTax = data[i];  
            collection.push((currentTax));
        }
        that.fullCollection = collection;
    },

    getFormValues2: function () {
        this.id = this.$el.find('#id').val();
        this.rate = this.$el.find('#rate').val();
        this.glAccount = this.$el.find('#glAccount').val();
        this.taxCode = this.model.attributes.id;
    },

    saveTaxAuthority: function () {
        var that = this;
        this.getFormValues2();
        var sessionToken = this.getCookie();

        //this.saveTaxCode();

        $.ajax({
            url: '/data/save-tax-authority',
            data: {
                id: that.id,
                rate: that.rate,
                glAccount: that.glAccount,
                taxCode: that.taxCode,
                taxAuth: that.taxAuth,
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
                    M.toast({ html: '{Literal}There was a problem saving this tax code{/Literal}' });
                }
            }
        });

        $('#tax-authority-modal').modal().modal('close');
        $('#sales-taxes-form-modal').modal().modal('close');
    },

    deletionModal: function () {
        $('#delete-tax-authority-modal').modal().modal('open');
    },

    deleteTaxAuthority: function () {
        var that = this;
        var sessionToken = this.getCookie();
        var selectedTaxAuth = 0;

        if (this.id.toUpperCase() == this.model.attributes.taxAuth1.toUpperCase()) {
            selectedTaxAuth = 1;
        }
        else if (this.id.toUpperCase() == this.model.attributes.taxAuth2.toUpperCase()) {
            selectedTaxAuth = 2;
        }
        else if (this.id.toUpperCase() == this.model.attributes.taxAuth3.toUpperCase()) {
            selectedTaxAuth = 3;
        }
        else if (this.id.toUpperCase() == this.model.attributes.taxAuth4.toUpperCase()) {
            selectedTaxAuth = 4;
        }
        else if (this.id.toUpperCase() == this.model.attributes.taxAuth5.toUpperCase()) {
            selectedTaxAuth = 5;
        }

        selectedTaxAuth = this.taxAuth;

        $.ajax({
            url: '/data/delete-tax-authority',
            type: 'POST',
            data: {
                selectedTaxCode: that.model.attributes.code,
                selectedTaxAuth:  selectedTaxAuth,
                token: sessionToken
            },
            method: 'POST',
            success: function (data) {
                var success = false;
                if (typeof data.results !== 'undefined' && typeof data.results.success !== 'undefined') {
                    success = data.results.success;
                }

                M.toast({ html: '{Literal}Tax authority deleted successfully{/Literal}' });
            },

            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem deleting this tax code{/Literal}' });
                }
            }
        });
        $('#tax-authority-modal').modal().modal('close');
        $('#sales-taxes-form-modal').modal().modal('close');
    },

    saveTaxCode: function () {
        if (this.taxAuth == 1) {
            this.model.attributes.taxAuth1 = this.$el.find('#id').val();
        }
        else if (this.taxAuth == 2) { 
            this.model.attributes.taxAuth2 = this.$el.find('#id').val();
        }
        else if (this.taxAuth == 3) {
            this.model.attributes.taxAuth3 = this.$el.find('#id').val();
        }
        else if (this.taxAuth == 4) {
            this.model.attributes.taxAuth4 = this.$el.find('#id').val();
        }
        else if (this.taxAuth == 5) {
            this.model.attributes.taxAuth5 = this.$el.find('#id').val();
        }

        var that = this;

        $.ajax({
            url: '/data/save-sales-taxes',
            data: {
                code: (that.model.attributes.code),
                taxAuth1: (that.model.attributes.taxAuth1),
                taxAuth2: (that.model.attributes.taxAuth2),
                taxAuth3: (that.model.attributes.taxAuth3),
                taxAuth4: (that.model.attributes.taxAuth4),
                taxAuth5: (that.model.attributes.taxAuth5) 
            },
            dataType: 'json',
            type: 'POST',

            success: function (data) {
                var success = false;
                if (typeof data.results !== 'undefined' && typeof data.results.success !== 'undefined') {
                    success = data.results.success;
                }
            },

            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem saving this tax code{/Literal}' });
                }
            }
        });
    }
});