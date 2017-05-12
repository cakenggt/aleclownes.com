---
layout: md_page
title: Decentralized IPFS Indexing
---
# Decentralized IPFS Indexing

## Problem

[IPFS](https://ipfs.io/) is an excellent file distribution platform. However, as files are identified by only their hashes, it is difficult to discover the files you want except through pre-compiled lists online. [The Index](https://www.reddit.com/r/ipfs/comments/67brhw/the_index_online_the_index_as_an_online_app_again/) was my attempt to create such an index of IPFS files using no centralized service at all, to enable maximum robustness.

## PubSub

PubSub was a new feature added to IPFS and would prove central to the execution of this solution. Through PubSub, a node can subscribe to a certain 'topic' (usually identified by a string) and listen for messages posted to that topic by other nodes. The node can also post messages to that topic. This allows inter-node communication, a key feature needed in decoupling IPFS from the wider internet.

However, since it is so new, and the specification is evolving, it can only be enabled in the daemon with the `--enable-pubsub-experiment` flag. Additionally, it is not supported in the official [ipfs-api](https://github.com/ipfs/js-ipfs-api) npm package. To get around this, I access the rudimentary PubSub API using an HTTP streaming request. This will be switched over to the official API once that support comes.

One thing that I have discovered using the rudimentary PubSub API is that all nodes receive a message, including the node that sent it. This will probably be fixed in future versions of the implementation (since it is currently using an algorithm known as `floodsub`), but to be safe, the below described `set-db` assumes that it might receive it's own messages and acts accordingly to prevent infinite message loops.

## CRDT

A [Conflict-free Replicated Data Type](https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type) is a data structure designed explicitly to allow operation in a distributed manner, while still allowing updates from any of the instances without conflicts. There are many different types of CRDT which allow a wide range of operations to occur without conflict using complicated (to me) mathematics, but the simplest can be thought of as a Set that can only be added to. In fact, that is exactly the data structure I used to back The Index, as that was the easiest to program and had all of the functionality I needed.

### orbit-db

[orbit-db](https://github.com/orbitdb/orbit-db) is a CRDT designed specifically to work with IPFS PubSub and supports a wide range of operations on it's many data types. However, its authors wisely decided against accessing the raw PubSub api with HTTP requests and instead used what limited support the official API would give them. This was not good enough for me, so I developed my own solution below. Additionally, their `docstore` database supported the removal of documents, which I did not want possible in The Index.

## set-db

[set-db](https://github.com/cakenggt/set-db) is my solution to the above problems. I needed a CRDT that only supported additions (no updates or deletions allowed), was easy to code up, and would work with the PubSub messaging protocol. At 240 lines long, it ended up being a lot shorter than I thought, with a large percentage of that dedicated to parsing the raw HTTP stream requests (which will supposedly go away with a proper PubSub api).

### Structure

set-db's underlying data structure is a map where each entry is indexed by the instance's configurable `indexBy` attribute. It supports a `query` method which takes in a filter function and returns the records that return true from the filter function. It supports a `get` method which gets a record by it's id, and a `put` method which adds a record. The constructor takes in a `topic` to subscribe to in PubSub and an options object. The options object can have the following options:

* `indexBy` which specifies which key in each record the record will be identified by
* `validator` a filter function which entries must pass when they are being added to the db either though synchronization or manual `put`
* `dbHash` an IPFS multihash of a previous db state to load up

When a set-db is first constructed, if a `dbHash` option was passed in, it uses the ipfs-api library to load the file specified by that multihash. This multihash is saved to localStorage every time the db is updated, so on startup the db always has the last state.

### Validation

All entries in the loaded db from the file indicated by `dbHash` are not only checked for the existence of the `indexBy` attribute (\_id by default) but are also passed through the `validator` function. These checks are performed for every entry added to the db, no matter if it is from the initial db load, a `put` method call, or a database sync. If a record already exists in the db under the same id, it is not updated. This prevents poisoning of the databases.

### Requests

Once the previous database is loaded, or no database was loaded, it uploads the state of the database to IPFS and keeps track of the hash that IPFS returns (through sorting the db and then stringifying it, the same hash should be produced for a db that has the same entries but not necessarily the same order). Then, it connects to the specified topic in PubSub and subscribes to it. It then sends out two requests, an `ASK` request and a `NEW` request. These are described below:

* `NEW` requests are used to tell all other set-dbs subscribed to that topic the current db multihash of the sending db. Just the db hash is sent, allowing low request size, and letting IPFS take care of the content distribution.
* `ASK` requests are used to ask all other set-dbs subscribed to that topic for their current db hash. All set-dbs should respond to an `ASK` request with a `NEW` request containing their current db's multihash.

### Syncing

When a set-db receives a `NEW` request, it fetches the file from IPFS associated with the multihash that came in with that request. Then, each entry in the fetched db is run through the validation protocol described in the validation section, and if it passes, it is added to the current db. If any entries were added to the db as a result of a `NEW` request, the db is uploaded to IPFS, and a new db multihash is received and stored. Then, the set-db instance sends out a `NEW` request with this new multihash.

## The Index

Using the above data structure, it is possible to create a fully decentralized file descriptor service for IPFS. This service is [The Index](https://github.com/cakenggt/ipfs-foundation-frontend) and should work forever as long as PubSub works to enable inter-node communication.

The interesting thing about the PubSub functionality is that it enables dynamism completely within IPFS. I have taken an approach where every instance of the app acts as both server and client (server in that they give data to other nodes, and client in that they consume that data), but you could also set up an app to listen on PubSub to a central server's commands. What has to always be taken into account though is the possiblity of poisoning that comes with the lack of a real central server. The Index protects against it by validating all entries that come in, but it would also be possible to set up all clients with a public key, and have a single app that acts as a server on that PubSub topic that could receive and publish messages using the corresponding private key. While such a service would be completely within IPFS, it wouldn't so much be in the spirit of IPFS in that it relied on a central server.
