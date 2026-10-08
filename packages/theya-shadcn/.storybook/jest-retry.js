// On GitHub Actions a story whose play test fails is run up to two more
// times before the run fails. The shared runner is slow and uneven, and a
// few play tests (focus moves, scroll listeners, Embla/Recharts measuring)
// occasionally miss their moment there while passing every local run.
// Every retried failure is still printed (logErrorsBeforeRetry), so a
// flaky story stays visible in the log instead of silently passing.
// Locally there are no retries: a failure there is always real.
if (process.env.GITHUB_ACTIONS === 'true') {
  jest.retryTimes(2, { logErrorsBeforeRetry: true });
}
