var TaxesView = Backbone.View.extend({
    fullCollection: {},
    formModal: null,
    deletionModal: {},

    events: {
        'click .card-panel-entity': 'highlightCard',
        'click .edit-tax-trigger': 'editTax',
        'click #add-tax-button': 'addTax',
        'click .save-button': 'saveTax',
        'click .delete-button': 'deletionModal',
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
        this.taxesFormTemplate = options.taxesFormTemplate;
        this.breadcrumb = options.breadcrumb;
        this.collection = options.collection;
        this.listenTo(this.collection, 'reset', this.render);
        this.listenTo(this.collection, 'remove', this.render);
        this.listenTo(this.collection, 'add', this.render);
        this.model = options.model;
        this.initTaxes();
    },

    render: function () {
        var that = this;
        this.$el.html(this.template({
            taxes: this.collection.toJSON(),
        }));

        $(document).ready(function(){
            $('.modal').modal();
        });
        App.breadCrumbToolTip = "Create or manage your VAT taxes that will apply to taxable items";     
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
        this.formModal = this.$el.find('#taxes-form-modal').modal();
        return this;
    },

    editTax: function (e) {
        var element = $(e.currentTarget);
        var id = $(element).attr('data-id');
        if (this.collection.get(id) !== null && this.collection.get(id) !== '') {
            this.taxesFormView = new TaxesFormView({
                template: this.taxesFormTemplate,
                model: this.collection.get(id),
            });

            this.$el.find('#taxes-form-modal').html(this.taxesFormView.render().el);
            this.$el.find('select').formSelect();
            this.formModal.modal('open');
        }
        else {
            M.toast({ html: '{Literal}There was a problem fetching data from the server{/Literal}' });
        }
    },

    addTax: function () {
        var taxes = new Taxes();
        this.taxesFormView = new TaxesFormView({
            template: this.taxesFormTemplate,
            model: taxes,
        });

        this.$el.find('#taxes-form-modal').html(this.taxesFormView.render().el);
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

    initTaxes: function () {
        this.getTaxes();
    },

    getTaxes: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-vat-list',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.generateTaxesStyleMapping(data.results);
                that.renderTaxes(data.results);
                
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

    renderTaxes: function (data) {
        var that = this;
        data.sort(function (a, b) {
            return a.code.toLowerCase() < b.code.toLowerCase() ? -1 : (a.code.toLowerCase() > b.code.toLowerCase() ? 1 : 0);
        });
        var collection = new TaxesCollection();
        for (var i = 0; i < data.length; i++) {
            var currentTax = data[i];
            currentTax.cardStyleClass = that.taxesStyleMapping[data[i].id];
            
            collection.add(new Taxes(currentTax));
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

    getFormValues: function () {
        var id = this.taxesFormView.$el.find('#id').val();
        var code = this.taxesFormView.$el.find('#code').val();
        var description = this.taxesFormView.$el.find('#description').val();
        var rate1 = this.taxesFormView.$el.find('#rate1').val();
        var rate2 = this.taxesFormView.$el.find('#rate2').val();
        var piggyback = this.taxesFormView.$el.find('.piggyback:checked').length > 0
        if (id == "") {
            var updatedModel = {
                id: id,
                code: code,
                description: description,
                rate: rate1,
                rate2: rate2,
                isPiggyBack: piggyback,  
                isAdd: true
            };
        }
        else {
            var updatedModel = {
                id: id,
                code: code,
                description: description,
                rate: rate1,
                rate2: rate2,
                isPiggyBack: piggyback,    
            };
        }

        this.taxesFormView.model.set(updatedModel);
    },

    validateForm: function () {
        var valid = true;
        var validateDescription= this.$el.find("#description").val();
        if (validateDescription.trim().length < 1) {
            this.$el.find("#description").addClass("invalid");
            valid = false;
        }
        else {
            var iChars = "`~!@#$%^&*_+=[]{}:;,<>?*\'\"";
            for (var i = 0; i < validateDescription.length; i++) {
                if (iChars.indexOf(validateDescription.charAt(i)) != -1) {
                    this.$el.find("#description").addClass("invalid");
                    valid = false;
                    break;
                }
            }
        }

        var validateId = this.$el.find("#code").val();
        if (validateId.trim().length < 1) {
            this.$el.find("#code").addClass("invalid");
            valid = false;
        }
        else {
            var iChars = "`~!@#$%^&*()_+=[]{}:;,<>?*\'\"";
            for (var i = 0; i < validateId.length; i++) {
                if (iChars.indexOf(validateId.charAt(i)) != -1) {
                    this.$el.find("#code").addClass("invalid");
                    valid = false;
                    break;
                }
            }
        }

        var validateRate = this.$el.find("#rate1").val();
        if (validateRate.trim().length < 1) {
            this.$el.find("#rate1").addClass("invalid");
            valid = false;
        }
        else if (validateRate > 999999 || validateRate < 0) {
            this.$el.find("#rate1").addClass("invalid");
            valid = false;
        }

        var validateRate2 = this.$el.find("#validateRate2").val();
        if (validateRate2 > 999999 || validateRate2 < 0) {
            this.$el.find("#rate2").addClass("invalid");
            valid = false;
        }
        
        return valid;
    },

    deletionModal: function (e) {
        var that = this;
        var element = $(e.currentTarget);
        var taxId = $(element).attr('data-id');
        $("#delete-tax-id").val(taxId);
        $('#delete-tax-modal').modal().modal('open');
    },

    deleteTax: function(e) {
        this.getFormValues();
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/delete-vat-code',
            type: 'POST',
            data: {
                vatCode: JSON.stringify(that.taxesFormView.model.toJSON()),
                token: sessionToken
            },
            method: 'POST',
            success: function (data) {
                var success = false;
                if (typeof data.results !== 'undefined' && typeof data.results.success !== 'undefined') {
                    success = data.results.success;
                }
                if (success !== null) {
                    that.collection.remove(taxId);
                }

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
    },

    saveTax: function (){
        var tax;
        var that = this;
        var validation = this.validateForm();
        var updateCollection = that.collection;
        
        if(validation) {
            this.getFormValues();
            var sessionToken = this.getCookie();
            $.ajax({
                url: '/data/save-vat-code',
                data: {
                    vatCode: JSON.stringify(that.taxesFormView.model.toJSON()),
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
                        that = (that.taxesFormView.model);
                        updateCollection.add(that);
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

            this.render();
        }
        else {
            M.toast({ html: '{Literal}Some of the required fields are missing or invalid{/Literal}' });
        }
    }
});