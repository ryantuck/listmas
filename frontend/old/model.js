(function($){

    var IdGenerator = Backbone.Model.extend({
        urlRoot: 'https://m2mr88rewf.execute-api.us-east-1.amazonaws.com/prod/id',
        getCustomUrl: function (method) {
            switch (method) {

                case 'read':
                    console.log('attempting read');
                    return this.urlRoot;
                    break;
            }
        },
        sync: function (method, model, options) {
            options || (options = {});
            options.url = this.getCustomUrl(method.toLowerCase());

            return Backbone.sync.apply(this, arguments);
        }
    });

    var IdGeneratorView = Backbone.View.extend({
        el: $('#id_generator'),
        events: {
            'click button#generate_id': 'generateId',
        },
        initialize: function () {
            _.bindAll(this, 'render');
            this.model.bind('change', this.render);
            this.render();
        },
        render: function () {
            $(this.el).html('<button id="generate_id">generate</button><p id="current_id">' + this.model.attributes.id + '</p>');
            return this;
        },
        generateId: function () {
            this.model.fetch({
                success: function (res) {
                    console.log('fetched');
                }
            });
        }
    });

    var ExistingListView = Backbone.View.extend({
        el: $('#existing_list'),
        events: {
            'click button#fetch_list': 'fetchList',
        },
        initialize: function () {
            this.render();
        },
        render: function () {
            $(this.el).html('<input type="text" name="list_id" id="asdf"><button id="fetch_list">fetch list</button>');
            return this;
        },
    });

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


    var ListView = Backbone.View.extend({
        el: $('#list_container'),
        initialize: function() {
            this.model = new List({
                id: 'aaa111',
                items: [
                    'train', 'pillow', 'tree'
                ],
            });

            this.render();
        },
        render: function() {
            $(this.el).append(
                "<pre><code>" +
                JSON.stringify(this.model.toJSON()) +
                "</code></pre>"
            );
        }
    });

    var list = new List({id: 'a123456', items: ['blah', 'asdf']});

    var l2 = new List({id: 'abc123'});

    l2.fetch({
        success: function (l2) {
            console.log(JSON.stringify(l2));
        }
    });

    var idGenerator = new IdGenerator();
    idGeneratorView = new IdGeneratorView({model: idGenerator});

    listView = new ListView();
    e = new ExistingListView();

//    list.save({}, {
//        success: function (model, response, options) {
//            console.log('success');
//        },
//        error: function (model, xhr, options) {
//            console.log('error');
//        }
//    });

    console.log(list.toJSON());

})(jQuery);
