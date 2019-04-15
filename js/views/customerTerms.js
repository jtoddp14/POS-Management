var CustomerTermsView = Backbone.View.extend({
    fullCollection: {},
    deletionModal: {},
    formModal: null,
    deleteId: "",

    events: {
        'click .card-panel-entity': 'highlightCard',
        'click .edit-customer-terms-trigger': 'editCustomerTerm',
        'click .save-button' : 'saveCustomerTerm'
    },

    breadcrumb: {},

    styles: [
        'ap-blue',
        '#31619e'
    ],

    termStyleMapping: {},

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.customerTermsFormTemplate = options.customerTermsFormTemplate;
        this.breadcrumb = options.breadcrumb;
        this.collection = options.collection;
        this.listenTo(this.collection, 'reset', this.render);
        this.listenTo(this.collection, 'remove', this.render);
        this.listenTo(this.collection, 'add', this.render);
        this.model = options.model;
        this.getCustomerTerms();
    },

    render: function () {
        var that = this;
        this.$el.html(this.template({
            customerTerms: this.collection.toJSON()
        }));

        $(document).ready(function(){
            $('.tooltipped').tooltip();
            $('.modal').modal();
        });

        App.breadCrumbToolTip = "Set day or time for when customers payments are due";
            
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

        this.formModal = this.$el.find('#customer-terms-form-modal').modal();
        return this;
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
    
    getCustomerTerms: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-customer-terms',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.generateCustomerTermsStyleMapping(data.results);
                that.renderCustomerTerms(data.results);
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

    renderCustomerTerms: function (data) {
        var that = this;
        data.sort(function (a, b) {
            return a.id < b.id ? -1 : (a.id > b.id ? 1 : 0);
        });
        var collection = new CustomerTermsCollection();
        for (var i = 0; i < data.length; i++) {
            var currentTerm = data[i];
            currentTerm.cardStyleClass = that.termStyleMapping[data[i].id];
            
            collection.add(new CustomerTerms(currentTerm));
        }
        that.fullCollection = collection;
        that.collection.reset(collection.models);
    },

    generateCustomerTermsStyleMapping: function (data) {
        var term = [];
        var totalStyles = this.styles.length;
        var currentStyle = 0;
        for (var i = 0; i < data.length; i++) {
            
            if (term.indexOf(data[i].id) < 0) {
                term.push(data[i].id);
                this.termStyleMapping[data[i].id] = this.styles[currentStyle];
                if (currentStyle < totalStyles - 1) {
                    currentStyle++;
                } else {
                    currentStyle = 0;
                }
            }
        }
    },

    editCustomerTerm: function (e) {
        var element = $(e.currentTarget);
        var id = $(element).attr('data-id');
        
        if (this.collection.get(id) !== null && this.collection.get(id) !== '') {
            this.customerTermsFormView = new CustomerTermsFormView({
                template: this.customerTermsFormTemplate,
                model: this.collection.get(id),
            });

            this.$el.find('#customer-terms-form-modal').html(this.customerTermsFormView.render().el);
            this.formModal.modal('open');
        }
        else {
            M.toast({ html: '{Literal}There was a problem fetching data from the server{/Literal}' });
        }
    },
    
    getFormValues: function () {
        var that = this;
        var id = this.$el.find("#id").val();
        var terms = this.$el.find("#terms").val();
        var dueDayOfMonth = this.$el.find('#dueDayOfMonth').val();
        var daysUntilDue = this.$el.find("#daysUntilDue").val();
        var discountDays = this.$el.find("#discountDays").val();


        var updatedModel = {
            id: id,
            terms: terms,
            dueDayOfMonth: dueDayOfMonth,
            daysUntilDue: daysUntilDue,
            discountDays: discountDays
        };

        this.customerTermsFormView.model.set(updatedModel);
    },

    saveCustomerTerm: function () {
        var that = this;
        this.getFormValues();
        var sessionToken = this.getCookie();
        var updateCollection = that.collection

        $.ajax({
            url: '/data/save-customer-terms',
            data: {
                customer: JSON.stringify(that.customerTermsFormView.model.toJSON()),
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',

            success: function (data) {
                that = (that.customerTermsFormView.model);
                updateCollection.add(that);
                M.toast({ html: '{Literal}Settings saved successfully{/Literal}' });
            },

            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem saving this Customer Term{/Literal}' });
                }
            }
        });

        this.render();
    }
});