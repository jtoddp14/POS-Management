var UnitsOfMeasureFormView = Backbone.View.extend({
    itemsAutocomplete1: {},
    itemsAutocomplete2: {},

    events: {
        'keyup #itemSearch1': 'searchItemBySearchTerm1',
        'keyup #itemSearch2': 'searchItemBySearchTerm2',
    },

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.model = options.model;
        this.unitsOfMeasure = options.unitsOfMeasure;
    },

    render: function () {
        var that = this;
        this.$el.detach();

        this.$el.html(this.template({
            unitsOfMeasure: this.model.toJSON(),
        }));

        $(document).ready(function() {
            $('.tooltipped').tooltip();
        });
        return this;
    },

    searchItemBySearchTerm1: function(element) {
        var element = $(element.currentTarget);
        var searchTerm = $(element).val();
        var that = this;
        if (searchTerm.trim().length > 0) {
            if (this.timer) {
                clearTimeout(this.timer);
            }
            this.timer = setTimeout(function() { 
                that.getItemsBySearchTerm1(searchTerm); 
            }, 0);
        }
        that.$el.find("input.autocomplete1").trigger("click");
    },

    searchItemBySearchTerm2: function(element) {
        var element = $(element.currentTarget);
        var searchTerm = $(element).val();
        var that = this;
        if (searchTerm.trim().length > 0) {
            if (this.timer) {
                clearTimeout(this.timer);
            }
            this.timer = setTimeout(function() { 
                that.getItemsBySearchTerm2(searchTerm); 
            }, 0);
        }
        that.$el.find("input.autocomplete2").trigger("click");
    },

    selectItemFromAutocompleteList: function (e) {
        var element = $(e.currentTarget);
    },

    getItemsBySearchTerm1: function(searchTerm) {
        var that = this;
        var sessionToken = this.getCookie();

        var elems = document.querySelector('#itemSearch1');
        that.itemsAutocomplete1 = M.Autocomplete.init(elems, {
            minLength: 1,
            sortFunction: function (a, b, inputString) {
                return a.indexOf(inputString) - b.indexOf(inputString);
            }
        });
        
        $.ajax({
            url: '/data/get-items-by-search-term',
            data: {
                searchTerm: searchTerm,
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                var results = data.results;
                that.items = {};
                var itemCodes = results.length;
                for (var i = 0; i < results.length; i++) {
                    that.items[results[i].itemCode] = null;
                }

                that.itemsAutocomplete1.updateData(that.items); 
                that.$el.find("input.autocomplete1").trigger("click");    
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    
                }
            }
        });
    },

    getItemsBySearchTerm2: function(searchTerm) {
        var that = this;
        var sessionToken = this.getCookie();

        var elems = document.querySelector('#itemSearch2');
        that.itemsAutocomplete2 = M.Autocomplete.init(elems, {
            minLength: 1,
            sortFunction: function (a, b, inputString) {
                return a.indexOf(inputString) - b.indexOf(inputString);
            }
        });
        
        $.ajax({
            url: '/data/get-items-by-search-term',
            data: {
                searchTerm: searchTerm,
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                var results = data.results;
                that.items = {};
                var itemCodes = results.length;
                for (var i = 0; i < results.length; i++) {
                    that.items[results[i].itemDescription] = null;
                }

                that.itemsAutocomplete2.updateData(that.items); 
                that.$el.find("input.autocomplete2").trigger("click");    
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    
                }
            }
        });
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
});