module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // We have a different index.html for development.
    // With each js and css file separate. Created by 'preprocess'
    env: {
      dev: {
          NODE_ENV : 'DEVELOPMENT'
      },
      prod: {
          NODE_ENV : 'PRODUCTION'
      }
    },
    preprocess: {
      options: {
        context : {
          DEBUG: true
        }
      },
      layout: {
        src : 'src/layout/index.html',
        dest : 'public/index.html',
        options : {
          context : {
            pkgname : '<%= pkg.name %>',
          }
        }
      }
    },
    copy: {
      static:   { expand: true, src: ['static/**'], dest: 'public/' },
      vendor:   { expand: true, src: ['vendor/**'], dest: 'public/' }
    },
    sass: {
      options: {
        sourcemap: 'none'
      },
      foundation: {
        files: [{
          expand: true,
          cwd: 'src/scss/foundation',
          src: ['*.scss'],
          dest: 'public/vendor/css',
          ext: '.css'
        }]
      },
      dist: {
        files: [{
          expand: true,
          cwd: 'src/scss',
          src: ['*.scss'],
          dest: 'tmp/css',
          ext: '.css'
        }]
      }
    },
    concat: {
      dev: {
        files: {
          'public/css/<%= pkg.name %>.css': ['tmp/css/*.css']
        }
      },
      prod: {
        // Concat files for production. File order is important!
        files: {
          'public/css/<%= pkg.name %>.css': ['tmp/css/*.css'],
          'public/vendor/css/vendor.css': [
             'vendor/css/normalize.css',
             'public/vendor/css/foundation.css',
             'vendor/css/foundation-icons.css'],
        },
      }
    },
    // Minify CSS for production
    cssmin: {
      add_banner: {
        options: {
          banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */'
        },
        files: {
          'public/css/<%= pkg.name %>.min.css': ['public/css/<%= pkg.name %>.css'],
          'public/vendor/css/vendor.min.css': ['public/vendor/css/vendor.css']
        }
      }
    },
    // Jade templating language focused on enabling quick HTML coding
    jade: {
      compile: {
        options: {
            pretty: true,
            data: {package: '<%= pkg.name %>', version: '<%= pkg.version %>'}
        },
        files: [ { 
          expand: true, 
          dest: "public/partials",
          src: "**/*.jade", 
          cwd: "src/partials",
          ext: '.html',
          extDot: 'last'
        } ]
      }
    },
    // Cleanup files we don't need on production
    clean: {
      dev: ["tmp/*",
            "public/css/<%= pkg.name %>.css",
            "public/vendor/css/vendor.css"]
    },
    // Watch files we edit an reload the app on save.
    watch: {
      all: {
        options: { livereload: true },
        files: ['Gruntfile.js', 'src/scss/*','src/partials/*.jade', 'src/layout/index.html'],
        tasks: ['default']
      },
    },
    // Webserver for development
    connect: {
      server: {
        options: {
          port: 3000,
          base: 'public',
          livereload: true
        }
      }
    }
  });

  // Load the plugin that provides the tasks.
  grunt.loadNpmTasks('grunt-env');
  grunt.loadNpmTasks('grunt-preprocess');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-jade');


  // Run once to compile foundation css and copy vendor files, save time on development ;)
  grunt.registerTask('once', ['sass:foundation', 'copy']);

  // Default tasks for development
  grunt.registerTask('default', ['jade', 'env:dev','preprocess', 'sass:dist', 'concat:dev', 'connect','watch']);

  // grunt for production (minified files, remove logging, clean-up)
  grunt.registerTask('production', ['jade', 'copy','env:prod', 'preprocess', 'sass', 'concat:prod', 'cssmin', 'clean']);

};
