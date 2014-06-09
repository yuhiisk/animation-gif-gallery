(function(win, doc, $) {
  'use strict';
  var SHOTS, app;
  app = win.app || {};
  SHOTS = ['popular', 'debuts', 'everyone'];
  app.Data = Backbone.Model.extend({
    defaults: {
      config: {
        shots: SHOTS,
        page: 1,
        per_page: 15
      }
    }
  });
  app.DataList = Backbone.Collection.extend({
    model: app.Data,
    url: 'http://api.dribbble.com/shots/popular'
  });
  app.ListsController = Backbone.Router.extend({
    routes: {
      ':id': 'view',
      ':id/page': 'view',
      ':id/page/:number': 'view',
      'player/:user': 'search'
    },
    initialize: function() {
      this.view = new app.ListView({
        player: 'popular',
        hashName: location.hash.replace('#', '')
      });
      return Backbone.history.start();
    },
    view: function(id, number) {
      this.view.render({
        player: id,
        page: number || 1
      });
      return this.view.subNav.$('.' + id).addClass('active');
    },
    search: function(user) {
      this.view.render({
        player: user
      });
      return this.view.subNav.reset();
    }
  });
  app.ListView = Backbone.View.extend({
    el: '#List',
    initialize: function(option) {
      option = _.extend({
        page: 1,
        par_page: 15
      }, option);
      this.$item = $('#list-template').html();
      this.template = Handlebars.compile(this.$item);
      this.collection = new app.DataList([]);
      this.subNav = new app.SubNavView(option.player);
      this.pagination = new app.PaginationView({
        collection: this.collection
      });
      if (/player\/.+/ig.test(option.hashName) || _.indexOf(SHOTS, option.hashName) !== -1) {

      } else {
        return this.render(option);
      }
    },
    render: function(option) {
      this.reset();
      switch (option.player) {
        case 'popular':
          this.collection.url = 'http://api.dribbble.com/shots/popular';
          break;
        case 'debuts':
          this.collection.url = 'http://api.dribbble.com/shots/debuts';
          break;
        case 'everyone':
          this.collection.url = 'http://api.dribbble.com/shots/everyone';
          break;
        default:
          this.collection.url = 'http://api.dribbble.com/players/' + option.player + '/shots/likes';
      }
      return this.collection.fetch({
        data: option,
        dataType: 'jsonp',
        timeout: 50000
      }).done((function(_this) {
        return function(data) {
          return _this.add(data);
        };
      })(this));
    },
    add: function(data) {
      return _.each(data.shots, (function(_this) {
        return function(d, i) {
          return _this.$el.append(_this.template(d));
        };
      })(this));
    },
    reset: function() {
      return this.$el.empty();
    }
  });
  app.SubNavView = Backbone.View.extend({
    el: '#SubNav',
    events: {
      'click a': 'active'
    },
    initialize: function(id) {
      return _.bindAll(this, 'active');
    },
    active: function(e) {
      this.reset();
      return $(e.currentTarget).parent().addClass('active');
    },
    reset: function() {
      return this.$el.find('dd.active').removeClass('active');
    }
  });
  app.PaginationView = Backbone.View.extend({
    el: '#Pagination',
    events: {
      'click a': 'active',
      'click .prev a': 'prev',
      'click .next a': 'next'
    },
    initialize: function(page) {},
    render: function() {
      return console.log('call render');
    },
    active: function(e) {
      console.log('call active');
      return e.preventDefault();
    },
    prev: function(e) {
      console.log('call prev');
      return e.preventDefault();
    },
    next: function(e) {
      console.log('call next');
      return e.preventDefault();
    }
  });
  app.SearchView = Backbone.View.extend({
    el: '#Search',
    events: {
      'click a.button': 'submit',
      'keypress input': 'submit'
    },
    initialize: function() {
      _.bindAll(this, 'submit');
      this.$input = this.$('input[type="text"]');
      return this.$btn = this.$('a.button');
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
    $(doc).foundation();
    new app.SubNavView();
    new app.SearchView();
    return new app.ListsController();
  };
  $(function() {
    return app.init();
  });
})(this, this.document, jQuery);
