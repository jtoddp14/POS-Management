var OperatorMessagesView = Backbone.View.extend({
    fullCollection: {},
    formModal: null,
    deletionModal: {},
    itemTypes: {},
    taxAuthorities: {},

    events: {
        'click .card-panel-entity': 'highlightCard',
        'click .edit-operator-message-trigger': 'editOperatorMessage',
        'click #add-operator-message-button': 'addOperatorMessage',
        'click .save-button': 'saveOperatorMessage',
        'click .delete-operator-message-button': 'deletionModal',
        'click #delete-operator-message-confirm': 'deleteOperatorMessage'
    },

    breadcrumb: {},

    styles: [
        'ap-blue',
        '#31619e'
    ],

    operatorMessagesStyleMapping: {},

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.operatorMessagesFormTemplate = options.operatorMessagesFormTemplate;
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
            operatorMessages: this.collection.toJSON(),
        }));

        $(document).ready(function(){
            $('.modal').modal();
        });
        App.breadCrumbToolTip = "Set specific items or item types to pop up a message on your POS when added to an order";     
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
        this.formModal = this.$el.find('#operator-message-form-modal').modal();
        return this;
    },

    editOperatorMessage: function (e) {
        var that = this;
        var element = $(e.currentTarget);
        var id = $(element).attr('data-id');
        if (this.collection.get(id) !== null && this.collection.get(id) !== '') {
            this.operatorMessagesFormView = new OperatorMessagesFormView({
                template: this.operatorMessagesFormTemplate,
                model: this.collection.get(id),
                itemTypes: this.itemTypes,
            });

            this.$el.find('#operator-message-form-modal').html(this.operatorMessagesFormView.render().el);
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
                that.getOperatorMessages();
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

    getOperatorMessages: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-operator-messages',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                for (var i = 0; i < data.results.length; i++) {
                    data.results[i].id += i; 
                }
                that.generateOperatorMessagesStyleMapping(data.results);
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

    renderOperatorMessages: function (data) {
        var that = this;
        data.sort(function (a, b) {
            return a.id < b.id ? -1 : (a.id > b.id ? 1 : 0);
        });
        var collection = new OperatorMessagesCollection();
        for (var i = 0; i < data.length; i++) {
            data[i].id = i;
            var currentTax = data[i];
            currentTax.cardStyleClass = that.operatorMessagesStyleMapping[data[i].id];
            
            collection.add(new OperatorMessages(currentTax));
        }
        that.fullCollection = collection;
        that.collection.reset(collection.models);
    },

    generateOperatorMessagesStyleMapping: function (data) {
        var taxes = [];
        var totalStyles = this.styles.length;
        var currentStyle = 0;
        for (var i = 0; i < data.length; i++) {
            if (taxes.indexOf(data[i].id) < 0) {
                taxes.push(data[i].id);
                this.operatorMessagesStyleMapping[data[i].id] = this.styles[currentStyle];
                if (currentStyle < totalStyles - 1) {
                    currentStyle++;
                } else {
                    currentStyle = 0;
                }
            }
        }

        this.renderOperatorMessages(data);
    },

    getFormValues: function () {
        var that = this;
        var id = this.$el.find("#id").val();
        var itemType = this.$el.find('#item-type-dropdown option:selected').text();
        var message = this.$el.find("#message").val();
        var originalMessage = this.$el.find("#originalMessage").val();

        if (id == "" || id == 0) {
            var updatedModel = {
                id: Math.floor(Math.random() * 1000) + 1,
                itemType: itemType,
                message: message,
            };
        }
        else {
            var updatedModel = {
                id: id,
                itemType: itemType,
                message: message,
            };
        }

        this.operatorMessagesFormView.model.set(updatedModel);
    },

    addOperatorMessage: function () {
        var alternativeTaxes = new OperatorMessages();
        this.operatorMessagesFormView = new OperatorMessagesFormView({
            template: this.operatorMessagesFormTemplate,
            model: alternativeTaxes,
            itemTypes: this.itemTypes,
        });

        this.$el.find('#operator-message-form-modal').html(this.operatorMessagesFormView.render().el);
        this.$el.find('select').formSelect();
        this.$el.find("select[required]").css({
            display: "block", 
            position: 'absolute',
            visibility: 'hidden'
        });  
        this.formModal.modal('open');
    },

    deletionModal: function (e) {
        $('#delete-operator-message-modal').modal().modal('open');
    },

    deleteOperatorMessage: function(e) {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/delete-operator-message',
            type: 'POST',
            data: {
                itemType: that.operatorMessagesFormView.model.attributes.itemType,
                token: sessionToken
            },
            method: 'POST',
            success: function (data) {
                that.collection.remove(that.operatorMessagesFormView.model.attributes.id);
                
                M.toast({ html: '{Literal}Operator Message deleted successfully{/Literal}' });
                that.render();
            },

            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem deleting this Operator Message{/Literal}' });
                }
            }
        });
        this.render();
    },

    saveOperatorMessage: function (){
        var that = this;
        var updateCollection = that.collection;

        this.getFormValues();
        var sessionToken = this.getCookie();

        $.ajax({
            url: '/data/save-operator-message',
            data: {
                itemType: (that.operatorMessagesFormView.model.attributes.itemType),
                newOperatorMessage: (that.operatorMessagesFormView.model.attributes.message),
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',

            success: function (data) {
                that = (that.operatorMessagesFormView.model);
                updateCollection.add(that);
                M.toast({ html: '{Literal}Settings saved successfully{/Literal}' });
            },

            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem saving this Operator Message{/Literal}' });
                }
            }
        });

        this.render();
    }
});