var PriceLevelTimesView = Backbone.View.extend({
    fullCollection: {},
    formModal: null,
    deletionModal: {},

    events: {
        'click .card-panel-entity': 'highlightCard',
        'click .edit-price-level-time-trigger': 'editPriceLevelTime',
        'click #add-price-level-time-button': 'addPriceLevelTime',
        'click .save-button': 'savePriceLevelTime',
        'click .delete-price-level-time-button': 'deletionModal',
        'click #delete-price-level-time-confirm': 'deletePriceLevelTime'
    },

    breadcrumb: {},

    styles: [
        'ap-blue',
        '#31619e'
    ],

    priceLevelStyleMapping: {},

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.priceLevelTimesFormTemplate = options.priceLevelTimesFormTemplate;
        this.breadcrumb = options.breadcrumb;
        this.collection = options.collection;
        this.listenTo(this.collection, 'reset', this.render);
        this.listenTo(this.collection, 'remove', this.render);
        this.listenTo(this.collection, 'add', this.render);
        this.model = options.model;
        this.getPriceLevelTimes();
    },

    render: function () {
        var that = this;
        this.$el.html(this.template({
            priceLevelTimes: this.collection.toJSON(),
        }));

        $(document).ready(function(){
            $('.modal').modal();
        });
        App.breadCrumbToolTip = "Set specific times or days for your current price level to change";     
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
        this.formModal = this.$el.find('#price-level-times-form-modal').modal();
        return this;
    },

    editPriceLevelTime: function (e) {
        var that = this;
        var element = $(e.currentTarget);
        var id = $(element).attr('data-id');
        if (this.collection.get(id) !== null && this.collection.get(id) !== '') {
            this.priceLevelTimesFormView = new PriceLevelTimesFormView({
                template: this.priceLevelTimesFormTemplate,
                model: this.collection.get(id),
            });

            this.$el.find('#price-level-times-form-modal').html(this.priceLevelTimesFormView.render().el);
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
    
    getPriceLevelTimes: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-price-level-times',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.priceLevelTimes = data.results;
                that.generatePriceLevelStyleMapping(data.results);
                that.renderPriceLevelTimes(data.results);
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

    renderPriceLevelTimes: function (data) {
        var that = this;
        data.sort(function (a, b) {
            return a.id < b.id ? -1 : (a.id > b.id ? 1 : 0);
        });
        var collection = new PriceLevelTimesCollection();
        for (var i = 0; i < data.length; i++) {
            var currentPriceLevel = data[i];
            currentPriceLevel.cardStyleClass = that.priceLevelStyleMapping[data[i].id];
            
            collection.add(new PriceLevelTimes(currentPriceLevel));
        }
        that.fullCollection = collection;
        that.collection.reset(collection.models);
    },

    generatePriceLevelStyleMapping: function (data) {
        var priceLevel = [];
        var totalStyles = this.styles.length;
        var currentStyle = 0;
        for (var i = 0; i < data.length; i++) {
            if (priceLevel.indexOf(data[i].id) < 0) {
                priceLevel.push(data[i].id);
                this.priceLevelStyleMapping[data[i].id] = this.styles[currentStyle];
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
        var priceLevel = this.$el.find("#price-level-dropdown").val();
        var priceStart = this.$el.find("#start").val();
        var priceEnd = this.$el.find("#end").val();
        var monday = this.$el.find('#mon:checked').length > 0;
        var tuesday = this.$el.find('#tue:checked').length > 0;
        var wednesday = this.$el.find('#wed:checked').length > 0;
        var thursday = this.$el.find('#thu:checked').length > 0;
        var friday = this.$el.find('#fri:checked').length > 0;
        var saturday = this.$el.find('#sat:checked').length > 0;
        var sunday = this.$el.find('#sun:checked').length > 0;

        var updatedModel = {
            id: id,
            priceLevel: priceLevel,
            priceStart: priceStart,
            priceEnd: priceEnd,
            monday: monday,
            tuesday: tuesday,
            wednesday: wednesday,
            thursday: thursday,
            friday: friday,
            saturday: saturday,
            sunday: sunday,
        };



        this.priceLevelTimesFormView.model.set(updatedModel);
    },

    addPriceLevelTime: function () {
        var priceLevelTimes = new PriceLevelTimes();
        this.priceLevelTimesFormView = new PriceLevelTimesFormView({
            template: this.priceLevelTimesFormTemplate,
            model: priceLevelTimes,
        });

        this.$el.find('#price-level-times-form-modal').html(this.priceLevelTimesFormView.render().el);
        this.$el.find('select').formSelect();
        this.$el.find("select[required]").css({
            display: "block", 
            position: 'absolute',
            visibility: 'hidden'
        });  
        this.formModal.modal('open');
    },

    deletionModal: function (e) {
        $('#delete-price-level-time-modal').modal().modal('open');
    },

    deletePriceLevelTime: function(e) {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/delete-price-level-times',
            type: 'POST',
            data: {
                selectedPriceLevelTime: that.priceLevelTimesFormView.model.attributes.id,
                token: sessionToken
            },
            method: 'POST',
            success: function (data) {
                that.collection.remove(that.priceLevelTimesFormView.model.attributes.id);
                
                M.toast({ html: '{Literal}Price Level Time deleted successfully{/Literal}' });
            },

            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem deleting this price level time{/Literal}' });
                }
            }
        });
    },

    savePriceLevelTime: function (){
        var that = this;
        var updateCollection = that.collection;

        this.getFormValues();
        var sessionToken = this.getCookie();

        $.ajax({
            url: '/data/save-price-level-times',
            data: {
                priceLevelTime: JSON.stringify(that.priceLevelTimesFormView.model.toJSON()),
                priceStart: that.priceLevelTimesFormView.model.attributes.priceStart,
                priceEnd: that.priceLevelTimesFormView.model.attributes.priceEnd,
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',

            success: function (data) {
                newModel = (that.priceLevelTimesFormView.model);
                updateCollection.add(newModel);
                that.render();
                M.toast({ html: '{Literal}Settings saved successfully{/Literal}' });
            },

            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem saving this price level time{/Literal}' });
                }
            }
        });
    }
});