module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        html2js: {
            dist: {
                options: {
                    base: '.',
                    module: 'template-<%= pkg.name %>-<%= pkg.version %>.html',
                    singleModule: true,
                    htmlmin: {
                        collapseBooleanAttributes: true,
                        collapseWhitespace: true,
                        removeAttributeQuotes: true,
                        removeComments: true,
                        removeEmptyAttributes: true,
                        removeRedundantAttributes: true
                    }
                },
                files: [{
                    expand: false,
                    src: ['templates/**/*.html'],
                    dest: 'build/<%= pkg.name %>.html.js'
                }]
            }
        },

        uglify: {
            dist: {
                files: {
                    'build/<%= pkg.name %>.min.js': [
                        'build/vsdtmodule.js',
                        'js/config/vsdtconfig.js',
                        'js/service/vsdtservice.js',
                        'js/filter/vsdtdaterange.js',
                        'js/directive/<%= pkg.name %>.js',
                        'js/directive/vsdtfilterfocus.js',
                        'js/directive/vsdtcolfiltertemplate.js',
                        'js/directive/vsdttablebodyrow.js',
                        'js/directive/vsdtpaginator.js',
                        'js/directive/vsdtcoltogglemenu.js',
                        'js/directive/vsdtcaptionbar.js',
                        'js/directive/vsdtoverlaywindow.js',
                        'js/directive/vsdttooltip.js',
                        'js/directive/vsdtcolresizer.js'
                    ]
                }
            }
        },

        concat: {
            options: {
                banner:
                    '/* \n' +
                    '*  Name: <%= grunt.config.get("pkg.name") %> \n' +
                    '*  Description: <%= grunt.config.get("pkg.description") %> \n' +
                    '*  Version: <%= grunt.config.get("pkg.version") %> \n' +
                    '*  Author: <%= grunt.config.get("pkg.author") %> \n' +
                    '*  Homepage: <%= grunt.config.get("pkg.homepage") %> \n' +
                    '*  License: <%= grunt.config.get("pkg.license") %> \n' +
                    '*  Date: <%= grunt.template.today("yyyy-mm-dd") %> \n' +
                    '*/ \n'
            },
            dist_min: {
                files: {
                    'dist/min/<%= pkg.name %>-<%= pkg.version %>.min.js': ['build/**/*.html.js', 'build/**/*.min.js']
                }
            },
            dist_debug: {
                files: {
                    'dist/debug/<%= pkg.name %>-<%= pkg.version %>.js': [
                        'build/**/*.html.js',
                        'build/vsdtmodule.js',
                        'js/config/vsdtconfig.js',
                        'js/service/vsdtservice.js',
                        'js/filter/vsdtdaterange.js',
                        'js/directive/<%= pkg.name %>.js',
                        'js/directive/vsdtfilterfocus.js',
                        'js/directive/vsdtcolfiltertemplate.js',
                        'js/directive/vsdttablebodyrow.js',
                        'js/directive/vsdtpaginator.js',
                        'js/directive/vsdtcoltogglemenu.js',
                        'js/directive/vsdtcaptionbar.js',
                        'js/directive/vsdtoverlaywindow.js',
                        'js/directive/vsdttooltip.js',
                        'js/directive/vsdtcolresizer.js'
                    ]
                }
            }
        },

        cssmin: {
            target: {
                files: [{
                    expand: true,
                    cwd: 'css',
                    src: '*.css',
                    dest: 'build',
                    ext: '.min.css'
                }]
            }
        },

        copy: {
            module: {
                files: [{
                    src: 'js/module/vsdtmodule.js',
                    dest: 'build/vsdtmodule.js'
                }],
                options: {
                    process: function (src, filepath) {
                        var newStr = 'template-' + grunt.config.get('pkg.name') + '-' + grunt.config.get('pkg.version') + '.html';
                        return src.replace('[]', '["' + newStr + '"]');
                    }
                }
            },
            dest_min: {
                files: [{
                    src: 'build/<%= pkg.name %>.min.css',
                    dest: 'dist/min/<%= pkg.name %>-<%= pkg.version %>.min.css'
                }]
            },
            dest_debug: {
                files: [{
                    src: 'css/<%= pkg.name %>.css',
                    dest: 'dist/debug/<%= pkg.name %>-<%= pkg.version %>.css'
                }]
            }
        },

        karma: {
            unit: {
                configFile: 'karma.conf.js',
                background: false,
                browsers: ['Firefox']
            }
        },

        clean: {
            all: {
                src: ['build', 'coverage']
            },
            build: {
                src: ['build']
            },
            coverage: {
                src: ['coverage']
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-html2js');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-karma');

    grunt.registerTask('default', ['clean:all', 'html2js', 'copy:module', 'uglify', 'concat', 'cssmin', 'copy:dest_debug', 'copy:dest_min', 'clean:build']);
    grunt.registerTask('test', ['clean:all', 'html2js', 'uglify', 'concat', 'cssmin', 'copy:dest_debug', 'copy:dest_min', 'karma', 'clean:build']);
};