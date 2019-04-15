var PayPeriods = Backbone.Model.extend({
    defaults: {
        periodEnd: '',
        periodStart: 0,
        periodDuration: 0,
        weekStartDay: 0,
        weekEndDay: 0,
        hoursBeforeOT: 0
    }
});