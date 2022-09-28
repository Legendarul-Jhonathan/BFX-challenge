'use strict'

class Book{
    constructor(symbol){
        this.info = {
            symbol: symbol,
            pair0: symbol.split("-")[0],
            pair1: symbol.split("-")[1],
        }
        this.asks = [];
        this.bids = [];
        this.trades = [];
        this.lastUpdate = Date.now();
    }
    addOrder(order){
        if (order.side == "buy") {
            this.bids.push(order);
            this.bids=this.sortOrders(this.bids);
        } else {
            this.asks.push(order);
            this.asks=this.sortOrders(this.asks);
        }
    }

    removeOrder(order){
        if (order.side == "buy") {
            this.bids = this.bids.filter((o) => {
                return o.id != order.id;
            })
        } else {
            this.asks = this.asks.filter((o) => {
                return o.id != order.id;
            })
        }
    }

    findMatch(){
        if (this.asks.length == 0 || this.bids.length == 0) {
            return null;
        }
        let bestAsk = this.asks[0];
        let bestBid = this.bids[0];
        if (bestAsk.price <= bestBid.price) {
            return [bestAsk, bestBid];
        } else {
            return null;
        }
    }

    match(){
        let match = this.findMatch();
        if (match == null) {
            return null;
        }
        let [ask, bid] = match;
        let trade = {
            "askPrice": ask.price,
            "askQuantity": ask.quantity,
            "bidPrice": bid.price,
            "bidQuantity": bid.quantity,
            "executionPrice": ask.price,
            "quantity": Math.min(ask.quantity, bid.quantity),
            "time": Date.now(),
            "askID": ask.id,
            "bidID": bid.id,
            "askUserID": ask.userID,
            "bidUserID": bid.userID,
        }
        this.trades.push(trade);
        ask.quantity -= trade.quantity;
        bid.quantity -= trade.quantity;
        if (ask.quantity == 0) {
            this.removeOrder(ask);
        }
        if (bid.quantity == 0) {
            this.removeOrder(bid);
        }
        return trade;
    }

    matchAllOrders(){
        let trades = [];
        let trade = this.match();
        while (trade != null) {
            trades.push(trade);
            trade = this.match();
        }
        return trades;
    }

    //sort by price, then by time, then by quantity, then by id(uuidV4)
    sortOrders(orders){
        if (orders.length < 2) {
            return orders;
        }
        orders.sort((a,b) => {
            if (a.price != b.price) {
                return a.price - b.price;
            } else if (a.time != b.time) {
                return a.time - b.time;
            } else if (a.quantity != b.quantity) {
                return a.quantity - b.quantity;
            } else {
                return a.id - b.id;
            }
        })
        return orders;
    }

    getOrdersAndTrades(){
        return {
            asks: this.asks,
            bids: this.bids,
            trades: this.trades
        }
    }

    setOrdersAndTrades(data){
        this.asks = data.asks;
        this.bids = data.bids;
        this.trades = data.trades;
    }



    setLastUpdate(date){
        this.lastUpdate = date;
    }

    getLastUpdate(){
        return this.lastUpdate;
    }

    getLastPrice(){
        if (this.trades.length == 0) {
            return 0;
        }
        return this.trades[this.trades.length-1].executionPrice;
    }


}

module.exports = Book;