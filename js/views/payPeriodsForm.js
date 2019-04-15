var PayPeriodsFormView = Backbone.View.extend({
    dates: [],
    clockOut: '',
    clockIn: '',
    id: '',
    name: '',
    timeId: '',
    editedCard: '',

    events: { 
        'click .card-panel-entity': 'highlightCard',
        'click #send-times-to-accounting' : 'sendTimesToAccounting',
        'click #add-break-times' : 'addBreakTime',
        'click #add-clock-in' : 'addClockIn',
        'click .choose-item-trigger' : 'openPayTimeModal',
        'click .close-employee-time-modal': 'closeEmployeeTimeModal',
        'click .save-pay-period-button ' : 'savePayPeriod',
        'change #clockIn' : 'changeTotal',
        'change #clockOut' : 'changeTotal',
        'click #add-clock-in' : 'addClockIn',
        'click .save-new-pay-period-button' : 'addNewPayPeriod',
        'click .close-new-employee-time-modal' : 'closeNewEmployeeTimeModal',
        'click .delete-pay-period-button' : 'removePayPeriodForm',
        'click #delete-pay-period-confirm' : 'removePayPeriod'
    },

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.payPeriods = options.payPeriods;
        this.chosenDate = options.chosenDate;
        this.collection = options.collection;
        this.employees = options.employees;
        this.payTypes = options.payTypes;
        this.renderTimes();
    },

    render: function () {
        var that = this;
        this.$el.detach();
        this.$el.html(this.template({
            chosenDate: this.chosenDate,
            dates: this.dates,
            employees: this.employees,
            payTypes:  this.payTypes
        }));

        $(document).ready(function() {
            $('.tooltipped').tooltip();
            $('select').formSelect();
            $('.fixed-action-btn').floatingActionButton();
            var pickerElement = document.querySelectorAll('.timepicker');
            var instances = M.Timepicker.init(pickerElement, {
                autoClose: true,
                container: 'body'
            });
            that.timepicker = instances;
        });
        return this;
    },

    renderTimes: function () {
        this.dates = [];
        var chosenDateFormat = new Date(this.chosenDate);
        var month = chosenDateFormat.getUTCMonth() + 1; //months from 1-12
        var day = chosenDateFormat.getUTCDate();
        var year = chosenDateFormat.getUTCFullYear();
        var dateSelected = year + "/" + month + "/" + day;
        
        for (var i = 0; i < this.collection.length; i++) {
            var inDate = new Date(this.collection.models[i].attributes.in);
            var month = inDate.getUTCMonth() + 1; //months from 1-12
            var day = inDate.getUTCDate();
            var year = inDate.getUTCFullYear();
            var startDate = year + "/" + month + "/" + day;

            var outDate = new Date(this.collection.models[i].attributes.out);
            month = outDate.getUTCMonth() + 1; //months from 1-12
            day = outDate.getUTCDate();
            year = outDate.getUTCFullYear();
            var endDate = year + "/" + month + "/" + day;

            if (startDate == dateSelected || endDate == dateSelected) {
                this.dates.push(this.collection.models[i].attributes)
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

    sendTimesToAccounting: function () {
        var that = this;
        var sessionToken = this.getCookie();
        
        if (App.serverInfo.hasAccounting) {
            $.ajax({
                url: '/data/send-times-payroll',
                data: {
                    token: sessionToken
                },
                dataType: 'json',
                type: 'POST',
    
                success: function (data) {
                    M.toast({ html: '{Literal}Times sent successfully{/Literal}' });
                },
    
                error: function (e) {
                    if (e.status == 523) {
                        window.location.href = "#/log-in";
                        location.reload();
                    }
                    else {
                        M.toast({ html: '{Literal}There was a problem sending times to accounting{/Literal}' });
                    }
                }
            });    
        }
        else {
            M.toast({ html: '{Literal}Your AccuServer does not have accounting integration{/Literal}' }); 
        }
    },

    addBreakTime: function () {

    },

    openPayTimeModal: function (e) {
        this.editedCard = $(e.currentTarget.parentElement.parentElement);
        var element = $(e.currentTarget.parentElement.parentElement);
        this.clockOut = $(element).attr('clock-out-id');
        this.clockIn = $(element).attr('clock-in-id');
        this.id = $(element).attr('data-id');
        this.name = $(element).attr('employee-name-id');
        this.timeId = $(element).attr('time-id');

        var totalHours = document.getElementById('total');
        totalHours.value = "";

        var clockInHours = document.getElementById('clockIn');
        clockInHours.value = "";

        var clockOutHours = document.getElementById('clockOut');
        clockOutHours.value = "";

        if (this.clockIn == "") {
            var clockInLabel = document.getElementById("clockInLabel");
            clockInLabel.style.color = "red";
        }
        else if (this.clockOut == "") {
            var clockOutLabel = document.getElementById("clockOutLabel");
            clockOutLabel.style.color = "red";
        }

        for (var i = 0; i < this.dates.length; i++) {
            if (this.dates[i].in == this.clockIn && this.dates[i].out == this.clockOut && this.dates[i].employeeId == this.id && this.dates[i].employeeName == this.name) {
                if (this.dates[i].in == "" || this.dates[i].out == "" ) {
                    totalHours.value = "---"
                }
                else {
                    totalHours.value = this.dates[i].total;
                }

                if (this.dates[i].in != "") {
                    var dateIn = new Date(this.dates[i].in);
                    var h = dateIn.getHours();
                    var m = dateIn.getMinutes();
                    m = (10 > m) ? "0" + m : m;
                    test1 = moment().hours(h).minutes(m);
                    clockInHours.value = test1.format("hh:mm A");
                }
                
                if (this.dates[i].out != "") {
                    var dateOut = new Date(this.dates[i].out);
                    var h = dateOut.getHours();
                    var m = dateOut.getMinutes();
                    m = (10 > m) ? "0" + m : m;
                    test2 = moment().hours(h).minutes(m);
                    clockOutHours.value = test2.format("hh:mm A");
                }
            }
        }

        payPeriodForm = this.$el.find('#employee-times-modal').modal();
        payPeriodForm.modal('open');
    },

    closeEmployeeTimeModal: function () {
        payPeriodForm = this.$el.find('#employee-times-modal').modal();
        payPeriodForm.modal('close');
    },

    closeNewEmployeeTimeModal: function () {
        payPeriodForm = this.$el.find('#new-employee-times-modal').modal();
        payPeriodForm.modal('close');
    },

    savePayPeriod: function () {
        var that = this;
        
        var sessionToken = this.getCookie();
        var clockIn = this.$el.find("#clockIn").val();
        var clockOut = this.$el.find("#clockOut").val();
        var total = this.$el.find("#total").val();

        if (clockIn != "" && clockOut != "") {
            var clockInTime = new Date("January 1, 2000 " + clockIn);
            var clockOutTime = new Date("January 1, 2000 " + clockOut);

            if (clockOutTime.getHours() > clockInTime.getHours()) {
                for (var i = 0; i < this.dates.length; i++) {
                    if (this.dates[i].in == this.clockIn && this.dates[i].out == this.clockOut && this.dates[i].employeeId == this.id && this.dates[i].employeeName == this.name) {
                        var dateOut = new Date(clockInTime);
                        var h = dateOut.getHours();
                        var m = dateOut.getMinutes();
                        m = (10 > m) ? "0" + m : m;
                        var ampm = h >= 12 ? 'pm' : 'am';
                        test1 = moment().hours(h).minutes(m);
                        clockInFormated = test1.format("HH:mm");
                        clockInFormatedAmPm = test1.format("hh:mm A");

                        var dateOut = new Date(clockOutTime);
                        var h = dateOut.getHours();
                        var m = dateOut.getMinutes();
                        m = (10 > m) ? "0" + m : m;
                        var ampm = h >= 12 ? 'pm' : 'am';
                        test2 = moment().hours(h).minutes(m);
                        clockOutFormated = test2.format("HH:mm");
                        clockOutFormatedAmPm = test2.format("hh:mm A");
                        
                        this.dates[i].in = this.chosenDate + " " + clockInFormated + ":00.0";
                        this.dates[i].out = this.chosenDate + " " + clockOutFormated + ":00.0";
                        this.dates[i].timeId = this.timeId;

                        $.ajax({
                            url: '/data/edit-time',
                            data: {
                                token: sessionToken,
                                employeeId: that.id,
                                timeId: this.timeId,
                                in: this.dates[i].in,
                                out: this.dates[i].out
                            },
                            dataType: 'json',
                            type: 'POST',
                            success: function (data) {
                                M.toast({
                                    html: '{Literal}Time Saved Successfully{/Literal}' 
                                });
                                
                                var testing = '<div id ="itemsCards"> <div class="col s12 m4 l2"> <div class="card-panel card-panel-entity z-depth-2 sequence-card hoverable black-text waves-effect waves-light " style="background-color: #fff" data-id="' + that.dates[i].employeeId + '" employee-name-id="' + that.dates[i].employeeName + '" clock-out-id="' + that.dates[i].out + '" clock-in-id="' + that.dates[i].in + '" time-id="' + that.timeId + '" data-selected="0"> <div class="row description truncate"  style="color: #3970b7;">' + that.dates[i].employeeName + '</div> <div class="row item truncate" style="font-size: .95rem; margin-bottom: 0px; color: black;"> {Literal}Clock In:{/Literal}&nbsp;&nbsp;&nbsp;&nbsp; ' +  clockInFormatedAmPm + ' </div> <div class="row item truncate"  style="font-size: .95rem; margin-bottom: 0px; color: black;"> {Literal}Clock Out:{/Literal}&nbsp; ' + clockOutFormatedAmPm + ' </div> <div class="row item truncate" style="font-size: .95rem; margin-bottom: 0px; color: black;"> Total:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + total + ' </div> <div class="edit" style="display: none"> <a href="javascript:void(0)" class="btn-floating btn-large waves-effect waves-light ap-dark-blue choose-item-trigger" data-id="'+ that.dates[i].employeeId + '"> <i class="material-icons">create</i> </a> </div> </div> </div> </div>'
                                $('#approved').append(testing);
                                that.editedCard.hide();

                                payPeriodForm.modal('close'); 
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
                        break;
                    }
                }
            }
            else {
                M.toast({ html: '{Literal}Your Clock Out time must be greater than your Clock In{/Literal}' });
            }
        }
        else {
            M.toast({ html: '{Literal}Both Clock In and Clock Out must be defined{/Literal}' });
        }
    },

    changeTotal: function () {
        var clockIn = this.$el.find("#clockIn").val();
        var clockOut = this.$el.find("#clockOut").val();
        var total = document.getElementById('total');

        if (clockIn != "" && clockOut != "") {
            var clockInTime = new Date("January 1, 2000 " + clockIn);
            var clockOutTime = new Date("January 1, 2000 " + clockOut);
            
            if (clockOutTime.getHours() > clockInTime.getHours()) {
                var hours = (clockOutTime.getHours()) - clockInTime.getHours()
                var minutes = (clockOutTime.getMinutes()) - clockInTime.getMinutes();
                
                if (minutes > 0) {
                    if (hours < 10) {
                        if (minutes < 10 ) {
                            total.value = "0" + hours + ":0" + minutes
                        }
                        else if (minutes == 60) {
                            hours++;
                            total.value = "0" + hours + ":00"
                        }
                        else {
                            total.value = "0" + hours + ":" + minutes
                        }
                    }
                    else {
                        if (minutes < 10 ) {
                            total.value = hours + ":0" + minutes
                        }
                        else if (minutes == 60) {
                            hours++;
                            total.value = "0" + hours + ":00"
                        }
                        else {
                            total.value = hours + ":" + minutes
                        }
                    }
                }
                else {
                    hours = hours - 1;
                    minutes = 60 + minutes;
                    if (hours < 10) {
                        if (minutes < 10 ) {
                            total.value = "0" + hours + ":0" + minutes
                        }
                        else if (minutes == 60) {
                            hours++;
                            total.value = "0" + hours + ":00"
                        }
                        else {
                            total.value = "0" + hours + ":" + minutes
                        }
                    }
                    else {
                        if (minutes < 10 ) {
                            total.value = hours + ":0" + minutes
                        }
                        else if (minutes == 60) {
                            hours++;
                            total.value = "0" + hours + ":00"
                        }
                        else {
                            total.value = hours + ":" + minutes
                        }
                    }
                }
            }
            else if (clockOutTime.getHours() == clockInTime.getHours()) {
                var hours = 0;
                var minutes = (clockOutTime.getMinutes()) - clockInTime.getMinutes();
                
                if (minutes > 0) {
                    if (minutes < 10 ) {
                        total.value = "0" + hours + ":0" + minutes
                    }
                    else if (minutes == 60) {
                        hours++;
                        total.value = "0" + hours + ":00"
                    }
                    else {
                        total.value = "0" + hours + ":" + minutes
                    }
                }
            }
            else {
                total.value = "00:00"
            }
        }
    },

    addClockIn: function () {
        var newBreak = document.getElementById('newBreak');
        newBreak.value = "";

        var newLunch = document.getElementById('newLunch');
        newLunch.value = "";

        var newClockIn = document.getElementById('newClockIn');
        newClockIn.value = "";

        var newClockOut = document.getElementById('newClockOut');
        newClockOut.value = "";

        var newPayPeriodModal = this.$el.find('#new-employee-times-modal').modal();
        newPayPeriodModal.modal('open');
    },

    addNewPayPeriod: function () {
        var that = this;
        var sessionToken = this.getCookie();
        var clockIn = this.$el.find("#newClockIn").val();
        var clockOut = this.$el.find("#newClockOut").val();
        var newBreak = this.$el.find("#newBreak").val();
        var lunch = this.$el.find("#newLunch").val();
        var employeeName = this.$el.find('#employee-dropdown option:selected').text();
        var payLevel = this.$el.find('#payLevel-dropdown').val();
        var employeeId = this.$el.find('#employee-dropdown').val();
        var total = "";

        if (clockIn != "" && clockOut != "") {
            var clockInTime = new Date("January 1, 2000 " + clockIn);
            var clockOutTime = new Date("January 1, 2000 " + clockOut);
            
            if (clockOutTime.getHours() > clockInTime.getHours()) {
                if (employeeName == "Select Employee") {
                    M.toast({ html: '{Literal}An employee must be chosen{/Literal}' });
                }
                else {
                    var hours = (clockOutTime.getHours()) - clockInTime.getHours()
                    var minutes = (clockOutTime.getMinutes()) - clockInTime.getMinutes();
    
                    if (minutes > 0) {
                        if (hours < 10) {
                            if (minutes < 10 ) {
                                total = "0" + hours + ":0" + minutes
                            }
                            else if (minutes == 60) {
                                hours++;
                                total.value = "0" + hours + ":00"
                            }
                            else {
                                total = "0" + hours + ":" + minutes
                            }
                        }
                        else {
                            if (minutes < 10 ) {
                                total = hours + ":0" + minutes
                            }
                            else if (minutes == 60) {
                                hours++;
                                total.value = "0" + hours + ":00"
                            }
                            else {
                                total = hours + ":" + minutes
                            }
                        }
                    }
                    else {
                        hours = hours - 1;
                        minutes = 60 + minutes;
                        if (hours < 10) {
                            if (minutes < 10 ) {
                                total = "0" + hours + ":0" + minutes
                            }
                            else if (minutes == 60) {
                                hours++;
                                total.value = "0" + hours + ":00"
                            }
                            else {
                                total = "0" + hours + ":" + minutes
                            }
                        }
                        else {
                            if (minutes < 10 ) {
                                total = hours + ":0" + minutes
                            }
                            else if (minutes == 60) {
                                hours++;
                                total.value = "0" + hours + ":00"
                            }
                            else {
                                total = hours + ":" + minutes
                            }
                        }
                    }
                    

                    var dateOut = new Date(clockInTime);
                    var h = dateOut.getHours();
                    var m = dateOut.getMinutes();
                    m = (10 > m) ? "0" + m : m;
                    var ampm = h >= 12 ? 'pm' : 'am';
                    test1 = moment().hours(h).minutes(m);
                    clockInFormated = test1.format("HH:mm");
                    clockInFormatedAmPm = test1.format("hh:mm A");

                    var dateOut = new Date(clockOutTime);
                    var h = dateOut.getHours();
                    var m = dateOut.getMinutes();
                    m = (10 > m) ? "0" + m : m;
                    var ampm = h >= 12 ? 'pm' : 'am';
                    test2 = moment().hours(h).minutes(m);
                    clockOutFormated = test2.format("HH:mm");
                    clockOutFormatedAmPm = test2.format("hh:mm A");

                    inTime = this.chosenDate + " " + clockInFormated + ":00.0";
                    out = this.chosenDate + " " + clockOutFormated + ":00.0";

                    var updatedModel = {
                        id: employeeId,
                        payLevel: payLevel,
                        employeeId: employeeId,
                        employeeName: employeeName,
                        out: out,
                        total: total,
                        in: inTime
                    };

                    $.ajax({
                        url: '/data/add-times',
                        data: {
                            token: sessionToken,
                            id: employeeId,
                            in: inTime,
                            out: out,
                            total: total,
                            payLevel: payLevel
                        },
                        dataType: 'json',
                        type: 'POST',
                        success: function (data) {
                            M.toast({
                                html: '{Literal}Time Saved Successfully{/Literal}' 
                            });
                            that.dates.push(updatedModel);

                            var testing = '<div id ="itemsCards"> <div class="col s12 m4 l2"> <div class="card-panel card-panel-entity z-depth-2 sequence-card hoverable black-text waves-effect waves-light " style="background-color: #fff" data-id="' + employeeId + '" employee-name-id="' + employeeName + '" clock-out-id="' + out + '" clock-in-id="' + inTime + '" data-selected="0"> <div class="row description truncate"  style="color: #3970b7;">' + employeeName + '</div> <div class="row item truncate" style="font-size: .95rem; margin-bottom: 0px; color: black;"> {Literal}Clock In:{/Literal}&nbsp;&nbsp;&nbsp;&nbsp; ' +  clockInFormatedAmPm + ' </div> <div class="row item truncate"  style="font-size: .95rem; margin-bottom: 0px; color: black;"> {Literal}Clock Out:{/Literal}&nbsp; ' + clockOutFormatedAmPm + ' </div> <div class="row item truncate" style="font-size: .95rem; margin-bottom: 0px; color: black;"> Total:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + total + ' </div> <div class="edit" style="display: none"> <a href="javascript:void(0)" class="btn-floating btn-large waves-effect waves-light ap-dark-blue choose-item-trigger" data-id="'+ employeeId + '"> <i class="material-icons">create</i> </a> </div> </div> </div> </div>'
                            $('#approved').append(testing);
                            
                            var newPayPeriodModal = that.$el.find('#new-employee-times-modal').modal();
                            newPayPeriodModal.modal('close'); 
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
                }
            }
            else {
                M.toast({ html: '{Literal}Your Clock Out time must be greater than your Clock In{/Literal}' });
            }
        }
        else {
            M.toast({ html: '{Literal}Both Clock In and Clock Out must be defined{/Literal}' });
        }
    },

    removePayPeriodForm: function () {
        $('#delete-pay-period-modal').modal().modal('open');
    },

    removePayPeriod: function () {
        var that = this;
        var sessionToken = this.getCookie();

        $.ajax({
            url: '/data/remove-time',
            data: {
                token: sessionToken,
                employeeId: this.id,
                timeId: this.timeId,
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                M.toast({
                    html: '{Literal}Time Deleted Successfully{/Literal}' 
                });
                
                that.editedCard.hide();
                that.editedCard.css('display', 'none');
                that.editedCard.remove();
                that.editedCard.destroy();

                for (var i = 0; i < that.date.length; i++) {
                    if (that.dates[i].employeeId == that.id && that.dates[i].timeId == that.timeId) {
                        that.dates.splice(i, 1); 
                    }
                }

                payPeriodForm.modal('close'); 
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
    }
});