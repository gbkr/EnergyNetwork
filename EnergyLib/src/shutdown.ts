const onShutDown = (callback: () => void) => {
  process.stdin.resume();
  [
    `exit`,
    `SIGINT`,
    `SIGUSR1`,
    `SIGUSR2`,
    `uncaughtException`,
    `SIGTERM`,
  ].forEach((eventType) => {
    process.on(eventType, callback.bind(null, eventType));
  });
};

export default onShutDown;
