/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {}],
  },
  reporters: [
    "default",
    ["jest-html-reporter", {
      "outputPath": "reports/test-report.html",
      "pageTitle": "Reporte de Pruebas ATM",
      "includeFailureMsg": true,
      "includeSuiteFailure": true
    }]
  ]
};
