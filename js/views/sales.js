var SalesView = Backbone.View.extend({
    formModal: null,
    deletionModal: {},

    events: {
        'click .card-panel-entity': 'highlightCard',
        'click .edit-sales-trigger': 'editSales',
        'click #add-sales-button': 'addSales',
        'click .save-button': 'saveSales',
        'click .delete-button': 'deletionModal',
        'click #delete-sales-confirm': 'deleteSales',
        'keyup #id' : 'validateForm',
        'keyup #percentDiscount1' : 'validateForm',
        'keyup #percentDiscount2' : 'validateForm',
        'keyup #quantity1' : 'validateForm',
        'keyup #quantity2' : 'validateForm',
        'keyup #quantity3' : 'validateForm',
        'keyup #price1' : 'validateForm',
        'keyup #price2' : 'validateForm',
        'keyup #type' : 'validateForm',
        'keyup #items' : 'validateForm',
    },

    breadcrumb: {},

    styles: [
        'ap-blue',
    ],

    salesStyleMapping: {},

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.model = options.model;
        this.salesFormTemplate = options.salesFormTemplate;
        this.breadcrumb = options.breadcrumb;
        this.collection = options.collection;
        this.listenTo(this.collection, 'reset', this.render);
        this.listenTo(this.collection, 'remove', this.render);
        this.listenTo(this.collection, 'add', this.render);
        this.initSales();
    },

    render: function () {
        var that = this;
        this.$el.html(this.template({
            sales: this.collection.toJSON(),
        }));

        $(document).ready(function(){
            $('.modal').modal();
        });
        App.breadCrumbToolTip = "Create sales on specific items or item types on your desired dates and times"; 
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

        this.deletionModal = $(".modal").modal();

        $('.tooltipped').tooltip();
        this.formModal = this.$el.find('#sales-form-modal').modal();
    
        return this;
    },

/*-----------------------------------------------------------------------------------------------------------*/

    editSales: function (e) {
        var element = $(e.currentTarget);
        var id = $(element).attr('data-id');
        if (this.collection.get(id) !== null && this.collection.get(id) !== '') {
            this.salesFormView = new SalesFormView({
                template: this.salesFormTemplate,
                model: this.collection.get(id),
            });
            
            this.$el.find('#sales-form-modal').html(this.salesFormView.render().el);
            this.formModal.modal('open');
        }
        else {
            M.toast({ html: '{Literal}There was a problem fetching data from the server{/Literal}' });
        }
    },

    addSales: function () {
        var sales = new Sales();
        this.salesFormView = new SalesFormView({
            template: this.salesFormTemplate,
            model: sales,
            type: this.type
        });

        this.$el.find('#sales-form-modal').html(this.salesFormView.render().el);
        this.$el.find('select').formSelect();          
        $('.byItemTypeText').hide();
        $('.byItemTypeButton').hide();
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

/*-----------------------------------------------------------------------------------------------------------*/
    getCookie: function() {
        var nameEQ = "sessionCookie" + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
    },

    initSales: function () {
        this.getSales();
    },

    getSales: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-saleprice',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.generateSalesStyleMapping(data.results);
                that.renderSales(data.results);
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

    renderSales: function (data) {
        var that = this;
        data.sort(function (a, b) {
            return a.id < b.id ? -1 : (a.id > b.id ? 1 : 0);
        });
        var collection = new SalesCollection();
        for (var i = 0; i < data.length; i++) {
            var currentSales = data[i];
            currentSales.cardStyleClass = that.salesStyleMapping[data[i].name];
            collection.add(new Sales(currentSales));
        }
        that.fullCollection = collection;
        that.collection.reset(collection.models);
    },
    
/*-----------------------------------------------------------------------------------------------------------*/
    
    getFormValues: function () { 
        var saleType = this.$el.find('#sale-type-dropdown').val();
        var percentDiscount = this.$el.find('#percentDiscount1').val();
        var nextDiscountPct  = this.$el.find('#percentDiscount2').val();
        var quantity = this.$el.find('#quantity1').val();
        var quantity2 = this.$el.find('#quantity2').val();
        var quantity3 = this.$el.find('#quantity3').val();
        var quantityLevel = this.$el.find('#quantity4').val();
        var price = this.$el.find('#price1').val();
        var price2 = this.$el.find('#price3').val();
        var nextDiscountPrice = this.$el.find('#price2').val();
        var id = this.$el.find('#id').val();
        
        if (percentDiscount < 100) {
            percentDiscount = "0." + percentDiscount;
        }

        if (nextDiscountPct < 100) {
            nextDiscountPct = "0." + nextDiscountPct;
        }

        var byItem = this.$el.find('#byItem:checked').length > 0

        if (byItem) {
            var item = this.$el.find('#items').val();
            var type = "";
        }

        var byType = this.$el.find('#byType:checked').length > 0

        if (byType) {
            var item = "";
            var type = this.$el.find('#type').val();
        }
        var everyDay = this.$el.find('#everyDay:checked').length > 0
        if (everyDay) {
            var mon = true;
            var tue = true;
            var wed = true;
            var thu = true;
            var fri = true;
            var sat = true;
            var sun = true;
        }
        var certainDays = this.$el.find('#certainDays:checked').length > 0
        if (certainDays) {
            var mon = this.$el.find('#mon:checked').length > 0
            var tue = this.$el.find('#tue:checked').length > 0
            var wed = this.$el.find('#wed:checked').length > 0
            var thu = this.$el.find('#thu:checked').length > 0
            var fri = this.$el.find('#fri:checked').length > 0
            var sat = this.$el.find('#sat:checked').length > 0
            var sun = this.$el.find('#sun:checked').length > 0
        }
        var startDay = this.$el.find('#startDay').val();
        var d = new Date(startDay),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();
        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;
    
        startDay = [year, month, day].join('-');

        var endDay = this.$el.find('#endDay').val();
        var d = new Date(endDay),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();
        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;
    
        endDay = [year, month, day].join('-');
        
        var allDay = this.$el.find('#allDay:checked').length > 0
        
        if (allDay) {
            var startTime = '00:00:00.0'
            var endTime = '23:59:00.0'
        }
        var certainTimes = this.$el.find('#certainTimes:checked').length > 0
        if (certainTimes) {
            var startTime = $("#startTime").val(); 
            var endTime = $("#endTime").val(); 

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
        }

        if (allDay) {
            var fromMinutes = 0000;
            var thruMinutes = 1439;
        }
        else {
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
        }
       
        if (allDay) {
            if (saleType == 0) {
                var updatedModel = {
                    nextDiscountPrice: 0,
                    nextDiscountPct: 0,
                    discount: percentDiscount,
                    quantity: 0,
                    quantityPrice: 0,
                    quantityLevel: 0,
                    group: type,
                    item: item,
                    id: id,
                    monday: mon,
                    tuesday: tue,
                    wednesday: wed,
                    thursday: thu,
                    friday: fri,
                    saturday: sat,
                    sunday: sun,
                    start: startDay + ' ' + startTime,
                    end: endDay + ' ' + endTime,
                    fromMinutes: fromMinutes,
                    thruMinutes: thruMinutes
                };
            }
            else if (saleType == 1) {
                var updatedModel = {
                    nextDiscountPrice: 0,
                    nextDiscountPct: 0,
                    discount: 0,
                    quantity: quantity,
                    quantityPrice: 0,
                    forPrice: price,
                    quantityLevel: 0,
                    id: id,
                    item: item,
                    group: type,
                    start: startDay + ' ' + startTime,
                    end: endDay + ' ' + endTime,
                    monday: mon,
                    tuesday: tue,
                    wednesday: wed,
                    thursday: thu,
                    friday: fri,
                    saturday: sat,
                    sunday: sun,
                    fromMinutes: fromMinutes,
                    thruMinutes: thruMinutes
                };
            }
            else if (saleType == 2) {
                var updatedModel = {
                    nextDiscountPrice: 0,
                    nextDiscountPct: 0,
                    discount: 0,
                    quantity: 0,
                    quantityPrice: price2,
                    quantityLevel: quantityLevel,
                    id: id,
                    item: item,
                    group: type,
                    start: startDay + ' ' + startTime,
                    end: endDay + ' ' + endTime,
                    monday: mon,
                    tuesday: tue,
                    wednesday: wed,
                    thursday: thu,
                    friday: fri,
                    saturday: sat,
                    sunday: sun,
                    fromMinutes: fromMinutes,
                    thruMinutes: thruMinutes
                };
            }
            else if (saleType == 3) {
                var updatedModel = {
                    nextDiscountPrice: 0,
                    nextDiscountPct: nextDiscountPct,
                    discount: 0,
                    quantity: 0,
                    quantityPrice: 0,
                    quantityLevel: 0,
                    id: id,
                    initialQuantity: quantity2,
                    item: item,
                    group: type,
                    start: startDay + ' ' + startTime,
                    end: endDay + ' ' + endTime,
                    monday: mon,
                    tuesday: tue,
                    wednesday: wed,
                    thursday: thu,
                    friday: fri,
                    saturday: sat,
                    sunday: sun,
                    fromMinutes: fromMinutes,
                    thruMinutes: thruMinutes
                };
            }
            else if (saleType == 4){
                var updatedModel = {
                    nextDiscountPrice: nextDiscountPrice,
                    nextDiscountPct: 0,
                    discount: 0,
                    quantity: 0,
                    quantityPrice: 0,
                    quantityLevel: 0,
                    id: id,
                    initialQuantity: quantity3,
                    item: item,
                    group: type,
                    start: startDay + ' ' + startTime,
                    end: endDay + ' ' + endTime,
                    monday: mon,
                    tuesday: tue,
                    wednesday: wed,
                    thursday: thu,
                    friday: fri,
                    saturday: sat,
                    sunday: sun,
                    fromMinutes: fromMinutes,
                    thruMinutes: thruMinutes
                }; 
            }
            else {
                var updatedModel = {
                    nextDiscountPrice: nextDiscountPrice,
                    percentDiscount: percentDiscount,
                    quantity: quantity,
                    quantityPrice: price,
                    quantityLevel: quantityLevel,
                    id: id,
                    item: item,
                    group: type,
                    start: startDay + ' ' + startTime,
                    end: endDay + ' ' + endTime,
                    fromMinutes: fromMinutes,
                    thruMinutes: thruMinutes,
                    monday: mon,
                    tuesday: tue,
                    wednesday: wed,
                    thursday: thu,
                    friday: fri,
                    saturday: sat,
                    sunday: sun,
                };
            }
        }
        else {
            if (saleType == 0) {
                var updatedModel = {
                    nextDiscountPrice: 0,
                    nextDiscountPct: 0,
                    discount: percentDiscount,
                    quantity: 0,
                    quantityPrice: 0,
                    quantityLevel: 0,
                    group: type,
                    item: item,
                    id: id,
                    monday: mon,
                    tuesday: tue,
                    wednesday: wed,
                    thursday: thu,
                    friday: fri,
                    saturday: sat,
                    sunday: sun,
                    start: startDay + ' ' + start24format,
                    end: endDay + ' ' + end24format,
                    fromMinutes: fromMinutes,
                    thruMinutes: thruMinutes
                };
            }
            else if (saleType == 1) {
                var updatedModel = {
                    nextDiscountPrice: 0,
                    nextDiscountPct: 0,
                    discount: 0,
                    quantity: quantity,
                    quantityPrice: 0,
                    forPrice: price,
                    quantityLevel: 0,
                    group: type,
                    item: item,
                    id: id,
                    monday: mon,
                    tuesday: tue,
                    wednesday: wed,
                    thursday: thu,
                    friday: fri,
                    saturday: sat,
                    sunday: sun,
                    start: startDay + ' ' + start24format,
                    end: endDay + ' ' + end24format,
                    fromMinutes: fromMinutes,
                    thruMinutes: thruMinutes
                };
            }
            else if (saleType == 2) {
                var updatedModel = {
                    nextDiscountPrice: 0,
                    nextDiscountPct: 0,
                    discount: 0,
                    quantity: 0,
                    quantityPrice: price2,
                    quantityLevel: quantityLevel,
                    group: type,
                    item: item,
                    id: id,
                    monday: mon,
                    tuesday: tue,
                    wednesday: wed,
                    thursday: thu,
                    friday: fri,
                    saturday: sat,
                    sunday: sun,
                    start: startDay + ' ' + start24format,
                    end: endDay + ' ' + end24format,
                    fromMinutes: fromMinutes,
                    thruMinutes: thruMinutes
                };
            }
            else if (saleType == 3) {
                var updatedModel = {
                    nextDiscountPrice: 0,
                    nextDiscountPct: nextDiscountPct,
                    discount: 0,
                    quantity: 0,
                    quantityPrice: 0,
                    quantityLevel: 0,
                    group: type,
                    initialQuantity: quantity2,
                    item: item,
                    id: id,
                    monday: mon,
                    tuesday: tue,
                    wednesday: wed,
                    thursday: thu,
                    friday: fri,
                    saturday: sat,
                    sunday: sun,
                    start: startDay + ' ' + start24format,
                    end: endDay + ' ' + end24format,
                    fromMinutes: fromMinutes,
                    thruMinutes: thruMinutes
                };
            }
            else if (saleType == 4){
                var updatedModel = {
                    nextDiscountPrice: nextDiscountPrice,
                    nextDiscountPct: 0,
                    discount: 0,
                    quantity: 0,
                    quantityPrice: 0,
                    quantityLevel: 0,
                    group: type,
                    item: item,
                    initialQuantity: quantity3,
                    id: id,
                    monday: mon,
                    tuesday: tue,
                    wednesday: wed,
                    thursday: thu,
                    friday: fri,
                    saturday: sat,
                    sunday: sun,
                    start: startDay + ' ' + start24format,
                    end: endDay + ' ' + end24format,
                    fromMinutes: fromMinutes,
                    thruMinutes: thruMinutes
                }; 
            }
            else {
                var updatedModel = {
                    nextDiscountPrice: nextDiscountPrice,
                    percentDiscount: percentDiscount,
                    quantity: quantity,
                    quantityPrice: price,
                    quantityLevel: quantityLevel,
                    id: id,
                    item: item,
                    group: type,
                    start: startDay + ' ' + start24format,
                    end: endDay + ' ' + end24format,
                    fromMinutes: fromMinutes,
                    thruMinutes: thruMinutes,
                    monday: mon,
                    tuesday: tue,
                    wednesday: wed,
                    thursday: thu,
                    friday: fri,
                    saturday: sat,
                    sunday: sun,
                };
            }
        }
        

        
        this.salesFormView.model.set(updatedModel);
        return updatedModel;
    },

    generateSalesStyleMapping: function (data) {
        var sales = [];
        var totalStyles = this.styles.length;
        var currentStyle = 0;
        for (var i = 0; i < data.length; i++) {
            if (sales.indexOf(data[i].id) < 0) {
                sales.push(data[i].id);
                this.salesStyleMapping[data[i].id] = this.styles[currentStyle];
                if (currentStyle < totalStyles - 1) {
                    currentStyle++;
                } else {
                    currentStyle = 0;
                }
            }
        }
    },

    deletionModal: function (e) {
        var that = this;
        var element = $(e.currentTarget);
        var salesId = $(element).attr('data-id');
        $("#delete-sales-id").val(salesId);
        $('#delete-sales-modal').modal().modal('open');
    },

    deleteSales: function(e) {
        var element = $(e.currentTarget);
        var salesId = $(element).attr("data-sales-id");
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/delete-saleprice',
            type: 'POST',
            data: {
                id: salesId,
                token: sessionToken
            },

            success: function (data) {
                var success = false;
                if (typeof data.results !== 'undefined' && typeof data.results.success !== 'undefined') {
                    success = data.results.success;
                }
                if (success !== null) {
                    that.collection.remove(salesId);
                }

                M.toast({ html: '{Literal}Promotion deleted successfully{/Literal}' });
            },

            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem deleting this Promotion{/Literal}' });
                }
            }
        });
        this.render();
    },
    validateForm: function () {
        var valid = true;

        var startDateValue = this.$el.find('#startDay').val();
        var endDateValue = this.$el.find('#endDay').val();
        var startTimeValue = this.$el.find('#startTime').val();
        var endTimeValue = this.$el.find('#endTime').val();

        if (startDateValue === null || startDateValue === '') {
            this.$el.find('#startDay').addClass('invalid');
            valid = false;
        }
        if (endDateValue === null || endDateValue === '') {
            this.$el.find('#endDay').addClass('invalid');
            valid = false;
        }

        if (valid) {
            if (startDateValue !== 'undefined' && startDateValue !== 'undefined') {
                if (new Date(startDateValue) > new Date(endDateValue)) {
                    M.toast({html: '{Literal}The end date cannot be sooner than the start date{/Literal}'});
                    valid = false;
                }
            }
        }

        var allDay = this.$el.find('#allDay:checked').length > 0
        if (valid && allDay) {
            if (startTimeValue === null || startTimeValue === '') {
                this.$el.find('#startTime').addClass('invalid');
                valid = false;
            }
            if (endTimeValue === null || endTimeValue === '') {
                this.$el.find('#endTime').addClass('invalid');
                valid = false;
            }
            if (valid) {
                var test = new Date('December 17, 1995 ' + startTimeValue )
                var test2 = new Date('December 17, 1995 ' + endTimeValue)
                if (startTimeValue !== 'undefined' && startTimeValue !== 'undefined') {
                    if (test.getTime() > test2.getTime()) {
                        M.toast({html: '{Literal}The end date cannot be sooner than the start date{/Literal}'});
                        valid = false;
                    }
                }
            }
        }

        var saleType = this.$el.find('#sale-type-dropdown').val();
        if (saleType == 0) {
            var validatePercentDiscount1 = this.$el.find("#percentDiscount1").val(); 
            if (validatePercentDiscount1 > 100 || validatePercentDiscount1 < 0) {
                this.$el.find("#percentDiscount1").addClass("invalid");
                valid = false;
            }
            else if (validatePercentDiscount1 == '') {
                this.$el.find("#percentDiscount1").addClass("invalid");
                valid = false;
            }
        }
        else if (saleType == 1) {
            var validatePrice1 = this.$el.find("#price1").val(); 
            if (validatePrice1 > 999999 || validatePrice1 < 0 || validatePrice1.indexOf("-") > -1 || validatePrice1.indexOf('e') > -1) {
                this.$el.find("#price1").addClass("invalid");
                valid = false;
            }
            else if (validatePrice1 == '') {
                this.$el.find("#price1").addClass("invalid");
                valid = false;
            }

            var validateQuantity1 = this.$el.find("#quantity1").val(); 
            if (validateQuantity1 > 999999 || validateQuantity1 < 0 || validateQuantity1.indexOf("-") > -1 || validateQuantity1.indexOf('e') > -1) {
                this.$el.find("#quantity1").addClass("invalid");
                valid = false;
            }
            else if (validateQuantity1 == '') {
                this.$el.find("#quantity1").addClass("invalid");
                valid = false;
            }
    
        }
        else if (saleType == 3) {
            var price = this.$el.find("#price3").val(); 
            if (price < 0) {
                this.$el.find("#quantity4").addClass("invalid");
                valid = false;
            }
            else if (price == '') {
                this.$el.find("#quantity4").addClass("invalid");
                valid = false;
            }

            var price3 = this.$el.find("#price3").val();
            if (price3 < 0) {
                this.$el.find("#price3").addClass("invalid");
                valid = false;
            }
            else if (price3 == '') {
                this.$el.find("#price3").addClass("invalid");
                valid = false;
            }
        }
        else if (saleType == 4) {
            var validatePercentDiscount2 = this.$el.find("#percentDiscount2").val(); 
            if (validatePercentDiscount2 > 100 || validatePercentDiscount2 < 0) {
                this.$el.find("#percentDiscount2").addClass("invalid");
                valid = false;
            }
            else if (validatePercentDiscount2 == '') {
                this.$el.find("#percentDiscount2").addClass("invalid");
                valid = false;
            }

            var validateQuantity2 = this.$el.find("#quantity2").val(); 
            if (validateQuantity2 > 999999 || validateQuantity2 < 0) {
                this.$el.find("#quantity2").addClass("invalid");
                valid = false;
            }
            else if (validateQuantity2 == '') {
                this.$el.find("#quantity2").addClass("invalid");
                valid = false;
            }
        }
        return valid;
    },

    saveSales: function (){
        var sales;
        var that = this;
        var validation = this.validateForm();
        var updateCollection = that.collection;
        
        if (validation) {
            var formValues = this.getFormValues();
            var sessionToken = this.getCookie();

           $.ajax({
                url: '/data/save-saleprice',
                data: {
                    salePrice: JSON.stringify(formValues),
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
                        var m = that.salesFormView.model;
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
                        M.toast({ html: '{Literal}There was a problem saving this Promotion{/Literal}' });
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