const compareSnapshotCommand = require('../../dist/command.js');
const path = require('path');

function compareSnapshotTestCommand() {
  Cypress.Commands.add('compareSnapshotTest', { prevSubject: 'optional' }, (subject, name, params = 0.0) => {
    let screenshotOptions = {};
    let errorThreshold = 0.0;
    if (typeof params === 'number') {
      errorThreshold = params;
    } else if (typeof params === 'object') {
      errorThreshold = params.errorThreshold || 0.0;
      // eslint-disable-next-line prefer-object-spread
      screenshotOptions = Object.assign({}, params);
    }
    // get image title from the 'type' environment variable
    let title = 'actual';
    if (Cypress.env('type') === 'base') {
      title = 'base';
    }

    const specDirectory = Cypress.spec.relative.replace('cypress/e2e', '');
    const screenshotPath = path.join(specDirectory, `${name}-${title}`);

    // take snapshot
    if (subject) {
      cy.get(subject).screenshot(`${name}-${title}`, screenshotOptions);
    } else {
      cy.screenshot(`${name}-${title}`, screenshotOptions);
    }

    // run visual tests
    if (Cypress.env('type') === 'actual') {
      const options = {
        fileName: name,
        specDirectory: specDirectory,
        failSilently: Cypress.env('failSilently') !== undefined ? Cypress.env('failSilently') : true
      };
      cy.task('compareSnapshotsPlugin', options).then(results => {
        if (results.error) {
          console.log(results.error); // eslint-disable-line no-console
          return results.error;
        }

        if (results.percentage > errorThreshold) {
          return false
        };

        return true;
      });
    }
  });
}

compareSnapshotTestCommand();
compareSnapshotCommand();
