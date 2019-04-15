var BarcodeView = Backbone.View.extend({
    events: {
        'click .save-button': 'saveChanges',
        'click #embeddedPrice': 'embeddedPrice',
        'click #embeddedWeight': 'embeddedWeight',
        'click .search-items-button': 'searchItems',
        'keyup #print': 'changePrintQuantity',
        'click #clearBarcodeCount' : 'clearBarcodeCount',
        'click #saveBarcodeCounts' : 'saveBarcodeCount'
    },
    data: {},
    breadcrumb: {},
    itemsStyleMapping: {},
    styles: [
        'ap-blue',
    ],

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.breadcrumb = options.breadcrumb;
        this.collection = options.collection;
        this.model = options.model;
        this.getItemBarcodes();
    },

    render: function () {   
        App.breadCrumbToolTip = "Set/print barcodes for your items";
        App.setBreadcrumbs(this.breadcrumb);

        var that = this;
        $(document).ready(function () {
            $('.tooltipped').tooltip();
            $('select').formSelect();
            $('.fixed-action-btn').floatingActionButton();
            that.$el.find('select').formSelect();
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

    searchItems: function () {
        $('#resultsBlock').html("");
        var that = this;
        var searchText = this.$el.find('#searchText').val();
        var searchField = this.$el.find('#searchField').val();

        if (searchText == '') {
            M.toast({ html: '{Literal}Showing all items{/Literal}...' });
            var delayInMilliseconds = 100; 
            
            setTimeout(function() {
                for (var i = 0; i < that.collection.length; i++) {
                    var html = '<div id = "itemCards" class="card">';
                    html += '<div class="col s12 m3">';
                    html += '<div class="card card-panel z-depth-1 sequence-card hoverable waves-effect waves-light" style="background-color: #ffffff" data-id="' + that.collection.models[i].attributes.id + '">';
                    html += '<div class="description truncate" style="color: #3970b7; font-size: 1rem; margin-bottom: 0px;">' + that.collection.models[i].attributes.id + '</div>';
                    html += '<div class="type truncate" style="font-size: .95rem; margin-bottom: 0px; color: gray;">{Literal}Description{/Literal}:' + that.collection.models[i].attributes.description + '</div>';
                    html += '<div class="type truncate" style="font-size: .95rem; margin-bottom: 0px; color: gray; padding-bottom: 10px">{Literal}Price{/Literal}: ' + that.collection.models[i].attributes.price + '</div>';
                    html += '<div class="card-action" style="padding: 0px 0px 0px 0px !important;">';
                    html += '<div class="input-field" style="margin-top: 0rem; margin-bottom: 0rem; width: 100%;">'
                    html += '<input id="print"  type="number" data-id="' + that.collection.models[i].attributes.id + '" value="' + that.collection.models[i].attributes.barcodeCount + '" maxlength="50" class = "barCodeInput">';
                    html += '</div></div></div></div></div>'

                    $('#resultsBlock').append(html);
                }
            }, delayInMilliseconds);
        }

        else if (searchField == 0) {
            var filtered = this.collection.byItemDescription(searchText);
            if (filtered.models.length > 0) {
                var delayInMilliseconds = 100;
                setTimeout(function() {
                    for (var i = 0; i < filtered.length; i++) {
                        var html = '<div id = "itemCards" class="card">';
                        html += '<div class="col s12 m3">';
                        html += '<div class="card card-panel z-depth-1 sequence-card hoverable waves-effect waves-light" style="background-color: #ffffff" data-id="' + filtered.models[i].attributes.id + '">';
                        html += '<div class="description truncate" style="color: #3970b7; font-size: 1rem; margin-bottom: 0px;">' + filtered.models[i].attributes.id + '</div>';
                        html += '<div class="type truncate" style="font-size: .95rem; margin-bottom: 0px; color: gray;">{Literal}Description{/Literal}:' + filtered.models[i].attributes.description + '</div>';
                        html += '<div class="type truncate" style="font-size: .95rem; margin-bottom: 0px; color: gray; padding-bottom: 10px">{Literal}Price{/Literal}: ' + filtered.models[i].attributes.price + '</div>';
                        html += '<div class="card-action" style="padding: 0px 0px 0px 0px !important;">';
                        html += '<div class="input-field" style="margin-top: 0rem; margin-bottom: 0rem; width: 100%;">'
                        html += '<input id="print"  type="number" data-id="' + filtered.models[i].attributes.id + '" value="' + filtered.models[i].attributes.barcodeCount + '" maxlength="50" class = "barCodeInput">';
                        html += '</div></div></div></div></div>'

                        $('#resultsBlock').append(html);
                    }
                }, delayInMilliseconds);
            }
            else {
                M.toast({ html: '{Literal}No search results found{/Literal}' }); 
            }
        }

        else if (searchField == 1) {
            var filtered = this.collection.byItemId(searchText);

            if (filtered.models.length > 0) {
                setTimeout(function() {
                    for (var i = 0; i < filtered.length; i++) {
                        var html = '<div id = "itemCards" class="card">';
                        html += '<div class="col s12 m3">';
                        html += '<div class="card card-panel z-depth-1 sequence-card hoverable waves-effect waves-light" style="background-color: #ffffff" data-id="' + filtered.models[i].attributes.id + '">';
                        html += '<div class="description truncate" style="color: #3970b7; font-size: 1rem; margin-bottom: 0px;">' + filtered.models[i].attributes.id + '</div>';
                        html += '<div class="type truncate" style="font-size: .95rem; margin-bottom: 0px; color: gray;">{Literal}Description{/Literal}:' + filtered.models[i].attributes.description + '</div>';
                        html += '<div class="type truncate" style="font-size: .95rem; margin-bottom: 0px; color: gray; padding-bottom: 10px">{Literal}Price{/Literal}: ' + filtered.models[i].attributes.price + '</div>';
                        html += '<div class="card-action" style="padding: 0px 0px 0px 0px !important;">';
                        html += '<div class="input-field" style="margin-top: 0rem; margin-bottom: 0rem; width: 100%;">'
                        html += '<input id="print"  type="number" data-id="' + filtered.models[i].attributes.id + '" value="' + filtered.models[i].attributes.barcodeCount + '" maxlength="50" class = "barCodeInput">';
                        html += '</div></div></div></div></div>'

                        $('#resultsBlock').append(html);
                    }
                }, delayInMilliseconds);
            }
            else {
                M.toast({ html: '{Literal}No search results found{/Literal}' });
            }
        }

        else if (searchField == 2) {
            var filtered = this.collection.byItemType(searchText);
            if (filtered.models.length > 0) {
                setTimeout(function() {
                    for (var i = 0; i < filtered.length; i++) {
                        var html = '<div id = "itemCards" class="card">';
                        html += '<div class="col s12 m3">';
                        html += '<div class="card card-panel z-depth-1 sequence-card hoverable waves-effect waves-light" style="background-color: #ffffff" data-id="' + filtered.models[i].attributes.id + '">';
                        html += '<div class="description truncate" style="color: #3970b7; font-size: 1rem; margin-bottom: 0px;">' + filtered.models[i].attributes.id + '</div>';
                        html += '<div class="type truncate" style="font-size: .95rem; margin-bottom: 0px; color: gray;">{Literal}Description{/Literal}:' + filtered.models[i].attributes.description + '</div>';
                        html += '<div class="type truncate" style="font-size: .95rem; margin-bottom: 0px; color: gray; padding-bottom: 10px">{Literal}Price{/Literal}: ' + filtered.models[i].attributes.price + '</div>';
                        html += '<div class="card-action" style="padding: 0px 0px 0px 0px !important;">';
                        html += '<div class="input-field" style="margin-top: 0rem; margin-bottom: 0rem; width: 100%;">'
                        html += '<input id="print"  type="number"data-id="' + filtered.models[i].attributes.id + '" value="' + filtered.models[i].attributes.barcodeCount + '" maxlength="50" class = "barCodeInput">';
                        html += '</div></div></div></div></div>'

                        $('#resultsBlock').append(html);
                    }
                }, delayInMilliseconds);
            }
            else {
                M.toast({ html: '{Literal}No search results found{/Literal}' }); 
            }
        }

        else if (searchField == 3) {
            var filtered = this.collection.byAltDescription(searchText);
            if (filtered.models.length > 0) {
                setTimeout(function() {
                    for (var i = 0; i < filtered.length; i++) {
                        var html = '<div id = "itemCards" class="card">';
                        html += '<div class="col s12 m3">';
                        html += '<div class="card card-panel z-depth-1 sequence-card hoverable waves-effect waves-light" style="background-color: #ffffff" data-id="' + filtered.models[i].attributes.id + '">';
                        html += '<div class="description truncate" style="color: #3970b7; font-size: 1rem; margin-bottom: 0px;">' + filtered.models[i].attributes.id + '</div>';
                        html += '<div class="type truncate" style="font-size: .95rem; margin-bottom: 0px; color: gray;">{Literal}Description{/Literal}:' + filtered.models[i].attributes.description + '</div>';
                        html += '<div class="type truncate" style="font-size: .95rem; margin-bottom: 0px; color: gray; padding-bottom: 10px">{Literal}Price{/Literal}: ' + filtered.models[i].attributes.price + '</div>';
                        html += '<div class="card-action" style="padding: 0px 0px 0px 0px !important;">';
                        html += '<div class="input-field" style="margin-top: 0rem; margin-bottom: 0rem; width: 100%;">'
                        html += '<input id="print"  type="number" data-id="' + filtered.models[i].attributes.id + '" value="' + filtered.models[i].attributes.barcodeCount + '" maxlength="50" class = "barCodeInput">';
                        html += '</div></div></div></div></div>'

                        $('#resultsBlock').append(html);
                    }
                }, delayInMilliseconds);
            }
            else {
                M.toast({ html: '{Literal}No search results found{/Literal}' });
            }
        }

        else if (searchField == 4) {
            var filtered = this.collection.byCategory(searchText);
            if (filtered.models.length > 0) {
                setTimeout(function() {
                    for (var i = 0; i < filtered.length; i++) {
                        var html = '<div id = "itemCards" class="card">';
                        html += '<div class="col s12 m3">';
                        html += '<div class="card card-panel z-depth-1 sequence-card hoverable waves-effect waves-light" style="background-color: #ffffff" data-id="' + filtered.models[i].attributes.id + '">';
                        html += '<div class="description truncate" style="color: #3970b7; font-size: 1rem; margin-bottom: 0px;">' + filtered.models[i].attributes.id + '</div>';
                        html += '<div class="type truncate" style="font-size: .95rem; margin-bottom: 0px; color: gray;">{Literal}Description{/Literal}:' + filtered.models[i].attributes.description + '</div>';
                        html += '<div class="type truncate" style="font-size: .95rem; margin-bottom: 0px; color: gray; padding-bottom: 10px">{Literal}Price{/Literal}: ' + filtered.models[i].attributes.price + '</div>';
                        html += '<div class="card-action" style="padding: 0px 0px 0px 0px !important;">';
                        html += '<div class="input-field" style="margin-top: 0rem; margin-bottom: 0rem; width: 100%;">'
                        html += '<input id="print"  type="number" data-id="' + filtered.models[i].attributes.id + '" value="' + filtered.models[i].attributes.barcodeCount + '" maxlength="50" class = "barCodeInput">';
                        html += '</div></div></div></div></div>'

                        $('#resultsBlock').append(html);
                    }
                }, delayInMilliseconds);
            }
            else {
                M.toast({ html: '{Literal}No search results found{/Literal}' });
            }
        }
    },

    changePrintQuantity: function (e) {
        var element = $(e.currentTarget);
        var id = $(element).attr('data-id');

        for (var i = 0; i < this.collection.models.length; i++) {
            if (this.collection.models[i].attributes.id == id) {
                this.collection.models[i].attributes.barcodeCount = element[0].value;
                this.collection.models[i].attributes.isChanged = true;
                break;
            }
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

    getItemBarcodes: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-item-barcodes',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.renderItems(data.results);
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem retrieving all items{/Literal}.' });
                }
            }
        });
    },

    renderItems: function (data) {
        var that = this;
        this.generateItemsStyleMapping(data);

        data.sort(function (a, b) {
            return a.id < b.id ? -1 : (a.id > b.id ? 1 : 0);
        });
        
        barcodeCollection = new BarcodeCollection();
        for (var i = 0; i < data.length; i++) {
            var currentItems = data[i];
            if (currentItems.barcodeCount > 0) {
            }
            currentItems.cardStyleClass = that.itemsStyleMapping[data[i].id];
            barcodeCollection.add(new Barcode(currentItems));
        }
        this.collection = barcodeCollection;
      
        this.$el.html(this.template({
            items: this.collection.toJSON(),
        })); 
        $('.fixed-action-btn').floatingActionButton();
        $('select').formSelect();
        $('.tooltipped').tooltip();
    },

    generateItemsStyleMapping: function (data) {
        var items = [];
        var totalStyles = this.styles.length;
        var currentStyle = 0;
        for (var i = 0; i < data.length; i++) {
            if (items.indexOf(data[i].id) < 0) {
                items.push(data[i].id);
                this.itemsStyleMapping[data[i].id] = this.styles[currentStyle];
                if (currentStyle < totalStyles - 1) {
                    currentStyle++;
                } else {
                    currentStyle = 0;
                }
            }
        }
    },

    clearBarcodeCount: function () {
        var that = this;
        var sessionToken = this.getCookie();

        $.ajax({
            url: '/data/clear-barcode-counts',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            
            success: function (data) {
                $('#resultsBlock').html("");
                $('#barcodeBlock').html("");

                for (var i = 0; i < that.collection.models.length; i++) {
                    if (that.collection.models[i].attributes.barcodeCount > 0) {
                        that.collection.models[i].attributes.barcodeCount = 0;
                    }
                }
                M.toast({ html: '{Literal}Barcodes Cleared successfully{/Literal}' });
            },

            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem clearing barcode settings{/Literal}' });
                }
            }
        });
    },

    saveBarcodeCount: function () {
        var that = this;
        var sessionToken = this.getCookie();

        var updatedPageModels = {};

        $('#barcodeBlock').html("");
        $('#resultsBlock').html("");

        Object.size = function(obj) {
            var size = 0, key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) size++;
            }
            return size;
        };

        for (var i =0; i < this.collection.models.length; i++) {
            if (this.collection.models[i].attributes.barcodeCount > 0) {
                updatedPageModels[Object.size(updatedPageModels)] = this.collection.models[i].attributes;
            }
        }
        
        var keysSent = 0;

        for (var t = 0; t < Object.size(updatedPageModels); t++) {
            $.ajax({
                url: '/data/save-barcode-count',
                data: {
                    token: sessionToken,
                    item: JSON.stringify(updatedPageModels[t]),
                },
                dataType: 'json',
                type: 'POST',
                
                success: function (data) {
                    keysSent++;

                   

                    if (keysSent == Object.size(updatedPageModels) - 1) {
                        M.toast({ html: '{Literal}Barcode Counts saved successfully{/Literal}' });
                    }
                },

                error: function (e) {
                    if (e.status == 523) {
                        window.location.href = "#/log-in";
                        location.reload();
                    }
                    else {
                        M.toast({ html: '{Literal}There was a problem adding this Barcode Count{/Literal}.' });
                    }
                }
            });

            
            var html = '<div id = "itemCards" class="card">';
            html += '<div class="col s12 m3">';
            html += '<div class="card card-panel z-depth-1 sequence-card hoverable waves-effect waves-light" style="background-color: #ffffff" data-id="' + updatedPageModels[t].id + '">';
            html += '<div class="description truncate" style="color: #3970b7; font-size: 1rem; margin-bottom: 0px;">' + updatedPageModels[t].id + '</div>';
            html += '<div class="type truncate" style="font-size: .95rem; margin-bottom: 0px; color: gray;">{Literal}Description{/Literal}:' + updatedPageModels[t].description + '</div>';
            html += '<div class="type truncate" style="font-size: .95rem; margin-bottom: 0px; color: gray; padding-bottom: 10px">{Literal}Price{/Literal}: ' + updatedPageModels[t].price + '</div>';
            html += '<div class="card-action" style="padding: 0px 0px 0px 0px !important;">';
            html += '<div class="input-field" style="margin-top: 0rem; margin-bottom: 0rem; width: 100%;">'
            html += '<input id="print"  type="number" data-id="' + updatedPageModels[t].id + '" value="' + updatedPageModels[t].barcodeCount + '" maxlength="50" class = "barCodeInput">';
            html += '</div></div></div></div></div>'
            $('#barcodeBlock').append(html);
        }
    }
});
