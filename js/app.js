var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

(function(win, doc, $) {
  'use strict';
  var SHOTS, app;
  app = win.app || {};
  app.imageSize = true;
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
      this.category = 'popular';
      this.page = 1;
      this.mainView = new app.ListView({
        player: this.category,
        hashName: location.hash.replace('#', '')
      });
      this.mainView.subNav.$('.' + this.category).addClass('active');
      return Backbone.history.start();
    };

    ListsController.prototype.view = function(id, number) {
      this.category = id;
      this.page = number;
      this.mainView.render({
        player: id,
        page: number || 1
      });
      return this.mainView.subNav.$('.' + id).addClass('active');
    };

    ListsController.prototype.search = function(user) {
      this.category = user;
      return this.mainView.render({
        player: user
      });
    };

    ListsController.prototype.reRender = function(id, number) {
      this.isCategory = _.some(SHOTS, function(v) {
        if (new RegExp(v, 'ig').test(id)) {
          return true;
        }
        return false;
      });
      if (this.isCategory) {
        return this.view(id, number);
      } else {
        return this.search(id);
      }
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
      isShots = _.some(SHOTS, function(v) {
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
      this.$el.addClass('is-loading');
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
      var html;
      html = '';
      _.each(data.shots, (function(_this) {
        return function(d, i) {
          var $item, str;
          _.extend(d, {
            'size': app.imageSize
          });
          str = _this.template(d);
          html += str;
          $item = $(str);
          $('.lazy', $item).lazyload({
            container: _this.$el,
            event: 'load',
            effect: 'fadeIn',
            placeholder: 'data:image/gif;base64,R0lGODlhyACWAPcAAP///8MjYepMiczMzOlLiM3NzcQkYsfHx8jIyMnJycvLy9DQ0MbGxsrKyvX19ccnZeVHhOhKh8kpZ8goZuJEgcssacUlY8TExPv7+9Q1c+RGg/z1+OFDgMXFxf39/f78/fn5+f7+/tk6d9c4dvz8/MYmZNTU1MLCwssradHR0coqaNLS0tY3dN0+e+dJht/f39o7edM0cckqZ9w+e//+/skqaOZIhco7cs4vbc8vbevr6+Li4sYvauNFgtEyb9g5duFCf/TY4+BBf9Awbswta8QmY9AxbudIhtIzceBCf99BfuBBft9Aftg5d9Y3defn5/f3988wbuJDgN9Afck6cscoZfj4+M9Pgfjk7PLy8u7u7s4ubN7e3vvy9s0ta9U2c9lzm8cwathymfT09NVmkdt7oO/v78Yuafr6+sPDw9nZ2dRgjc8wbd2EpsUmZOKTsvvx9dM0cv76+9NfjPno7tXV1eqwx9o7eOCOrtBUhOakvtra2tzc3OCMrcQoZcUsZ94/fNs8etw9e8o+dNbW1vjn7s4vbNhvmN4/ffrs8fHN2+akveVGhM1IfMk5cPnp7+RFg+rq6scwa8ssaubm5stCd9dul87OztQ1ctt5n8xDeN5AfcMkYehJht+Lq+qyyMUpZeeowNExb+WfuscybNIzcPLQ3vrr8dx+ouy7ztc4dd6GqNU2dO/E1eSbt8g3b+muxc1He/rt8vfi6uCNrcczbfnp8Mcxa8orad0+fNdtluZHhco8c/nq8PHK2dlymvz099o8edJZiP33+dNei8MlYtp4ntx9ouGQr+Hh4dQ0cvXc5tU1c8YtaOWhu80ubNt9oe2+0cwsas9Qgcwtauirw+u3y+WeuvXZ5Ou1yuzs7M5Mf/HM2scoZtw9esUoZdFVhds9eu/D1Mo9dNl1nPPU4M0ua85KfeJDgeKVs9p3ndg6d+isxONEgf/9/sMkYs/Pz8UqZuenwMYnZNdqlNs8ecUrZ+3t7fLO3Oepwd2Bpffh6QAAAAAAAAAAAAAAACH/C1hNUCBEYXRhWE1QPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS41LWMwMjEgNzkuMTU0OTExLCAyMDEzLzEwLzI5LTExOjQ3OjE2ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QjZGNkVDRkRGNzVBMTFFM0EzQjNCMDAyMEQ2QjQ0NTUiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QjZGNkVDRkVGNzVBMTFFM0EzQjNCMDAyMEQ2QjQ0NTUiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpCNkY2RUNGQkY3NUExMUUzQTNCM0IwMDIwRDZCNDQ1NSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpCNkY2RUNGQ0Y3NUExMUUzQTNCM0IwMDIwRDZCNDQ1NSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PgH//v38+/r5+Pf29fTz8vHw7+7t7Ovq6ejn5uXk4+Lh4N/e3dzb2tnY19bV1NPS0dDPzs3My8rJyMfGxcTDwsHAv769vLu6ubi3trW0s7KxsK+urayrqqmop6alpKOioaCfnp2cm5qZmJeWlZSTkpGQj46NjIuKiYiHhoWEg4KBgH9+fXx7enl4d3Z1dHNycXBvbm1sa2ppaGdmZWRjYmFgX15dXFtaWVhXVlVUU1JRUE9OTUxLSklIR0ZFRENCQUA/Pj08Ozo5ODc2NTQzMjEwLy4tLCsqKSgnJiUkIyIhIB8eHRwbGhkYFxYVFBMSERAPDg0MCwoJCAcGBQQDAgEAACH5BAAAAAAALAAAAADIAJYAAAj/AAEIHEiwoMGDCBMqXMiwocOHECNKnEixosWLGDNq3Mixo8ePIEOKHEmypMmTKFOqXMmypcuXMGPKnEmzps2bOHPq3Mmzp8+fQIMKHUq0qNGjSJMqXcq0qdOnUKNKnUq1qtWrWLNq3cq1q9evYMOKHUu2rNmzaNOqXcu2rdu3cOPKnUu3rt27ePPq3cu3r9+/gAMLHky4sOHDiBMrNhvkmq5t9gJIDnDmCphQsxazTPRG0+TPoCVfcdZFs8lTbf6EXg06DJ7SpkG603OLtW3Qjj7F9ihrjm0vImZMYdKiSSkZrMVs2K0RG5XbNQgImE5dAIQmE0LHwsL8oiJSoGs4/wGdobp5ATOyf+a1rDvFIGE+GxghHQloIOerE/gC+kYh9xHZcsNnD3BAXQTqSSaBdPlRNwVo5wADoEMfCPPZBIyYBwRoLDRIXQahHTJhQ6N8VoIG+cUgXw8eqriaNSMq9AgPkxlAQYMRPPAZEflFEIV8n92wXIwHlfHZOh4KAAhoLZgnRIIBGMCEfZO9QaRBdPgxWQVJTofDhRFMB4EPoFkghAAITlbLkFcKRMtnSXQpgAYGfKZKDzHUSaAU1LXwmR5tCkTDIJPxKKcArAAZ2hY2mCfBZHkECgA+n81wKAEP2uZGMPmJ8Bl3baYzmQUMnhcBOvXEIY2eqxkQhwsN2v/wWTWBErMlBUsgEkgTX/hAjY63SWYAJhB0icJk5AT6XLDMCnuEnMpMNk2gzbJmgSGPTtZhlzBMxgO11Ur2ABsjJCHdkpOVYAMkuC4hBQUQhDmdEp+Bu5oFE1QwBDMwJAHredkGa4EMQ5A5mb0BKEGBBruU6iEB4RAR7moIF3vpD/NMzBrCfMrZQhXBPoBLBRXI0A2rnxUTqJaSCdLlETkwK8F5BGiwCQsBDxJoI5OV5yEQwIJmjiAVfHZjg6JMNkegv0yGgoeBoCxZFEff8dm2+QXdR6D5fGaxeT+EVsOZ1LnwmQoNcvCZOIH2UsRkI5w3AmgGiODwdM94nR+VlA3/I+kakz3gcLefScBiflZPBsN5LrCqjqQAZPOZCNQxAZoXnXgIwWdDnAfiZNxA/kEl6T4LQQmf5XA3wJO5YR6dk4EDuUCwfMYGAUVPprqcn0tm4HQEHDtZK7MDQEMen01ytrxd0jsZ5dO5KBk9xQsURDz3ft1lBKwaMd3ck0nyX/UALLKaN4dSl3sAVQgw3mScpEL+QJmAJnj60/UewJefbT2/QB8gA2hU8LtD5cI2x/gfQeRgidBQ7VAaYI0+aKBAgnzAE+8IDQp+0I7VEYADTgjYZIrgigoeJBqvsJYKcGAEI2xBBlKbzDh8YUKEwAEVb9OYZL6xCjbV8CD7MAYo/ybWjDbQ4YcNgYM81qAa2/CADHbwIRIbIgdTsAMPZRADGKCBDDuU4wNTDKNKQuABD5AAA2gEARQcwMY2shEKIEAjCUjggRCEYIoeQIMVsqCNJySDD2owQQoWUIABJKABiExkAgZQgAUsoA5q4MMOnnCPLFgBAx6YXwhAoIUXmKAACDgAAy6Qhgsw4AAHQMAhE8DKVjYgAaEUJSlNmcpL1OEFZgDBHWfnAHic4AQXSIACFDAARhagkMVMpjKXaUxkDhMBF/jlAqBQPAco4AKpTOUhh0nMYx6TmcX0ZiG5+cpYMqADCnBA9UigA08W4JWiFOU5O4BKBNjznvZEZQc6wHaAU55SmAUwwQt0QAIFgmAMWtABJXbAhT0QYgUrGKQjJzrRFKQAooTYAxcmGQkzjAENYgypSEdK0pKa9KQoTalKV8rSlrr0pTCNqUxnStOa2vSmOM2pTnfK05769KdADapQh0rUohr1qEhNqlKXytSmOvWpAAoIADs='
          });
          return _this.$el.append($item);
        };
      })(this));
      this.$el.removeClass('is-loading');
      this.pagination.render(data, player);
      return this.$el.trigger('load');
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

    PaginationView.prototype.el = '.pagination';

    PaginationView.prototype.initialize = function(data) {
      return this.$el.pagination({
        prevText: '&laquo;',
        nextText: '&raquo;',
        cssStyle: 'disabled',
        hrefTextPrefix: '#' + data.option.player + '/page/',
        edges: 1,
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
  app.SettingView = (function(_super) {
    __extends(SettingView, _super);

    function SettingView() {
      return SettingView.__super__.constructor.apply(this, arguments);
    }

    SettingView.prototype.el = '#Setting';

    SettingView.prototype.events = {
      'click a': 'change'
    };

    SettingView.prototype.initialize = function() {
      return this.currentSize = 0;
    };

    SettingView.prototype.change = function(e) {
      e.preventDefault();
      this.$('> li').removeClass('active');
      $(e.currentTarget).parent().addClass('active');
      app.imageSize = $(e.currentTarget).data('image-size');
      return this.trigger('change');
    };

    return SettingView;

  })(Backbone.View);
  app.init = function() {
    var controller, searchView, settingView;
    $(doc).foundation();
    searchView = new app.SearchView();
    settingView = new app.SettingView();
    controller = new app.ListsController();
    return settingView.on('change', function() {
      return controller.reRender(controller.category, controller.page);
    });
  };
  $(function() {
    return app.init();
  });
})(this, this.document, jQuery);
