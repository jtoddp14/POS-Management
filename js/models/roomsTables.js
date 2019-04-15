var RoomsTables = Backbone.Model.extend({
    defaults: {
        id: null,
        name: '',
        room: '',
        type: '',
        turn: '',
        X: '',
        Y: ''
    }
});