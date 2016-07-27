export default function () {
    return {
        noColors:           false,
        startTime:          null,
        afterErrList:       false,
        currentFixtureName: null,
        testCount:          0,

        reportTaskStart (startTime, userAgents, testCount) {
            this.startTime = startTime;
            this.testCount = testCount;

            this.setIndent(1)
                .useWordWrap(true)
                .write(this.chalk.bold('Running tests in:'))
                .newline();

            userAgents.forEach(ua => {
                this
                    .write(`- ${this.chalk.blue(ua)}`)
                    .newline();
            });

            this.newline();
        },

        reportFixtureStart (name) {
            this.currentFixtureName = name;
        },

        _renderErrors (errs) {
            this.setIndent(2)
                .newline();

            errs.forEach((err, idx) => {
                var prefix = this.chalk.red(`${idx + 1}) `);

                this.newline()
                    .write(this.formatError(err, prefix))
                    .newline()
                    .newline();
            });
        },

        reportTestDone (name, testRunInfo) {
            var hasErr    = !!testRunInfo.errs.length;
            var nameStyle = hasErr ? this.chalk.red.bold : this.chalk.gray;
            var symbol    = hasErr ? this.chalk.red.bold(this.symbols.err) : this.chalk.green(this.symbols.ok);

            name = `${this.currentFixtureName} - ${name}`;

            var title = `${symbol} ${nameStyle(name)}`;

            if (testRunInfo.unstable)
                title += this.chalk.yellow(' (unstable)');

            if (testRunInfo.screenshotPath)
                title += ` (screenshots: ${this.chalk.grey.underline(testRunInfo.screenshotPath)})`;

            this.setIndent(1)
                .useWordWrap(true)
                .write(title);

            if (hasErr)
                this._renderErrors(testRunInfo.errs);

            this.afterErrList = hasErr;

            this.newline();
        },

        _renderWarnings (warnings) {
            this.newline()
                .setIndent(1)
                .write(this.chalk.bold.yellow(`Warnings (${warnings.length}):`))
                .newline();

            warnings.forEach(msg => {
                this.setIndent(1)
                    .write(this.chalk.bold.yellow(`--`))
                    .newline()
                    .setIndent(2)
                    .write(msg)
                    .newline();
            });
        },

        reportTaskDone (endTime, passed, warnings) {
            var durationMs  = endTime - this.startTime;
            var durationStr = this.moment.duration(durationMs).format('h[h] mm[m] ss[s]');
            var footer      = passed === this.testCount ?
                              this.chalk.bold.green(`${this.testCount} passed`) :
                              this.chalk.bold.red(`${this.testCount - passed}/${this.testCount} failed`);

            footer += this.chalk.gray(` (${durationStr})`);

            this.setIndent(1)
                .useWordWrap(true);

            if (!this.afterErrList)
                this.newline();

            this.newline()
                .write(footer)
                .newline();

            if (warnings.length)
                this._renderWarnings(warnings);
        }
    };
}
