import delay from './delay.js';

export default async function* producer() {
  for (let index = 0; index < 10; index++) {
    yield index;
    await delay(50);
  }
}
