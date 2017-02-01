---
layout: md_page
title: Javascript Chains
---
# Javascript Chains Part 1: Prototype Chain

## Introduction

It can be said that Javascript is one of the most despised programming languages. However, it is also one of the most popular languages, and we regularly encounter it every day in various forms. A lot of this animosity comes from confusion about two key components of the language: the prototype chain and scoping. While Javascript's inheritance and scoping is different from most languages, I think that with proper understanding, these quirks can be embraced and used to their full potential. In this two part series, I will attempt to explain the prototype chain and the scope chain so that readers will understand how to debug their specific issues and how to use them to their advantage.

## Prototype Chain

Javascript has an interesting inheritance model, which happens to be completely different from most OOP languages. While it is object-oriented, an object doesn't have a type or a class that it gets it's methods from, it has a prototype. It is important to understand the differences beween these two, as they are not equivalent, and lead to much confusion down the line.

### Constructors

To create an object in Javascript, you first must define it's constructor function.

```js
//Constructor
var LivingEntity = function(location){
	this.x = location.x;
	this.y = location.y;
	this.z = location.z;
};

//New instance
var dog = new LivingEntity({
	x: 5,
	y: 0,
	z: 1
});
```

The constructor function is nothing more than a normal function. You may notice that we are referencing `this` in the constructor function above. `this` is not specific to constructor functions, and can be referenced in any function. Normally it points to the function's scope of execution, which we will get to in the next section.

To create a new instance of this object, call the constructor with the `new` keyword in front of it.

### Methods

Lets say we want to add a method to `LivingEntity` called `moveWest` that will decreate the entity's x component by 1. Since an object is just a map in Javascript, you might be tempted to add it to the instance of the object during or after construction.

```js
//During construction
var LivingEntity = function(location){
	this.x = location.x;
	this.y = location.y;
	this.z = location.z;
	this.moveWest = function(){
		this.x--;
	}
};

//OR after construction
dog.moveWest = function(){
	this.x--;
}
```

Doing so is not the way to construct objects using prototypes, and both of these methods add unnecessary anonymous functions to memory.

Instead, we can add a single anonymous function to the prototype chain!

```js
LivingEntity.prototype.moveWest = function(){
	this.x--;
}
```

If we do this, there is only one anonymous function, whose reference is passed around to all `LivingEntity` objects.

But what is `<Function>.prototype`? `prototype` is an attribute of all functions, and points to a map where attributes can be assigned that should be able to be accessed from all objects created with that function as the constructor.

Every object has a prototype that can be modified through the constructor's `prototype`, even `Object`.

```js
Object.prototype.a = 5;

var v = {};
console.log(v.a); //5
```

The prototype of an object is a way to store common attributes across all instances of a class, but in a way that is overwritable. If an object doesn't have a reference to an attribute, that object's prototype will be cheked for the attribute.

```js
LivingEntity.prototype.makeSound = function(){
	console.log('meow');
}

//dog uses it's prototype because it doesn't have makeSound as an attribute
dog.makeSound(); //meow

dog.makeSound = function(){
	console.log('woof');
}

//now dog has makeSound as an attribute, it will use that instead of it's prototype
dog.makeSound(); //woof
```

### The Prototype Chain

Every object has a prototype, including the prototype object. This "chain" goes all the way back until it reaches an object that has no prototype, ususally `Object`'s prototype. Prototype's version of "Inheritance" involves adding another link to the end of this prototype chain, as shown below.

```js
var Dragon = function(location){
	/*
	 * <Function>.call is a method that executes the defined function,
	 * but with the "this" variable pointing to the first argument,
	 * and the rest of the arguments being arguments of the function
	 * that is being "called". This essentially performs all of
	 * LivingEntity's constructor logic on Dragon's "this".
	 */
	LivingEntity.call(this, location);
	//canFly is an attribute of the constructed object and not Dragon's prototype
	this.canFly = true;
};

/*
 * Object.create(<Function>) creates an object with the same prototype
 * as the provided function, but without executing any of the logic
 * provided in the function. This example will return an object
 * with a prototype that has the "moveWest" and "makeSound" functions,
 * but not x, y, or z attributes.
 */
Dragon.prototype = Object.create(LivingEntity);

/*
 * Now we can assign prototype attributes to Dragon without affecting
 * the prototype of LivingEntity.
 */
Dragon.prototype.fly = function(y){
	this.y += y;
}

var sparky = new Dragon({
	x: 0,
	y: 0,
	z: 0
});
```

When an attribute is called on an object, the object is first checked for that attribute, and if it doesn't exist, then each link in it's prototype chain in traversed until the attribute is found or the end is reached. In this way, sparky can use `moveWest` even though `moveWest` was not defined in it's immediate prototype.

What does sparky and it's prototype chain look like with only each object's specific attributes listed?

* sparky
	* x
	* y
	* z
	* canFly
* sparky.prototype (Dragon.prototype)
	* fly
* sparky.prototype.prototype (LivingEntity.prototype)
	* makeSound
	* moveWest
* sparky.prototype.prototype.prototype (Object.prototype)
	* create
	* toString
	* etc...
