---
layout: md_page
title: Test Post
---
# Stonemason and generating microservice stubs

As a developer who takes on a lot of small, independent personal projects, I often found myself tasked with writing the same boilerplate code over and over again before even getting to start on meat of the code. Additionally, as I came to depend on more and more tools, the boilerplate that I would have to write seemed to expand exponentially. I would always find that the first time I tentatively started up a service, I had forgotten the webpack config or the babel presets, or something else equally obvious. Even worse than writing the boilerplate myself was attempting to copy my previous projects, as I would always end up including some functionality in the dependencies or the code that I never needed for the new service. I needed something like [create-react-app], but for an entire microservice.

## Microservice diversity

The problem with creating a stub-generator for microservices is the broad range of functionalities that microservices are used for. What if I just wanted to provide api routes? Do we even need DB integration? I found that my previous projects had a broad range of required functionality, so I wanted to make a tool that could generate a microservice stub for any of my previous projects.

I identified three main components that an app could independently include or exclude without affecting the others:

1. Database support
2. API routes
3. Front-end

If you were to chart out the possibilities, they would look like this:

DB | API | FRONT | Example
---|-----|-------|-------
|||A server that listens to a port with no action
x|||A service that manipulates records in a database for upgrades, etc.
|x||A service that performs some calculation on a request
x|x||A db record getter/setter service
||x|An electron front-end or a static html site
x||x|Not much
|x|x|A website that performs some non-persisting service
x|x|x|A metrics page

As you can see, a wide range of services can be generated with just these three features being enabled or disabled. Additionally, many other features can be grouped into these three as sub-features, such as which type of database will be used and whether Redux will be used for front-end state management.

## Technology decisions

Stonemason generates a stub service with a fairly rigid set of core technologies. These can be included and removed, but for the most part they can't be substituted with different technologies that serve the same function. Maximally, Stonemason will generate a microservice using the following tecnhology stack:

* [Express](http://expressjs.com/)
* [Sequelize](http://docs.sequelizejs.com/en/v3/)
* [Babel](https://babeljs.io/)
* [Webpack](https://webpack.github.io/)
* [React](https://facebook.github.io/react/)
* [Redux](http://redux.js.org/)
* [Socket.io](http://socket.io/)

From the beginning I wanted Stonemason to be easily extensible with new sub-options whenever I found a new favorite technology that I thought might be useful in the future. While the stub generator initially started with a fairly complicated nest of template literals, I ended up going with [Handlebars] due to it's logic-less nature. This would force myself any any future contributors to keep all the logic within the generator, where it belongs.

I initially found [Electron] very difficult to work with, but decided to go with it anyway because it would enable a truly cross-platform GUI experience, and I could code the whole thing in JavaScript!

I decided at a late stage to include a command line interface when I found myself annoyed by how I had to switch from the Stonemason GUI to the command line to start installing the dependencies of my created app every time I tested it. In comparison to the Electron GUI, building the [Inquirer] prompt object was a piece of cake. Additionally, Inquirer gave me a ton of nice visual selectors while also outputting the exact object I would end up passing to the generator.

## Using Stonemason

Before anything else, [Stonemason] must be installed globally with the following command:

`npm install -g stonemason`

Generating a microservice with Stonemason can be accomplished in two different ways: Using the GUI or the CLI. To use the GUI, run `stonemason`, to use the CLI, run `stonemason-cli`. When using the CLI, you can get a helpful default answer to the starting directory by running it in the directory where you want to create the stubs.

Regardless of which way you start it up, Stonemason will end up asking you the same questions. As mentioned above, the main question you want to ask yourself is which combination of Database, API, and Front-end your microservice will need.

*Note: If you end up using environment variables for your database path or port number, you will need to make sure these are set in your hosting environment and your local computer for testing (you can use the `heroku local` command to use a .env file, if you plan to host on heroku. [Read more here](https://devcenter.heroku.com/articles/heroku-local))*

At the end of the generation process you will have a series of directories and files that form the framework of your microservice. In this directory you will want to run the following command to install your microservice's dependences.

`npm install`

It is important at this step to make sure your app runs by running the following command. Any errors that Stonemason might have introduced can be caught at this stage.

`npm start`

Additionally, if you decided to use a front-end, the build and watch commands are provided for you to build your React app and watch it for changes in development.

`npm run build`

`npm run watch`

There you have it! You can start working on the api by going to `/api/v1.js` or your React app by going to `/app/index.jsx`, for example.

[create-react-app]: https://github.com/facebookincubator/create-react-app
[Handlebars]: http://handlebarsjs.com/
[Electron]: http://electron.atom.io/
[Inquirer]: https://github.com/sboudrias/Inquirer.js
[Stonemason]: https://github.com/cakenggt/mason
