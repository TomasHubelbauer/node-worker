import worker_threads from 'worker_threads';
import defer from './defer.js';
import delay from './delay.js';

void async function () {
  const status = {};
  for await (const item of cache(status)) {
    console.log(item, '|'.repeat(status.overhead))
    worker_threads.parentPort.postMessage(item);
    await delay(100);
  }

  worker_threads.parentPort.postMessage(null);
}()

async function* cache(status) {
  const messages = [];
  let done = defer();

  worker_threads.parentPort.addEventListener('message', event => {
    if (event.data === null) {
      done.resolve(true);
      return;
    }

    messages.push(event.data);
    status.overhead = messages.length;
    done.resolve(false);
    done = defer();
  });

  while (messages.length > 0 || !await done.promise) {
    if (messages.length > 0) {
      status.overhead = messages.length - 1;
      yield messages.shift();
    }
  }
}
