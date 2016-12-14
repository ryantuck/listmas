(function ($) {

    // base model for christmas list
    var ChristmasList = Backbone.Model.extend({
        defaults: {
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
            link: null,
            is_claimed: false,
            viewing: false,
            editing: false,
            is_being_edited: false,
        },

        initialize: function (options) {
            this.options = _.extend(this.defaults, options);
            _.bindAll(this, 'render');
            this.render();
        },

        render: function () {

            this.$el.html(this.template({
                title: this.options.title,
                link: this.options.link
            }));

            if (typeof this.options.link === 'undefined') {
                this.$('.item-link').hide();
            }

            console.log(this.options);
            if (this.options.link === null) {
                this.$('.item-link').hide();
            }

            if (this.options.link === '') {
                this.$('.item-link').hide();
            }

            if (this.options.is_being_edited === true) {
                this.$('.item-edit').show();
                this.$('.item-display').hide();

                this.$('.item-editing-title').val(this.options.title);
                this.$('.item-editing-link').val(this.options.link);

                this.$('.stop-edit-item').show();
                this.$('.edit-item').hide();

            } else {
                this.$('.item-edit').hide();
                this.$('.item-display').show();

                this.$('.stop-edit-item').hide();
                this.$('.edit-item').show();

            }

            if (this.options.viewing) {

                console.log('viewing = true');

                this.$('.delete-item').hide();
                this.$('.edit-item').hide();

                if (this.options.is_claimed) {
                    console.log('is_claimed = true');
                    this.$('.claim-item').hide();
                    this.$('.is-claimed').show();
                } else {
                    this.$('.claim-item').show();
                    this.$('.is-claimed').hide();
                }

            } else if (this.options.editing) {

                console.log('editing = true');

                this.$('.claim-item').hide();
                this.$('.is-claimed').hide();

            } else {
                console.log('neither viewing or editing');
            }

            return this;
        },

    });

    var AppView = Backbone.View.extend({

        el: $('#main-div'),

        events: {
            'click button#fetch-list': 'fetchList',
            'click button#add-button': 'addItem',
            'click button.delete-item': 'deleteItem',
            'click button#generate-list': 'generateId',
            'click button.claim-item': 'claimItem',
            'click button#start-edit': 'setEditing',
            'click button#start-view': 'setViewing',
            'click button.edit-item': 'setEditItem',
            'click button.stop-edit-item': 'stopEditItem',
        },

        template: _.template($('#app').html()),

        defaults: {
            viewing: false,
            editing: false,
        },

        initialize: function (options) {
            this.options = _.extend(this.defaults, options);
            console.log('initializing appview');
            _.bindAll(this, 'render');
            this.$el.html(this.template());

            this.listenTo(idGenerator, 'change', this.render);

            this.render();
        },

        render: function () {

            if (this.options.viewing === false) {
                if (this.options.editing === false) {
                    // nothing yet selected
                    this.$('#check-owner').show();
                    this.$('#add-item-container').hide();
                    this.$('#list').hide();

                } else {
                    // editing
                    this.$('#check-owner').hide();
                    this.$('#add-item-container').show();
                    this.$('#list').show();
                }
            } else {
                // viewing
                this.$('#check-owner').hide();
                this.$('#add-item-container').hide();
                this.$('#list').show();

            }

            console.log('rendering appview');

            this.$('#missing-list-container').hide();

            if (typeof this.model.get('id') != 'undefined') {
                this.$('#current-list-id').text(this.model.get('id'));
                this.$('#shareable-link').val('http://listmas.io#' + this.model.get('id'));
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
                    var iv = new ItemView({
                        title: this.model.get('items')[i].title,
                        link: this.model.get('items')[i].link,
                        is_claimed: this.model.get('items')[i].is_claimed,
                        viewing: this.options.viewing,
                        editing: this.options.editing,
                        is_being_edited: this.model.get('items')[i].is_being_edited,
                    });
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
                link: $('#new-item-link').val(),
                is_claimed: false,
            };

            items.push(newItem);

            var self = this;

            this.model.save({}, {
                success: function(res) {
                    console.log('saved model');
                    $('#new-item').val('');
                    $('#new-item-link').val('');
                    self.render();
                },
                error: function(res) {
                    console.log('error saving model');
                },
            });

        },

        setEditItem: function (e) {

            console.log('setting item to edit mode');

            var idx = $(e.currentTarget.parentElement.parentElement.parentElement.parentElement.parentElement).index();
            var items = this.model.get('items');

            items[idx].is_being_edited = true;

            this.model.set('items', items);

            this.render();
        },

        stopEditItem: function (e) {

            console.log(e);
            console.log('exiting edit mode');

            var idx = $(e.currentTarget.parentElement.parentElement.parentElement.parentElement.parentElement).index();
            var items = this.model.get('items');

            var currentDisplay = $(e.currentTarget.parentElement.parentElement).find('.item-edit');

            items[idx].title = currentDisplay.find('.item-editing-title').val();
            items[idx].link = currentDisplay.find('.item-editing-link').val();

            items[idx].is_being_edited = false;

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

        deleteItem: function (e) {

            // gross hack
            var idx = $(e.currentTarget.parentElement.parentElement.parentElement.parentElement.parentElement).index();

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

        claimItem: function (e) {

            // vomsauce
            var idx = $(e.currentTarget.parentElement.parentElement.parentElement.parentElement.parentElement).index();

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

        setEditing: function () {
            if (confirm("you're about to edit this list. please be nice and make sure it's yours 🙃 ")) {
                this.$('#check-owner').hide();
                this.$('#add-item-container').show();
                this.options.editing = true;
                this.render();
            }
        },

        setViewing: function () {
            if (confirm("you definitely want to view this list? if it's yours, the magic of christmas will be ruined 😳")) {
                this.options.viewing = true;
                this.$('#check-owner').hide();
                this.$('#add-item-container').hide();
                this.render();
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

    // load base homepage or specific list depending on url hash

    var xmasList = new ChristmasList;

    var app;

    if (location.hash.charAt(0) === '#') {
        var hashValue = location.hash.slice(1);

        xmasList.set('id', hashValue);

        xmasList.fetch({
            success: function(res) {
                console.log('fetched list');
                app = new AppView({model: xmasList});
            },
            error: function() {
                console.log('error fetching list');
            },
        });
    } else {
        app = new AppView({model: xmasList});
    }



})(jQuery);
