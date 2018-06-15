module.exports = (grunt) ->

	paths =
		sass:
			cwd: 'sass'
			src: '**/*.scss'
			dest: 'css'
		coffee:
			cwd: 'coffee'
			src: '**/*.coffee'
			dest: 'js'

	# Configuration
	# =============
	grunt.initConfig

		pkg: grunt.file.readJSON 'package.json'

		concat:
			matchMedia:
				src: [
					'bower_components/matchMedia/matchMedia.js',
					'js/gridle.js'
				]
				dest: 'js/gridle.js'
			extras:
				src: [
					'bower_components/css-element-queries/src/ResizeSensor.js'
					'bower_components/css-element-queries/src/ElementQueries.js'
					'js/gridle-eq.js'
				]
				dest: 'js/gridle-eq.js'

		sass:
			options:
				sourceMap: false
				precision: 8
			dist:
				files:
					'css/grid.css':'sass/grid.scss'
					'css/style.css':'sass/style.scss'
				files: [
					expand: true
					cwd: paths.sass.cwd
					src: paths.sass.src
					dest: paths.sass.dest
					ext: '.css'
				]

		coffee:
			options:
				bare: true
				sourceMap : true
				transpile:
					presets: [ "env" ]
			dist:
				files: [
					expand: true
					cwd: paths.coffee.cwd
					src: paths.coffee.src
					dest: paths.coffee.dest
					ext: '.js'
				]

		cssmin:
			options:
				shorthandCompacting: false
			target:
				files: [{
					expand: true,
					cwd: 'css',
					src: ['*.css', '!*.min.css'],
					dest: 'css',
					ext: '.min.css'
				}]

		uglify:
			my_target:
				files:
					'js/gridle.min.js': 'js/gridle.js'
					'js/gridle.eq.min.js' : 'js/gridle-eq.js'
					'js/jquery.js' : 'bower_components/jquery/dist/jquery.min.js'
			full:
				files:
					'js/gridle-full.min.js' : [
						'js/gridle.js'
						'js/gridle-eq.js'
					]
		watch:
			livereload:
				options:
					livereload: 12345
				files: [
					'css/*.css'
					'js/*.js'
					'*.html'
				]
			html:
				files: 'index.html'
				tasks: ['notify:default']
			sass:
				files: paths.sass.cwd + '/' + paths.sass.src
				tasks: ['sass', 'cssmin', 'notify:sass']
			coffee:
				files: paths.coffee.cwd+'/'+paths.coffee.src
				tasks: ['clean', 'coffee', 'concat', 'uglify', 'notify:coffee']

		clean: [
			'js'
		]

		notify:
			default:
				options:
					title:'Grunt'
					message: 'All tasks where processed'
			coffee:
				options:
					title:'Grunt watcher'
					message: 'Coffee files where processed'
			sass:
				options:
					title:'Grunt watcher'
					message: 'Sass files where processed'


	grunt.loadNpmTasks 'grunt-sass'
	grunt.loadNpmTasks 'grunt-contrib-coffee'
	grunt.loadNpmTasks 'grunt-sass'
	grunt.loadNpmTasks 'grunt-contrib-watch'
	grunt.loadNpmTasks 'grunt-contrib-cssmin'
	grunt.loadNpmTasks 'grunt-notify'
	grunt.loadNpmTasks 'grunt-contrib-uglify'
	grunt.loadNpmTasks 'grunt-contrib-concat'
	grunt.loadNpmTasks 'grunt-contrib-clean'

	grunt.registerTask 'default', [
		'clean'
		'sass'
		'cssmin'
		'coffee'
		'concat'
		'uglify'
		'notify:default'
	]
