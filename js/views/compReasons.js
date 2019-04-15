var CompReasonsView = Backbone.View.extend({
    fullCollection: {},
    formModal: null,
    deletionModal: {},
    editedCollecton: {},
    isAdded: false,
    paymentTypeMapping: {},

    events: {
        'click .card-panel-entity': 'highlightCard',
        'click .edit-comp-reasons-trigger': 'editCompReason',
        'click .save-button': 'saveCompReason',
        'click .delete-button': 'deletionModal',
        'click #delete-comp-reason-confirm': 'deleteCompReason',
        'click #add-comp-reason': 'addCompReason'
    },

    breadcrumb: {},

    styles: [
        'ap-blue',
        '#31619e'
    ],

    inventoryStyleMapping: {},

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.compReasonsFormTemplate = options.compReasonsFormTemplate; 
        this.breadcrumb = options.breadcrumb;
        this.collection = options.collection;
        this.listenTo(this.collection, 'reset', this.render);
        this.listenTo(this.collection, 'remove', this.render);
        this.listenTo(this.collection, 'add', this.render);
        this.model = options.model;
        this.initCompReasons();
    },

    render: function () {
        var that = this;
        this.$el.html(this.template({
            compReasons: this.collection.toJSON(),
        }));
        
        var that = this;

        App.breadCrumbToolTip = "Set reasons to compensate an order";
        
        $(document).ready(function(){
            $('.tooltipped').tooltip({delay: 0});
            $('.modal').modal();
        });
            
        App.setBreadcrumbs(this.breadcrumb);

        $(document).on('keydown', 'input, select', function(e) {
            var self = $(this)
              , form = self.parents('form:eq(0)')
              , focusable
              , next
              ;
            if (e.keyCode == 13) {
                that.$el.find(".save-button").trigger("click");
                return false;
            }
        });

        $('.tooltipped').tooltip();
        this.formModal = this.$el.find('#comp-reasons-form-modal').modal();
        return this;
    },

    editCompReason: function (e) {
        var element = $(e.currentTarget);
        var id = $(element).attr('data-id');
        
        if (this.collection.get(id) !== null && this.collection.get(id) !== '') {
            this.compReasonsFormView = new CompReasonsFormView({
                template: this.compReasonsFormTemplate,
                model: this.collection.get(id),
            });

            this.$el.find('#comp-reasons-form-modal').html(this.compReasonsFormView.render().el);
            this.formModal.modal('open');
        }
        else {
            M.toast({ html: '{Literal}There was a problem fetching data from the server{/Literal}' });
        }
    },

    addCompReason: function (e) {
        this.isAdded = true;
        var compReasons = new CompReasons();
        this.compReasonsFormView = new CompReasonsFormView({
            template: this.compReasonsFormTemplate,
            model: compReasons
        });

        this.$el.find('#comp-reasons-form-modal').html(this.compReasonsFormView.render().el);
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

    initCompReasons: function () {
        this.getCompReasons();
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

    compReasons: [],

    getCompReasons: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-comp-reasons',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                for (var i = 0; i < data.results.length; i++) {
                    that.compReasons.push({id: i, compReason: data.results[i], originalCompReason: data.results[i]}) 
                }
                that.generateCompReasonsStyleMapping(that.compReasons);
                that.renderCompReasons(that.compReasons);  
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

    renderCompReasons: function (data) {
        var that = this;
        
        data.sort(function (a, b) {
            return a.compReason.toLowerCase() < b.compReason.toLowerCase() ? -1 : (a.compReason.toLowerCase() > b.compReason.toLowerCase() ? 1 : 0);
        });
        var collection = new CompReasonsCollection();
        for (var i = 0; i < data.length; i++) {
            var currentCompReason = data[i];
            currentCompReason.cardStyleClass = that.inventoryStyleMapping[data[i].id];
            
            collection.add(new CompReasons(currentCompReason));
        }
        that.fullCollection = collection;
        that.collection.reset(collection.models);
    },

    generateCompReasonsStyleMapping: function (data) {
        var inventory = [];
        var totalStyles = this.styles.length;
        var currentStyle = 0;
        for (var i = 0; i < data.length; i++) {
            if (inventory.indexOf(data[i].id) < 0) {
                inventory.push(data[i].id);
                this.inventoryStyleMapping[data[i].id] = this.styles[currentStyle];
                if (currentStyle < totalStyles - 1) {
                    currentStyle++;
                } else {
                    currentStyle = 0;
                }
            }
        }
    },

    getFormValues: function () {
        var id = this.$el.find('#id').val();
        var compReason = this.$el.find('#compReason').val();
        if (id == "" || id == undefined || id == null) {
            id = this.collection.length
        }
        if (this.isAdded) {
           
            var updatedModel = {
                id: id,
                compReason: compReason,
                isAdded: true
            };
            this.isAdded = false;
        }
        else {
            var updatedModel = {
                id: id,
                compReason: compReason,
                isAdded: false
            };
        }

        this.editedCollecton = new CompReasonsCollection();
        this.compReasonsFormView.model.set(updatedModel);
        this.editedCollecton.add(this.compReasonsFormView.model); 
    },

    validateForm: function () {
        var valid = true;

        var validateCompReason = this.$el.find("#compReason").val();
        if (validateCompReason.trim().length < 1) {
            this.$el.find("#qtyReceived").addClass("invalid");
            valid = false;
        }
        else
        {
            iChars = "`~@$%^*()_+=[]{}:;,<>./?*\\\'\"";
            for (var i = 0; i < validateCompReason.length; i++) {
                if (iChars.indexOf(validateCompReason.charAt(i)) != -1) {
                    this.$el.find("#compReason").addClass("invalid");
                    valid = false;
                    break;
                }
            }
        }

        return valid;
    },

    deletionModal: function (e) {
        var that = this;
        var element = $(e.currentTarget);
        var compReasonId = $(element).attr('data-id');
        $("#delete-comp-reason-id").val(compReasonId);
        $('#delete-comp-reason-modal').modal().modal('open');
    },

    deleteCompReason: function(e) {
        var that = this;
        var element = $(e.currentTarget);
        var compReasonId = $(element).attr("data-comp-reason-id");
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/delete-comp-reasons',
            data: {
                originalCompReason: (that.compReasonsFormView.model.attributes.originalCompReason),
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',

            success: function (data) {
                that.collection.remove(compReasonId);
                M.toast({ html: '{Literal}Comp Reason removed successfully{/Literal}' });
                        
                that.render();
            },

            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem removing this comp reason item{/Literal}' });
                }
            }
        });
    },

    saveCompReason: function (){
        var that = this;
        var validation = this.validateForm();
        var updateCollection = that.collection;
        if (validation) {
            this.getFormValues();
            var that = this;
            var updateCollection = that.collection;
            var sessionToken = this.getCookie();

            $.ajax({
                url: '/data/save-comp-reasons',
                data: {
                    isAdded: (that.compReasonsFormView.model.attributes.isAdded),
                    originalCompReason: (that.compReasonsFormView.model.attributes.originalCompReason),
                    newCompReason: (that.compReasonsFormView.model.attributes.compReason),
                    token: sessionToken
                },
                dataType: 'json',
                type: 'POST',

                success: function (data) {
                    if (data.success) {
                        newModel = (that.compReasonsFormView.model);
                        updateCollection.add(newModel);
                        M.toast({ html: '{Literal}Settings saved successfully{/Literal}' });
                        that.render();
                    }

                },

                error: function (e) {
                    if (e.status == 523) {
                        window.location.href = "#/log-in";
                        location.reload();
                    }
                    else {
                        M.toast({ html: '{Literal}There was a problem saving this comp reason item{/Literal}' });
                    }
                }
            });
        }
    }
});