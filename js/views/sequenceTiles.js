var SequenceTilesView = Backbone.View.extend({

    events: {
        'click .sequence-card': 'toggleTileSelection'
    },

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.listenTo(this.collection, 'reset', this.render);
    },

    render: function () {
        this.$el.html(this.template({ 
            sequences: this.collection.toJSON() 
        }));
        return this;
    },

    updateSequences: function (newCollection) {
        this.collection = newCollection;
    },

    toggleTileSelection: function(e, el) {
        var element = $(e.currentTarget);
        var selected = $(element).attr('data-selected') === '1';
        
        $('.sequence-card').attr('data-selected', '0');
        $('.sequence-card').removeClass('ap-teal-light', '0');
        $('.sequence-card').addClass('ap-blue');

        if (!selected) {
            $("#selected-sequence").val($(element).attr('data-id'));
            $(element).removeClass('ap-blue');
            $(element).addClass('ap-teal-light');
            $(element).attr('data-selected', '1');
        } else {
            $("#selected-sequence").val('');
            $(element).addClass('ap-blue');
            $(element).removeClass('ap-teal-light');
            $(element).attr('data-selected', '0');
        }
        
    }
});