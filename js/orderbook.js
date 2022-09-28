'use strict'
let book = require('./book.js');

class Orderbook{
    constructor(props) {
        this.books = {};
    }

    addPair(symbol) {
        this.books[symbol] = new book(symbol);
    }

    removePair(symbol) {
        delete this.books[symbol];
    }

    addOrder(order) {
        this.books[order.symbol].addOrder(order);
    }

    removeOrder(order) {
        this.books[order.symbol].removeOrder(order);
    }

    getPair(symbol) {
        return this.books[symbol];
    }

    getPairs() {
        return Object.keys(this.books);
    }

    getOrdersAndTrades(symbol) {
        return this.books[symbol].getOrdersAndTrades();
    }
}

module.exports = Orderbook;