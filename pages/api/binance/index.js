import {
  log,
  delay,
  empty,
  isset,
} from "../../../utils/common";
import tulind from "tulind";
import Binance from "node-binance-api";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const binance = new Binance();
const markets = [];


export default async function handler(req, res) {
  const { query } = req;
  console.log( query );

  switch (query.action.toLowerCase()) {
    case "indicators":
      //TODO: time expires session controls
      try {
        if (!isset(query.symbol) || empty(query.symbol)) {
          if (isset(query.indicator) && isset(tulind.indicators[query.indicator])) {
            res.status(200).json( tulind.indicators[query.indicator] );
          } else if (!isset(query.indicator)) {
            res.status(200).json( tulind.indicators );
          } else {
            res.status(200).json({ error: "Indicator Unknown" });
          }
        } else {          
          let __high = [];
          let __close = [];
          let __open = [];
          let __low = [];
          let __vol = [];

          const resultsOfIndicators = {};

          const symbol = query.symbol ?? "BTCUSDT";
          const timeframes = "1m,3m,5m,15m,30m,1h,2h,4h,6h,8h,12h,1d,3d,1w,1M".split(",");
          let timeframe = timeframes.includes(query.timeframe) ? query.timeframe : "4h";
                    
          binance.candlesticks(symbol.toUpperCase(), timeframe, function (error, ticks) {
            try {
              if (!empty(ticks)) {
                ticks.map(t => {
                  let [
                    time,
                    open,
                    high,
                    low,
                    close,
                    volume,
                    closeTime,
                    assetVolume,
                    trades,
                    buyBaseVolume,
                    buyAssetVolume,
                    ignored,
                  ] = t;

                  __high.push( high );
                  __low.push( low );
                  __open.push( open );
                  __close.push( close );
                  __vol.push( volume );
                });

                resultsOfIndicators[symbol] = {};
                resultsOfIndicators[symbol].indicators = {};

                resultsOfIndicators[symbol].data = {
                  high: __high,
                  low: __low,
                  open: __open,
                  close: __close,
                  volume: __vol,
                };

                const callIndicator = isset(query.indicator) && isset(tulind.indicators[query.indicator]);

                if (callIndicator && query.indicator === "stoch") {
                  //get indicators from db
                  //apply indicators for this symbol and period
                  tulind.indicators.stoch.indicator(
                    [__high, __low, __close],
                    [14, 1, 3],
                    function (err, results) {
                      if (!err)
                        resultsOfIndicators[symbol].indicators.stoch = [
                          results[0].pop(),
                          results[1].pop(),
                        ];

                      //TODO: time expires session controls
                      try {
                        res.status(200).json({
                          ticks: resultsOfIndicators,
                        });
                      } catch (e) {
                        res.status(500).json({ error: e });
                      }
                      res.end();
                    }
                  );
                }
                if (callIndicator && query.indicator === "rsi") {
                  //get indicators from db
                  //apply indicators for this symbol and period
                  tulind.indicators.rsi.indicator(
                    [__close],
                    [14],
                    function (err, results) {
                      if (!err)
                        resultsOfIndicators[symbol].indicators.rsi = [
                          results,
                        ];

                      //TODO: time expires session controls
                      try {
                        res.status(200).json({
                          ticks: resultsOfIndicators,
                        });
                      } catch (e) {
                        res.status(500).json({ error: e });
                      }
                      res.end();
                    }
                  );
                }                  
              }
            } catch (err) {
              console.log(err);
            }
          });
        }
      } catch (e) {
        res.status(500).json({ error: e });
      }
      break;
    case "prevday":
      const markets = [];
      binance.prevDay(false, (error, prevDay) => {
        try {
          if (Array.isArray(prevDay)) {
            for (let obj of prevDay) {
              //TODO: apply symbol filters to only load crypto alerts
              let symbol = obj.symbol;
              markets.push(symbol);
            }
          }
          
          res.status(200).json(markets);
        } catch (err) {
          console.log(err);
        }
      });
      break;
      default:
        res.status(200).json({ error: "Action Undefined" });
        break;
  }

  //set request timeout after 20 seconds
  //setTimeout(()=> res.send(), 1000 * 20);
}
/*
const data = {};

data.often = {}; //record how many times a crypto satisfies all criterias
data.list = []; //record all cryptos that has satisfied all criterias

function init(ex, ...options) {
  if (myData.get("debug"))
    log("Checking functions exists: get24HData and addChange");
  if (!isset(ex) && !isset(ex.get24hData) && !isset(ex.addChange)) return false;

  if (!isset(data.ex)) data.ex = ex;
  if (myData.get("debug")) log("Adding criterias...");
  addCriteria(__cVolumeMin);
  addCriteria(__cPriceMin);
  addCriteria(__cPriceIncreased);

  return this;
}

function isOK() {
  let ok = true;
  //TODO: check if the script can run
  return ok;
}

function start() {
  if (myData.get("debug")) log("Starting the Doorman");
  __listen();
  setTimeout(function () {
    __callCriteria();
  }, 3 * 1000);
  let interval = setInterval(function () {
    //__listen();
    __callCriteria();
  }, 1 * 60 * 1000);
}

function addCriteria(...fnName) {
  if (!isset(data.criterias)) data.criterias = [];

  if (myData.get("debug")) log("Adding criteria " + fnName);
  if (Array.isArray(fnName)) {
    data.criterias = [...data.criterias, ...fnName];
  } else if (!empty(fnName) && typeof fnName == "function") {
    data.criterias.push(fnName);
  }

  if (myData.get("debug")) log("Deleting duplicated criterias");
  data.criterias.filter((v, k, a) => a.indexOf(v) === k);
}

function getCriterias() {
  return data.criterias;
}

function getData() {
  return data;
}

function __listen() {
  if (!isset(data.ex)) return false;

  //start to listen cryptos
  data.ex.get24hData([], (r) => {
    if (myData.get("debug")) log(r);
    //record crypto data for post manipulation
    data.ex.addChange({
      id: common.generateId(),
      code: r.symbol,
      bidPrice: getFloat(r.bestBid).toFixed(8),
      bidQty: getFloat(r.bestBidQty),
      askPrice: getFloat(r.bestAsk).toFixed(8),
      askQty: getFloat(r.bestAskQty),
      priceBuy: getFloat(r.bestBid).toFixed(8),
      volume: getFloat(r.volume),
      quoteVolume: getFloat(r.quoteVolume),
      percentDiff: 0,
      percentProfit: data.ex.config.get("percentProfit"),
      percentToWatch: data.ex.config.get("percentToWatch"),
      priceSell: getFloat(
        (r.bestBid * (data.ex.config.get("percentProfit") / 100 + 1)).toFixed(8)
      ),
      open: r.open,
      close: r.close,
      high: r.high,
      low: r.low,
      openTime: r.openTime,
      closeTime: r.closeTime,
      closeQty: r.closeQty,
      averagePrice: r.averagePrice,
      numTrades: r.numTrades,
      prevClose: r.prevClose,
    });
  });
}

async function backtesting(symbol, period, cb) {
  return await data.ex.candlesticks(symbol, period, function (error, data) {
    let ticks = data.data;

    let chart = {
      lowest: 100000000000000,
      highest: 0,
      ohlc: {},
      trends: [],
      breakers: [],
      length: Object.keys(ticks).length,
    };

    let amplitud = 0;
    let ticksCount = 1;
    let startZone = false;
    let prevTick = false;
    Object.keys(ticks)
      .reverse()
      .map((i) => {
        if (chart.lowest > ticks[i].low) {
          chart.lowest = ticks[i].low;

          if (!isset(chart.ohlc.lowest)) chart.ohlc.lowest = {};
          chart.ohlc.lowest = ticks[i];
          chart.ohlc.lowest.date = new Date(ticks[i].id * 1000);
          chart.ohlc.lowest.symbol = symbol;
        }

        if (chart.highest < ticks[i].high) {
          chart.highest = ticks[i].high;

          if (!isset(chart.ohlc.highest)) chart.ohlc.highest = {};
          chart.ohlc.highest = ticks[i];
          chart.ohlc.highest.date = new Date(ticks[i].id * 1000);
          chart.ohlc.highest.symbol = symbol;
        }

        if (i > 0) {

          ticks[i].bodyLen = bodyLen(ticks[i]).toFixed(2);
          ticks[i].wickLen = wickLen(ticks[i]).toFixed(2);
          ticks[i].tailLen = tailLen(ticks[i]).toFixed(2);
          ticks[i].nextMove = !isBullish(ticks[i]) ? "UP" : "DOWN";
          ticks[i].isEngulfed = isEngulfed(ticks[i - 1], ticks[i]);
          ticks[i].date = new Date(ticks[i].id * 1000).toLocaleString();
          ticks[i].spread = Math.abs(
            (1 - ticks[i].high / ticks[i].low) * 100
          ).toFixed(4);
          amplitud =
            isBullish(ticks[i - 1]) == isBullish(ticks[i])
              ? amplitud + ticks[i].spread * 1
              : amplitud - ticks[i].spread * 1;
          ticks[i].amplitud = Math.abs(amplitud).toFixed(4);
          ticks[i].distance = ticksCount;

          if (isBullish(ticks[i - 1]) != isBullish(ticks[i])) {
            //change direction
            if (chart.trends.length > 0) {
              let j = chart.trends.length - 1;
              let spread = Math.abs(
                (1 -
                  Math.min(chart.trends[j].open, chart.trends[j].close) /
                    Math.max(ticks[i].open, ticks[i].close).toFixed(2)) *
                  100
              ).toFixed(4);

              if (spread >= 0.7) {
                ticks[i].accumZone = [startZone, prevTick];
                ticks[i].spreadFromLastBreak = spread;
                ticksCount = 0;
                chart.breakers.push(ticks[i]);
                startZone = false;
              } else {
                //accumulation period
                if (!startZone) startZone = ticks[i];
              }
            }

            chart.trends.push(ticks[i]);
          }
        }
        ticksCount++;
        prevTick = ticks[i];
      });

    if (!error && typeof cb == "function") cb([chart, ticks]);
  });
}

if (!isset(data.trends)) data.trends = {};
function showBTCBP() {
  let symbol = "btcusdt";
  let strRepeatNumber = 116;
  const printBK = (chart, ticks, period) => {
    toprint =
      "\n**** BREAK POINTS for " +
      period +
      " ****. Actualizado: " +
      Date().toLocaleString() +
      "\n";
    toprint += "-".repeat(strRepeatNumber) + "\n";
    toprint +=
      "SYMBOL\t\tSIGNAL\t\tENTRY/OUT POINT\t\tVolume\t\t\tDistance\t\tDate\n";
    toprint += "=".repeat(strRepeatNumber) + "\n";
    let firstOne = true;
    chart.breakers
      .reverse()
      .slice(0, 4)
      .map((bp, i) => {
        /*
            {
                id: 1613082000,
                open: 47156.35,
                close: 47269.5,
                low: 47123.33,
                high: 47386.6,
                amount: 98.07470247864222,
                vol: 4639824.052836859,
                count: 4547,
                bodyLen: '113.15',
                wickLen: '117.10',
                tailLen: '33.02',
                nextMove: 'DOWN',
                isEngulfed: true,
                date: 'Thu Feb 11 2021 18:20:00 GMT-0400 (Venezuela Time)',
                spread: '0.5587',
                amplitud: '3.2198',
                distance: 17,
                accumZone: [ [Object], [Object] ],
                spreadFromLastBreak: '1.0892'
            }
            * /
        if (isset(bp)) {
          toprint += symbol + "\t\t";
          toprint += bp.nextMove == "UP" ? "BUY\t\t" : "SELL\t\t";
          toprint += `${getFloat(bp.close).toFixed(2)} \t\t${bp.vol.toFixed(
            4
          )} \t\t${bp.distance}\t\t${bp.date}\t\t`;
          toprint += "\n";

          if (!isset(data.trends[symbol + ":" + period]) && firstOne)
            data.trends["btcusdt:" + period] = bp;
          else if (
            data.trends[symbol + ":" + period].date != bp.date &&
            firstOne
          ) {
            data.trends[symbol + ":" + period] = bp;
            notify(
              "BTCUSDT Trend Breaks " + bp.nextMove,
              `Period: ${period}\nOpen: ${bp.open}\nClose: ${bp.close}\nDate: ${bp.date}`
            );
          }
          firstOne = false;
        }
      });
    toprint += "-".repeat(strRepeatNumber) + "\n";
    toprint += "**** /BREAK POINTS FOR " + period + " ****\n\n";
    log(toprint);
  };

  backtesting(symbol, "1week", (d) => {
    let chart = d[0];
    let ticks = d[1];
    printBK(chart, ticks, "1week");
  });

  backtesting(symbol, "1day", (d) => {
    let chart = d[0];
    let ticks = d[1];
    printBK(chart, ticks, "1day");
  });

  backtesting(symbol, "4hour", (d) => {
    let chart = d[0];
    let ticks = d[1];
    printBK(chart, ticks, "4hour");
  });

  backtesting(symbol, "60min", (d) => {
    let chart = d[0];
    let ticks = d[1];
    printBK(chart, ticks, "60min");
  });

  backtesting(symbol, "30min", (d) => {
    let chart = d[0];
    let ticks = d[1];
    printBK(chart, ticks, "30min");
  });

  backtesting(symbol, "15min", (d) => {
    let chart = d[0];
    let ticks = d[1];
    printBK(chart, ticks, "15min");
  });

  backtesting(symbol, "5min", (d) => {
    let chart = d[0];
    let ticks = d[1];
    printBK(chart, ticks, "5min");
  });

  backtesting(symbol, "1min", (d) => {
    let chart = d[0];
    let ticks = d[1];
    printBK(chart, ticks, "1min");
  });
}

async function __callCriteria() {
  if (!isset(data.ex)) return false;

  showBTCBP();
  return;
}

function getList() {
  return data.list.filter((v, k, a) => a.indexOf(v) === k);
}

function updateList() {
  data.list = getList();
  myData.set("doormanList", data.list);
}

function inList(code) {
  return isset(data.list[code]);
}

function deleteFromList(code) {
  data.list.splice(data.list.indexOf(code), 1);
  updateList();
}

function addToList(code) {
  data.list.push(code);
  updateList();
}

function __cVolumeMin(...args) {
  const [current, prev] = args;

  return parseInt(current.volume) >= 20 ? "PASSED" : null;
}

function __cPriceMin(...args) {
  const [current, prev] = args;
  return getFloat(current.priceBuy) >= 0.000005 ? "BUY" : null;
}

function __cPriceIncreased(...args) {
  const [current, prev] = args;
  return prev.percentChange > data.ex.config.get("percentToWatch")
    ? "BUY"
    : null;
}

/*************************************************************************************
/*************************************************************************************
/*************************************************************************************
/*************************************************************************************
/************************************************************************************* /

function bodyLen(candlestick) {
  return Math.abs(candlestick.open - candlestick.close);
}

function wickLen(candlestick) {
  return candlestick.high - Math.max(candlestick.open, candlestick.close);
}

function tailLen(candlestick) {
  return Math.min(candlestick.open, candlestick.close) - candlestick.low;
}

function isBullish(candlestick) {
  return candlestick.open < candlestick.close;
}

function isBearish(candlestick) {
  return candlestick.open > candlestick.close;
}

function isHammerLike(candlestick) {
  return (
    tailLen(candlestick) > bodyLen(candlestick) * 2 &&
    wickLen(candlestick) < bodyLen(candlestick)
  );
}

function isInvertedHammerLike(candlestick) {
  return (
    wickLen(candlestick) > bodyLen(candlestick) * 2 &&
    tailLen(candlestick) < bodyLen(candlestick)
  );
}

function isEngulfed(shortest, longest) {
  return bodyLen(shortest) < bodyLen(longest);
}

function isGap(lowest, upmost) {
  return (
    Math.max(lowest.open, lowest.close) < Math.min(upmost.open, upmost.close)
  );
}

function isGapUp(previous, current) {
  return isGap(previous, current);
}

function isGapDown(previous, current) {
  return isGap(current, previous);
}

// Dynamic array search for callback arguments.
function findPattern(dataArray, callback) {
  const upperBound = dataArray.length - callback.length + 1;
  const matches = [];

  for (let i = 0; i < upperBound; i++) {
    const args = [];

    // Read the leftmost j values at position i in array.
    // The j values are callback arguments.
    for (let j = 0; j < callback.length; j++) {
      args.push(dataArray[i + j]);
    }

    // Destructure args and find matches.
    if (callback(...args)) {
      matches.push(args[1]);
    }
  }

  return matches;
}

// Boolean pattern detection.
// @public

function isHammer(candlestick) {
  return isBullish(candlestick) && isHammerLike(candlestick);
}

function isInvertedHammer(candlestick) {
  return isBearish(candlestick) && isInvertedHammerLike(candlestick);
}

function isHangingMan(previous, current) {
  return (
    isBullish(previous) &&
    isBearish(current) &&
    isGapUp(previous, current) &&
    isHammerLike(current)
  );
}

function isShootingStar(previous, current) {
  return (
    isBullish(previous) &&
    isBearish(current) &&
    isGapUp(previous, current) &&
    isInvertedHammerLike(current)
  );
}

function isBullishEngulfing(previous, current) {
  return (
    isBearish(previous) && isBullish(current) && isEngulfed(previous, current)
  );
}

function isBearishEngulfing(previous, current) {
  return (
    isBullish(previous) && isBearish(current) && isEngulfed(previous, current)
  );
}

function isBullishHarami(previous, current) {
  return (
    isBearish(previous) && isBullish(current) && isEngulfed(current, previous)
  );
}

function isBearishHarami(previous, current) {
  return (
    isBullish(previous) && isBearish(current) && isEngulfed(current, previous)
  );
}

function isBullishKicker(previous, current) {
  return (
    isBearish(previous) && isBullish(current) && isGapUp(previous, current)
  );
}

function isBearishKicker(previous, current) {
  return (
    isBullish(previous) && isBearish(current) && isGapDown(previous, current)
  );
}

// Pattern detection in arrays.
// @public

function hammer(dataArray) {
  return findPattern(dataArray, isHammer);
}

function invertedHammer(dataArray) {
  return findPattern(dataArray, isInvertedHammer);
}

function hangingMan(dataArray) {
  return findPattern(dataArray, isShootingStar);
}

function shootingStar(dataArray) {
  return findPattern(dataArray, isShootingStar);
}

function bullishEngulfing(dataArray) {
  return findPattern(dataArray, isBullishEngulfing);
}

function bearishEngulfing(dataArray) {
  return findPattern(dataArray, isBearishEngulfing);
}

function bullishHarami(dataArray) {
  return findPattern(dataArray, isBullishHarami);
}

function bearishHarami(dataArray) {
  return findPattern(dataArray, isBearishHarami);
}

function bullishKicker(dataArray) {
  return findPattern(dataArray, isBullishKicker);
}

function bearishKicker(dataArray) {
  return findPattern(dataArray, isBearishKicker);
}*/