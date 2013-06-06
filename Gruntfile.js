'use strict';

var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};

var serverConfig = require('./config');

module.exports = function (grunt) {
  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  // configurable paths
  var yeomanConfig = {
    app: 'public/app',
    dist: 'public/dist'
  };

  try {
    yeomanConfig.app = require('./bower.json').appPath || yeomanConfig.app;
  } catch (e) {}

  grunt.initConfig({
    yeoman: yeomanConfig,
    pkg: grunt.file.readJSON('package.json'),
    serverConfig : serverConfig,
    bower : {
      install : {
        options : {
          targetDir : '<%= yeoman.app %>/lib'
        }
      }
    },
    develop: {
      server: {
        file: '<%= pkg.main %>'
      }
    },
    watch: {
      less : {
        files: ['<%= yeoman.app %>/styles/{,*/}*.less'],
        tasks: ['less']
      },
      js: {
        files: [
          'app.js',
          'config/*.js',
          'src/*.js',
          'models/*.js'
        ],
        tasks: ['develop', 'delayed-livereload']
      },
      livereload: {
        files: [
          '<%= yeoman.app %>/{,*/}*.html',
          '{.tmp,<%= yeoman.app %>}/styles/{,*/}*.css',
          '{.tmp,<%= yeoman.app %>}/scripts/{,*/}*.js',
          '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ],
        tasks: ['livereload']
      }
    },
    connect: {
      options: {
        port: serverConfig.port,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: serverConfig.hostname
      },
      test: {
        options: {
          middleware: function (connect) {
            return [
              mountFolder(connect, '.tmp'),
              mountFolder(connect, 'test')
            ];
          }
        }
      }
    },
    open: {
      server: {
        url: 'http://<%= serverConfig.hostname %>:<%= serverConfig.port %>'
      }
    },
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '<%= yeoman.dist %>/*',
            '!<%= yeoman.dist %>/.git*',
            '<%= yeoman.app %>/lib'
          ]
        }]
      },
      server: {
        files: [{
          src: [
            '.tmp'
          ]
        }]
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        'Gruntfile.js',
        'models/*.js',
        'controllers/*.js',
        '<%= yeoman.app %>/scripts/services/{,*/}*.js',
        '<%= yeoman.app %>/scripts/controllers/{,*/}*.js',
        '<%= yeoman.app %>/scripts/directives/{,*/}*.js'
      ]
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true
      }
    },
    mochacli : {
      options : {
        reporter : 'spec',
        bail : true
      },
      all : ['test/*.js']
    },
    less : {
      server: {
        options : {
          paths : ['<%= yeoman.app %>/styles']
        },
        files: {
          '<%= yeoman.app %>/styles/main.css' : '<%= yeoman.app %>/styles/main.less'
        }
      },
      dist: {
        options : {
          paths : ['<%= yeoman.app %>/styles']
        },
        files: {
          '<%= yeoman.dist %>/styles/main.css' : '<%= yeoman.app %>/styles/main.less'
        }
      }
    },
    concat: {
      dist: {
        files: {
          '<%= yeoman.dist %>/scripts/app.js': [
            '<%= yeoman.app %>/scripts/{,*/}*.js'
          ]
        }
      }
    },
    useminPrepare: {
      html: '<%= yeoman.app %>/index.html',
      options: {
        dest: '<%= yeoman.dist %>'
      }
    },
    usemin: {
      html: ['<%= yeoman.dist %>/{,*/}*.html'],
      //   css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
      options: {
        dirs: ['<%= yeoman.dist %>'],
        baseDir : '<%= yeoman.app %>'
      }
    },
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/images',
          src: '{,*/}*.{png,jpg,jpeg}',
          dest: '<%= yeoman.dist %>/images'
        }]
      }
    },
    htmlmin: {
      dist: {
        options: {
          //removeCommentsFromCDATA: true,
          // https://github.com/yeoman/grunt-usemin/issues/44
          //collapseWhitespace: true,
          //collapseBooleanAttributes: true,
          //removeAttributeQuotes: true,
          //removeRedundantAttributes: true,
          //useShortDoctype: true
          //removeEmptyAttributes: true,
          //removeOptionalTags: true
        },
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>',
          src: ['*.html', 'views/*.html', 'views/*/*.html'],
          dest: '<%= yeoman.dist %>'
        }]
      }
    },
    ngmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.dist %>/scripts',
          src: '*.js',
          dest: '<%= yeoman.dist %>/scripts'
        }]
      }
    },
    uglify: {
      dist: {
        files: {
          '<%= yeoman.dist %>/scripts/scripts.js': [
            '<%= yeoman.dist %>/scripts/scripts.js'
          ]
        }
      }
    },
    rev: {
      dist: {
        files: {
          src: [
            '<%= yeoman.dist %>/scripts/{,*/}*.js',
            '<%= yeoman.dist %>/styles/{,*/}*.css',
            '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
            '<%= yeoman.dist %>/styles/fonts/*'
          ]
        }
      }
    },
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>',
          dest: '<%= yeoman.dist %>',
          src: [
            '*.{ico,txt,json,js}',
            '.htaccess',
            'package/**/*',
            'fonts/**/*',
            'components/**/*',
            'images/{,*/}*.{gif,webp}'
          ]
        }]
      }
    }
  });

  grunt.registerTask('delayed-livereload', 'delayed livereload', function () {
    var done = this.async();
    setTimeout(function () {
      grunt.task.run('livereload');
      done();
    }, 500);
  });

  grunt.renameTask('regarde', 'watch');


  grunt.registerTask('server', [
    'clean:server',
    'less',
    'livereload-start',
    'develop',
    'open',
    'watch'
  ]);

  grunt.registerTask('test', [
    'clean:server',
    'bower',
    'jshint',
    'mochacli',
    'less',
    'connect:test',
    'karma'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
  //  'bower',
  //  'jshint',
    //'test',
    'less',
    'useminPrepare',
    'imagemin',
    //   'cssmin',
    'htmlmin',
    'concat',
    'copy',
    'ngmin',
    //  'uglify',
    'rev',
    'usemin'
  ]);

  grunt.registerTask('build-dev', [
    'clean:server',
    'bower'
  ]);

  grunt.registerTask('default', ['build']);
};
