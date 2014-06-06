((win, doc, $) ->
	'use strict'

	# namespace
	app = win.app || {}

	# initialize
	app.init = ->
		# apply foundation
		$(doc).foundation()

		listView = new app.ListView({ player: 'yuhiisk' })


	# Model
	app.Data = Backbone.Model.extend
		defaults:
			player: 'yuhiisk'
			shots: [ 'popular', 'debuts', 'everyone' ]

	# Collection
	app.DataList = Backbone.Collection.extend
		model: app.Data
		url: './api.php'

	# Router
	app.ListsController = Backbone.Router.extend

	# View
	app.ListView = Backbone.View.extend
		el: '#List'
		model: app.Data
		collection: app.DataList

		initialize: (option) ->
			# _.bindAll(this)
			@$item = $('#list-template').html()
			@template = Handlebars.compile(@$item)
			@render(option)

		render: (option) ->
			self = @
			@collection = new app.DataList()
			@collection.fetch(
				data: option
			).done((data) ->
				self.add(data)
			)

		add: (data) ->
			self = @
			_.each(data.shots, (d, i)->
				self.$el.append(self.template(d))
			)

	app.BreadCrumbs = Backbone.View.extend


	# Dom ready
	$ ->
		app.init()

	return

) @, @.document, jQuery
