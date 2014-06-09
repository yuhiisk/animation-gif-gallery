((win, doc, $) ->
	'use strict'

	# Namespace
	app = win.app || {}

	SHOTS = [ 'popular', 'debuts', 'everyone' ]

	# Model
	app.Data = Backbone.Model.extend
		defaults:
			config:
				shots: SHOTS
				page: 1
				per_page: 15

	# Collection
	app.DataList = Backbone.Collection.extend
		model: app.Data
		url: 'http://api.dribbble.com/shots/popular'

	# Router
	app.ListsController = Backbone.Router.extend
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
			Backbone.history.start()

		view: (id, number) ->
			@view.render(
				player: id
				page: number || 1
			)
			@view.subNav.$('.' + id).addClass('active')

		search: (user) ->
			@view.render(player: user)
			@view.subNav.reset()

	# View
	app.ListView = Backbone.View.extend
		el: '#List'

		initialize: (option) ->
			# _.bindAll(this)
			option = _.extend(
				page: 1
				par_page: 15
			, option)
			@$item = $('#list-template').html()
			@template = Handlebars.compile(@$item)
			@collection = new app.DataList([])
			# @breadcrumbs = new app.BreadCrumbs()
			@subNav = new app.SubNavView(option.player)
			@pagination = new app.PaginationView(
				collection: @collection
			)

			# hashが存在したら@renderは実行しない
			if /player\/.+/ig.test(option.hashName) or _.indexOf(SHOTS, option.hashName) != -1
				return
			else
				@render(option)

		render: (option) ->
			@reset()

			switch option.player
				when 'popular'
					@collection.url = 'http://api.dribbble.com/shots/popular'
					# @breadcrumbs.add([option.player])
				when 'debuts'
					@collection.url = 'http://api.dribbble.com/shots/debuts'
					# @breadcrumbs.add([option.player])
				when 'everyone'
					@collection.url = 'http://api.dribbble.com/shots/everyone'
					# @breadcrumbs.add([option.player])
				# TODO: 後で書き直し
				else
					@collection.url = 'http://api.dribbble.com/players/' + option.player + '/shots/likes'
					# @breadcrumbs.add(['players', option.player])

			@collection.fetch(
				data: option
				dataType: 'jsonp'
				timeout: 50000
			).done (data) => @add(data)

		add: (data) ->
			# TODO:怪しいから書き直し
			_.each(data.shots, (d, i) =>
				@$el.append(@template(d))
			)

		reset: ->
			@$el.empty()
			# @breadcrumbs.reset()

	# app.BreadCrumbs = Backbone.View.extend
	# 	el: '#BreadCrumbs'
	# 	initialize: () ->
	# 		# @$el.append('<li>Popular</li>')

	# 	add: (ids) ->
	# 		item = ''
	# 		_.each(ids, (id, i) ->
	# 			item += '<li>' + id + '</li>'
	# 		)
	# 		@$el.append(item)

	# 	reset: () ->
	# 		@$el.empty()

	app.SubNavView = Backbone.View.extend
		el: '#SubNav'
		events:
			'click a': 'active'

		initialize: (id) ->
			_.bindAll(this, 'active')

		active: (e) ->
			@reset()
			$(e.currentTarget).parent().addClass('active')

		reset: () ->
			@$el.find('dd.active').removeClass('active')

	app.PaginationView = Backbone.View.extend
		el: '#Pagination'
		events:
			'click a': 'active'
			'click .prev a': 'prev'
			'click .next a': 'next'

		initialize: (page) ->

		render: ->
			console.log 'call render'

		active: (e) ->
			console.log 'call active'
			e.preventDefault()

		prev: (e) ->
			console.log 'call prev'
			e.preventDefault()

		next: (e) ->
			console.log 'call next'
			e.preventDefault()

	app.SearchView = Backbone.View.extend
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

			name = @$input.val()
			@$btn.attr('href', '#player/' + name)
			if isPress
				win.location.hash = '#player/' + name


	# initialize
	app.init = ->
		# apply foundation
		$(doc).foundation()

		# Objects
		new app.SubNavView()
		new app.SearchView()
		new app.ListsController()


	# Dom ready
	$ ->
		app.init()

	return

) @, @.document, jQuery
