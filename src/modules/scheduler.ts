import schedule from 'node-schedule';

process.on('SIGINT', function () {
    schedule.gracefulShutdown().then(() => process.exit(0));
});

export function scheduleJob(job: () => Promise<void>, date: Date) {
    schedule.scheduleJob(date, job);
}
