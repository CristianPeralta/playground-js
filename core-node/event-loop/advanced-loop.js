/**
 * Advanced Event Loop Demo
 * This example demonstrates the interaction between different types of tasks in the Node.js event loop
 */

const fs = require('fs');
const { createServer } = require('net');

function advancedDemo() {
    console.log('1. [Sync] Script start');

    // --- Next Tick Queue ---
    process.nextTick(() => {
        console.log('3. [Next Tick] First nextTick');
        
        // Nested next tick
        process.nextTick(() => {
            console.log('4. [Next Tick] Nested nextTick');
        });
    });

    // --- Microtasks (Promises) ---
    Promise.resolve().then(() => {
        console.log('5. [Microtask] First promise resolved');
        
        // Nested microtask
        Promise.resolve().then(() => {
            console.log('6. [Microtask] Nested promise');
        });
    });

    // --- Timers Phase ---
    setTimeout(() => {
        console.log('7. [Timers] setTimeout 0ms');
        
        // Microtask inside timer
        Promise.resolve().then(() => {
            console.log('8. [Microtask] Inside setTimeout');
        });
    }, 0);

    // --- Poll Phase (I/O) ---
    fs.readFile(__filename, () => {
        console.log('11. [Poll] File read complete');
        
        // Microtask inside I/O
        Promise.resolve().then(() => {
            console.log('12. [Microtask] Inside I/O callback');
        });
    });

    // --- Check Phase (setImmediate) ---
    setImmediate(() => {
        console.log('9. [Check] setImmediate');
        
        // Next tick inside setImmediate
        process.nextTick(() => {
            console.log('10. [Next Tick] Inside setImmediate');
        });
    });

    // --- Close Phase ---
    const server = createServer();
    server.on('close', () => {
        console.log('13. [Close] Server closed');
    });
    server.close();

    // Final synchronous code
    console.log('2. [Sync] Script end');
}

console.log('--- Advanced Event Loop Demo ---');
advancedDemo();

/**
 * Expected Output Order:
 * 
 * 1. [Sync] Script start
 * 2. [Sync] Script end
 * 3. [Next Tick] First nextTick
 * 13. [Close] Server closed
 * 4. [Next Tick] Nested nextTick
 * 5. [Microtask] First promise resolved
 * 6. [Microtask] Nested promise
 * 7. [Timers] setTimeout 0ms
 * 8. [Microtask] Inside setTimeout
 * 9. [Check] setImmediate
 * 10. [Next Tick] Inside setImmediate
 * 11. [Poll] File read complete
 * 12. [Microtask] Inside I/O callback
 * 
 * Notes:
 * - The close phase might appear earlier in some Node.js versions
 * - The order between setTimeout and setImmediate can vary
 * - Next tick callbacks always run before microtasks in the same phase
 */

/**
 * Why the Close Callback Executes Early:
 * 
 * The close callback (13) appears earlier than expected due to how Node.js handles clean
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
 * 1. [Sync] Script start
 * 2. [Sync] Script end
 * 3. [Next Tick] First nextTick
 * 13. [Close] Server closed  <-- Executed as a queued nextTick
 * 4. [Next Tick] Nested nextTick
 * 5. [Microtask] First promise resolved
 * 
 * This behavior is expected and documented in Node.js for clean, immediate closures.
 * If the server had active connections or pending I/O, the close event would wait for
 * the Close phase of the event loop.
 */