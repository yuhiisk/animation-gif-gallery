(function(win, doc, $) {
  'use strict';
  var app;
  app = win.app || {};
  app.init = function() {
    var listView;
    $(doc).foundation();
    return listView = new app.ListView({
      player: 'yuhiisk'
    });
  };
  app.Data = Backbone.Model.extend({
    defaults: {
      player: 'yuhiisk',
      shots: ['popular', 'debuts', 'everyone']
    }
  });
  app.DataList = Backbone.Collection.extend({
    model: app.Data,
    url: './api.php'
  });
  app.ListsController = Backbone.Router.extend;
  app.ListView = Backbone.View.extend({
    el: '#List',
    model: app.Data,
    collection: app.DataList,
    initialize: function(option) {
      this.$item = $('#list-template').html();
      this.template = Handlebars.compile(this.$item);
      return this.render(option);
    },
    render: function(option) {
      var self;
      self = this;
      this.collection = new app.DataList();
      return this.collection.fetch({
        data: option
      }).done(function(data) {
        return self.add(data);
      });
    },
    add: function(data) {
      var self;
      self = this;
      return _.each(data.shots, function(d, i) {
        return self.$el.append(self.template(d));
      });
    }
  });
  app.BreadCrumbs = Backbone.View.extend;
  $(function() {
    return app.init();
  });
})(this, this.document, jQuery);
