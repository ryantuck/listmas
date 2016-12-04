(function ($) {

    var ChristmasList = Backbone.Model.extend({
        defaults: {
            id: 'aaaaaa',
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

    l = new ChristmasList({id: 'a123456'});

//    l.fetch({
//        success: function(l) {
//            console.log(JSON.stringify(l));
//        }
//    });
//
//    for (i=0; i < l.get('items').length; i++) {
//        var item = new Item({title: l.get('items')[i].title});
//        itemList.add(item);
//    };

    var Item = Backbone.Model.extend({
        defaults: {
            title: 'default title',
        },
    });

    var ItemView = Backbone.View.extend({

        tagName: 'li',

        template: _.template($('#item').html()),

        initialize: function () {
            _.bindAll(this, 'render');
            console.log(this.model);
            this.render();
        },

        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },

    });

    var ItemList = Backbone.Collection.extend({

        model: Item,

    });

    var itemList = new ItemList;


    item_1 = new Item({title: 'cup'});
    item_2 = new Item({title: 'desk'});
    item_3 = new Item({title: 'phone'});

    itemList.add(item_1);
    itemList.add(item_2);
    itemList.add(item_3);

    var ListView = Backbone.View.extend({

        //el: $('#main-div'),

        template: _.template($('#list').html()),

        initialize: function () {
            this.listenTo(itemList, 'all', this.render);
            this.render();
        },

        render: function () {
            console.log('rendering');
            this.$el.html(this.template());
            itemList.each(this.addOne, this);
            return this;

        },

        addOne: function (item) {
            var view = new ItemView({model: item});
            this.$('#stuff').append(view.render().el);
        },

    });

    var HeaderView = Backbone.View.extend({

        template: _.template($('#header').html()),

        initialize: function () {
            this.$el.html(this.template());
            this.render();
        },

        render: function () {
            return this;
        },

    });

    var AppView = Backbone.View.extend({

        el: $('#main-div'),

        template: _.template($('#app').html()),

        initialize: function () {
            this.$el.html(this.template());
            this.render();
        },

        render: function () {
            var listView = new ListView();
            this.$('#list-view-container').html(listView.render().el);

            var headerView = new HeaderView();
            this.$('#header-container').html(headerView.render().el);
        },

    });

    //listView = new ListView();
    app = new AppView();


})(jQuery);
