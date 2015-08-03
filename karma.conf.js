// Karma configuration
module.exports = function(config) {
  config.set({
    basePath: '.',
    frameworks: ['jasmine'],
    files: [
        'http://ajax.googleapis.com/ajax/libs/angularjs/1.4.3/angular.min.js',
        'http://ajax.googleapis.com/ajax/libs/angularjs/1.4.3/angular-mocks.js',
        'dist/debug/*.js',
        'test/*.spec.js'
    ],
    exclude: [],
    preprocessors: {
        'dist/debug/*.js': ['coverage']
    },
    reporters: ['spec', 'coverage'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['Firefox'],
    singleRun: true
  });
};
