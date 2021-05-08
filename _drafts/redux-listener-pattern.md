---
layout: md_page
title: Redux Listener Pattern
comments: true
---
# What React-Redux Is Good At

With the introduction of React, front-end devs have discovered the simple pleasures of compartmentalizing their code in a predictable way. Sure, we all had our own separate methods beforehand, but now there is a strong incentive for devs to all use a component-based pattern to split up logic in their apps. In the same way as React led the way in the adoption of using components, React-Redux has led the way to a whole slew of new patterns enabling modularization of app logic, such as the `combineReducers` function.

It is easy to use patterns that a language is built around. They appear in every tutorial and blog post, because they are the most efficient and effective ways of solving these common tasks. It is easier to work with a language than to fight against it, and React-Redux has a lot to work with.

However, one of the things that it does not work with well are outside events.

# Outside Events

What are outside events? These are, simply put, events that don't have a cause originating from inside the React app. You may first think of an HTTP Response, but this doesn't count as an outside event purely because the various apis that we use to send Requests almost always come with a promise or callback-based way to deal with the Response. The Response to a Request is immediately caused by the Request itself, and thus we can deal easily with whatever actions we need to take in the reducer.

To be quite frank, the reason this hasn't really come up is because not many developers need the libraries which are capable of producing an outside event. The technologies I can think of that produce outside events are limited to the following:

* WebSockets
* IPC (Electron)

How do you deal with outside events? It is trivial to include some code somewhere which dispatches an action when an event comes through on these channels (for [Socket.io](http://socket.io/), [redux-socket.io](https://github.com/itaylor/redux-socket.io) is a good prewritten one), but sometimes you need fine-grain control. For instance, I wanted to get an acknowledgement when the server received a socket event from the client, so I could take the event off of a queue of repeating messages, but I was unable to use the callbacks that come with Socket.io when I was using redux-socket.io. Additionally, if I wanted to produce side effects from an outside event, I could not integrate [Thunk](https://github.com/gaearon/redux-thunk) into my app, since the socket events were dispatched normally.

The pattern I ended up using was so useful that I used it in multiple other projects with the same needs, and I would like to take this opportunity to codify it in this post.

# Redux Listener Pattern

The listener is implemented as a file that you will import when creating your Redux store. The object that is required to listen to events will be created as a constant outside of all functions in the listener file. The listener file must have a default export as a function which takes in the `dispatch` function as the first argument and the `getState` function as the second. Additionally, you can have other named exports which you can import wherever else you need them in the code  (such as for using the same socket to emit events in the file of an actionCreator).

For outsideEvents which produce plain objects, you can optionally pass them directly to the dispatch function if they don't match any pre-defined types that you want to handle specially.

An example using Socket.io is provided below.
```javascript
/* global io */
import {join} from './actionCreators/chat-actions';

export const socket = io();

export default function (dispatch, getState) {
	socket.on('MESSAGE_SEND', data => {
		/*
		 * Sometimes you just want to do a simple normal
		 * thing like dispatching a certain action when
		 * a certain event occurs.
		 */
		dispatch({
			type: 'APPEND_CHAT_LOG',
			data: data
		});
	});

	socket.on('dispatch', action => {
		/*
		 * If I wanted to send certain events directly through
		 * to the dispatch method without defining specific
		 * listeners for each one, I can use the 'dispatch'
		 * event type to do it
		 */
		 dispatch(action);
	});

	socket.on('reconnect', () => {
		/*
		 * Here I need to use an action creator to produce
		 * a Thunk function to dispatch. Additionally, the
		 * dispatch depends on the current state.
		 */
		var state = getState();
		if (state.chat.room && state.chat.username) {
			dispatch(join(state.chat.room, state.chat.username));
		}
	});
}
```

The default export from this listener file is used after store creation.
```javascript
import addSocketListeners from './socket-listeners';

var reducer = combineReducers({
	chat: chatReducer,
	message: messageReducer
});

var store = createStore(
	reducer,
	applyMiddleware(
		thunk
	)
);

addSocketListeners(store.dispatch, store.getState);
```

As you can see, I have exported the socket that is connected to the server. This is so I can use it in the action creators that produce Thunk actions. The following excerpt is what `./actionCreators/chat-actions` can look like. You can see that I am using the callback I wanted from Socket.io below.
```javascript
/* global io */
import {socket} from '../socket-listeners';

export function join(room, username) {
	return function (dispatch) {
		/*
		 * This Thunk action emits a
		 * JOIN event to the socket, and then
		 * waits until the server acknowledges
		 * receipt of the JOIN with either an
		 * error code or a list of users in the room
		 */
		socket.emit('JOIN', {
			room: room,
			username: username
		}, (error, users) => {
			if (!error) {
				dispatch({
					type: 'SELF_JOIN',
					data: {
						room: room,
						username: username,
						users: users
					}
				});
			} else {
				dispatch({
					type: 'MESSAGE',
					data: error
				});
			}
		});
	};
}
```

I hope that I have shown how using this pattern can give you as fine-grained control as you want over your outside events, while enabling reuse of key constants and keeping code compartmentalized.
