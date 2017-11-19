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

    // Base model for generating IDs for new lists.
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

    // Instantiate the idGenerator object.
    idGenerator = new IdGenerator;

    // View for any particular item.
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

        // this runs when the element is rendered.
        render: function () {

            this.$el.html(this.template({
                title: this.options.title,
                link: this.options.link
            }));

            this.$('.confirm-claim-item').hide();
            this.$('.cancel-claim-item').hide();

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

    // View for the entire app.
    var AppView = Backbone.View.extend({

        el: $('#main-div'),

        // defines what button clicks correspond to particular functions
        events: {
            'click button#fetch-list': 'fetchList',
            'click button#add-button': 'addItem',
            'click button.delete-item': 'deleteItem',
            'click button#generate-list': 'generateId',
            'click button#start-edit': 'confirmEditing',
            'click button#start-view': 'confirmViewing',
            'click button#confirm-edit': 'setEditing',
            'click button#confirm-view': 'setViewing',
            'click button#cancel-edit': 'cancelEditing',
            'click button#cancel-view': 'cancelViewing',
            'click button.edit-item': 'setEditItem',
            'click button.stop-edit-item': 'stopEditItem',
            'click button.claim-item': 'confirmClaim',
            'click button.confirm-claim-item': 'claimItem',
            'click button.cancel-claim-item': 'cancelClaim',
        },

        template: _.template($('#app').html()),

        // by default, a user is neither viewing nor editing a list
        defaults: {
            viewing: false,
            editing: false,
        },

        initialize: function (options) {
            this.options = _.extend(this.defaults, options);
            console.log('initializing appview');
            _.bindAll(this, 'render');
            this.$el.html(this.template());

            // re-render if id generator changes
            this.listenTo(idGenerator, 'change', this.render);

            this.render();
        },

        render: function () {

            // hide both the edit and change divs on start
            this.$('#confirm-edit-div').hide();
            this.$('#confirm-view-div').hide();

            // logic for showing / hiding viewing / editing divs
            // depending on state of view
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

            // by default, don't show the error message that a user is missing a list
            this.$('#missing-list-container').hide();

            // if the id of the model *is* defined, show the shareable link
            if (typeof this.model.get('id') != 'undefined') {
                this.$('#shareable-link').attr('href', 'http://listmas.io/' + this.model.get('id'));
                this.$('#shareable-link').text('http://listmas.io/' + this.model.get('id'));
                this.$('#current-list-container').show();
            }
            else {
                this.$('#current-list-container').hide();
            }

            // start out with an empty list of items
            this.$('#list ul').empty();
            this.$('#list p').hide();

            // if list does not exist, show missing-list div
            if (this.model.get('items') === null) {
                this.$('#current-list-container').hide();
                this.$('#missing-list-container').show();
            }
            // if list exists with no items, just show a blank list container
            else if (this.model.get('items').length === 0) {
                this.$('#list p').show();
            }
            // otherwise, populate the items list
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

        // function to call API to get list
        fetchList: function () {

            // read input from list id input box
            var val = $('#asdf').val();
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

        // call API to add item
        addItem: function () {

            var items = this.model.get('items');

            // create item
            var newItem = {
                title: $('#new-item').val(),
                link: $('#new-item-link').val(),
                is_claimed: false,
            };

            // add item to model's list of items
            items.push(newItem);

            var self = this;

            // call API to save item
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

        // change item to edit mode
        setEditItem: function (e) {

            console.log('setting item to edit mode');

            var idx = $(e.currentTarget.parentElement.parentElement.parentElement.parentElement.parentElement).index();
            var items = this.model.get('items');

            items[idx].is_being_edited = true;

            this.model.set('items', items);

            this.render();
        },

        // exit edit mode
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

        // delete item from list
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

        // mark item as claimed
        claimItem: function (e) {

            // vomsauce
            var idx = $(e.currentTarget.parentElement.parentElement.parentElement.parentElement.parentElement).index();

            var items = this.model.get('items');


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
        },

        confirmEditing: function () {

            console.log('confirming editing');
            this.$('#list-options-div').hide();
            this.$('#confirm-view-div').hide();
            this.$('#confirm-edit-div').show();
        },

        confirmViewing: function () {

            console.log('confirming editing');
            this.$('#list-options-div').hide();
            this.$('#confirm-view-div').show();
            this.$('#confirm-edit-div').hide();
        },

        cancelEditing: function () {

            console.log('canceling editing');
            this.$('#list-options-div').show();
            this.$('#confirm-view-div').hide();
            this.$('#confirm-edit-div').hide();
        },

        cancelViewing: function () {

            console.log('canceling viewing');
            this.$('#list-options-div').show();
            this.$('#confirm-view-div').hide();
            this.$('#confirm-edit-div').hide();
        },

        confirmClaim: function (e) {

            console.log('confirming claim');
            var currentDisplay = $(e.currentTarget.parentElement);

            currentDisplay.find('.claim-item').hide();
            currentDisplay.find('.confirm-claim-item').show();
            currentDisplay.find('.cancel-claim-item').show();
        },

        cancelClaim: function (e) {

            console.log('canceling claim');
            var currentDisplay = $(e.currentTarget.parentElement);

            currentDisplay.find('.claim-item').show();
            currentDisplay.find('.confirm-claim-item').hide();
            currentDisplay.find('.cancel-claim-item').hide();
        },

        setEditing: function () {

            this.$('#check-owner').hide();
            this.$('#add-item-container').show();
            this.options.editing = true;
            this.render();
        },

        setViewing: function () {

            this.options.viewing = true;
            this.$('#check-owner').hide();
            this.$('#add-item-container').hide();
            this.render();
        },

        // function for generating a new ID
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

    // if unique id in url, load that list
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
    }
    // otherwise, load up a fresh app view
    else {
        app = new AppView({model: xmasList});
    }

})(jQuery);
