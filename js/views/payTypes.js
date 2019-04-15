var PayTypesView = Backbone.View.extend({
    fullCollection: {},
    formModal: null,
    deletionModal: {},    
    payTypes: {},
    events: {
        'click .card-panel-entity': 'highlightCard',
        'click .edit-pay-type-trigger': 'editPayType',
        'click #add-pay-types-button': 'addPayType',
        'click .save-button': 'savePayType',
        'click .delete-pay-type-button': 'deletionModal',
        'click #delete-pay-type-confirm': 'deletePayType'
    },

    breadcrumb: {},

    styles: [
        'ap-blue',
        '#31619e'
    ],

    payTypesStyleMapping: {},

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.payTypesFormTemplate = options.payTypesFormTemplate;
        this.breadcrumb = options.breadcrumb;
        this.collection = options.collection;
        this.listenTo(this.collection, 'reset', this.render);
        this.listenTo(this.collection, 'remove', this.render);
        this.listenTo(this.collection, 'add', this.render);
        this.model = options.model;
        this.getPayTypes();
    },

    render: function () {
        var that = this;
        this.$el.html(this.template({
            payTypes: this.collection.toJSON(),
        }));

        $(document).ready(function(){
            $('.modal').modal();
        });
        App.breadCrumbToolTip = "Define Pay Levels for your Employees";     
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
        this.formModal = this.$el.find('#pay-types-form-modal').modal();
        return this;
    },

    editPayType: function (e) {
        var that = this;
        var element = $(e.currentTarget);
        var id = $(element).attr('data-id');
        if (this.collection.get(id) !== null && this.collection.get(id) !== '') {
            this.payTypesFormView = new PayTypesFormView({
                template: this.payTypesFormTemplate,
                model: this.collection.get(id)
            });

            this.$el.find('#pay-types-form-modal').html(this.payTypesFormView.render().el);
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
    
    getPayTypes: function () {
        if (App.serverInfo.hasAccuShift) {
            var that = this;
            var sessionToken = this.getCookie();
            $.ajax({
                url: '/data/get-pay-types',
                data: {
                    token: sessionToken
                },
                dataType: 'json',
                type: 'POST',
                success: function (data) {
                    for ( var key in data.results ) {
                        if (data.results[key] != "") {
                            that.payTypes[key] = data.results[key];
                        }
                    }
    
                    that.generatePayTypeStyleMapping(that.payTypes);
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
        }
        else {
            M.toast({ html: '{Literal}Your account does not have AccuShift{/Literal}' });
        }
    },

    renderPayTypes: function (data) {
        var that = this;
        var collection = new PayTypesCollection();

        for (var i = 0; i < Object.keys(data).length; i++) {
            var currentPayType = {};
            currentPayType.id = i;
            currentPayType.name = that.payTypes[i]
            collection.add(new PayTypes(currentPayType));

        }
        that.fullCollection = collection;
        that.collection.reset(collection.models);
    },

    generatePayTypeStyleMapping: function (data) {
        var payTypes = [];
        var totalStyles = this.styles.length;
        var currentStyle = 0;
        
        for (var i = 0; i < data.length; i++) {
            if (payTypes.indexOf(data[i].id) < 0) {
                payTypes.push(data[i].id);
                this.payTypesStyleMapping[data[i].id] = this.styles[currentStyle];
                if (currentStyle < totalStyles - 1) {
                    currentStyle++;
                } else {
                    currentStyle = 0;
                }
            }
        }
        this.renderPayTypes(this.payTypes);
    },

    getFormValues: function () {
        var that = this;
        var id = this.$el.find("#id").val();
        var name = this.$el.find("#name").val();
        var originalName = this.$el.find("#originalName").val();

        if (id == "") {
            var size = 0, key;
            for (key in this.payTypes) {
                if (this.payTypes.hasOwnProperty(key)) size++;
            }

            var updatedModel = {
                id: size,
                name: name,
                originalName: originalName,
                isAdded: true
            };
        }
        else {
            var updatedModel = {
                id: id,
                name: name,
                originalName: originalName,
                isAdded: false
            };
        }

        this.payTypesFormView.model.set(updatedModel);
    },

    addPayType: function () {
        if (this.collection.length < 20) {
            var payType = new PayTypes();
            this.payTypesFormView = new PayTypesFormView({
                template: this.payTypesFormTemplate,
                model: payType
            });
    
            this.$el.find('#pay-types-form-modal').html(this.payTypesFormView.render().el);
            this.$el.find('select').formSelect();
            this.$el.find("select[required]").css({
                display: "block", 
                position: 'absolute',
                visibility: 'hidden'
            });  
            this.formModal.modal('open');
        }
        else {
            M.toast({ html: '{Literal}You cannot have more than 20 pay types{/Literal}' });
        }
    },

    deletionModal: function (e) {
        $('#delete-pay-type-modal').modal().modal('open');
    },

    deletePayType: function(e) {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/remove-pay-type',
            type: 'POST',
            data: {
                payType: that.payTypesFormView.model.attributes.name,
                token: sessionToken
            },
            method: 'POST',
            success: function (data) {
                that.collection.remove(that.payTypesFormView.model.attributes.id);
                
                M.toast({ html: '{Literal}Pay Type deleted successfully{/Literal}' });
                that.render();
            },

            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem deleting this Pay Type{/Literal}' });
                }
            }
        });
        this.render();
    },

    savePayType: function (){
        var that = this;
        var updateCollection = that.collection;

        this.getFormValues();
        var sessionToken = this.getCookie();

        $.ajax({
            url: '/data/save-pay-type',
            data: {
                newPayType: that.payTypesFormView.model.attributes.name,
                originalPayType: that.payTypesFormView.model.attributes.originalName,
                isAdded: that.payTypesFormView.model.attributes.isAdded,
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',

            success: function (data) {
                that = (that.payTypesFormView.model);
                updateCollection.add(that);
                M.toast({ html: '{Literal}Settings saved successfully{/Literal}' });
            },

            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem saving this Pay Type{/Literal}' });
                }
            }
        });

        this.render();
    }
});