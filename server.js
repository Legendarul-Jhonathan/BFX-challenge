'use strict'
let ob = require('./js/orderbook.js');

const {PeerRPCServer} = require('grenache-nodejs-ws')
const Link = require('grenache-nodejs-link')

let orderbook = initOrderbook();

//Setup link to grenache
const link = new Link({
    grape: 'http://127.0.0.1:30001'
})

link.start()

//Setup peer for grenache RPC Server
const peer = new PeerRPCServer(link, {})
peer.init()

const service = peer.transport('server')
service.listen(1337)

//Announce service to grenache
setInterval(() => {
    link.announce('server', service.port, {})
}, 1000)


//Handle RPC requests
service.on('request', (rid, key, payload, handler) => {
    switch (payload.action) {
        case "addOrder":
            orderbook.addOrder(payload.data);
            handler.reply(null, "Order added");
            break;
        case "removeOrder":
            orderbook.removeOrder(payload.data);
            handler.reply(null, "Order removed");
            break;
        case "getPairs":
            handler.reply(null, orderbook.getPairs());
            break;
        case "syncPair":
            if (orderbook.getPair(payload.data) === undefined) {
                orderbook.addPair(payload.data);
            }
            handler.reply(null, orderbook.getOrdersAndTrades(payload.data));
            break;
    }
})

//Match orders every 1 second
setInterval(() => {
    orderbook.getPairs().forEach((pair) => {
        orderbook.getPair(pair).matchAllOrders();
        console.log("Matching orders for pair: " + pair);
    });
}, 1000)


//Initialize orderbook with some pairs
function initOrderbook() {
    let orderbook = new ob();
    orderbook.addPair("BTC-USD");
    orderbook.addPair("ETH-USD");
    orderbook.addPair("BTC-ETH");
    orderbook.addPair("DOGE-USD");
    console.log("Orderbook initialized");
    return orderbook;
}