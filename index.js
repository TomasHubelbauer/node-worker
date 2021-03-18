import worker_threads from 'worker_threads';
import producer from './producer.js';
import fs from 'fs';

void async function () {
  const worker = new worker_threads.Worker('./consumer.js', { type: 'module' });

  const stream = fs.createWriteStream('result.log');
  worker.addListener('message', data => {
    if (data === null) {
      stream.close();
      worker.terminate();
      return;
    }

    stream.write(data + '\n');
  });

  for await (const item of producer()) {
    worker.postMessage(item);
  }

  worker.postMessage(null);
}()
