var UnitsOfMeasureView = Backbone.View.extend({
    fullCollection: {},
    formModal: null,
    deletionModal: {},
    tableMapping: [],
    tableMapping2: [],

    events: {
        'click .card-panel-entity': 'highlightCard',
        'click .edit-units-of-measure-trigger': 'editUnitsOfMeasure',
        'click #add-units-of-measure-button': 'addUnitsOfMeasure',
        'click .save-button': 'saveUnitsOfMeasure',
        'click .delete-button': 'deletionModal',
        'click #delete-units-of-measure-confirm': 'deleteUnitsOfMeasure',
        'change #fraction-dropdown' : 'chooseFraction',
    },

    breadcrumb: {},

    styles: [
        'ap-blue',
    ],

    unitsOfMeasureStyleMapping: {},

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.unitsOfMeasureFormTemplate = options.unitsOfMeasureFormTemplate;
        this.breadcrumb = options.breadcrumb;
        this.collection = options.collection;
        this.listenTo(this.collection, 'reset', this.render);
        this.listenTo(this.collection, 'remove', this.render);
        this.listenTo(this.collection, 'add', this.render);
        this.model = options.model;
        this.initUnits();
    },

    render: function () {
        var that = this;
        this.$el.html(this.template({
            unitsOfMeasure: this.collection.toJSON(),
        }));

        $(document).ready(function(){
            $('.modal').modal();
            $('.tooltipped').tooltip()
        });
        App.breadCrumbToolTip = "Whenver you scan an item of your choosing, inventory of another item is also taken out";     
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
        this.formModal = this.$el.find('#units-of-measure-form-modal').modal();
        return this;
    },

    editUnitsOfMeasure: function (e) {
        var element = $(e.currentTarget);
        var id = $(element).attr('data-id');

        if (this.collection.get(id) !== null && this.collection.get(id) !== '') {
            this.unitsOfMeasureFormView = new UnitsOfMeasureFormView({
                template: this.unitsOfMeasureFormTemplate,
                model: this.collection.get(id),
            });


            this.$el.find('#units-of-measure-form-modal').html(this.unitsOfMeasureFormView.render().el);
            this.$el.find('select').formSelect();
            this.formModal.modal('open');
        }
        else {
            M.toast({ html: '{Literal}There was a problem fetching data from the server{/Literal}' });
        }
    },

    addUnitsOfMeasure: function () {
        var unitsOfMeasure = new UnitsOfMeasure();
        this.unitsOfMeasureFormView = new UnitsOfMeasureFormView({
            template: this.unitsOfMeasureFormTemplate,
            model: unitsOfMeasure,
        });

        this.$el.find('#units-of-measure-form-modal').html(this.unitsOfMeasureFormView.render().el);
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

    initUnits: function () {
        this.getUnits();
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

    getUnits: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-units-of-measure',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.unitsOfMeasure = data.results;
                that.getItemsFull(data.results);
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

    getItemsFull: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-items-full',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                var results = data.results;
                for (var i = 0; i < results.length; i++) {
                    that.tableMapping[results[i].id] = results[i].description;
                    that.tableMapping2[results[i].description] = results[i].id
                }

                that.generateUnitsOfMeasureStyleMapping(that.unitsOfMeasure);
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

    renderUnitsOfMeasure: function (data) {
        var that = this;
        data.sort(function (a, b) {
            return a.unit_of_measure.id.toLowerCase() < b.unit_of_measure.id.toLowerCase() ? -1 : (a.unit_of_measure.id.toLowerCase() > b.unit_of_measure.id.toLowerCase() ? 1 : 0);
        });
        var collection = new UnitsOfMeasureCollection();
        for (var i = 0; i < data.length; i++) {
            var currentUnitsOfMeasure = data[i].unit_of_measure;
            currentUnitsOfMeasure.itemDescription = that.tableMapping[currentUnitsOfMeasure.code];
            currentUnitsOfMeasure.stockingItemDescription = that.tableMapping[currentUnitsOfMeasure.stockingItem];
            currentUnitsOfMeasure.cardStyleClass = that.unitsOfMeasureStyleMapping[data[i].unit_of_measure.id];    
            collection.add(new UnitsOfMeasure(currentUnitsOfMeasure));
        }
        that.fullCollection = collection;
        that.collection.reset(collection.models);
    },

    generateUnitsOfMeasureStyleMapping: function (data) {
        var unitsOfMeasures = [];
        var totalStyles = this.styles.length;
        var currentStyle = 0;
        for (var i = 0; i < data.length; i++) {
            if (unitsOfMeasures.indexOf(data[i].unit_of_measure.id) < 0) {
                unitsOfMeasures.push(data[i].unit_of_measure.id);
                this.unitsOfMeasureStyleMapping[data[i].unit_of_measure.id] = this.styles[currentStyle];
                if (currentStyle < totalStyles - 1) {
                    currentStyle++;
                } else {
                    currentStyle = 0;
                }
            }
        }
        this.renderUnitsOfMeasure(this.unitsOfMeasure);
    },

    getFormValues: function () {
        var itemSearch1 = this.$el.find('#itemSearch1').val();
        var itemSearch2 = this.$el.find('#itemSearch2').val();

        var code = this.tableMapping2[itemSearch1];
        var quantity = this.$el.find('#quantity').val();
        var stockingItem = this.tableMapping2[itemSearch2];
       

        var updatedModel = {
            id: code,
            code: itemSearch1,
            quantity: quantity,
            stockingItem: stockingItem,
            stockingItemDescription: itemSearch2,
            itemDescription: itemSearch1
        };
        this.unitsOfMeasureFormView.model.set(updatedModel);
        return updatedModel;
    },

    deletionModal: function (e) {
        var that = this;
        var element = $(e.currentTarget);
        var unitsOfMeasureId = $(element).attr('data-id');
        $("#delete-units-of-measure-id").val(unitsOfMeasureId);
        $('#delete-units-of-measure-modal').modal().modal('open');
    },

    deleteUnitsOfMeasure: function(e) {
        var element = $(e.currentTarget);
        var unitsOfMeasureId = $(element).attr("data-units-of-measure-id");
        var that = this;

        if (unitsOfMeasureId !== null && unitsOfMeasureId !== '') {
            var sessionToken = this.getCookie();
            $.ajax({
                url: '/data/delete-units-of-measure',
                type: 'POST',
                data: {
                    unitsOfMeasureId: unitsOfMeasureId,
                    token: sessionToken
                },

                success: function (data) {
                    var success = false;
                    if (typeof data.results !== 'undefined' && typeof data.results.success !== 'undefined') {
                        success = data.results.success;
                    }
                    if (success !== null) {
                        that.collection.remove(unitsOfMeasureId);
                    }

                    M.toast({ html: '{Literal}Unit of Measure deleted successfully{/Literal}' });
                },

                error: function (e) {
                    if (e.status == 523) {
                        window.location.href = "#/log-in";
                        location.reload();
                    }
                    else {
                        M.toast({ html: '{Literal}There was a problem deleting this Unit of Measure{/Literal}.' });
                    }
                }
            });
            this.render();
        }
    },

    saveUnitsOfMeasure: function (){
        var that = this;
        var updateCollection = that.collection;
        

            var formValues = this.getFormValues();
            var sessionToken = this.getCookie();
            $.ajax({
                url: '/data/save-units-of-measure',
                data: {
                    unitsOfMeasure: JSON.stringify(formValues),
                    token: sessionToken,
                },
                dataType: 'json',
                type: 'POST',
    
                success: function (data) {
                    var success = false;
                    if (typeof data.results !== 'undefined' && typeof data.results.success !== 'undefined') {
                        success = data.results.success;
                    }
                    if (success !== null) {
                        var m = that.unitsOfMeasureFormView.model;
                        updateCollection.add(m);
                    }
                    that.formModal.modal('close');
                    M.toast({ html: '{Literal}Settings saved successfully{/Literal}' });
                },
    
                error: function (e) {
                    if (e.status == 523) {
                        window.location.href = "#/log-in";
                        location.reload();
                    }
                    else {
                        M.toast({ html: '{Literal}There was a problem saving this unit of measure{/Literal}.' });
                    }
                }
            });

            this.render();
    },

    chooseFraction: function () {
        var quantity = document.getElementById('quantity'); 
        var fraction = this.$el.find('#fraction-dropdown option:selected').text();
        if (fraction == "1/2") {
            quantity.value = .5
        }
        else if (fraction == "1/3") {
            quantity.value = ".333"
        }
        else if (fraction == "1/4") {
            quantity.value = .25
        }
        else if (fraction == "1/5") {
            quantity.value = ".2"
        }
        else if (fraction == "1/10") {
            quantity.value = ".1"
        }
        else if (fraction == "1/12") {
            quantity.value = ".083"
        }
        else if (fraction == "1/15") {
            quantity.value = ".066"
        }
        else if (fraction == "1/18") {
            quantity.value = ".055"
        }
        else if (fraction == "1/24") {
            quantity.value = ".0416"
        }
        else if (fraction == "1/36") {
            quantity.value = ".0277"
        }
        else if (fraction == "1/48") {
            quantity.value = ".0208"
        }
        else if (fraction == "1/64") {
            quantity.value = ".0156"
        }
        else if (fraction == "1") {
            quantity.value = "1"
        }
    }
});