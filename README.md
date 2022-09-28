# The BFX challenge

Simple POC of a distributed exchange using Grenache and Node.js

This is a very simple and naive implementation of a distributed exchange.


## How to run

```
grape --dp 20001 --aph 30001 --bn '127.0.0.1:20002'
grape --dp 20002 --aph 40001 --bn '127.0.0.1:20001'

npm install

#start server
node server.js

#Can start as many clients.js as you want
node client.js
```

This is not the implementation I had in mine, but unfortunately I could not get grape to do what I wanted. I wished to have multiple server instances that talked to each other and acknowledge each other's orders. The problem is that I was using random port numbers and spinning up multiple servers but grape cached the address of the services when the services would restart `grenache-nodejs-ws` (using the `peer.map()` method) would try to connect to this dead services and resul in a `ECONNREFUSED` error that was uncaught. The only way I could get around this was to do something like this:

```
process.on('uncaughtException', function(err) {
    // Handle error
})
```
Needless to say, instead of fighting with grape I settled on this implementation.


### Things that are missing:
 - Book persistence on the server
 - Book price and quantity should be stored as BigNumber
 - Order matching should be done in a separate process
 - Orders should be validated and stored in a database
 - The size of the orderbook and the trades should be limited
 - Robustness and fault tolerance
 - Security
 - Logging
 - Tests