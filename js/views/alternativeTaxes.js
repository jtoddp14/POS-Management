var AlternativeTaxesView = Backbone.View.extend({
    fullCollection: {},
    formModal: null,
    deletionModal: {},
    itemTypes: {},
    taxAuthorities: {},

    events: {
        'click .card-panel-entity': 'highlightCard',
        'click .edit-tax-trigger': 'editTax',
        'click #add-tax-button': 'addAlternativeTax',
        'click .save-button': 'saveTax',
        'click .delete-tax-button': 'deletionModal',
        'click #delete-tax-confirm': 'deleteTax'
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
        this.alternativeTaxesFormTemplate = options.alternativeTaxesFormTemplate;
        this.breadcrumb = options.breadcrumb;
        this.collection = options.collection;
        this.listenTo(this.collection, 'reset', this.render);
        this.listenTo(this.collection, 'remove', this.render);
        this.listenTo(this.collection, 'add', this.render);
        this.model = options.model;
        this.getItemTypes();
    },

    render: function () {
        var that = this;
        this.$el.html(this.template({
            alternativeTaxes: this.collection.toJSON(),
        }));

        $(document).ready(function(){
            $('.modal').modal();
        });
            
        App.breadCrumbToolTip = "Set item types to use a seperate tax authorities or rates"

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
        this.formModal = this.$el.find('#alternative-taxes-form-modal').modal();
        return this;
    },

    editTax: function (e) {
        var that = this;
        var element = $(e.currentTarget);
        var id = $(element).attr('data-id');
        if (this.collection.get(id) !== null && this.collection.get(id) !== '') {
            this.alternativeTaxesFormView = new AlternativeTaxesFormView({
                template: this.alternativeTaxesFormTemplate,
                model: this.collection.get(id),
                itemTypes: this.itemTypes,
                taxAuthorities: this.taxAuthorities
            });

            this.$el.find('#alternative-taxes-form-modal').html(this.alternativeTaxesFormView.render().el);
            this.$el.find('select').formSelect();
            this.formModal.modal('open');
        }
        else {
            M.toast({ html: '{Literal}There was a problem fetching data from the server{/Literal}' });
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

    getCookie: function() {
        var nameEQ = "sessionCookie" + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
    },
    
    getItemTypes: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-item-types',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.itemTypes = data.results;
                that.getTaxAuthorities();
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem fetching item types from the server{/Literal}' });
                }
            }
        });
    },

    getTaxAuthorities: function () {
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
                that.taxAuthorities = data.results;
                that.initAlternativeTaxes();
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

    initAlternativeTaxes: function () {
        this.getAlternativeTaxes();
    },

    getAlternativeTaxes: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-alternative-taxes',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                for (var i = 0; i < data.results.length; i++) {
                    data.results[i].id += i; 
                }
                that.generateTaxesStyleMapping(data.results);
                that.renderAlternativeTaxes(data.results);
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

    renderAlternativeTaxes: function (data) {
        var that = this;
        data.sort(function (a, b) {
            return a.id < b.id ? -1 : (a.id > b.id ? 1 : 0);
        });
        var collection = new AlternativeTaxesCollection();
        for (var i = 0; i < data.length; i++) {
            var currentTax = data[i];
            currentTax.cardStyleClass = that.taxesStyleMapping[data[i].id];
            
            collection.add(new AlternativeTaxes(currentTax));
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
        var id = this.$el.find("#id").val();
        var itemType = this.$el.find('#item-type-dropdown option:selected').text();
        var taxAuthority = this.$el.find('#tax-authority-dropdown option:selected').text();
        var taxRate = this.$el.find("#taxRate").val();

        if (id == "" || id == 0) {
            id = Math.floor(Math.random() * 1000) + 1  
        }

        var updatedModel = {
            id: id,
            itemType: itemType,
            taxAuthority: taxAuthority,
            taxRate: taxRate,
        };

        this.alternativeTaxesFormView.model.set(updatedModel);
    },

    addAlternativeTax: function () {
        var alternativeTaxes = new AlternativeTaxes();
        this.alternativeTaxesFormView = new AlternativeTaxesFormView({
            template: this.alternativeTaxesFormTemplate,
            model: alternativeTaxes,
            itemTypes: this.itemTypes,
            taxAuthorities: this.taxAuthorities
        });

        this.$el.find('#alternative-taxes-form-modal').html(this.alternativeTaxesFormView.render().el);
        this.$el.find('select').formSelect();
        this.$el.find("select[required]").css({
            display: "block", 
            position: 'absolute',
            visibility: 'hidden'
        });  
        this.formModal.modal('open');
    },

    deletionModal: function (e) {
        $('#delete-tax-modal').modal().modal('open');
    },

    deleteTax: function(e) {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/delete-alternative-tax',
            type: 'POST',
            data: {
                selectedAlternateTax: that.alternativeTaxesFormView.model.attributes.id,
                token: sessionToken
            },
            method: 'POST',
            success: function (data) {
                that.collection.remove(that.alternativeTaxesFormView.model.attributes.id);
                
                M.toast({ html: '{Literal}Alternative Tax deleted successfully{/Literal}' });
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
        var taxRate = this.$el.find("#taxRate").val();
        if (taxRate < 0 || taxRate > 100) {
            M.toast({ html: '{Literal}Please enter a valid rate percentage{/Literal}' });
        }
        else {
            var that = this;
            var updateCollection = that.collection;
    
            this.getFormValues();
            var sessionToken = this.getCookie();

            
            $.ajax({
                url: '/data/save-alternative-tax',
                data: {
                    alternativeTax: JSON.stringify(that.alternativeTaxesFormView.model.toJSON()),
                    token: sessionToken
                },
                dataType: 'json',
                type: 'POST',

                success: function (data) {
                    that = (that.alternativeTaxesFormView.model);
                    updateCollection.add(that);
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
    }
});