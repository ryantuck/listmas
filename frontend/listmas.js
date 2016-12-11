(function ($) {

    // base model for christmas list
    var ChristmasList = Backbone.Model.extend({
        defaults: {
//            id: null,
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

    idGenerator = new IdGenerator;

    var ItemView = Backbone.View.extend({

        tagName: 'li',

        template: _.template($('#item').html()),

        defaults: {
            title: 'some present',
            is_published: false,
            is_claimed: false,
        },

        initialize: function (options) {
            this.options = _.extend(this.defaults, options);
            _.bindAll(this, 'render');
            this.render();
        },

        render: function () {
            this.$el.html(this.template({title: this.options.title}));

            this.$('.is_published').hide();
            this.$('.is_claimed').hide();

            this.$('.publish').show();
            this.$('.delete').show();
            this.$('.claim').hide();


            if (this.options.is_published) {
                this.$('.delete').hide();
                this.$('.publish').hide();
                this.$('.claim').show();

                this.$('.is_published').show();

                if (this.options.is_claimed) {
                    this.$('.is_claimed').show();
                    this.$('.claim').hide();
                }
            }

            return this;
        },

    });

    var AppView = Backbone.View.extend({

        el: $('#main-div'),

        events: {
            'click button#fetch-list': 'fetchList',
            'click button#add-button': 'addItem',
            'click button.delete': 'deleteItem',
            'click button#generate-list': 'generateId',
            'click button.publish': 'publishItem',
            'click button.claim': 'claimItem'
        },

        template: _.template($('#app').html()),

        initialize: function () {
            console.log('initializing appview');
            _.bindAll(this, 'render');
            this.$el.html(this.template());

            this.listenTo(idGenerator, 'change', this.render);

            this.render();
        },

        render: function () {

            console.log('rendering appview');

            this.$('#missing-list-container').hide();

            if (typeof this.model.get('id') != 'undefined') {
                console.log(this.model);
                this.$('#current-list-id').text(this.model.get('id'));
                this.$('#current-list-container').show();
            }
            else {
                this.$('#current-list-container').hide();
            }

            this.$('#list ul').empty();

            if (this.model.get('items') === null) {
                this.$('#current-list-container').hide();
                this.$('#missing-list-container').show();
            }
            else if (this.model.get('items').length === 0) {
                this.$('#list p').text('no items in list');
            }
            else {
                this.$('#list p').text('');
                for (i=0; i<this.model.get('items').length; i++) {
                    var iv = new ItemView(this.model.get('items')[i]);
                    this.$('#list ul').append(iv.el);
                }
            }
        },

        fetchList: function () {

            // read input from list id input box
            var val = $('#asdf').val();
            $('#current-list-id').text(val);
            this.model.set('id', val);

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

        addItem: function () {

            var items = this.model.get('items');

            var newItem = {
                title: $('#new-item').val(),
                is_published: false,
                is_claimed: false,
            };

            items.push(newItem);

            var self = this;

            this.model.save({}, {
                success: function(res) {
                    console.log('saved model');
                    $('#new-item').val('');
                    self.render();
                },
                error: function(res) {
                    console.log('error saving model');
                },
            });

        },

        deleteItem: function (e) {

            // gross hack
            var idx = $(e.currentTarget.parentElement.parentElement).index();

            var items = this.model.get('items');

            items.splice(idx, 1);

            var self = this;
            this.model.save({}, {
                success: function(res) {
                    console.log('delete successful');
                    self.render();
                },
                error: function(res) {
                    console.log('error deleting item');
                },
            });

        },

        publishItem: function (e) {

            var idx = $(e.currentTarget.parentElement.parentElement).index();

            var items = this.model.get('items');

            items[idx].is_published = true;

            this.model.set('items', items);

            var self = this;
            this.model.save({}, {
                success: function(res) {
                    console.log('item update successful');
                    self.render();
                },
                error: function(res) {
                    console.log('error updating item');
                },
            });

        },

        claimItem: function (e) {

            var idx = $(e.currentTarget.parentElement.parentElement).index();

            var items = this.model.get('items');

            if (confirm('you definitely want to claim this?') === true) {

                items[idx].is_claimed = true;

                this.model.set('items', items);

                var self = this;
                this.model.save({}, {
                    success: function(res) {
                        console.log('item claim successful');
                        self.render();
                    },
                    error: function(res) {
                        console.log('error claiming item');
                    },
                });
            }
        },

        generateId: function () {

            var self = this;

            idGenerator.fetch({
                success: function (res) {

                    self.model.set('id', idGenerator.id);
                    self.model.set('items', []);

                    self.model.save({}, {
                        success: function() {
                            console.log('model updated');
                            self.render();
                        },
                        error: function() {
                            console.log('error saving model');
                        }
                    });
                },
            });
        },

    });

    app = new AppView({model: new ChristmasList});


})(jQuery);
