((win, doc, $) ->

	'use strict'

	# Namespace
	app = win.app || {}


	# Valiables
	SHOTS = [ 'popular', 'debuts', 'everyone' ]


	# Model
	# =========================================================================
	class app.Data extends Backbone.Model
		defaults:
			config:
				shots: SHOTS
				page: 1
				per_page: 15


	# Collection
	# =========================================================================
	class app.DataList extends Backbone.Collection
		model: app.Data
		url: 'http://api.dribbble.com/shots/popular'


	# Router
	# =========================================================================
	class app.ListsController extends Backbone.Router
		routes:
			':id': 'view'
			':id/page': 'view'
			':id/page/:number': 'view'
			'player/:user': 'search'

		initialize: () ->
			@view = new app.ListView(
				player: 'popular'
				hashName: location.hash.replace('#', '')
			)
			@view.subNav.$('.popular').addClass('active')
			Backbone.history.start()

		view: (id, number) ->
			@view.render(
				player: id
				page: number || 1
			)
			@view.subNav.$('.' + id).addClass('active')

		search: (user) ->
			@view.render(player: user)


	# View
	# =========================================================================
	# ListView
	class app.ListView extends Backbone.View
		el: '#List'

		initialize: (option) ->
			# _.bindAll(@)
			option = _.extend(
				page: 1
				par_page: 15
			, option)
			@$item = $('#ListTemplate').html()
			@template = Handlebars.compile @$item
			@collection = new app.DataList []
			@subNav = new app.SubNavView option.player
			@pagination = new app.PaginationView
				collection: @collection
				option: option

			isShots = _.some(SHOTS, (v, i) ->
				if new RegExp(v, 'ig').test(option.hashName)
					return true
				return false
			)

			# hashが存在したら@renderは実行しない
			if /player\/.+/ig.test(option.hashName) or isShots
				return
			else
				@render(option)

		render: (option) ->
			@reset()

			switch option.player
				when 'popular'
					@collection.url = 'http://api.dribbble.com/shots/popular'
				when 'debuts'
					@collection.url = 'http://api.dribbble.com/shots/debuts'
				when 'everyone'
					@collection.url = 'http://api.dribbble.com/shots/everyone'
				# TODO: 後で書き直し
				else
					@collection.url = 'http://api.dribbble.com/players/' + option.player + '/shots/likes'

			@collection.fetch(
				data: option
				dataType: 'jsonp'
				timeout: 50000
			).done (data) => @add(data, option.player)

		add: (data, player) ->
			# TODO:怪しいから書き直し
			_.each(data.shots, (d, i) =>
				@$el.append(@template(d))
			)
			@pagination.render(data, player)

		reset: ->
			@$el.empty()
			@subNav.reset()


	# SubNav
	class app.SubNavView extends Backbone.View
		el: '#SubNav'
		events:
			'click a': 'active'

		initialize: (id) ->
			_.bindAll(@, 'active')

		active: (e) ->
			@reset()
			$(e.currentTarget).parent().addClass('active')

		reset: () ->
			@$el.find('dd.active').removeClass('active')


	# Pagination
	class app.PaginationView extends Backbone.View
		el: '#Pagination'

		initialize: (data) ->
			@$el.pagination(
				prevText: '&laquo;'
				nextText: '&raquo;'
				cssStyle: 'disabled'
				hrefTextPrefix: '#' + data.option.player + '/page/'
				items: 750
				itemsOnPage: 15

				# default settings
				# pages: 0
				# displayedPages: 5
				# edges: 2
				# currentPage: 0
				# hrefTextPrefix: '#page-'
				# hrefTextSuffix: ''
				# prevText: 'Prev'
				# nextText: 'Next'
				# ellipseText: '&hellip;'
				# cssStyle: 'light-theme'
				# labelMap: []
				# selectOnClick: true
				# nextAtFront: false
				# invertPageOrder: false
				# onPageClick: (pageNumber, event) ->
				# 	// Callback triggered when a page is clicked
				# 	// Page number is given as an optional parameter
				# onInit: () ->
			)

		render: (option, category) ->
			@reset()
			o = @$el.data('pagination')
			o.currentPage = parseInt(option.page, 10) - 1
			o.hrefTextPrefix = '#' + category + '/page/'

			@$el.pagination('updateItems', option.total)

		reset: ->
			@$el.pagination('destroy')


	# Search
	class app.SearchView extends Backbone.View
		el: '#Search'
		events:
			'click a.button': 'submit'
			'keypress input': 'submit'

		initialize: ->
			_.bindAll(@, 'submit')
			@$input = @$('input[type="text"]')
			@$btn = @$('a.button')

		submit: (e) ->
			isPress = e.currentTarget.tagName.toLowerCase() is 'input'
			if isPress and e.which isnt 13
				return

			if @$input.val() isnt ''
				name = @$input.val().replace(/\s+/g, '')
			else
				e.preventDefault()
				return

			@$btn.attr('href', '#player/' + name)
			if isPress
				win.location.hash = '#player/' + name


	# Initialize Application
	# =========================================================================
	app.init = ->
		# apply foundation
		$(doc).foundation()

		# Objects
		searchView = new app.SearchView()
		controller = new app.ListsController()


	# Dom ready
	# =========================================================================
	$ ->
		app.init()

	return

) @, @.document, jQuery
