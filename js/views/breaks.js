var BreaksView = Backbone.View.extend({
    fullCollection: {},
    formModal: null,
    deletionModal: {},    
    payTypes: {},
    events: {
        'click .card-panel-entity': 'highlightCard',
        'click .edit-break-trigger': 'editBreak',
        'click #add-break-button': 'addBreak',
        'click .save-button': 'saveBreak',
        'click .delete-button': 'deletionModal',
        'click #delete-break-confirm': 'deleteBreak'
    },

    breadcrumb: {},

    styles: [
        'ap-blue',
        '#31619e'
    ],

    breaksStyleMapping: {},

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.breaksFormTemplate = options.breaksFormTemplate;
        this.breadcrumb = options.breadcrumb;
        this.collection = options.collection;
        this.listenTo(this.collection, 'reset', this.render);
        this.listenTo(this.collection, 'remove', this.render);
        this.listenTo(this.collection, 'add', this.render);
        this.model = options.model;
        this.getBreaks();
    },

    render: function () {
        var that = this;
        this.$el.html(this.template({
            breaks: this.collection.toJSON(),
        }));

        $(document).ready(function(){
            $('.modal').modal();
        });
        App.breadCrumbToolTip = "Define break types for your Employees";     
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
        this.formModal = this.$el.find('#breaks-form-modal').modal();
        return this;
    },

    editBreak: function (e) {
        var that = this;
        var element = $(e.currentTarget);
        var id = $(element).attr('data-id');
        if (this.collection.get(id) !== null && this.collection.get(id) !== '') {
            this.breaksFormView = new BreaksFormView({
                template: this.breaksFormTemplate,
                model: this.collection.get(id)
            });

            this.$el.find('#breaks-form-modal').html(this.breaksFormView.render().el);
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
    
    getBreaks: function () {
        if (App.serverInfo.hasAccuShift) {
            var that = this;
            var sessionToken = this.getCookie();
            $.ajax({
                url: '/data/get-breaks',
                data: {
                    token: sessionToken
                },
                dataType: 'json',
                type: 'POST',
                success: function (data) {
                    that.breaks = data.results;
                    that.generateBreaksStyleMapping(that.breaks);
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

    renderBreaks: function (data) {
        var that = this;
        var collection = new BreaksCollection();

        for (var i = 0; i < Object.keys(data).length; i++) {
            var currentBreak = data[i];
            currentBreak.cardStyleClass = that.breaksStyleMapping[data[i].id];
            collection.add(new Breaks(currentBreak));

        }
        that.fullCollection = collection;
        that.collection.reset(collection.models);
    },

    generateBreaksStyleMapping: function (data) {
        var breaks = [];
        var totalStyles = this.styles.length;
        var currentStyle = 0;
        
        for (var i = 0; i < data.length; i++) {
            if (breaks.indexOf(data[i].id) < 0) {
                breaks.push(data[i].id);
                this.breaksStyleMapping[data[i].id] = this.styles[currentStyle];
                if (currentStyle < totalStyles - 1) {
                    currentStyle++;
                } else {
                    currentStyle = 0;
                }
            }
        }
        this.renderBreaks(this.breaks);
    },

    getFormValues: function () {
        var that = this;
        var id = this.$el.find("#id").val();
        var type = this.$el.find("#type").val();
        var isPaid = this.$el.find('#isPaid:checked').length > 0;
        var breakTime = this.$el.find("#breakTime").val();
        var minimumTime = this.$el.find("#minimumTime").val();
        var appliesAfter = this.$el.find("#appliesAfter").val();

        if (id == "") {
            var updatedModel = {
                id: Math.floor(Math.random() * 10000) + 1,
                type: type,
                isPaid: isPaid,
                breakTime: breakTime,
                minimumTime: minimumTime,
                appliesAfter: appliesAfter
            };
        }
        else {
            var updatedModel = {
                id: id,
                type: type,
                isPaid: isPaid,
                breakTime: breakTime,
                minimumTime: minimumTime,
                appliesAfter: appliesAfter
            };
        }

        this.breaksFormView.model.set(updatedModel);
        return updatedModel;
    },

    addBreak: function () {
        var newBreak = new Breaks();
        this.breaksFormView = new BreaksFormView({
            template: this.breaksFormTemplate,
            model: newBreak
        });

        this.$el.find('#breaks-form-modal').html(this.breaksFormView.render().el);
        this.$el.find('select').formSelect();
        this.$el.find("select[required]").css({
            display: "block", 
            position: 'absolute',
            visibility: 'hidden'
        });  
        this.formModal = this.$el.find('#breaks-form-modal').modal();
        this.formModal.modal('open');
    },

    deletionModal: function (e) {
        $('#delete-break-modal').modal().modal('open');
    },

    deleteBreak: function(e) {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/remove-break',
            type: 'POST',
            data: {
                token: sessionToken,
                breakId: that.breaksFormView.model.attributes.id,
                
            },
            method: 'POST',
            success: function (data) {
                that.collection.remove(that.breaksFormView.model.attributes.id);
                
                M.toast({ html: '{Literal}Break removed successfully{/Literal}' });
                that.render();
            },

            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem deleting this Break{/Literal}' });
                }
            }
        });
        this.render();
    },

    saveBreak: function (){
        var that = this;
        var updateCollection = that.collection;

        var formValues = this.getFormValues();
        var sessionToken = this.getCookie();

        $.ajax({
            url: '/data/save-breaks',
            data: {
                token: sessionToken,
                break: JSON.stringify(formValues),
            },
            dataType: 'json',
            type: 'POST',

            success: function (data) {
                that = (that.breaksFormView.model);
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