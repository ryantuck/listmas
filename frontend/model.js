(function($){

    var List = Backbone.Model.extend({
        defaults: {
            id: 'a1',
            items: [],
        },
        urlRoot: 'https://m2mr88rewf.execute-api.us-east-1.amazonaws.com/prod/list',
        getCustomUrl: function (method) {
            switch (method) {

                case 'create':
                    console.log('attempting creation');
                    return this.urlRoot;
                    break;
                case 'read':
                    console.log('attempting read');
                    return this.urlRoot + '/' + this.id;
                    break;
                case 'update':
                    console.log('attempting update');
                    return this.urlRoot;
                    break;
                case 'delete':
                    console.log('attempting delete');
                    return this.urlRoot + '/' + this.id;
                    break;
            }
        },
        sync: function (method, model, options) {
            options || (options = {});
            options.url = this.getCustomUrl(method.toLowerCase());

            return Backbone.sync.apply(this, arguments);
        }
    });

    var list = new List({'id': 'a123456', 'items': ['blah']});
    list.save({}, {
        success: function (model, response, options) {
            console.log('success');
        },
        error: function (model, xhr, options) {
            console.log('error');
        }
    });

    console.log(list);

})(jQuery);
