(function ($) {

    var MyView = Backbone.View.extend({
        el: $('#main-div'),
        events: {
            'click button#my-button': 'changeStuff'
        },
        initialize: function () {
            //_.bindAll(this, 'render');
            this.render();
        },
        render: function () {
            var template = _.template($('#search_template').html(), {});
            this.$el.html(template);
            console.log('rendered');
            return this;
        },
        changeStuff: function () {
            var val = $('#asdf').val();
            console.log(val);
            $('#output').text(val);
        }
    });

    var myView = new MyView();


})(jQuery);
