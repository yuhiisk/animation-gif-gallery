((win, doc, $) ->

	'use strict'

	# Namespace
	app = win.app || {}
	app.imageSize = true


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
			@category = 'popular'
			@page = 1
			@mainView = new app.ListView(
				player: @category
				hashName: location.hash.replace('#', '')
			)
			@mainView.subNav.$('.' + @category).addClass('active')
			Backbone.history.start()

		view: (id, number) ->
			@category = id
			@page = number
			@mainView.render(
				player: id
				page: number || 1
			)
			@mainView.subNav.$('.' + id).addClass('active')

		search: (user) ->
			@category = user
			@mainView.render(player: user)

		reRender: (id, number) ->
			@isCategory = _.some(SHOTS, (v) ->
				if new RegExp(v, 'ig').test(id)
					return true
				return false
			)
			if @isCategory
				@view(id, number)
			else
				@search(id)


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

			isShots = _.some(SHOTS, (v) ->
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
			@$el.addClass('is-loading')
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
			html = ''
			_.each(data.shots, (d, i) =>
				_.extend(d, { 'size': app.imageSize })
				str = @template(d)
				html += str
				$item = $(str)
				$('.lazy', $item).lazyload
					container: @$el
					event: 'load'
					effect: 'fadeIn'
					placeholder: 'data:image/gif;base64,R0lGODlhyACWAPcAAP///8MjYepMiczMzOlLiM3NzcQkYsfHx8jIyMnJycvLy9DQ0MbGxsrKyvX19ccnZeVHhOhKh8kpZ8goZuJEgcssacUlY8TExPv7+9Q1c+RGg/z1+OFDgMXFxf39/f78/fn5+f7+/tk6d9c4dvz8/MYmZNTU1MLCwssradHR0coqaNLS0tY3dN0+e+dJht/f39o7edM0cckqZ9w+e//+/skqaOZIhco7cs4vbc8vbevr6+Li4sYvauNFgtEyb9g5duFCf/TY4+BBf9Awbswta8QmY9AxbudIhtIzceBCf99BfuBBft9Aftg5d9Y3defn5/f3988wbuJDgN9Afck6cscoZfj4+M9Pgfjk7PLy8u7u7s4ubN7e3vvy9s0ta9U2c9lzm8cwathymfT09NVmkdt7oO/v78Yuafr6+sPDw9nZ2dRgjc8wbd2EpsUmZOKTsvvx9dM0cv76+9NfjPno7tXV1eqwx9o7eOCOrtBUhOakvtra2tzc3OCMrcQoZcUsZ94/fNs8etw9e8o+dNbW1vjn7s4vbNhvmN4/ffrs8fHN2+akveVGhM1IfMk5cPnp7+RFg+rq6scwa8ssaubm5stCd9dul87OztQ1ctt5n8xDeN5AfcMkYehJht+Lq+qyyMUpZeeowNExb+WfuscybNIzcPLQ3vrr8dx+ouy7ztc4dd6GqNU2dO/E1eSbt8g3b+muxc1He/rt8vfi6uCNrcczbfnp8Mcxa8orad0+fNdtluZHhco8c/nq8PHK2dlymvz099o8edJZiP33+dNei8MlYtp4ntx9ouGQr+Hh4dQ0cvXc5tU1c8YtaOWhu80ubNt9oe2+0cwsas9Qgcwtauirw+u3y+WeuvXZ5Ou1yuzs7M5Mf/HM2scoZtw9esUoZdFVhds9eu/D1Mo9dNl1nPPU4M0ua85KfeJDgeKVs9p3ndg6d+isxONEgf/9/sMkYs/Pz8UqZuenwMYnZNdqlNs8ecUrZ+3t7fLO3Oepwd2Bpffh6QAAAAAAAAAAAAAAACH/C1hNUCBEYXRhWE1QPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS41LWMwMjEgNzkuMTU0OTExLCAyMDEzLzEwLzI5LTExOjQ3OjE2ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QjZGNkVDRkRGNzVBMTFFM0EzQjNCMDAyMEQ2QjQ0NTUiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QjZGNkVDRkVGNzVBMTFFM0EzQjNCMDAyMEQ2QjQ0NTUiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpCNkY2RUNGQkY3NUExMUUzQTNCM0IwMDIwRDZCNDQ1NSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpCNkY2RUNGQ0Y3NUExMUUzQTNCM0IwMDIwRDZCNDQ1NSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PgH//v38+/r5+Pf29fTz8vHw7+7t7Ovq6ejn5uXk4+Lh4N/e3dzb2tnY19bV1NPS0dDPzs3My8rJyMfGxcTDwsHAv769vLu6ubi3trW0s7KxsK+urayrqqmop6alpKOioaCfnp2cm5qZmJeWlZSTkpGQj46NjIuKiYiHhoWEg4KBgH9+fXx7enl4d3Z1dHNycXBvbm1sa2ppaGdmZWRjYmFgX15dXFtaWVhXVlVUU1JRUE9OTUxLSklIR0ZFRENCQUA/Pj08Ozo5ODc2NTQzMjEwLy4tLCsqKSgnJiUkIyIhIB8eHRwbGhkYFxYVFBMSERAPDg0MCwoJCAcGBQQDAgEAACH5BAAAAAAALAAAAADIAJYAAAj/AAEIHEiwoMGDCBMqXMiwocOHECNKnEixosWLGDNq3Mixo8ePIEOKHEmypMmTKFOqXMmypcuXMGPKnEmzps2bOHPq3Mmzp8+fQIMKHUq0qNGjSJMqXcq0qdOnUKNKnUq1qtWrWLNq3cq1q9evYMOKHUu2rNmzaNOqXcu2rdu3cOPKnUu3rt27ePPq3cu3r9+/gAMLHky4sOHDiBMrNhvkmq5t9gJIDnDmCphQsxazTPRG0+TPoCVfcdZFs8lTbf6EXg06DJ7SpkG603OLtW3Qjj7F9ihrjm0vImZMYdKiSSkZrMVs2K0RG5XbNQgImE5dAIQmE0LHwsL8oiJSoGs4/wGdobp5ATOyf+a1rDvFIGE+GxghHQloIOerE/gC+kYh9xHZcsNnD3BAXQTqSSaBdPlRNwVo5wADoEMfCPPZBIyYBwRoLDRIXQahHTJhQ6N8VoIG+cUgXw8eqriaNSMq9AgPkxlAQYMRPPAZEflFEIV8n92wXIwHlfHZOh4KAAhoLZgnRIIBGMCEfZO9QaRBdPgxWQVJTofDhRFMB4EPoFkghAAITlbLkFcKRMtnSXQpgAYGfKZKDzHUSaAU1LXwmR5tCkTDIJPxKKcArAAZ2hY2mCfBZHkECgA+n81wKAEP2uZGMPmJ8Bl3baYzmQUMnhcBOvXEIY2eqxkQhwsN2v/wWTWBErMlBUsgEkgTX/hAjY63SWYAJhB0icJk5AT6XLDMCnuEnMpMNk2gzbJmgSGPTtZhlzBMxgO11Ur2ABsjJCHdkpOVYAMkuC4hBQUQhDmdEp+Bu5oFE1QwBDMwJAHredkGa4EMQ5A5mb0BKEGBBruU6iEB4RAR7moIF3vpD/NMzBrCfMrZQhXBPoBLBRXI0A2rnxUTqJaSCdLlETkwK8F5BGiwCQsBDxJoI5OV5yEQwIJmjiAVfHZjg6JMNkegv0yGgoeBoCxZFEff8dm2+QXdR6D5fGaxeT+EVsOZ1LnwmQoNcvCZOIH2UsRkI5w3AmgGiODwdM94nR+VlA3/I+kakz3gcLefScBiflZPBsN5LrCqjqQAZPOZCNQxAZoXnXgIwWdDnAfiZNxA/kEl6T4LQQmf5XA3wJO5YR6dk4EDuUCwfMYGAUVPprqcn0tm4HQEHDtZK7MDQEMen01ytrxd0jsZ5dO5KBk9xQsURDz3ft1lBKwaMd3ck0nyX/UALLKaN4dSl3sAVQgw3mScpEL+QJmAJnj60/UewJefbT2/QB8gA2hU8LtD5cI2x/gfQeRgidBQ7VAaYI0+aKBAgnzAE+8IDQp+0I7VEYADTgjYZIrgigoeJBqvsJYKcGAEI2xBBlKbzDh8YUKEwAEVb9OYZL6xCjbV8CD7MAYo/ybWjDbQ4YcNgYM81qAa2/CADHbwIRIbIgdTsAMPZRADGKCBDDuU4wNTDKNKQuABD5AAA2gEARQcwMY2shEKIEAjCUjggRCEYIoeQIMVsqCNJySDD2owQQoWUIABJKABiExkAgZQgAUsoA5q4MMOnnCPLFgBAx6YXwhAoIUXmKAACDgAAy6Qhgsw4AAHQMAhE8DKVjYgAaEUJSlNmcpL1OEFZgDBHWfnAHic4AQXSIACFDAARhagkMVMpjKXaUxkDhMBF/jlAqBQPAco4AKpTOUhh0nMYx6TmcX0ZiG5+cpYMqADCnBA9UigA08W4JWiFOU5O4BKBNjznvZEZQc6wHaAU55SmAUwwQt0QAIFgmAMWtABJXbAhT0QYgUrGKQjJzrRFKQAooTYAxcmGQkzjAENYgypSEdK0pKa9KQoTalKV8rSlrr0pTCNqUxnStOa2vSmOM2pTnfK05769KdADapQh0rUohr1qEhNqlKXytSmOvWpAAoIADs='

				@$el.append($item)
			)
			@$el.removeClass('is-loading')
			@pagination.render(data, player)
			@$el.trigger('load')

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
		el: '.pagination'

		initialize: (data) ->
			@$el.pagination(
				prevText: '&laquo;'
				nextText: '&raquo;'
				cssStyle: 'disabled'
				hrefTextPrefix: '#' + data.option.player + '/page/'
				edges: 1
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


	# Setting
	class app.SettingView extends Backbone.View

		el: '#Setting'

		events:
			'click a': 'change'

		initialize: () ->
			@currentSize = 0

		change: (e) ->
			e.preventDefault()
			@$('> li').removeClass('active')
			$(e.currentTarget).parent().addClass('active')
			app.imageSize = $(e.currentTarget).data('image-size')
			@trigger('change')


	# Initialize Application
	# =========================================================================
	app.init = ->
		# apply foundation
		$(doc).foundation()

		# Objects
		searchView = new app.SearchView()
		settingView = new app.SettingView()
		controller = new app.ListsController()
		settingView.on('change', () ->
			controller.reRender(controller.category, controller.page)
		)


	# Dom ready
	# =========================================================================
	$ ->
		app.init()

	return

) @, @.document, jQuery
