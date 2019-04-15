var SalesTaxesView = Backbone.View.extend({
    fullCollection: {},
    formModal: null,
    deletionModal: {},

    events: {
        'click .card-panel-entity': 'highlightCard',
        'click .edit-sales-tax-trigger': 'editTax',
        'click #add-sales-tax-authority-button': 'addTaxAuthority',
        'click #add-sales-tax-button': 'addTaxCode',
        'click .save-new-tax-button': 'saveNewTax',
        'click .save-button': 'saveTax',
        'click .delete-tax-button': 'deletionModal',
        'click #delete-tax-confirm': 'deleteTax',
        'keyup #description' : 'validateForm',
        'keyup #id' : 'validateForm',
        'keyup #rate1' : 'validateForm',
        'keyup #rate2' : 'validateForm',
    },

    breadcrumb: {},

    styles: [
        'ap-blue',
        '#31619e'
    ],

    taxesStyleMapping: {},

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.salesTaxesFormTemplate = options.salesTaxesFormTemplate;
        this.breadcrumb = options.breadcrumb;
        this.collection = options.collection;
        this.listenTo(this.collection, 'reset', this.render);
        this.listenTo(this.collection, 'remove', this.render);
        this.listenTo(this.collection, 'add', this.render);
        this.model = options.model;
        this.initSalesTaxes();
    },

    render: function () {
        var that = this;
        this.$el.html(this.template({
            salesTaxes: this.collection.toJSON(),
        }));

        $(document).ready(function(){
            $('.modal').modal();
        });
        App.breadCrumbToolTip = "Create or manage your tax codes and tax authorities that will apply to taxable items"; 
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
        this.formModal = this.$el.find('#sales-taxes-form-modal').modal();
        return this;
    },

    editTax: function (e) {
        var element = $(e.currentTarget);
        var id = $(element).attr('data-id');
        if (this.collection.get(id) !== null && this.collection.get(id) !== '') {
            this.salesTaxesFormView = new SalesTaxesFormView({
                template: this.salesTaxesFormTemplate,
                model: this.collection.get(id),
            });

            this.$el.find('#sales-taxes-form-modal').html(this.salesTaxesFormView.render().el);
            this.$el.find('select').formSelect();
            this.formModal.modal('open');
        }
        else {
            M.toast({ html: '{Literal}There was a problem fetching data from the server{/Literal}' });
        }
    },

    addTaxCode: function () {
        var addTaxCodeModal = this.$el.find('#add-tax-code-modal').modal();
        addTaxCodeModal.modal('open');
    },

    saveNewTax: function () {
        var that = this;
        var sessionToken = this.getCookie();
        var addedModel = { 
            code: this.$el.find('#taxCodeId').val(),
            description: this.$el.find('#taxCodeName').val(),
            taxAuth1: '',
            taxAuth2: '',
            taxAuth3: '',
            taxAuth4: '',
            taxAuth5: '',
        };

        $.ajax({
            url: '/data/save-sales-taxes',
            data: {
                token: sessionToken,
                code: addedModel.code,
                description: addedModel.description,
                taxAuth1: '',
                taxAuth2: '',
                taxAuth3: '',
                taxAuth4: '',
                taxAuth5: '',
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
               that.collection.add(addedModel);

                M.toast({
                    html: '{Literal}Tax Code added successfully{/Literal}'
                });
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

    addTaxAuthority: function () {
        var taxes = new SalesTaxes();
        this.salesTaxesFormView = new SalesTaxesFormView({
            template: this.salesTaxesFormTemplate,
            model: taxes,
        });

        this.$el.find('#sales-taxes-form-modal').html(this.salesTaxesFormView.render().el);
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

    getCookie: function() {
        var nameEQ = "sessionCookie" + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
    },

    initSalesTaxes: function () {
        this.getSalesTaxes();
    },

    getSalesTaxes: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-sales-taxes',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.generateTaxesStyleMapping(data.results);
                that.renderSalesTaxes(data.results);
                
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

    renderSalesTaxes: function (data) {
        var that = this;
        data.sort(function (a, b) {
            return a.code.toLowerCase() < b.code.toLowerCase() ? -1 : (a.code.toLowerCase() > b.code.toLowerCase() ? 1 : 0);
        });
        var collection = new SalesTaxesCollection();
        for (var i = 0; i < data.length; i++) {
            var currentTax = data[i];
            currentTax.cardStyleClass = that.taxesStyleMapping[data[i].id];
            
            collection.add(new SalesTaxes(currentTax));
        }
        that.fullCollection = collection;
        that.collection.reset(collection.models);
    },

    generateTaxesStyleMapping: function (data) {
        var taxes = [];
        var totalStyles = this.styles.length;
        var currentStyle = 0;
        for (var i = 0; i < data.length; i++) {
            if (taxes.indexOf(data[i].id) < 0) {
                taxes.push(data[i].id);
                this.taxesStyleMapping[data[i].id] = this.styles[currentStyle];
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
        var taxId = $(element).attr('data-id');
        $("#delete-tax-id").val(taxId);
        $('#delete-tax-modal').modal().modal('open');
    },

    deleteTax: function(e) {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/delete-tax-code',
            type: 'POST',
            data: {
                selectedTaxCode: (that.salesTaxesFormView.model.attributes.code),
                token: sessionToken
            },
            method: 'POST',
            success: function (data) {
                that.collection.remove(that.salesTaxesFormView.model.attributes.id);
                
                M.toast({ html: '{Literal}Tax code deleted successfully{/Literal}' });
                that.render();
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
        this.render();
    }
});