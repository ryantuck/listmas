(function ($) {

    // base model for christmas list
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

    // initially fetch stuff - this should trigger appView.render()
    l.fetch({
        success: function(l) {
            console.log('fetching list');
            console.log(JSON.stringify(l));
        }
    });

    var AppView = Backbone.View.extend({

        el: $('#main-div'),

        events: {
            'click button#my-button': 'changeStuff'
        },

        template: _.template($('#app').html()),

        initialize: function () {
            console.log('initializing appview');
            _.bindAll(this, 'render');
            this.$el.html(this.template());
            var self = this;
            this.model.fetch({
                success: function(res) {
                    self.render();
                }
            });
        },

        render: function () {

            console.log('rendering appview');

            this.$('#list ul').empty();

            if (this.model.get('items') === null) {
                this.$('#list p').text('no items!');
            }
            else {
                this.$('#list p').text('');
                for (i=0; i<this.model.get('items').length; i++) {
                    this.$('#list ul').append('<li>'+l.get('items')[i]+'</li>');
                }
            }
        },

        changeStuff: function () {
            var val = $('#asdf').val();
            $('#output').text(val);
            this.model.set('id', val);
            console.log(this.model.get('id'));
            var self = this;
            this.model.fetch({
                success: function(res) {
                    console.log('fetched list');
                    console.log(res);
                    console.log(self.model);
                    self.render();
                },
                error: function() {
                    console.log('error fetching list');
                    self.render();
                },
            });
        },

    });

    app = new AppView({model: l});


})(jQuery);
