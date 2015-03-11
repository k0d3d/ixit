// set timer

module.exports = function (grunt) {


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
        src : ['models/**/*.js', 'lib/**/*.js', 'controllers/**/*.js']
      },
      build: {
        src: 'build/js/**/*.js'
      }
    }
  });

  // These plugins provide necessary tasks
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-docco');
  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-node-inspector');

  // Default task
  grunt.registerTask('default', ['jshint']);

};
