// set timer
var timer = require("grunt-timer");

module.exports = function (grunt) {

  timer.init(grunt);

  // Project configuration
  grunt.initConfig({
    // Metadata
    pkg : grunt.file.readJSON('package.json'),
    banner : '/*! <%= pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %>\n' + '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' + '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' + ' Licensed <%= props.license %> */\n',
    // Task configuration
    bump : {
      options : {
        files : ['package.json'],
        updateConfigs : [],
        commit : true,
        commitMessage : 'Release v%VERSION%',
        commitFiles : ['-a'], // '-a' for all files createTag: true, tagName: 'v%VERSION%', tagMessage: 'Version %VERSION%', push: true, pushTo: 'origin', gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d' // options to use with '$ git describe'
      }
    },
    docco : {
      development : {
        src : ['*.js', 'lib/**/*.js', 'controllers/**/*.js', 'models/**/*.js', 'tests/**/*.js'],
        options : {
          output : 'docs/'
        }
      }
    },
    concat : {
      options : {
        banner : '<%= banner %>',
        stripBanners : true
      },
      dist : {
        src : ['lib/<%= pkg.name %>.js'],
        dest : 'dist/<%= pkg.name %>.js'
      }
    },
    uglify : {
      modules:{
        options:{
          mangle: false
        },
        files:{
          'public/js/public.js': [
            'public/js/public-app.js',
            'public/js/modules/controllers/homeController.js',
            'public/js/modules/controllers/userController.js',
            'public/js/modules/services/service.js',
            'public/js/modules/directives.js',
            'public/js/modules/filters.js',
            'public/js/modules/lang.js'
          ],
          'public/js/dashboard.js': [
            'public/js/app.js',
            'public/js/main.js',
            'public/js/modules/controllers/dashboardController.js',
            'public/js/modules/controllers/homeController.js',
            'public/js/modules/controllers/userController.js',
            'public/js/modules/services/service.js',
            'public/js/modules/directives.js',
            'public/js/modules/filters.js',
            'public/js/modules/lang.js',
            'public/js/generic.js',
            'public/js/theme.js'
          ]
        }
      },
      build:{
        options:{
          mangle: false
        },
        files:{
          'public/js/components.js': [
            'public/bower_components/jquery/dist/jquery.min.js',
            'public/bower_components/angular/**/*.js',
            'public/bower_components/flow.js/**/*.js',
            'public/bower_components/**/*.js',
            '!public/bower_components/flow.js'
          ],
          'public/js/vendor.js': [
            'public/js/ng-flow.js',
            'public/js/jquery.tagsinput.min.js',
            'public/js/jquery.dataTables.min.js',
            'public/js/bootstrap-hover-dropdown.min.js',
            'public/js/tab.js',
            'public/cors/*.js',
          ],
          'public/js/public.js': [
            'public/js/modules/public-app.js',
            'public/js/modules/controllers/homeController.js',
            'public/js/modules/controllers/userController.js',
            'public/js/modules/services/service.js',
            'public/js/modules/directives.js',
            'public/js/modules/filters.js',
            'public/js/modules/lang.js'
          ],
          'public/js/dashboard.js': [
            'public/js/modules/app.js',
            'public/js/main.js',
            'public/js/modules/controllers/dashboardController.js',
            'public/js/modules/controllers/homeController.js',
            'public/js/modules/controllers/userController.js',
            'public/js/modules/services/service.js',
            'public/js/modules/directives.js',
            'public/js/modules/filters.js',
            'public/js/modules/lang.js',
            'public/js/generic.js',
            'public/js/theme.js'
          ]
        }
      }
    },
    jshint : {
      options : {
        node : true,
        curly : true,
        eqeqeq : true,
        immed : true,
        latedef : true,
        newcap : true,
        noarg : true,
        sub : true,
        undef : true,
        unused : true,
        boss : true,
        eqnull : true,
        globals : {}
      },
      gruntfile : {
        src : 'gruntfile.js'
      },
      lib_test : {
        src : ['models/**/*.js', 'lib/**/*.js', 'controllers/**/*.js', 'public/**/*.js', 'test/**/*.js']
      },
      build: {
        src: 'build/js/**/*.js'
      }
    },
    watch : {
      lib_test : {
        files : '<%= jshint.lib_test.src %>',
        tasks : ['jshint:lib_test']
      },
      gruntfile : {
        files : '<%= jshint.gruntfile.src %>',
        tasks : ['jshint:gruntfile']
      },
      js: {
        files: 'build/js/**/*.js',
        task: ['clean:modules', 'copy:modulesjs', 'uglify:modules', 'clean:scripts'],
        options: {
          spawn: false,
          event: ['changed']
        }
      },
      css: {
        files: 'build/css/**/*.css',
        task: ['clean:stylesheets', 'copy:modulescss', 'cssmin:modules', 'clean:stylesheets'],
        options: {
          spawn: false,
          event: ['changed']
        }
      }
    },
    'node-inspector': {
      dev: {
        options: {
          'web-port': 5877,
          'web-host': 'localhost',
          'debug-port': 5855,
          'stack-trace-limit': 4,
          'hidden': ['node_modules']
        }
      }
    },
    clean:{
      'public':{
        src:[
          'public'
        ]
      },
      build:{
        src:[
          '<%= clean.stylesheets.src %>',
          '<%= clean.scripts.src %>',
          'public/bower_components',
        ]
      },
      stylesheets:{
        src: [
          'public/css/**/*',
          '!public/css/components.css',
          '!public/css/public.css',
          '!public/css/dashboard.css',

        ]
      },
      scripts: {
        src: [
          'public/js/**/*',
          '!public/js/public.js',
          '!public/js/dashboard.js',
          '!public/js/components.js',
          '!public/js/vendor.js'
        ]
      },
      components: {
        src: [
          'public/app/bower_components/**/*',
          'public/app/bower_components'
        ]
      }
    },
    copy: {
      modulescss: {
        cwd: 'build',
        src: [
          'css/page.css',
          'css/modules.css',
          //dashboard css
          'css/layout.css',
          'css/elements.css',
          'css/icons.css',
          'css/bootstrap-overrides.css',
          'css/compiled/gallery.css',
          'css/compiled/tables.css',
          'css/lib/jquery.dataTables.css'
        ],
        dest: 'public',
        expand: true
      },
      modulesjs: {
        cwd: 'build',
        src: [
          '/js/modules/public-app.js',
          '/js/modules/controllers/homeController.js',
          '/js/modules/controllers/userController.js',
          '/js/modules/services/service.js',
          '/js/modules/directives.js',
          '/js/modules/filters.js',
          '/js/modules/lang.js',
          '/js/tab.js',
          '/js/jquery.tagsinput.min.js',
          '/js/jquery.dataTables.min.js',
          '/js/bootstrap-hover-dropdown.min.js',
          '/js/modules/app.js',
          '/js/main.js',
          '/js/modules/controllers/dashboardController.js',
          '/js/modules/controllers/homeController.js',
          '/js/modules/controllers/userController.js',
          '/js/modules/services/service.js',
          '/js/modules/directives.js',
          '/js/modules/filters.js',
          '/js/modules/lang.js',
          '/js/generic.js',
          '/js/theme.js',
        ],
        dest: 'public',
        expand: true
      },
      build: {
        cwd: 'build',
        src: [
          //misc files
          'favicon.ico',
          'ZeroClipboard.swf',
          'robots.txt',
          'humans.txt',
          //copy imgs
          'img/**/*',
          //copy css
          'css/page.css',
          'css/modules.css',
          //dashboard css
          'css/layout.css',
          'css/elements.css',
          'css/icons.css',
          'css/bootstrap-overrides.css',
          'css/compiled/gallery.css',
          'css/compiled/tables.css',
          '/css/lib/jquery.dataTables.css',
          //bower css components
          'bower_components/bootstrap/dist/css/bootstrap.min.css',
          'bower_components/fontawesome/css/font-awesome.min.css',
          'bower_components/animate.css/animate.min.css',
          //bower js components
          'bower_components/bootstrap/dist/js/bootstrap.min.js',
          'bower_components/jquery/dist/jquery.min.js',
          'bower_components/angular/angular.min.js',
          'bower_components/angular-sanitize/angular-sanitize.min.js',
          'bower_components/angular-cookies/angular-cookies.min.js',
          'bower_components/ui-router/release/angular-ui-router.min.js',
          'bower_components/jqueryui/jquery-ui.min.js',
          'bower_components/lodash/dist/lodash.min.js',
          'bower_components/flow.js/dist/flow.min.js',
          'bower_components/moment/moment.min.js',
          //other js files
          'js/cors/jquery.postmessage-transport.js',
          'js/cors/jquery.xdr-transport.js',
          'js/jquery.slimscroll.min.js',
          //font files
          'fonts/**/*',
          //ixit angular modules
          'js/ng-flow.js',
          'js/modules/public-app.js',
          'js/modules/controllers/homeController.js',
          'js/modules/controllers/userController.js',
          'js/modules/services/service.js',
          'js/modules/directives.js',
          'js/modules/filters.js',
          'js/modules/lang.js',
          'js/tab.js',
          'js/jquery.tagsinput.min.js',
          'js/jquery.dataTables.min.js',
          'js/bootstrap-hover-dropdown.min.js',
          'js/modules/app.js',
          'js/main.js',
          'js/modules/controllers/dashboardController.js',
          'js/modules/controllers/homeController.js',
          'js/modules/controllers/userController.js',
          'js/modules/services/service.js',
          'js/modules/directives.js',
          'js/modules/filters.js',
          'js/modules/lang.js',
          'js/generic.js',
          'js/theme.js',
          ],
        dest: 'public',
        expand: true
      }
    },
    cssmin:{
      modules: {
        files: {
          'public/css/public.css': [
            'public/css/page.css',
            'public/css/modules.css'
          ],
          //ixit dashboard css
          'public/css/dashboard.css': [
            'public/css/layout.css',
            'public/css/elements.css',
            'public/css/icons.css',
            'public/css/bootstrap-overrides.css',
            'public/css/lib/jquery.dataTables.css',
            'public/css/compiled/gallery.css',
            'public/css/compiled/tables.css'
          ],
        }
      },
      build:{
        files:{
          //component css
          'public/css/components.css': [
            'public/bower_components/bootstrap/dist/css/bootstrap.min.css',
            'public/bower_components/fontawesome/css/font-awesome.min.css',
            'public/bower_components/animate.css/animate.min.css',
          ],
          //public
          'public/css/public.css': [
            'public/css/page.css',
            'public/css/modules.css'
          ],
          //ixit dashboard css
          'public/css/dashboard.css': [
            'public/css/layout.css',
            'public/css/elements.css',
            'public/css/icons.css',
            'public/css/bootstrap-overrides.css',
            'public/css/lib/jquery.dataTables.css',
            'public/css/compiled/gallery.css',
            'public/css/compiled/tables.css'
          ],
        }
      }
    },
    autoprefixer:{
      build:{
        expand: true,
        cwd:'public/css',
        src: ['**/*.css'],
        dest: 'public/css'
      }
    },
    less: {
      options: {
        //paths: ['for-client-build/bower_components/bootstrap/less/'],
        yuicompress: false,
        ieCompat: true
      },
      src: {
        expand: true,
        cwd: 'public/app',
        src: [
            //'less/**/*.less',
            //'bower_components/bootstrap/less/alert.less'
            //'bower_components/bootstrap/less/carousel.less'
        ],
        ext: '.css',
        dest: 'public/app/css'
        // rename: function(dest, src) {
        //   return path.join(dest, src.replace(/^styles/, 'css'));
        // }
      }
    },
    imagemin: {
      png: {
        options: {
          optimizationLevel: 7
        },
        files: [
          {
            // Set to true to enable the following options…
            expand: true,
            // cwd is 'current working directory'
            cwd: 'for-client-build/img/',
            src: ['**/*.png'],
            // Could also match cwd line above. i.e. project-directory/img/
            dest: 'public/app/img/compressed/',
            ext: '.png'
          }
        ]
      },
      jpg: {
        options: {
          progressive: true
        },
        files: [
          {
            // Set to true to enable the following options…
            expand: true,
            // cwd is 'current working directory'
            cwd: 'for-client-build/img/',
            src: ['**/*.jpg'],
            // Could also match cwd. i.e. project-directory/img/
            dest: 'public/app/img/',
            ext: '.jpg'
          }
        ]
      }
    },
    concurrent: {
      dev: {
        tasks: ['nodemon', 'node-inspector', 'watch:js', 'watch:css'],
        options: {
          logConcurrentOutput: true
        }
      }
    },
    nodemon: {
      dev: {
        script: 'server.js',
        options: {
          nodeArgs: ['--debug'],
          env: {
            PORT: '3000'
          },
          ignore: ['node_modules/**'],
          ext: 'js,coffee',
          // omit this property if you aren't serving HTML files and
          // don't want to open a browser tab on start
          callback: function (nodemon) {
            nodemon.on('log', function (event) {
              console.log(event.colour);
            });
          }
        }
      }
    }
  });

  // These plugins provide necessary tasks
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-docco');
  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-node-inspector');
  grunt.loadNpmTasks('grunt-concurrent');

  // Default task
  grunt.registerTask('default', ['jshint', 'build']);

  // Nightly Build - we will be elaborating on this task
  grunt.registerTask('nightly-build', ['jshint', 'docco']);
  grunt.registerTask(
    'build',
    'Compiles all of the assets and copies the files to the build directory.',
    ['clean:public', 'copy:build', 'cssmin:build', 'uglify:build', 'clean:build']
  );
  grunt.registerTask(
    'stylesheets',
    'Compiles the stylesheets.',
    [ 'less', 'autoprefixer', 'cssmin']
  );
  grunt.registerTask(
    'scripts',
    'Compiles the JavaScript files.',
    [ 'uglify']
  );
  grunt.registerTask(
    'copynclean',
    'Copies files needed for app',
    ['clean:build', 'copy']
  );


};
