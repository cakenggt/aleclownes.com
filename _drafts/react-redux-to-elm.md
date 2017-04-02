---
layout: md_page
title: Moving from React-Redux to Elm
---
# Moving from React-Redux to Elm

The React-Redux combo has become the darling of the front-end community. Unidirectional data flow has taken us out of the dark-ages of binding, but few know that this much-lauded move came from Elm originally. In fact, much of React-Redux's best practices come from functional concepts (reducer, map), and Elm uses only those concepts as it is a purely functional language. In this article I will attempt to map the concepts we learn in React-Redux to Elm to ease the transition, as well as to answer some questions that I had starting out.

# Required Reading

Before we start, you should read some of the [official Elm guide](https://guide.elm-lang.org), at least the `Core Language` and `Types` sections to be able to understand the boilerplate below.

# Boilerplate

An Elm app can be started with a farily minimal boilerplate which succinctly shows all of the working parts of the app.

```elm
import Html exposing (..)


main : Program Never Model Msg
main =
  Html.program
    { init = init
    , view = view
    , update = update
    , subscriptions = subscriptions
    }



-- MODEL


type alias Model =
  {
  }


init : (Model, Cmd Msg)
init =
  ( Model
  , Cmd.none
  )



-- UPDATE


type Msg
  = Reset


update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    Reset ->
      init



-- VIEW


view : Model -> Html Msg
view model =
  div [] []



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
  Sub.none
```

# Types

Elm is statically typed, so it's code looks more like TypeScript than normal jsx. It's syntax is too complicated to get into in this article, but more information can be found [here](http://elm-lang.org/docs/syntax)

# Store

In React-Redux we are accustomed to creating a store and keeping application state within that store. The direct corrolary is the `Model` type declared above, which has no declared attributes, but functions as an object. The `init` function defined above is run when the app is first loaded, giving the initial state of the model and an optional action (Cmd) to perform (explained below). Providing the initial model state in `init` is exactly like providing an ES6 default value to your reducer's `state` parameter.

# View and Components

In the `view` function above, you can see that we take in the model as a parameter and output some Html (that is capable of delivering a Msg type, but let's forget about that for now). This is the same in concept as what React-Redux does, take a model (store) and render Html based on it.

You may be wondering how we can use components in a functional language like Elm. In fact, we use components in the same way that you have been hearing about new components being used in React-Redux, functional components! You may have heard of this newfangled way of doing components where the component doesn't have it's own internal React state, but instead is just a function that returns Html based on the arguments passed into it. Well this is exactly how components are done in Elm!

# Update

The `update` function above serves the exact same function as the `reducer` in a React-Redux app. It receives certain types of actions (dispatched from Html, what we talked about above when we said that Html can deliver Msg), and it affects the state by returning the new state (and an optional command to be carried out, such as making an AJAX request, detailed below).

This is all well and good for a single reducer function, but what if you want the often-used pattern provided by `combineReducers` where you have a reducer for each part of your app? This is possible too. In Elm, you can define multiple kinds of reducers and Msg types, and then to import all of those when you make the update function. All of the Msg types are unioned together for the total Msg type, and all of the reducer functions are unioned together in the total update function.

# Commands

In React-Redux we often hear about how the reducer should be purely functional in that it produces no side effects. To produce side effects, we should use a library like Thunk to dispatch functions which will be run and contain the code that produces side effects. In the above section, we saw how the `update` function returns a new model (state) and an optional command. This command serves the same function as using Thunk, it is how we cause a side effect. For example, you can cause an AJAX request using a command. A random number must also be generated using a command, because the random number is 'outside' of the state of the app in that it's value is not purely a result of the combination of the state of the app and the Msg received. It is important to understand that the corrolary to dispatching an object in React-Redux is sending a `Msg` in Elm (initiated by Html events), and the corrolary to dispatching a function (Thunk) in React-Redux is sending a `Cmd` in Elm (initiated by the `update` method).

When thinking about what actions should be done with commands vs. can be done normally, it is useful to think about Elm's time machine functionality. When using elm-reactor to look at your app, there is a little panel to the bottom right that allows you to reverse time in the app and look at the state and message that caused that state. Now think about how a random number would be recorded to be able to preserve this time machine. It's value would have to be dispatched to the model so that the same action could be replayed over and over again without getting a different random number.

What if you want multiple commands to be dispatched as a result of a single action, like initiating several AJAX requests? That's easy, there is a command bundler in Elm!

# Subscriptions

Sometimes you want to respond to something that happens with no initiation from the app at all, like getting a websocket emit from the server. For events that originate outside of the app, we are told in React-Redux to write middleware which captures their events, transforms them, and dispatches them as actions for the reducer. This can be seen in middleware such as [redux-socket.io](https://github.com/itaylor/redux-socket.io). In Elm, we `subscribe` to events that originate outside of the app, and our subscription tells the app how to transform the event into a message.

# Packages

In React-Redux we are used to being able to require packages from npm and having them automatically bundled in by webpack. In Elm, there is a much smaller package manager called `elm-package` where you can get packages made especially for Elm, and publish your own packages as well. But you may ask, how do I use the HMAC library, or spellcheck library, from npm with Elm? I'm not going to lie to you, it's hard to use npm packages in Elm, but it is possible, as detailed in the next section. If you are the charitable type, you can rewrite the logic in an Elm package so future developers don't have to go through the pain of JS Interop.

# JS Interop

What if you absolutely have to use an npm package in your Elm application? There is a fairly convoluted way of doing so, which involves setting up an Html file which imports both the compiled Elm application and the compiled npm library, and manually mashes them together in a script tag using Elm's JS Interop. The most important thing to understand about JS Interop in Elm is that you end up communicating with the npm library just like you would with a websocket. You send out a `Cmd` to tell the npm library to do something, and you `subscribe` to anything you want to get from the npm library. You may be wondering why Elm just doesn't treat the return value from an npm library like the response of an AJAX request, and I'll tell you why. First, it may never come. There is no guarantee that the npm library will return anything, whereas an AJAX request will end with either success or an error. Second, the npm library could want to say something to your Elm app without you doing anything to cause it first on the Elm side, which makes it much more like listening to a websocket emit.

And no, you can't make an Elm package which just sets up a bridge from an npm library to Elm. Elm apps that are declared to have `port`s (what JS Interop goes through) cannot be published.

# Misc Questions

## Routing

You can create a full SPA in Elm including features such as Routing. A great guide to creating an SPA is the [elm tutorial](https://www.elm-tutorial.org/). You may be thinking "I know, I'll use JS Interop to control the routing!" Wrong! You'll use the `Navigation` module like everyone else, or a router package based on it. But how does the Navigation module, which is a package just like all others (except it is an `elm-lang` package, which makes it more official than others), mess with the URL of the page, when we said before that packages cannot contain ports? Well, it is something called an `effects module`, which is not documented anywhere currently, since it was never intended for there to be more than like 10 of them in existence. It is almost never the right decision for you to make one of these yourself, and in fact you should just look for the one that already exists doing what you need. There is (almost) always, at this time, a way to do what you want in pure Elm.
