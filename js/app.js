(function(win, doc, $) {
  'use strict';
  var app;
  app = win.app || {};
  app.Data = Backbone.Model.extend({
    defaults: {
      shots: ['popular', 'debuts', 'everyone']
    }
  });
  app.DataList = Backbone.Collection.extend({
    model: app.Data,
    url: 'http://api.dribbble.com/shots/popular'
  });
  app.ListsController = Backbone.Router.extend({
    routes: {
      'popular': 'popular',
      'debuts': 'debuts',
      'everyone': 'everyone',
      'player/:user': 'search'
    },
    initialize: function() {
      this.view = new app.ListView({
        player: 'popular'
      });
      this.model = this.view.model;
      return Backbone.history.start();
    },
    popular: function() {
      return this.view.render({
        player: 'popular'
      });
    },
    debuts: function() {
      return this.view.render({
        player: 'debuts'
      });
    },
    everyone: function() {
      return this.view.render({
        player: 'everyone'
      });
    },
    search: function(user) {
      return this.view.render({
        player: user
      });
    }
  });
  app.ListView = Backbone.View.extend({
    el: '#List',
    model: app.Data,
    collection: app.DataList,
    initialize: function(option) {
      option = _.extend({
        page: 1,
        par_page: 10
      }, option);
      this.$item = $('#list-template').html();
      this.template = Handlebars.compile(this.$item);
      return this.render(option);
    },
    render: function(option) {
      var self;
      self = this;
      this.reset();
      this.collection = new app.DataList();
      return this.collection.fetch({
        data: option,
        dataType: 'jsonp',
        timeout: 50000
      }).done(function(data) {
        console.log(data);
        return self.add(data);
      });
    },
    add: function(data) {
      var self;
      self = this;
      return _.each(data.shots, function(d, i) {
        return self.$el.append(self.template(d));
      });
    },
    reset: function() {
      return this.$el.empty();
    }
  });
  app.BreadCrumbs = Backbone.View.extend({
    el: '#BreadCrumbs',
    initialize: function() {
      return this.$el.append('<li>Popular</li>');
    },
    reset: function() {
      return this.$el.empty();
    }
  });
  app.SearchView = Backbone.View.extend({
    el: '#Search',
    events: {
      'click a.button': 'submit',
      'keypress input': 'submit'
    },
    initialize: function() {
      this.$input = this.$('input[type="text"]');
      this.$btn = this.$('a.button');
      return _.bindAll(this, 'submit');
    },
    submit: function(e) {
      var isPress, name;
      isPress = e.currentTarget.tagName.toLowerCase() === 'input';
      if (isPress && e.which !== 13) {
        return;
      }
      name = this.$input.val();
      this.$btn.attr('href', '#player/' + name);
      if (isPress) {
        return win.location.hash = '#player/' + name;
      }
    }
  });
  app.init = function() {
    var breadCrumbsView, listsController, searchView;
    $(doc).foundation();
    breadCrumbsView = new app.BreadCrumbs();
    searchView = new app.SearchView();
    return listsController = new app.ListsController();
  };
  $(function() {
    return app.init();
  });
})(this, this.document, jQuery);
