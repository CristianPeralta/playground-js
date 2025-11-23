/**
 * Advanced Event Loop Demo
 * This example demonstrates the interaction between different types of tasks in the Node.js event loop
 *
 * Conceptual cycles used in comments:
 * - Cycle 0: Synchronous script execution + scheduling of async work (timers, I/O, setImmediate, closes)
 *           and the first batch of nextTick + Promise microtasks.
 * - Cycle 1: First pass through timers/check/close callbacks for the work scheduled in Cycle 0.
 * - Cycle 2: Later I/O completion in the poll phase (e.g. fs.readFile).
 *
 * These "cycles" are a teaching tool, not exact libuv internals, but they match the observed output order.
 */

const fs = require('fs');
const { createServer } = require('net');

function advancedDemo() {
    // Cycle 0 (script): synchronous start of the main module
    console.log('1. [Sync][Cycle 0] Script start');

    // --- Next Tick Queue ---
    // Cycle 0: schedule nextTick callbacks to run immediately after the current synchronous work
    process.nextTick(() => {
        console.log('3. [Next Tick][Cycle 0] First nextTick (after script)');
        
        // Nested next tick
        process.nextTick(() => {
            console.log('5. [Next Tick][Cycle 0] Nested nextTick');
        });
    });

    // --- Microtasks (Promises) ---
    // Cycle 0: schedule Promise microtasks, which will run after nextTick in the same tick
    Promise.resolve().then(() => {
        console.log('6. [Microtask][Cycle 0] First promise resolved');
        
        // Nested microtask
        Promise.resolve().then(() => {
            console.log('7. [Microtask][Cycle 0] Nested promise');
        });
    });

    // --- Timers Phase ---
    // Cycle 0: schedule a timer for the timers phase in the next loop iteration (conceptual Cycle 1)
    setTimeout(() => {
        console.log('8. [Timers][Cycle 1] setTimeout 0ms');
        
        // Microtask inside timer
        Promise.resolve().then(() => {
            console.log('9. [Microtask][Cycle 1] Inside setTimeout');
        });
    }, 0);

    // --- Poll Phase (I/O) ---
    // Cycle 0: start an asynchronous I/O operation whose callback will run later in the poll phase (Cycle 2)
    fs.readFile(__filename, () => {
        console.log('14. [Poll][Cycle 2] File read complete');
        
        // Microtask inside I/O
        Promise.resolve().then(() => {
            console.log('15. [Microtask][Cycle 2] Inside I/O callback');
        });
    });

    // --- Check Phase (setImmediate) ---
    // Cycle 0: schedule a callback for the check phase (setImmediate) in the next loop iteration (Cycle 1)
    setImmediate(() => {
        console.log('10. [Check][Cycle 1] setImmediate');
        
        // Next tick inside setImmediate
        process.nextTick(() => {
            console.log('11. [Next Tick][Cycle 1] Inside setImmediate');
        });
    });

    // --- Close Phase (clean close via nextTick) ---
    // Cycle 0: schedule a clean server close; Node will emit 'close' via process.nextTick()
    const server = createServer();
    server.on('close', () => {
        console.log('4. [Close][Next Tick][Cycle 0] Server closed cleanly');
    });
    server.close();

    // --- Close Phase (abrupt close callbacks phase) ---
    // Cycle 0: create and destroy a stream abruptly; its 'close' fires in the close callbacks phase (Cycle 1)
    const stream = fs.createReadStream(__filename);
    stream.on('close', () => {
        console.log('12. [Close][Cycle 1] Stream destroyed (abrupt close callbacks phase)');

        // Microtask inside abrupt close
        Promise.resolve().then(() => {
            console.log('13. [Microtask][Cycle 1] Inside abrupt close');
        });
    });
    stream.destroy();

    // Final synchronous code (still Cycle 0)
    console.log('2. [Sync][Cycle 0] Script end');
}

console.log('--- Advanced Event Loop Demo ---');
advancedDemo();

/**
 * Expected Output Order:
 * 
 * 1. [Sync][Cycle 0] Script start
 * 2. [Sync][Cycle 0] Script end
 * 3. [Next Tick][Cycle 0] First nextTick (after script)
 * 4. [Close][Next Tick][Cycle 0] Server closed cleanly
 * 5. [Next Tick][Cycle 0] Nested nextTick
 * 6. [Microtask][Cycle 0] First promise resolved
 * 7. [Microtask][Cycle 0] Nested promise
 * 8. [Timers][Cycle 1] setTimeout 0ms
 * 9. [Microtask][Cycle 1] Inside setTimeout
 * 10. [Check][Cycle 1] setImmediate
 * 11. [Next Tick][Cycle 1] Inside setImmediate
 * 12. [Close][Cycle 1] Stream destroyed (abrupt close callbacks phase)
 * 13. [Microtask][Cycle 1] Inside abrupt close
 * 14. [Poll][Cycle 2] File read complete
 * 15. [Microtask][Cycle 2] Inside I/O callback
 * 
 * Notes:
 * - The order between setTimeout and setImmediate can vary
 * - Clean server.close() without listen() emits 'close' via process.nextTick()
 * - Abrupt resource destruction (stream.destroy()) emits 'close' in the close callbacks phase
 * - Next tick callbacks always run before Promise microtasks in the same tick
 */

/**
 * Why the Close Callback Executes Early:
 * 
 * The clean server close (4) appears earlier than expected due to how Node.js handles clean
 * server closures. When server.close() is called on a server that's not listening:
 * 
 * 1. The server is marked for closing
 * 2. Node.js (via libuv) checks for active connections or pending I/O
 * 3. If no pending I/O exists (as in our case), the close event is emitted immediately
 *    using process.nextTick() rather than waiting for the Close phase
 * 
 * This is an optimization in Node.js that allows for immediate resource cleanup when
 * there's no need to wait for I/O operations to complete.
 * 
 * The sequence in our output:
 * 1. [Sync][Cycle 0] Script start
 * 2. [Sync][Cycle 0] Script end
 * 3. [Next Tick][Cycle 0] First nextTick (after script)
 * 4. [Close][Next Tick][Cycle 0] Server closed cleanly  <-- Executed as a queued nextTick
 * 5. [Next Tick][Cycle 0] Nested nextTick
 * 6. [Microtask][Cycle 0] First promise resolved
 * 
 * This behavior is expected and documented in Node.js for clean, immediate closures.
 * If the server had active connections or pending I/O, the close event would wait for
 * the Close phase of the event loop.
 */