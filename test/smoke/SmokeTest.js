const Application = require('spectron').Application;
const assert = require('assert');

describe('application launch', function () {
    this.timeout(10000);

    beforeEach(function () {
        this.app = new Application({
            //specify full path to application (change to other executable type if OS different than macOS)
            path: '/Applications/Palgo.app/Contents/MacOS/Palgo'
        });
        return this.app.start()
    });

    afterEach(function () {
        if (this.app && this.app.isRunning()) {
            return this.app.stop()
        }
    });

    it('shows an initial window', function () {
        return this.app.client.getWindowCount().then(function (count) {
            assert.equal(count, 1)
        });
    });
});
