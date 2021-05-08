---
layout: md_page
title: Javascript Chains
comments: true
---
# Javascript Chains Part 2: Scope Chain

## Introduction

It can be said that Javascript is one of the most despised programming languages. However, it is also one of the most popular languages, and we regularly encounter it every day in various forms. A lot of this animosity comes from confusion about two key components of the language: the prototype chain and scoping. While Javascript's inheritance and scoping is different from most languages, I think that with proper understanding, these quirks can be embraced and used to their full potential. In this two part series, I will attempt to explain the prototype chain and the scope chain so that readers will understand how to debug their specific issues and how to use them to their advantage.

## Scope Chain

Every Javascript developer has at one point or another run into a bug (most of the time when trying to write asynchronously), that is described mysteriously online as the result of incorrect "closure". As a result, most developers have learned not to write functions in certain ways, for fear of awakening the beast once more. However, knowledge of closure and of the scope chain can make Javascript's biggest headache into a great ally.

### Anonymous Functions and State

The root of the problem is that functions have a state. We call this state the scope of the function, and it stores references to all of the variables that were declared at the time the function was created. Due to hoisting, named functions have the scope present at the top of whatever block they belong to, but anonymous functions have whatever scope exists at the line they are initialized.

### Closure

Closure is the act of capturing a object and separating it from it's original scope, making it available to the capturing function forever. The example below illustrates accidental closure.

```js
var helloStr = 'world';

//I want to make a function which returns a function that will print out
//a hello message when I execute it.
var sayHello = function(name){
	return function(){
		console.log('Hello ' + name + '!');
	}
}

var sayGreeting = sayHello(helloStr);

//woops, I meant to greet Bob
helloStr = 'Bob';
sayGreeting();//Hello world!
```

This is an example of assuming that your function will use a reference to the string `helloStr` when in reality you have accidentally captured the specific value of that string at the time of function execution.

What about this next example of an asynchronous counter? What do you expect it to output?

```js
for (var i = 0; i < 10; i++){
	setTimeout(function(){
		console.log(i);
	}, 1000);
}
```

Output:
```
10
10
10
10
10
10
10
10
10
10
```

In this example, closure was needed and did not happen. When the function goes to print out the values one second later, it references the current value of `i`, which has long ago been incremented to `10`. To understand when a function will capture a variable and when it will not, we need to understand scope.

### What is Scope?

If you think of functions in Javascript as state machines, scope is that state. Wherever the cursor in your Javascript program is, it has a scope. If it is inside a function, it is that function's scope. If it doesn't have a scope, it is said to have the global scope. You can think of scope as an object structured like so:

```
{
	_scope,
	variables
}
```

The `_scope` variable points to the scope that the program cursor was at when the function was created, or null in the case of the global scope. This creates a chain of scopes called the Scope Chain. The `variables` variable is a map of all variable that are passed into the function or will be declared in the function (due to hoisting, they are all declared at the top of the function even though you may write them as being declared at other points). Whenever a variable is changed in the function, it's entry in the variables map is changed too.

### How are Closures related to the Scope Chain

When a variable is used, the program traverses the scope chain until it finds an entry for that variable. Redeclaring a variable or passing it into a function is a way of separating it from it's previous existence in the scope chain.

```js
var str1 = 'hello';
//Redeclaring the variable
var str2 = str1;
str1 = 'goodbye';
//Redeclaring the variable has separated it from it's original reference
console.log(str2);//hello

var str1 = 'hello';
var printVar = function(v){
	return function(){
		console.log(v);
	};
};
//Passing in variable into a function
var printHello = printVar(str1);
str1 = 'goodbye';
//Passing the variable into a function has saved it in the function's scope
printHello();//hello
```

In the Hello Bob example, the original string was preserved because it was passed into a function, and persisted in the function's scope even though it's variable outside the function was reassigned.

At the last line of the Hello Bob example, this is what the scope chain looks like when the program cursor is at the `console.log` statement.

* scope (nothing here)
* scope.scope
	* name: 'world'
* scope.scope.scope (global for this program)
	* sayHello: function
	* helloStr: 'Bob'
	* sayGreeting: function

In the async counting example, after one second when the program cursor starts to execute the `console.log` statements, this is the scope chain at each execution.

* scope (nothing here)
* scope.scope (global for this program)
	* i: 10

If we wanted to rewrite the async counting example correctly, we would write it so that it captured the current value of `i` instead of using the final value.

```js
//Even though the name of the variable is the same, we are using the
//value that is passed into the function, not the value that keeps incrementing
var logI = function(i){
	return function(){
		console.log(i);
	};
};

for (var i = 0; i < 10; i++){
	setTimeout(logI(i), 1000);
}
```

The value of `i` that has been captured in the function returned by `logI` is now ungettable and unsettable outside of the scope of the returned function. This is one way of making private variables in Javascript.

### Advanced: Immediately Invoked Functional Expression

Immediately Invoked Functional Expressions (IIFE) are a pattern in Javascript that allow variables and methods to be made private by declaring them inside a scope. This is how libraries like jQuery are structured. Passing the window object into these functions allows specific parts of the IIFE to be exported to the global namespace.

```js
(function(global){
	var privateVariable = 'No one can ever see me or change me outside of this scope';
	var publicVariable = 'No one can change me, but some can see me';

	global.getPublicVariable = function(){
		return publicVariable;
	};
})(window);
```

Now the window object has a `getPublicVariable` method.

## Conclusion

When using Javascript, it can sometimes get confusing to determine exactly which variable you are referencing at any given line. With an object attribute it can be anywhere along the prototype chain, and with a variable it can be anywhere along the scope chain. Hopefully this primer on the prototype and scope chains will increase your confidence when using these features of the language.
