# Node Worker

This repository hosts a sample of using workers in Node. `consumer.js` is a
worker script which listens for messages from coming from `index.js` which uses
`producer.js` to generate data to feed to the worker.

If the worker receives new messages at a faster rate than it is able to process
the existing messages, it will cache them in memory and process them at the next
available opportunity.

The protocol between the main and worker scripts is such that the main script
keeps sending messages to process and the worker keeps processing them until
`null` is sent instead of a message. At that moment, the worker knows no more
messages will come, it finishes up any cached messages and sends `null` back to
the main script to signal it is done processing.

To see the caching behavior in action, play around with the delay values in the
producer and consumer scripts. Right now, it is set up such that the producer is
twice as fast as the consumer, resulting in a nice pyramid/sawtool style cache
pattern.

## To-Do

### Prototype using this for SVG Screencast to off-load patching and optimizing

[SVG Screencast](https://github.com/TomasHubelbauer/svg-screencast) currently
uses a single thread for both capturing the frames to feed into the algorithm
and executing the processing itself, which if there are multiple regions to
process within a single screenshot, causes stutter, because the optimization
step can be quite heavy, hoarding the thread for itself for a long time and
starving the capturing process of resources to continue running uninterrupted.

At the moment, I am using `setImmediate` in some critical areas to split the
heavy processing up into more reasonable chunks, but that only eases the stutter
instead of eliminating it. Moving the `patch` and `optimize` phases into their
own worker would ensure smooth operation of the capture phase on the main thread
of the application.

There might be issue with the type of data that can be sent to a worker, namely,
it is very likely that instead of passing the `crop` function as a part of the
screenshot, it will have to be done using messaging so it will no longer be a
part of a screenshot, instead, it will be another parameter to SVG screencast.

In the initial proof of concept, this `crop` implementation using messaging can
be allowed to marshall the buffer it wants to crop back to the main thread so we
don't have to keep another cache of possibly-croppable buffers and maintain that
until we know the buffer has been processed and will not be asked for cropping
anymore, but in the final implementation, it would be ideal to communicate to
the caller the frame SVG Screencast is on and let it know when to release cached
buffers once that frame's number has passed.
