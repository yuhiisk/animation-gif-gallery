module.exports = (grunt) ->


	grunt.initConfig

		pkg: grunt.file.readJSON 'package.json'

		banner: """
/*! <%= pkg.name %> (<%= pkg.site.url %>)
 * lastupdate: <%= grunt.template.today("yyyy-mm-dd") %>
 * version: <%= pkg.version %>
 * author: <%= pkg.author %>
 */

"""
		connect:
			server:
				options:
					port: 8000
					base: '.'
					open: 'http://localhost:<%= connect.server.options.port %>/'
			doc:
				options:
					port: 8001
					base: 'docs/'
					# open: 'http://localhost:<%= connect.doc.options.port %>/'

		compass:
			options:
				httpPath: './'
				environment: 'development'
				outputStyle: 'expanded'
				relativeAssets: true
				noLineComments: true
				assetCacheBuster: false
			dist:
				options:
					sassDir: 'scss'
					cssDir: 'css'
					imagesDir: 'img'
					javascriptsDir: 'js'
					fontsDir: 'fonts'

		coffee: 
			options:
				bare: true

			dist:
				options:
					join: true

				expand: true
				cwd: 'coffee/'
				src: ['*.coffee']
				dest: 'js/'
				ext: '.js'

		# open:
			# dev:
				# path: 'http://dev.local:8888/dribbble/'
				# app: 'Google Chrome'

		uglify:
			options:
				preserveComments: 'some'

			lib:
				files:
					'js/lib.min.js': [
						'bower_components/lodash/dist/lodash.min.js'
						'bower_components/handlebars/handlebars.min.js'
						'bower_components/jquery/dist/jquery.min.js'
						'bower_components/backbone/backbone.js'
						'bower_components/jquery.lazyload/jquery.lazyload.js'
						'bower_components/jquery.simplePagination/jquery.simplePagination.js'
					]
				# src: ['<%= concat.pc.dest %>']
				# dest: 'js/lib.min.js'

			# script:
				# options:
					# banner: '<%= banner %>'
				# src: ['js/script.js']
				# dest: 'js/script.min.js'

		watch:
			options:
				livereload: true
			reload:
				files: [ '*.html', '*.js' ]
			scss:
				files: [
					'scss/*.scss',
					'scss/**/{,**/}*.scss'
				]
				tasks: [ 'compass' ]
			coffee:
				files: [
					'coffee/{,**/}*.coffee'
				]
				tasks: [ 'coffee' ]

		# kss:
			# options:
				# includeType: 'scss'
				# includePath: 'scss/style.scss'
				# template: 'docs/template'
			# dist:
				# files:
					# 'docs/': ['scss/']

	for task of grunt.config.data.pkg.devDependencies
		if /^grunt-/.test task then grunt.loadNpmTasks(task)

	grunt.registerTask 'default', [
		'uglify',
		'connect:server',
		'coffee',
		'compass',
		'watch'
	]
	# grunt.registerTask 'style', [ 'kss', 'connect:doc',  'watch' ]
