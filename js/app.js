var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

(function(win, doc, $) {
  'use strict';
  var SHOTS, app;
  app = win.app || {};
  SHOTS = ['popular', 'debuts', 'everyone'];
  app.Data = (function(_super) {
    __extends(Data, _super);

    function Data() {
      return Data.__super__.constructor.apply(this, arguments);
    }

    Data.prototype.defaults = {
      config: {
        shots: SHOTS,
        page: 1,
        per_page: 15
      }
    };

    return Data;

  })(Backbone.Model);
  app.DataList = (function(_super) {
    __extends(DataList, _super);

    function DataList() {
      return DataList.__super__.constructor.apply(this, arguments);
    }

    DataList.prototype.model = app.Data;

    DataList.prototype.url = 'http://api.dribbble.com/shots/popular';

    return DataList;

  })(Backbone.Collection);
  app.ListsController = (function(_super) {
    __extends(ListsController, _super);

    function ListsController() {
      return ListsController.__super__.constructor.apply(this, arguments);
    }

    ListsController.prototype.routes = {
      ':id': 'view',
      ':id/page': 'view',
      ':id/page/:number': 'view',
      'player/:user': 'search'
    };

    ListsController.prototype.initialize = function() {
      this.view = new app.ListView({
        player: 'popular',
        hashName: location.hash.replace('#', '')
      });
      this.view.subNav.$('.popular').addClass('active');
      return Backbone.history.start();
    };

    ListsController.prototype.view = function(id, number) {
      this.view.render({
        player: id,
        page: number || 1
      });
      return this.view.subNav.$('.' + id).addClass('active');
    };

    ListsController.prototype.search = function(user) {
      return this.view.render({
        player: user
      });
    };

    return ListsController;

  })(Backbone.Router);
  app.ListView = (function(_super) {
    __extends(ListView, _super);

    function ListView() {
      return ListView.__super__.constructor.apply(this, arguments);
    }

    ListView.prototype.el = '#List';

    ListView.prototype.initialize = function(option) {
      var isShots;
      option = _.extend({
        page: 1,
        par_page: 15
      }, option);
      this.$item = $('#ListTemplate').html();
      this.template = Handlebars.compile(this.$item);
      this.collection = new app.DataList([]);
      this.subNav = new app.SubNavView(option.player);
      this.pagination = new app.PaginationView({
        collection: this.collection,
        option: option
      });
      isShots = _.some(SHOTS, function(v, i) {
        if (new RegExp(v, 'ig').test(option.hashName)) {
          return true;
        }
        return false;
      });
      if (/player\/.+/ig.test(option.hashName) || isShots) {

      } else {
        return this.render(option);
      }
    };

    ListView.prototype.render = function(option) {
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
          return _this.add(data, option.player);
        };
      })(this));
    };

    ListView.prototype.add = function(data, player) {
      _.each(data.shots, (function(_this) {
        return function(d, i) {
          return _this.$el.append(_this.template(d));
        };
      })(this));
      return this.pagination.render(data, player);
    };

    ListView.prototype.reset = function() {
      this.$el.empty();
      return this.subNav.reset();
    };

    return ListView;

  })(Backbone.View);
  app.SubNavView = (function(_super) {
    __extends(SubNavView, _super);

    function SubNavView() {
      return SubNavView.__super__.constructor.apply(this, arguments);
    }

    SubNavView.prototype.el = '#SubNav';

    SubNavView.prototype.events = {
      'click a': 'active'
    };

    SubNavView.prototype.initialize = function(id) {
      return _.bindAll(this, 'active');
    };

    SubNavView.prototype.active = function(e) {
      this.reset();
      return $(e.currentTarget).parent().addClass('active');
    };

    SubNavView.prototype.reset = function() {
      return this.$el.find('dd.active').removeClass('active');
    };

    return SubNavView;

  })(Backbone.View);
  app.PaginationView = (function(_super) {
    __extends(PaginationView, _super);

    function PaginationView() {
      return PaginationView.__super__.constructor.apply(this, arguments);
    }

    PaginationView.prototype.el = '#Pagination';

    PaginationView.prototype.initialize = function(data) {
      return this.$el.pagination({
        prevText: '&laquo;',
        nextText: '&raquo;',
        cssStyle: 'disabled',
        hrefTextPrefix: '#' + data.option.player + '/page/',
        items: 750,
        itemsOnPage: 15
      });
    };

    PaginationView.prototype.render = function(option, category) {
      var o;
      this.reset();
      o = this.$el.data('pagination');
      o.currentPage = parseInt(option.page, 10) - 1;
      o.hrefTextPrefix = '#' + category + '/page/';
      return this.$el.pagination('updateItems', option.total);
    };

    PaginationView.prototype.reset = function() {
      return this.$el.pagination('destroy');
    };

    return PaginationView;

  })(Backbone.View);
  app.SearchView = (function(_super) {
    __extends(SearchView, _super);

    function SearchView() {
      return SearchView.__super__.constructor.apply(this, arguments);
    }

    SearchView.prototype.el = '#Search';

    SearchView.prototype.events = {
      'click a.button': 'submit',
      'keypress input': 'submit'
    };

    SearchView.prototype.initialize = function() {
      _.bindAll(this, 'submit');
      this.$input = this.$('input[type="text"]');
      return this.$btn = this.$('a.button');
    };

    SearchView.prototype.submit = function(e) {
      var isPress, name;
      isPress = e.currentTarget.tagName.toLowerCase() === 'input';
      if (isPress && e.which !== 13) {
        return;
      }
      if (this.$input.val() !== '') {
        name = this.$input.val().replace(/\s+/g, '');
      } else {
        e.preventDefault();
        return;
      }
      this.$btn.attr('href', '#player/' + name);
      if (isPress) {
        return win.location.hash = '#player/' + name;
      }
    };

    return SearchView;

  })(Backbone.View);
  app.init = function() {
    var controller, searchView;
    $(doc).foundation();
    searchView = new app.SearchView();
    return controller = new app.ListsController();
  };
  $(function() {
    return app.init();
  });
})(this, this.document, jQuery);
