/**
 * Execution Order Explanation:
 * 
 * 1. [Sync] Script start
 *    - First console.log(), executes immediately
 * 
 * 2. [Sync] Script end
 *    - Second console.log(), executes next in order
 * 
 * 3. [Next Tick] First nextTick
 *    - Registered before the promise but has higher priority
 *    - Executes after synchronous code but before any microtasks
 * 
 * 4. [Microtask] First resolved promise
 *    - Promises (microtasks) execute after nextTick callbacks
 *    - Even though the promise resolves immediately, its callback waits for the current tick
 *
 * Detailed Flow:
 * 1. Node.js starts executing synchronous code
 * 2. Registers nextTick callback in the nextTick queue
 * 3. Registers promise .then() in the microtask queue
 * 4. Finishes synchronous execution
 * 5. Processes nextTick queue (highest priority)
 * 6. Processes microtask queue (second priority)
 */

function firstDemo() {
    // 1. Synchronous code
    console.log('1. [Sync] Script start');

    // 2. Next tick (highest priority)
    process.nextTick(() => {
        console.log('3. [Next Tick] First nextTick');
    });

    // 3. Microtask (Promise)
    Promise.resolve().then(() => {
        console.log('4. [Microtask] First resolved promise');
    });

    // 4. Final synchronous code
    console.log('2. [Sync] Script end');

    /*
    Expected output:
    1. [Sync] Script start
    2. [Sync] Script end
    3. [Next Tick] First nextTick
    4. [Microtask] First resolved promise
    */
}


function secondDemo() {
    // 1. Microtask (Promise) - declared first but will execute after nextTick
    Promise.resolve().then(() => {
        console.log('4. [Microtask] First resolved promise');
    });

    // 2. Next tick - declared second but has higher priority
    process.nextTick(() => {
        console.log('3. [Next Tick] First nextTick');
    });

    // 3. Synchronous code
    console.log('1. [Sync] Script start');
    console.log('2. [Sync] Script end');
}

/**
 * Why the order remains the same:
 * 
 * 1. Synchronous code always runs first, regardless of declaration order
 * 2. nextTick callbacks are processed before microtasks (Promises)
 * 3. The order of registration doesn't matter - the priority is determined by the queue type
 * 
 * Execution Flow:
 * 1. All synchronous code runs first (console.logs)
 * 2. nextTick queue is processed (highest priority)
 * 3. Microtask queue is processed (second priority)
 * 
 * This demonstrates that the order of declaration doesn't affect the execution order
 * of different types of tasks in the event loop.
 */

// Execute both demos to compare
console.log('--- First Demo ---');
firstDemo();

// Add a small delay to separate the outputs
setTimeout(() => {
    console.log('\n--- Second Demo (Reversed Order) ---');
    secondDemo();
}, 100);