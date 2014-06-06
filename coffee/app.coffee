((win, doc, $) ->
	'use strict'

	# namespace
	app = win.app || {}

	# Model
	app.Data = Backbone.Model.extend
		defaults:
			# player: 'yuhiisk'
			shots: [ 'popular', 'debuts', 'everyone' ]
			# states: 'popular'
			# pages: 15

	# Collection
	app.DataList = Backbone.Collection.extend
		model: app.Data
		# url: './api.php'
		url: 'http://api.dribbble.com/shots/popular'

	# Router
	app.ListsController = Backbone.Router.extend

		routes:
			'popular': 'popular'
			'debuts': 'debuts'
			'everyone': 'everyone'
			'player/:user': 'search'

		initialize: () ->
			@view = new app.ListView({ player: 'popular' })
			@model = @view.model
			Backbone.history.start()

		popular: () ->
			@view.render({ player: 'popular' })

		debuts: () ->
			@view.render({ player: 'debuts' })
			
		everyone: () ->
			@view.render({ player: 'everyone' })

		search: (user) ->
			@view.render({ player: user })

	# View
	app.ListView = Backbone.View.extend
		el: '#List'
		model: app.Data
		collection: app.DataList

		initialize: (option) ->
			# _.bindAll(this)
			option = _.extend(
				page: 1
				par_page: 10
			, option)
			@$item = $('#list-template').html()
			@template = Handlebars.compile(@$item)
			@render(option)

		render: (option) ->
			self = @
			@reset()

			@collection = new app.DataList()
			@collection.fetch(
				data: option
				dataType: 'jsonp'
				timeout: 50000
			).done((data) ->
				# TODO: hashがあると2回callされる
				console.log data
				self.add(data)
			)

		add: (data) ->
			self = @
			_.each(data.shots, (d, i)->
				self.$el.append(self.template(d))
			)

		reset: ->
			@$el.empty()

	app.BreadCrumbs = Backbone.View.extend
		el: '#BreadCrumbs'
		initialize: () ->
			@$el.append('<li>Popular</li>')

		reset: () ->
			@$el.empty()

	app.SearchView = Backbone.View.extend
		el: '#Search'
		events:
			'click a.button': 'submit'
			'keypress input': 'submit'

		initialize: ->
			@$input = @$('input[type="text"]')
			@$btn = @$('a.button')
			_.bindAll(@, 'submit')

		submit: (e) ->
			isPress = e.currentTarget.tagName.toLowerCase() is 'input'
			if isPress and e.which isnt 13
				return

			name = @$input.val()
			# console.log name
			@$btn.attr('href', '#player/' + name)
			if isPress
				win.location.hash = '#player/' + name


	# initialize
	app.init = ->
		# apply foundation
		$(doc).foundation()

		# Objects
		breadCrumbsView = new app.BreadCrumbs()
		searchView = new app.SearchView()
		listsController = new app.ListsController()



	# Dom ready
	$ ->
		app.init()

	return

) @, @.document, jQuery
