(function($){

    // `Backbone.sync`: Overrides persistence storage with dummy function. This enables use of `Model.destroy()` without raising an error.
    Backbone.sync = function(method, model, success, error){
        success();
    }

    var Item = Backbone.Model.extend({
        urlRoot: '/items',
        defaults: {
            title: 'gift title'
        }
    });

    var List = Backbone.Collection.extend({
        model: Item,
        url: '/items'
    });

    var ItemView = Backbone.View.extend({
        tagName: 'li', // name of tag to be created
        // `ItemView`s now respond to two clickable actions for each `Item`: swap and delete.
        events: {
            'click span.delete': 'remove'
        },
        // `initialize()` now binds model change/removal to the corresponding handlers below.
        initialize: function(){
            _.bindAll(this, 'render', 'unrender', 'remove'); // every function that uses 'this' as the current object should be in here

            this.model.bind('change', this.render);
            this.model.bind('remove', this.unrender);
        },
        // `render()` now includes two extra `span`s corresponding to the actions swap and delete.
        render: function(){
            $(this.el).html('<span style="color:black;">'+this.model.get('title')+'</span> &nbsp; &nbsp; <span class="delete" style="cursor:pointer; color:red; font-family:sans-serif;">[delete]</span>');
            return this; // for chainable calls, like .render().el
        },
        // `unrender()`: Makes Model remove itself from the DOM.
        unrender: function(){
            $(this.el).remove();
        },
        // `remove()`: We use the method `destroy()` to remove a model from its collection. Normally this would also delete the record from its persistent storage, but we have overridden that (see above).
        remove: function(){
            this.model.destroy();
        }
    });

    // Because the new features (swap and delete) are intrinsic to each `Item`, there is no need to modify `ListView`.
    var ListView = Backbone.View.extend({
        el: $('body'), // el attaches to existing element
        events: {
            'click button#add': 'addItem'
        },
        initialize: function(){
            _.bindAll(this, 'render', 'addItem', 'appendItem'); // every function that uses 'this' as the current object should be in here

            this.collection = new List();
            this.collection.bind('add', this.appendItem); // collection event binder

            this.counter = 0;
            this.render();
        },
        render: function(){
            var self = this;
            $(this.el).append("<button id='add'>Add list item</button>");
            $(this.el).append("<ul></ul>");
            _(this.collection.models).each(function(item){ // in case collection is not empty
                self.appendItem(item);
            }, this);
        },
        addItem: function(){
            this.counter++;
            var item = new Item();
            item.set({
                part2: item.get('part2') + this.counter // modify item defaults
            });
            this.collection.add(item);
        },
        appendItem: function(item){
            var itemView = new ItemView({
                model: item
            });
            $('ul', this.el).append(itemView.render().el);
        }
    });

    var listView = new ListView();
})(jQuery);
