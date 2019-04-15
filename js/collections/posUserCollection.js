var POSUserCollection = Backbone.Collection.extend({
    model: POSUser,

    byUserGroupId: function (userGroupId) {
        filtered = this.filter(function (posUser) {
            return posUser.get("group").includes(userGroupId);
        });
        return new POSUserCollection(filtered);
    }
});