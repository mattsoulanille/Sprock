module.exports = function(config){
  config.set({

    basePath : '../',

    files : [
      'app/bower_components/angular/angular.js',
      'app/bower_components/angular-route/angular-route.js',
      'app/bower_components/angular-mocks/angular-mocks.js',
      'app/bower_components/underscore/underscore.js',
      'app/bower_components/underscore-contrib/underscore.collections.walk.js',
      'app/bower_components/showdown/src/showdown.js',
      'app/bower_components/showdown/src/extensions/twitter.js',
      'app/bower_components/chai/chai.js',
      'app/bower_components/angular-underscore-module/angular-underscore-module.js',
      'app/bower_components/angular-ui-bootstrap-bower/ui-bootstrap-tpls.js',
      'app/bower_components/angular-markdown-directive/markdown.js',
      'app/bower_components/angular-sanitize/angular-sanitize.js',
      'app/js/**/*.js',
      'test/unit/**/*.js'
    ],

    autoWatch : true,

    frameworks: ['jasmine'],

    browsers : [
      'Chrome',
      'Safari',
      'Firefox'
    ],

    plugins : [
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-safari-launcher',
      'karma-jasmine',
      'karma-junit-reporter'
    ],

    junitReporter : {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    }

  });
};
