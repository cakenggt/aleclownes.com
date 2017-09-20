---
layout: plain_page
title: ES6 Set Performance in Chrome's V8 JavaScript Engine
---
<script>
var NaiveSet = function(){
  this.map = {};
}
NaiveSet.prototype.add = function(el){
  this.map[el] = true;
}
NaiveSet.prototype.has = function(el){
  return this.map[el] == true;
}
var EnumSet = function(){
  this.array = [];
}
EnumSet.prototype.add = function(el){
  this.array[el] = true;
}
EnumSet.prototype.has = function(el){
  return this.array[el] == true;
}
var BitEnumSet = function(){
  this.num = 0;
}
BitEnumSet.prototype.add = function(el){
  this.num = this.num | 1<<el;
}
BitEnumSet.prototype.has = function(el){
  return (this.num & 1<<el) != 0;
}
function methodTest(tested, method, iterations, range){
  var start = performance.now();
  for (var i = 0; i < iterations; i++){
    var num = Math.floor(Math.random()*range);
    tested[method](num);
  }
  return performance.now()-start;
}
$(function(){
  if (!Set){
    $('#run-bit-enum-set-comp').hide();
    $('#results-bit-enum-set-comp').text('You do not have Set support. The tests cannot be run.');
  }
  $('#run-bit-enum-set-comp').on('click', function(){
    var results = $('#results-bit-enum-set-comp');
    results.html('');
    var s = new Set();
    var addTime = methodTest(s, 'add', 100000, 32);
    var hasTime = methodTest(s, 'has', 100000, 32);
    results.html('Set: '+(addTime+hasTime)+'</br>');
    var s = new EnumSet();
    var addTime = methodTest(s, 'add', 100000, 32);
    var hasTime = methodTest(s, 'has', 100000, 32);
    results.html(results.html()+'EnumSet: '+(addTime+hasTime)+'</br>');
    var s = new NaiveSet();
    var addTime = methodTest(s, 'add', 100000, 32);
    var hasTime = methodTest(s, 'has', 100000, 32);
    results.html(results.html()+'NaiveSet: '+(addTime+hasTime)+'</br>');
    var s = new BitEnumSet();
    var addTime = methodTest(s, 'add', 100000, 32);
    var hasTime = methodTest(s, 'has', 100000, 32);
    results.html(results.html()+'BitEnumSet: '+(addTime+hasTime));
  });
});
</script>

One of the nice things that came with ES6 were native Sets, provided so that developers didn't have to keep importing or rolling their own custom Set polyfills. As I was writing a post about the advantages of using an EnumSet over a generic Set, I coded up and included some performance examples which yielded some very surprising results.

It turns out that the Set implementation in Chrome's V8 JavaScript Engine is very slow, about 2x slower than a Naive Set polyfill using a `Map<String, Boolean>`.

I have included the test below using the following Set implementations, compared to the native ES6 Set implementation.

```js
class NaiveSet {
  constructor(){
    this.map = {};
  }

  add(el){
    this.map[el] = true;
  }

  has(el){
    return this.map[el] == true;
  }
}

class EnumSet {
  constructor(){
    this.array = [];
  }

  add(el){
    this.array[el] = true;
  }

  has(el){
    return this.array[el] == true;
  }
}

class BitEnumSet {
  constructor(){
    this.num = 0;
  }

  add(el){
    this.num = this.num | 1<<el;
  }

  has(el){
    return (this.num & 1<<el) != 0;
  }
}
```

<button id="run-bit-enum-set-comp">Run!</button>
<pre id="results-bit-enum-set-comp">




</pre>

The NaiveSet implementation represents the base polyfill that Sets in JavaScript are based on, mapping a String to a Boolean.

The EnumSet implementation was theoretically supposed to take advantage of the optimizations in the Array implementation for using only Integer keys, but it ended up no faster than the NaiveSet.

The BitEnumSet implementation was theoretically supposed to take advantage of the speed of bit manipulation, but it also appears no faster than the NaiveSet.
