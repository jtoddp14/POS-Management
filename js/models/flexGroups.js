var FlexGroups = Backbone.Model.extend({
    defaults: {
        id: '',
        startDate: '',
        endDate: '',
        fromMinutes: '',
        thruMinutes: '',
        sunday: false,
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        detailItems: [
            {
                masterItemId: '',
                detailItemId: '',
                subGroup: '',
                flexDetailPrice: 0.0,
            }
        ]
    }
});