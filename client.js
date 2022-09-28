'use strict'
let OrderBook = require('./js/orderbook.js');
const {PeerRPCClient} = require('grenache-nodejs-ws')
const Link = require('grenache-nodejs-link')
const { v4 } = require('uuid');

let orderbook = new OrderBook();


//Setup link to grenache
const link = new Link({
    grape: 'http://127.0.0.1:30001',
    requestTimeout: 10000
})
link.start()

//Setup peer for grenache RPC Client
const peer = new PeerRPCClient(link, {})
peer.init()


//Request all pairs from server and sync them
async function syncPairs() {
    return new Promise((resolve, reject) => {
        peer.request('server', {action: "getPairs"}, {timeout: 100000}, async (err, result) => {
            if (err) reject(err);
            let promises = [];
            result.forEach(async (pair) => {
                promises.push(syncPair(pair));
            });
            await Promise.all(promises);
            resolve();
        })
    })
}

//Request all orders and trades for a pair from server and sync them
async function syncPair(pair) {
    return new Promise((resolve, reject) => {
        peer.request('server', {action: "syncPair", data: pair}, {timeout: 100000}, (err, result) => {
            if (err) reject(err);
            orderbook.addPair(pair);
            let _pair = orderbook.getPair(pair);
            if(_pair !== undefined){
                _pair.setOrdersAndTrades(result);
                _pair.setLastUpdate(Date.now());
            }

            resolve();
        })
    })
}

//Add order to local orderbook and send to server to be added in the servers orderbook
function addOrderAndTransmit(order) {
    orderbook.addOrder(order);
    peer.request('server', {action: "addOrder", data: order}, {timeout: 100000}, (err, result) => {
        if (err) throw err

    })
}

async function main() {
    await syncPairs();
}

//Generate random orders every 1 second
setInterval(() => {
    let pairs = orderbook.getPairs();
    for(let i = 0; i < 10; i++) {
        pairs.forEach((pair) => {
            addOrderAndTransmit(generateRandomOrder(pair));
        });
    }
},500);

function generateRandomOrder(symbol) {
    let order = {
        symbol: symbol,
        price: Math.floor(Math.random() * 100) +1000,
        quantity: Math.floor(Math.random() * 100),
        side: Math.random() > 0.5 ? "buy" : "sell",
        time: Date.now(),
        id: v4(),
        userID: Math.floor(Math.random() * 100)
    };
    return order;
}

//Sync pairs every second and show some stats
setInterval(async () => {
    let pairs = orderbook.getPairs();
    let pairsSyncPromise = [];
    pairs.forEach((pair) => {
        pairsSyncPromise.push(syncPair(pair));
    });
    await Promise.all(pairsSyncPromise);

    pairs.forEach((pair) => {
        let p = orderbook.getOrdersAndTrades(pair);
        console.log(`${pair} ${p.asks.length} asks, ${p.bids.length} bids, ${p.trades.length} trades, last price: ${orderbook.getPair(pair).getLastPrice()}`);
    })

},1000);

//After 10 seconds add a new pair
setTimeout(()=>{
    orderbook.addPair("BTC-DOGE");
},10000)

main();