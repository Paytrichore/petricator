// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: "",
    frameworks: ["jasmine", "@angular-devkit/build-angular"],
    plugins: [
      require("karma-jasmine"),
      require("karma-chrome-launcher"),
      require("karma-jasmine-html-reporter"),
      require("karma-junit-reporter"),
      require("karma-coverage"),
      require("@angular-devkit/build-angular/plugins/karma"),
    ],
    client: {
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
    },
    coverageReporter: {
      dir: "coverage",
      reporters: [
        { type: "html", subdir: "." },
        { type: "lcov", subdir: "." },
        { type: "cobertura", subdir: "." },
        { type: "text-summary", subdir: "." },
      ],
      check: {
        global: {
          statements: 95,
          lines: 95,
          branches: 80,
          functions: 95,
        },
      }
    },
    reporters: ["progress", "coverage", "junit", "kjhtml"],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    browsers: ['ChromeHeadless'],
    singleRun: true,
    autoWatch: false,
    restartOnFileChange: true,
    junitReporter: {
      outputDir: require("path").join(__dirname, "./coverage"),
      outputFile: "junit.xml",
      useBrowserName: false,
    },
  });
};
