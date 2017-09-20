---
layout: plain_page
title: JavaScript Function Governor
---
The single-threaded nature of JavaScript often takes the language out of the running for the types of computations that take a significant amount of time. While there are workarounds for both the browser and NodeJs to run scripts asynchronously, ([Web Workers](http://www.w3schools.com/html/html5_webworkers.asp) for the browser), these can prove overkill for some problems.

For example, if you wanted your reactive website to display a list of widget names as the user typed a name into a search box, you would need to construct some sort of fast data structure out of a pre-defined list of names. Depending on how large this list of names is, it could take a few seconds to finish constructing the data structure. You could give this list to a web worker and have it post back with the complete data structure, but I think there is a simpler solution for this problem.

When a user is on a webpage, or when a server is waiting in between connections, the JavaScript thread is sitting idle. Between screen renders, there are plenty of milliseconds that are going to waste, so what if they were used to complete the long task a little bit at a time, between screen renders? The function that would be run during this time would need to be `parcelized`, or constructed in such a way as to be able to end it's execution after some amount of time, and then resume a task from the last place it left off. This would allow the function to finish the task, while also letting the webpage render seamlessly.

But how much work should the function do with each call? The answer to this question is completely dependent on the server (for a NodeJs server) or client (for a webpage) computer speed. It would not work out to manually set the function to do X amount of work each time it runs, because on some computers X is way too long, and on some other ones X does not use all of the time it could be using, and thus takes more execution cycles to finish.

Clearly we need some function which monitors the amount of time the job takes to run, and then adjusts how much work the job does afterwards to best use the time it is allotted. This is similar to how a [Centrifugal Governor](https://en.wikipedia.org/wiki/Centrifugal_governor) works, which is where the function gets its name from.

## Parcelized

First we need to define what a `parcelized` function is, as this is what will be going into our Governor to do work.

* It needs to perform discrete units of work that we'll call `work steps`.
* It needs The function also needs to take in a parameter saying how many `work steps` it should perform before it returns.
* It should keep it's state between executions so that it can make progress.
* It should indicate when it is finished working so the Governor can exit.

For finding whether or not a number is prime, the following function takes in a number to determine, and returns a `parcelized` function which will do the work.

```js
var isPrime = function(num){
  var currentDivisor = 2;
  return function(steps){
    for (var i = 0; i < steps; i++){
      if (currentDivisor <= Math.sqrt(num)){
        if (num%currentDivisor === 0){
          return {
            isPrime: false
          };
        }
        currentDivisor++;
      }
      else{
        return {
          isPrime: true
        };
      }
    }
  };
};
```

The returned `parcelized` function keeps state using closure and indicates that it is finished by returning an object. In each work step, it tries to divide the number in question by a divisor, increasing the divisor each work step.

## Governor Function

The following is a Governor function which monitors how long a `parcelized` function takes to run with a certain number of work steps, and then adjusts the next number of work steps it will run with.

```js
var hrtime = require('browser-process-hrtime');

var Governor = function(cb, duration){
  return new Promise(function(resolve, reject){
    var runs = 1;
    //Default duration of 30ms
    var duration = duration || 30;
    var loop = function(){
      var start = hrtime();
      var result = cb(runs);
      var hrtimeResult = hrtime(start);
      var fnDuration = (hrtimeResult[0]*1000)+(hrtimeResult[1]/1000000);
      //Prevents divide by 0 error
      fnDuration = fnDuration ? fnDuration : 1;
      if (result){
        //The computation finished
        resolve(result);
      }
      else{
        runs = Math.ceil(runs * (duration/(fnDuration)));
        setTimeout(loop, 0);
      }
    };
    setTimeout(loop, 0);
  });
};

module.exports = Governor;
```

[hrtime](https://github.com/kumavis/browser-process-hrtime) is a NodeJs library which enables a uniform timekeeping api across NodeJs and the browser.

The Governor function takes in a `parcelized` function and an optional duration in ms that the Governor will try to keep the function execution length less than. After the `parcelized` function runs, the new number of work steps are calculated and the looping function is called again in a setTimeout, in order to release the thread for any other computations that need done. Additionally, the Governor function returns a promise which resolves when the `parcelized` function indicates it is finished, with the value that the function indicated that with (any truthy value).
