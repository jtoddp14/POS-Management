var FlexGroupsView = Backbone.View.extend({
    fullCollection: {},
    formModal: null,
    deletionModal: {},

    events: {
        'click .card-panel-entity': 'highlightCard',
        'click .edit-flex-groups-trigger': 'editFlexGroups',
        'click #add-flex-groups-button': 'addFlexGroups',
        'click .save-button': 'saveFlexGroups',
        'click .delete-button': 'deletionModal',
        'click #delete-flex-group-confirm': 'deleteFlexGroups',
    },

    breadcrumb: {},

    styles: [
        'ap-blue',
    ],

    flexGroupsStyleMapping: {},

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.flexGroupsFormTemplate = options.flexGroupsFormTemplate;
        this.breadcrumb = options.breadcrumb;
        this.collection = options.collection;
        this.listenTo(this.collection, 'reset', this.render);
        this.listenTo(this.collection, 'remove', this.render);
        this.listenTo(this.collection, 'add', this.render);
        this.model = options.model;
        this.initFlexGroups();
    },

    render: function () {
        var that = this;
        this.$el.html(this.template({
            flexGroups: this.collection.toJSON(),
        }));

        $(document).ready(function(){
            $('.modal').modal();
        });

        App.breadCrumbToolTip = "Create a 'Master Item' that, when added to an order, adds a group of items of your choice";

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
        this.formModal = this.$el.find('#flex-groups-form-modal').modal();
        return this;
    },

    editFlexGroups: function (e) {
        var element = $(e.currentTarget);
        var masterItemId = $(element).attr('data-id');  

        for(var i = 0; i < this.collection.length; i++) { 
            if (this.collection.models[i].attributes.id == masterItemId) {
                var model = this.collection.models[i];
                this.flexGroupsFormView = new FlexGroupsFormView({
                    template: this.flexGroupsFormTemplate,
                    model: model,
                    newGroup: false,
                });
                
                this.$el.find('#flex-groups-form-modal').html(this.flexGroupsFormView.render().el);
                this.formModal.modal('open');
                break;
            }
        }
    },

    addFlexGroups: function () {
        var flexGroups = new FlexGroups();
        this.flexGroupsFormView = new FlexGroupsFormView({
            template: this.flexGroupsFormTemplate,
            model: flexGroups,
            newGroup: true
        });

        this.$el.find('#flex-groups-form-modal').html(this.flexGroupsFormView.render().el);
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

    initFlexGroups: function () {
        this.getFlexGroups();
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

    getFlexGroups: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-flex-groups',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.generateFlexGroupsStyleMapping(data.flexGroups);
                that.renderFlexGroups(data.flexGroups);
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

    renderFlexGroups: function (data) {
        var that = this;
        data.sort(function (a, b) {
            return a.id.toLowerCase() < b.id.toLowerCase() ? -1 : (a.id.toLowerCase() > b.id.toLowerCase() ? 1 : 0);
        });
        var collection = new FlexGroupsCollection();
        for (var i = 0; i < data.length; i++) {
            var currentFlexGroups = data[i];
            currentFlexGroups.cardStyleClass = that.flexGroupsStyleMapping[data[i].id];    
            collection.add(new FlexGroups(currentFlexGroups));
        }
        that.fullCollection = collection;
        that.collection.reset(collection.models);
    },

    generateFlexGroupsStyleMapping: function (data) {
        var flexGroups = [];
        var totalStyles = this.styles.length;
        var currentStyle = 0;
        
        for (var i = 0; i < data.length; i++) {
            if (flexGroups.indexOf(data[i].id) < 0) {
                flexGroups.push(data[i].id);
                this.flexGroupsStyleMapping[data[i].id] = this.styles[currentStyle];
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
        var name = this.$el.find('#name').val();
        var priceAfter = this.$el.find('#priceAfter').val();

        var itemTable = [];
        var priceArray = [];
        var subGroupArray = [];
        var itemIdArray = [];
        var isAdd = [];

        this.$el.find('.prices').each(function() {
            var currentPrice = $(this).html();
            priceArray.push(currentPrice);                
        });

        this.$el.find('.subgroups').each(function() {
            var currentSubgroup = $(this).html();
            subGroupArray.push(currentSubgroup);
        });

        this.$el.find('.itemId').each(function() {
            var currentId = $(this).html();
            itemIdArray.push(currentId);                
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
            var getItemPrice = priceArray[i];
            var getSubGroup = subGroupArray[i];
            var getItemId = itemIdArray[i]
            var getIsAdd = isAdd[i];
            itemTable.push({
                flexDetailPrice: getItemPrice,
                subGroup: getSubGroup,
                detailItemId: getItemId,
                masterItemId: that.flexGroupsFormView.model.attributes.id,
                isAdd: getIsAdd
            });
        }

        var startTime = this.$el.find('#startTime').val();
        var endTime = this.$el.find('#endTime').val();

        var start = new Date("01/01/2000 " + startTime);
        var h = start.getHours();

        if (h >= 12) 
        {
            h -= 12;
            h = (h * 60) + start.getMinutes();
            h += 720;
        }
        else 
        {
            h = (h * 60) + start.getMinutes();
        }

        var fromMinutes = h;

        end = new Date("01/01/2000 " + endTime);
        h = end.getHours();

        if (h >= 12) 
        {
            h -= 12;
            h = (h * 60) + end.getMinutes();
            h += 720;
        }
        else 
        {
            h = (h * 60) + end.getMinutes();
        }

        var thruMinutes = h;

        startDay = that.$el.find('#startDay').val();
        var hours = Number(startTime.match(/^(\d+)/)[1]);
        var minutes = Number(startTime.match(/:(\d+)/)[1]);
        var AMPM = startTime.match(/\s(.*)$/)[1];
        if(AMPM == "PM" && hours<12) hours = hours+12;
        if(AMPM == "AM" && hours==12) hours = hours-12;
        var sHours = hours.toString();
        var sMinutes = minutes.toString();
        if(hours<10) sHours = "0" + sHours;
        if(minutes<10) sMinutes = "0" + sMinutes;
        var start24format = (sHours + ":" + sMinutes + ":00.0");

        endDay = that.$el.find('#endDay').val();
        var hours = Number(endTime.match(/^(\d+)/)[1]);
        var minutes = Number(endTime.match(/:(\d+)/)[1]);
        var AMPM = endTime.match(/\s(.*)$/)[1];
        if(AMPM == "PM" && hours<12) hours = hours+12;
        if(AMPM == "AM" && hours==12) hours = hours-12;
        var sHours = hours.toString();
        var sMinutes = minutes.toString();
        if(hours<10) sHours = "0" + sHours;
        if(minutes<10) sMinutes = "0" + sMinutes;
        var end24format = (sHours + ":" + sMinutes + ":00.0");
        
    

        var updatedModel = {
            id: that.flexGroupsFormView.model.attributes.id,
            startDate: startDay + ' ' + start24format,
            endDate: endDay + ' ' + end24format,
            fromMinutes: fromMinutes,
            thruMinutes: thruMinutes,
            sunday: that.$el.find('#sunday:checked').length > 0,
            monday: that.$el.find('#monday:checked').length > 0,
            tuesday: that.$el.find('#tuesday:checked').length > 0,
            wednesday: that.$el.find('#wednesday:checked').length > 0,
            thursday: that.$el.find('#thursday:checked').length > 0,
            friday: that.$el.find('#friday:checked').length > 0,
            saturday: that.$el.find('#saturday:checked').length > 0,
            detailItems: itemTable
        }

        var updatedModel2 = {
            id: that.flexGroupsFormView.model.attributes.id,
            startDate: startDay,
            endDate: endDay,
            fromMinutes: startTime,
            thruMinutes: endTime,
            sunday: that.$el.find('#sunday:checked').length > 0,
            monday: that.$el.find('#monday:checked').length > 0,
            tuesday: that.$el.find('#tuesday:checked').length > 0,
            wednesday: that.$el.find('#wednesday:checked').length > 0,
            thursday: that.$el.find('#thursday:checked').length > 0,
            friday: that.$el.find('#friday:checked').length > 0,
            saturday: that.$el.find('#saturday:checked').length > 0,
            detailItems: itemTable
        }

        this.flexGroupsFormView.model.set(updatedModel2);
        return updatedModel;
    },

    validateForm: function () {
        var valid = true;

        var name = this.$el.find("#name").val();
        if (name.trim().length < 1) {
            this.$el.find("#name").addClass("invalid");
            valid = false;
        }

        var startDay = Date.parse(this.$el.find("#startDay").val());
        if (isNaN(startDay)) {
            valid = false;
        }

        var endDay = Date.parse(this.$el.find("#endDay").val());
        if (isNaN(endDay)) {
            valid = false;
        }

        var iChars = "-";

        var endTime = this.$el.find("#endTime").val();
        var startTime = this.$el.find("#startTime").val();
        for (var i = 0; i < endTime.length; i++) {
            if (iChars.indexOf(endTime.charAt(i)) != -1) {
                valid = false;
                break;
            }
        }
        
        for (var i = 0; i < startTime.length; i++) {
            if (iChars.indexOf(startTime.charAt(i)) != -1) {
                valid = false;
                break;
            }
        }

        return valid;
    },

    deletionModal: function (e) {
        var that = this;
        var element = $(e.currentTarget);
        var groupItemsId = $(element).attr('data-id');
        $("#delete-flex-group-id").val(groupItemsId);
        $('#delete-flex-group-modal').modal().modal('open');
    },

    deleteFlexGroups: function(e) {
        
        var element = $(e.currentTarget);
        var flexGroupId = $(element).attr("data-flex-group-id");
        var that = this;
        if (flexGroupId !== null && flexGroupId !== '') {
            var sessionToken = this.getCookie();
            $.ajax({
                url: '/data/delete-flex-group',
                type: 'POST',
                data: {
                    masterItemId: flexGroupId,
                    token: sessionToken
                },

                success: function (data) {
                    var success = false;
                    if (typeof data.results !== 'undefined' && typeof data.results.success !== 'undefined') {
                        success = data.results.success;
                    }
                    if (success !== null) {
                        M.toast({ html: '{Literal}Flex Group deleted successfully{/Literal}' });
                        that.collection.remove(flexGroupId);
                    }
                    location.reload();
                },

                error: function (e) {
                    if (e.status == 523) {
                        window.location.href = "#/log-in";
                        location.reload();
                    }
                    else {
                        M.toast({ html: '{Literal}There was a problem deleting this flex group{/Literal}' });
                    }
                }
            });
        }
    },

    saveFlexGroups: function (){
        var flexGroup;
        var that = this;
        var validation = this.validateForm();
        var updateCollection = that.collection;
        var formValues = this.getFormValues();
        
        if (validation) {
            var formValues = this.getFormValues();
            var sessionToken = this.getCookie();
            $.ajax({
                url: '/data/save-flex-group',
                data: {
                    flexGroup: JSON.stringify(formValues),
                    token: sessionToken
                },
                dataType: 'json',
                type: 'POST',
    
                success: function (data) {
                    var m = that.flexGroupsFormView.model;
                    updateCollection.add(m);
                    that.formModal.modal('close');
                    M.toast({ html: '{Literal}Flex Group Item saved successfully{/Literal}' });
                },
    
                error: function (e) {
                    if (e.status == 523) {
                        window.location.href = "#/log-in";
                        location.reload();
                    }
                    else {
                        M.toast({ html: '{Literal}There was a problem saving this flex group item{/Literal}' });
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