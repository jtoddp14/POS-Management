var CustomersFormView = Backbone.View.extend({
    customersStyleMapping: {},
    itemFullCollection: {},
    events: {
        'change #customersName': 'updateName',
        'click .select-discount' : 'openItemModal',
    },

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.model = options.model;
        this.customers = options.customers;
        this.taxCodes = options.taxCodes;
        this.customerDiscounts =  options.customerDiscounts
        this.israCardBuild = options.israCardBuild
    },

    render: function () {
        var that = this;
        this.$el.detach();
        
        this.$el.html(this.template({
            customers: that.model.toJSON(),
            taxCodes: that.taxCodes,
            customerDiscounts: that.customerDiscounts
        }));
        
        $(document).ready(function() {
            $('.tooltipped').tooltip();
            if (that.israCardBuild) {
                $('label[for=middle], input#middle').hide();
            }   
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

    updateName: function (e) {
        var element = $(e.currentTarget);
        var name = $(element).val();
        this.model.set('name', name);
    },
});