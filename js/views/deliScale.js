var DeliScaleView = Backbone.View.extend({
    events: {
        'click .save-button': 'saveChanges',
        'click #embeddedPrice': 'embeddedPrice',
        'click #embeddedWeight': 'embeddedWeight'
    },
    data: {},
    breadcrumb: {},

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.breadcrumb = options.breadcrumb;
        this.model = options.model;
        this.listenTo(this.model, 'change', this.render);
    },

    render: function () {        
        this.$el.html(this.template({
            deliScale: this.model.toJSON(),
        }));
      
        App.breadCrumbToolTip = "Setup embedded barcodes or weight for your items";
        App.setBreadcrumbs(this.breadcrumb);

        var that = this;
        $(document).ready(function () {
            $('.tooltipped').tooltip();
            that.$el.find('select').formSelect();
        });

        if (this.model.attributes.priceStart > 0) {
            this.$el.find("#embeddedPrice").trigger("click");
        }
        else if (this.model.attributes.weightStart > 0) {
            this.$el.find("#embeddedWeight").trigger("click");
        }

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
        that.getDeliScaleData();
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

    getDeliScaleData: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-deli-scale-settings',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.deliScale = data.deliScaleInfo;
                that.model.set(data.deliScaleInfo);
                that.$el.find('#deli-scale-form').show();
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem retrieving deli scale settings{/Literal}.' });
                }
            }
        });
    },

    getFormValues: function () {
        var prefix = this.$el.find('#prefix').val();
        var itemStart = this.$el.find('#itemStart').val();
        var itemLength = this.$el.find('#itemLength').val();
        var embeddedPrice = this.$el.find('#embeddedPrice:checked').length > 0;
        var embeddedWeight = this.$el.find('#embeddedWeight:checked').length > 0;
        if (embeddedPrice) {
            var priceLength = this.$el.find('#priceLength').val();
            var priceStart = this.$el.find('#priceStart').val();
            var priceDivisor = this.$el.find('#priceDivisor').val();
            var weightStart = 0;
            var weightLength = 0;
            var weightDivisor = 0;
        }
        else if (embeddedWeight) {
            var priceLength = 0;
            var priceStart = 0;
            var priceDivisor = 0;
            var weightStart = this.$el.find('#weightStart').val();
            var weightLength = this.$el.find('#weightLength').val();
            var weightDivisor = this.$el.find('#weightDivisor').val();
        }

        var updatedModel = {
            prefix: prefix,
            itemLength: itemLength,
            priceLength: priceLength,
            itemStart: itemStart,
            priceStart: priceStart,
            priceDivisor: priceDivisor,
            weightStart: weightStart,
            weightLength: weightLength,
            weightDivisor: weightDivisor
        };

        return (new DeliScale(updatedModel)).toJSON();
    },

    embeddedPrice: function () {
        this.$el.find('#embeddedWeight').not(this).prop('checked', false); 
        this.$el.find('#embeddedPrice').prop("disabled", true); 
        this.$el.find('#embeddedWeight').removeAttr('disabled');
        $('#embeddedPriceRow').show();
        $('#embeddedWeightRow').hide();
    },

    embeddedWeight: function () {
        this.$el.find('#embeddedPrice').not(this).prop('checked', false); 
        this.$el.find('#embeddedWeight').prop("disabled", true); 
        this.$el.find('#embeddedPrice').removeAttr('disabled');
        $('#embeddedPriceRow').hide();
        $('#embeddedWeightRow').show();
    },

    validateForm: function () {
        var valid = true;
        var validatePrefix = this.$el.find("#prefix").val();
        var validateEmbeddedPrice = this.$el.find('#embeddedPrice:checked').length > 0;;
        if (validatePrefix == '' && validateEmbeddedPrice) {
            valid = false;
        }
        return valid;
    },

    saveChanges: function () {
        var deliScale;
        var that = this;
        var validation = this.validateForm();

        if (validation) {
            var formData = this.getFormValues();
            var sessionToken = this.getCookie();
            $.ajax({
                url: '/data/save-deli-scale-settings',
                data: {
                    deliScale: JSON.stringify(formData),
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

                    }

                    M.toast({ html: '{Literal}Settings saved successfully{/Literal}' });
                },

                error: function (e) {
                    if (e.status == 523) {
                        window.location.href = "#/log-in";
                        location.reload();
                    }
                    else {
                        M.toast({ html: '{Literal}There was a problem saving deli scale settings{/Literal}' });
                    }
                }
            });
        }

        else {
            M.toast({html: '{Literal}Prefix cannot be blank while Embedded Price is selected{/Literal}'});
        }
    }
});
