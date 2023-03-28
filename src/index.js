export default function () {
    return {
        noColors:           false,
        startTime:          null,
        afterErrList:       false,
        currentFixtureName: null,
        testCount:          0,
        skipped:            0,

        reportTaskStart (startTime, userAgents, testCount) {
            this.startTime = startTime;
            this.testCount = testCount;

            const writeData = { startTime, userAgents, testCount };

            this.setIndent(1)
                .useWordWrap(true)
                .write(this.chalk.bold('Running tests in:'), writeData)
                .newline();

            userAgents.forEach(ua => {
                this
                    .write(`- ${this.chalk.blue(ua)}`, writeData)
                    .newline();
            });

            this.newline();
        },

        reportFixtureStart (name) {
            this.currentFixtureName = name;
        },

        _renderErrors (errs, writeData) {
            this.setIndent(3)
                .newline();

            errs.forEach((err, idx) => {
                const prefix = this.chalk.red(`${idx + 1}) `);

                this.newline()
                    .write(this.formatError(err, prefix), writeData)
                    .newline()
                    .newline();
            });
        },

        reportTestDone (name, testRunInfo, meta) {
            const hasErr  = !!testRunInfo.errs.length;
            let symbol    = null;
            let nameStyle = null;

            if (testRunInfo.skipped) {
                this.skipped++;

                symbol    = this.chalk.cyan('-');
                nameStyle = this.chalk.cyan;
            }
            else if (hasErr) {
                symbol    = this.chalk.red.bold(this.symbols.err);
                nameStyle = this.chalk.red.bold;
            }
            else {
                symbol    = this.chalk.green(this.symbols.ok);
                nameStyle = this.chalk.grey;
            }

            name = `${this.currentFixtureName} - ${name}`;

            let title = `${symbol} ${nameStyle(name)}`;

            if (testRunInfo.unstable)
                title += this.chalk.yellow(' (unstable)');

            if (testRunInfo.screenshotPath)
                title += ` (screenshots: ${this.chalk.grey.underline(testRunInfo.screenshotPath)})`;

            const writeData = { name, testRunInfo, meta };

            this.setIndent(1)
                .useWordWrap(true)
                .write(title, writeData);

            if (hasErr)
                this._renderErrors(testRunInfo.errs, writeData);

            this.afterErrList = hasErr;

            this.newline();
        },

        _renderWarnings (warnings, writeData) {
            this.newline()
                .setIndent(1)
                .write(this.chalk.bold.yellow(`Warnings (${warnings.length}):`), writeData)
                .newline();

            warnings.forEach(msg => {
                this.setIndent(1)
                    .write(this.chalk.bold.yellow('--'), writeData)
                    .newline()
                    .setIndent(2)
                    .write(msg, writeData)
                    .newline();
            });
        },

        reportTaskDone (endTime, passed, warnings) {
            const durationMs  = endTime - this.startTime;
            const durationStr = this.moment.duration(durationMs).format('h[h] mm[m] ss[s]');
            let footer        = passed === this.testCount ?
                this.chalk.bold.green(`${this.testCount} passed`) :
                this.chalk.bold.red(`${this.testCount - passed}/${this.testCount} failed`);

            footer += this.chalk.gray(` (${durationStr})`);

            const writeData = { endTime, passed, warnings };

            this.setIndent(1)
                .useWordWrap(true);

            if (!this.afterErrList)
                this.newline();

            this.newline()
                .write(footer, writeData)
                .newline();

            if (this.skipped > 0) {
                this.write(this.chalk.cyan(`${this.skipped} skipped`), writeData)
                    .newline();
            }

            if (warnings.length)
                this._renderWarnings(warnings, writeData);
        },
    };
}
