var EmployeesFormView = Backbone.View.extend({
    events: {
        'change #pay-level-dropdown' : 'showPayLevel',
        'click .advanced' : "showHidePosUser"
    },

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.model = options.model;
        this.payTypes = options.payTypes;
        this.tills = options.tills;
        this.userGroups = options.userGroups;
    },

    render: function () {
        var that = this;
        this.$el.detach();
        this.$el.html(this.template({
            employee: this.model.toJSON(),
            payTypes: this.payTypes,
            tills: this.tills,
            userGroups: this.userGroups
        }));
        return this;
    },

    showHidePosUser: function () {
        var posUserSwitch = this.$el.find('#posUserSwitch:checked').length > 0;

        if (posUserSwitch) {
            $('#posUserOptions').show();
            $('#posUserSwitches').show();
        }
        else {
            $('#posUserOptions').hide();
            $('#posUserSwitches').hide();
        }
    },

    showPayLevel: function(e) {
        var payLevel = document.getElementById("pay-level-dropdown").selectedIndex
        if (payLevel ==  1) {
            $('#show1').show();
            $('#show2').hide();
            $('#show3').hide();
            $('#show4').hide();
            $('#show5').hide();
            $('#show6').hide();
            $('#show7').hide();
            $('#show8').hide();
            $('#show9').hide();
            $('#show10').hide();
            $('#show11').hide();
            $('#show12').hide();
            $('#show13').hide();
            $('#show14').hide();
            $('#show15').hide();
            $('#show16').hide();
            $('#show17').hide();
            $('#show18').hide();
            $('#show19').hide();
            $('#show20').hide();
        }
        else if (payLevel ==  2) {
            $('#show1').hide();
            $('#show2').show();
            $('#show3').hide();
            $('#show4').hide();
            $('#show5').hide();
            $('#show6').hide();
            $('#show7').hide();
            $('#show8').hide();
            $('#show9').hide();
            $('#show10').hide();
            $('#show11').hide();
            $('#show12').hide();
            $('#show13').hide();
            $('#show14').hide();
            $('#show15').hide();
            $('#show16').hide();
            $('#show17').hide();
            $('#show18').hide();
            $('#show19').hide();
            $('#show20').hide();
        }
        else if (payLevel ==  3) {
            $('#show1').hide();
            $('#show2').hide();
            $('#show3').show();
            $('#show4').hide();
            $('#show5').hide();
            $('#show6').hide();
            $('#show7').hide();
            $('#show8').hide();
            $('#show9').hide();
            $('#show10').hide();
            $('#show11').hide();
            $('#show12').hide();
            $('#show13').hide();
            $('#show14').hide();
            $('#show15').hide();
            $('#show16').hide();
            $('#show17').hide();
            $('#show18').hide();
            $('#show19').hide();
            $('#show20').hide();
        }
        else if (payLevel ==  4) {
            $('#show1').hide();
            $('#show2').hide();
            $('#show3').hide();
            $('#show4').show();
            $('#show5').hide();
            $('#show6').hide();
            $('#show7').hide();
            $('#show8').hide();
            $('#show9').hide();
            $('#show10').hide();
            $('#show11').hide();
            $('#show12').hide();
            $('#show13').hide();
            $('#show14').hide();
            $('#show15').hide();
            $('#show16').hide();
            $('#show17').hide();
            $('#show18').hide();
            $('#show19').hide();
            $('#show20').hide();
        }
        else if (payLevel ==  5) {
            $('#show1').hide();
            $('#show2').hide();
            $('#show3').hide();
            $('#show4').hide();
            $('#show5').show();
            $('#show6').hide();
            $('#show7').hide();
            $('#show8').hide();
            $('#show9').hide();
            $('#show10').hide();
            $('#show11').hide();
            $('#show12').hide();
            $('#show13').hide();
            $('#show14').hide();
            $('#show15').hide();
            $('#show16').hide();
            $('#show17').hide();
            $('#show18').hide();
            $('#show19').hide();
            $('#show20').hide();
        }
        else if (payLevel ==  6) {
            $('#show1').hide();
            $('#show2').hide();
            $('#show3').hide();
            $('#show4').hide();
            $('#show5').hide();
            $('#show6').show();
            $('#show7').hide();
            $('#show8').hide();
            $('#show9').hide();
            $('#show10').hide();
            $('#show11').hide();
            $('#show12').hide();
            $('#show13').hide();
            $('#show14').hide();
            $('#show15').hide();
            $('#show16').hide();
            $('#show17').hide();
            $('#show18').hide();
            $('#show19').hide();
            $('#show20').hide();
        }
        else if (payLevel ==  7) {
            $('#show1').hide();
            $('#show2').hide();
            $('#show3').hide();
            $('#show4').hide();
            $('#show5').hide();
            $('#show6').hide();
            $('#show7').show();
            $('#show8').hide();
            $('#show9').hide();
            $('#show10').hide();
            $('#show11').hide();
            $('#show12').hide();
            $('#show13').hide();
            $('#show14').hide();
            $('#show15').hide();
            $('#show16').hide();
            $('#show17').hide();
            $('#show18').hide();
            $('#show19').hide();
            $('#show20').hide();
        }
        else if (payLevel ==  8) {
            $('#show1').hide();
            $('#show2').hide();
            $('#show3').hide();
            $('#show4').hide();
            $('#show5').hide();
            $('#show6').hide();
            $('#show7').hide();
            $('#show8').show();
            $('#show9').hide();
            $('#show10').hide();
            $('#show11').hide();
            $('#show12').hide();
            $('#show13').hide();
            $('#show14').hide();
            $('#show15').hide();
            $('#show16').hide();
            $('#show17').hide();
            $('#show18').hide();
            $('#show19').hide();
            $('#show20').hide();
        }
        else if (payLevel ==  9) {
            $('#show1').hide();
            $('#show2').hide();
            $('#show3').hide();
            $('#show4').hide();
            $('#show5').hide();
            $('#show6').hide();
            $('#show7').hide();
            $('#show8').hide();
            $('#show9').show();
            $('#show10').hide();
            $('#show11').hide();
            $('#show12').hide();
            $('#show13').hide();
            $('#show14').hide();
            $('#show15').hide();
            $('#show16').hide();
            $('#show17').hide();
            $('#show18').hide();
            $('#show19').hide();
            $('#show20').hide();
        }
        else if (payLevel ==  10) {
            $('#show1').hide();
            $('#show2').hide();
            $('#show3').hide();
            $('#show4').hide();
            $('#show5').hide();
            $('#show6').hide();
            $('#show7').hide();
            $('#show8').hide();
            $('#show9').hide();
            $('#show10').show();
            $('#show11').hide();
            $('#show12').hide();
            $('#show13').hide();
            $('#show14').hide();
            $('#show15').hide();
            $('#show16').hide();
            $('#show17').hide();
            $('#show18').hide();
            $('#show19').hide();
            $('#show20').hide();
        }
        else if (payLevel ==  11) {
            $('#show1').hide();
            $('#show2').hide();
            $('#show3').hide();
            $('#show4').hide();
            $('#show5').hide();
            $('#show6').hide();
            $('#show7').hide();
            $('#show8').hide();
            $('#show9').hide();
            $('#show10').hide();
            $('#show11').show();
            $('#show12').hide();
            $('#show13').hide();
            $('#show14').hide();
            $('#show15').hide();
            $('#show16').hide();
            $('#show17').hide();
            $('#show18').hide();
            $('#show19').hide();
            $('#show20').hide();
        }
        else if (payLevel ==  12) {
            $('#show1').hide();
            $('#show2').hide();
            $('#show3').hide();
            $('#show4').hide();
            $('#show5').hide();
            $('#show6').hide();
            $('#show7').hide();
            $('#show8').hide();
            $('#show9').hide();
            $('#show10').hide();
            $('#show11').hide();
            $('#show12').show();
            $('#show13').hide();
            $('#show14').hide();
            $('#show15').hide();
            $('#show16').hide();
            $('#show17').hide();
            $('#show18').hide();
            $('#show19').hide();
            $('#show20').hide();
        }
        else if (payLevel ==  13) {
            $('#show1').hide();
            $('#show2').hide();
            $('#show3').hide();
            $('#show4').hide();
            $('#show5').hide();
            $('#show6').hide();
            $('#show7').hide();
            $('#show8').hide();
            $('#show9').hide();
            $('#show10').hide();
            $('#show11').hide();
            $('#show12').hide();
            $('#show13').show();
            $('#show14').hide();
            $('#show15').hide();
            $('#show16').hide();
            $('#show17').hide();
            $('#show18').hide();
            $('#show19').hide();
            $('#show20').hide();
        }
        else if (payLevel ==  14) {
            $('#show1').hide();
            $('#show2').hide();
            $('#show3').hide();
            $('#show4').hide();
            $('#show5').hide();
            $('#show6').hide();
            $('#show7').hide();
            $('#show8').hide();
            $('#show9').hide();
            $('#show10').hide();
            $('#show11').hide();
            $('#show12').hide();
            $('#show13').hide();
            $('#show14').show();
            $('#show15').hide();
            $('#show16').hide();
            $('#show17').hide();
            $('#show18').hide();
            $('#show19').hide();
            $('#show20').hide();
        }
        else if (payLevel ==  15) {
            $('#show1').hide();
            $('#show2').hide();
            $('#show3').hide();
            $('#show4').hide();
            $('#show5').hide();
            $('#show6').hide();
            $('#show7').hide();
            $('#show8').hide();
            $('#show9').hide();
            $('#show10').hide();
            $('#show11').hide();
            $('#show12').hide();
            $('#show13').hide();
            $('#show14').hide();
            $('#show15').show();
            $('#show16').hide();
            $('#show17').hide();
            $('#show18').hide();
            $('#show19').hide();
            $('#show20').hide();
        }
        else if (payLevel ==  16) {
            $('#show1').hide();
            $('#show2').hide();
            $('#show3').hide();
            $('#show4').hide();
            $('#show5').hide();
            $('#show6').hide();
            $('#show7').hide();
            $('#show8').hide();
            $('#show9').hide();
            $('#show10').hide();
            $('#show11').hide();
            $('#show12').hide();
            $('#show13').hide();
            $('#show14').hide();
            $('#show15').hide();
            $('#show16').show();
            $('#show17').hide();
            $('#show18').hide();
            $('#show19').hide();
            $('#show20').hide();
        }
        else if (payLevel ==  17) {
            $('#show1').hide();
            $('#show2').hide();
            $('#show3').hide();
            $('#show4').hide();
            $('#show5').hide();
            $('#show6').hide();
            $('#show7').hide();
            $('#show8').hide();
            $('#show9').hide();
            $('#show10').hide();
            $('#show11').hide();
            $('#show12').hide();
            $('#show13').hide();
            $('#show14').hide();
            $('#show15').hide();
            $('#show16').hide();
            $('#show17').show();
            $('#show18').hide();
            $('#show19').hide();
            $('#show20').hide();
        }
        else if (payLevel ==  18) {
            $('#show1').hide();
            $('#show2').hide();
            $('#show3').hide();
            $('#show4').hide();
            $('#show5').hide();
            $('#show6').hide();
            $('#show7').hide();
            $('#show8').hide();
            $('#show9').hide();
            $('#show10').hide();
            $('#show11').hide();
            $('#show12').hide();
            $('#show13').hide();
            $('#show14').hide();
            $('#show15').hide();
            $('#show16').hide();
            $('#show17').hide();
            $('#show18').show();
            $('#show19').hide();
            $('#show20').hide();
        }
        else if (payLevel ==  19) {
            $('#show1').hide();
            $('#show2').hide();
            $('#show3').hide();
            $('#show4').hide();
            $('#show5').hide();
            $('#show6').hide();
            $('#show7').hide();
            $('#show8').hide();
            $('#show9').hide();
            $('#show10').hide();
            $('#show11').hide();
            $('#show12').hide();
            $('#show13').hide();
            $('#show14').hide();
            $('#show15').hide();
            $('#show16').hide();
            $('#show17').hide();
            $('#show18').hide();
            $('#show19').show();
            $('#show20').hide();
        }
        else if (payLevel ==  20) {
            $('#show1').hide();
            $('#show2').hide();
            $('#show3').hide();
            $('#show4').hide();
            $('#show5').hide();
            $('#show6').hide();
            $('#show7').hide();
            $('#show8').hide();
            $('#show9').hide();
            $('#show10').hide();
            $('#show11').hide();
            $('#show12').hide();
            $('#show13').hide();
            $('#show14').hide();
            $('#show15').hide();
            $('#show16').hide();
            $('#show17').hide();
            $('#show18').hide();
            $('#show19').hide();
            $('#show20').show();
        }
        else {
            $('#show1').hide();
            $('#show2').hide();
            $('#show3').hide();
            $('#show4').hide();
            $('#show5').hide();
            $('#show6').hide();
            $('#show7').hide();
            $('#show8').hide();
            $('#show9').hide();
            $('#show10').hide();
            $('#show11').hide();
            $('#show12').hide();
            $('#show13').hide();
            $('#show14').hide();
            $('#show15').hide();
            $('#show16').hide();
            $('#show17').hide();
            $('#show18').hide();
            $('#show19').hide();
            $('#show20').hide();
        }
    },
});
