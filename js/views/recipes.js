var RecipesView = Backbone.View.extend({
    fullCollection: {},
    formModal: null,
    deletionModal: {},

    events: {
        'click .card-panel-entity': 'highlightCard',
        'click .edit-recipes-trigger': 'editRecipes',
        'click #add-recipes-button': 'addRecipes',
        'click .save-button': 'saveRecipes',
        'click .delete-button': 'deletionModal',
        'click #delete-recipes-confirm': 'deleteRecipeItem',
        'keyup #id' : 'validateForm',
        'keyup #name' : 'validateForm',
        'keyup #priceAfter' : 'validateForm',
    },

    breadcrumb: {},

    styles: [
        'ap-blue',
    ],

    recipesStyleMapping: {},

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.recipesFormTemplate = options.recipesFormTemplate;
        this.breadcrumb = options.breadcrumb;
        this.collection = options.collection;
        this.listenTo(this.collection, 'reset', this.render);
        this.listenTo(this.collection, 'remove', this.render);
        this.listenTo(this.collection, 'add', this.render);
        this.model = options.model;
        this.initRecipes();
    },

    render: function () {
        var that = this;
        this.$el.html(this.template({
            recipes: this.collection.toJSON(),
        }));

        $(document).ready(function(){
            $('.modal').modal();
        });

        App.breadCrumbToolTip = "Set items to be taken out of inventory when they apart of a recipe item";

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
        this.formModal = this.$el.find('recipes-form-modal').modal();
        return this;
    },

    editRecipes: function (e) {
        var element = $(e.currentTarget);
        var masterItemId = $(element).attr('data-id');  
        
        for(var i = 0; i < this.collection.length; i++) { 
            if (this.collection.models[i].attributes.id == masterItemId) {
                var model = this.collection.models[i];
                
                this.recipesFormView = new RecipesFormView({
                    template: this.recipesFormTemplate,
                    model: model,
                    newGroup: false,
                });
                this.$el.find('#recipes-form-modal').html(this.recipesFormView.render().el);
                this.$el.find('#recipes-form-modal').modal("open")
                break;
            }
        }
    },

    addRecipes: function () {
        var recipes = new Recipes();
        this.recipesFormView = new RecipesFormView({
            template: this.recipesFormTemplate,
            model: recipes
        });

        this.$el.find('#recipes-form-modal').html(this.recipesFormView.render().el);
        this.$el.find('select').formSelect();
        this.$el.find("select[required]").css({
            display: "block", 
            position: 'absolute',
            visibility: 'hidden'
        });  
        this.$el.find('#recipes-form-modal').modal("open")
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

    initRecipes: function () {
        this.getRecipes();
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

    getRecipes: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-recipe-items',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.generateRecipesStyleMapping(data.itemRecipes);
                that.renderRecipes(data.itemRecipes);
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

    renderRecipes: function (data) {
        var that = this;
        data.sort(function (a, b) {
            return a.id.toLowerCase() < b.id.toLowerCase() ? -1 : (a.id.toLowerCase() > b.id.toLowerCase() ? 1 : 0);
        });
        var collection = new RecipesCollection();
        for (var i = 0; i < data.length; i++) {
            var currentRecipes = data[i];
            currentRecipes.cardStyleClass = that.recipesStyleMapping[data[i].id];    
            collection.add(new Recipes(currentRecipes));
        }
        that.fullCollection = collection;
        that.collection.reset(collection.models);
    },

    generateRecipesStyleMapping: function (data) {
        var recipes = [];
        var totalStyles = this.styles.length;
        var currentStyle = 0;
        
        for (var i = 0; i < data.length; i++) {
            if (recipes.indexOf(data[i].id) < 0) {
                recipes.push(data[i].id);
                this.recipesStyleMapping[data[i].id] = this.styles[currentStyle];
                if (currentStyle < totalStyles - 1) {
                    currentStyle++;
                } else {
                    currentStyle = 0;
                }
            }
        }
    },

    getFormValues: function () {
        var that = this;
        var masterItemId = this.recipesFormView.model.attributes.id;
        var name = this.$el.find('#description').val();
        var priceAfter = this.$el.find('#priceAfter').val();

        var itemTable = [];
        var qtyArray = [];
        var itemNameArray = [];
        var detailItemArray = [];
        var itemIdArray = [];
        var isAdd = [];

        this.$el.find('.quantities').each(function() {
            var currentQty = $(this).val();
            qtyArray.push(currentQty);
        });

        this.$el.find('.itemId').each(function() {
            var currentId = $(this).html();
            itemIdArray.push(currentId);                
        });

        this.$el.find('.detailItem').each(function() {
            var currentId = $(this).html();
            detailItemArray.push(currentId);                
        });

        this.$el.find('.isAdd').each(function() {
            if ($(this)[0].textContent == 'true') { 
                var isAdded = true;
                isAdd.push(isAdded);       
            }
            else {
                var isAdded = false;
                isAdd.push(isAdded);    
            }         
        });

        for (i = 0; i < document.getElementById("itemTable").rows.length - 2; i++){ 
                var getQty = qtyArray[i];
                var getItemId = itemIdArray[i]
                var getDetailItem = detailItemArray[i]
                var getIsAdd = isAdd[i];
                itemTable.push({
                    detailItem: getDetailItem,
                    quantity: getQty,
                    id: getItemId,
                    masterItem: masterItemId,
                    isAdd: getIsAdd
                });
            }

        var updatedModel = {
            id: masterItemId,
            description: name,
            detailItems: itemTable
        }
        this.recipesFormView.model.set(updatedModel);
        return updatedModel;
    },

    deletionModal: function (e) {
        var that = this;
        var element = $(e.currentTarget);
        var recipesId = $(element).attr('data-id');
        $("#delete-recipes-id").val(recipesId);
        $('#delete-recipes-modal').modal().modal('open');
    },

    deleteRecipeItem: function(e) {
        var element = $(e.currentTarget);
        var recipesId = $(element).attr("data-recipes-item-id");
        var that = this;

        if (recipesId !== null) {
            var sessionToken = this.getCookie();
            $.ajax({
                url: '/data/delete-recipe-item',
                type: 'POST',
                data: {
                    id: recipesId,
                    token: sessionToken
                },

                success: function (data) {
                    var success = false;
                    if (typeof data.results !== 'undefined' && typeof data.results.success !== 'undefined') {
                        success = data.results.success;
                    }
                    if (success !== null) {
                        M.toast({ html: '{Literal}Recipe Item deleted successfully{/Literal}' });
                        that.collection.remove(recipesId);
                    }
                    location.reload();
                },

                error: function (e) {
                    if (e.status == 523) {
                        window.location.href = "#/log-in";
                        location.reload();
                    }
                    else {
                        M.toast({ html: '{Literal}There was a problem deleting this recipe items{/Literal}' });
                    }
                }
            });
        }
    },

    saveRecipes: function (){
        var recipeItem;
        var that = this;
        var updateCollection = that.collection;
        
        if (0==0) {
            var formValues = this.getFormValues();
            var sessionToken = this.getCookie();
            $.ajax({
                url: '/data/save-recipe-item',
                data: {
                    recipeItem: JSON.stringify(that.recipesFormView.model.toJSON()),
                    addNewRecipeItem: that.recipesFormView.newRecipeItem,
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
                        var m = that.recipesFormView.model;
                        updateCollection.add(m);
                    }
                    that.formModal.modal('close');
                    M.toast({ html: '{Literal}Recipe Item saved successfully{/Literal}' });
                },
    
                error: function (e) {
                    if (e.status == 523) {
                        window.location.href = "#/log-in";
                        location.reload();
                    }
                    else {
                        M.toast({ html: '{Literal}There was a problem saving this recipe item{/Literal}' });
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