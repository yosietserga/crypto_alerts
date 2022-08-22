const common = require("../utils/helpers");

const { log, isset, empty, notify } = common;
const data = {};

data.often = {}; //record how many times a crypto satisfies all criterias
data.list = []; //record all cryptos that has satisfied all criterias

function init(ex, ...options) {
  if (!isset(data.ex)) data.ex = ex;
  if (myData.get("debug")) log("Adding criterias...");

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
  }, 1000 * 10 * 1);
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
}

function getTickData(tick) {
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
  ] = tick;

  return {
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
  };
}

async function backtesting(symbol, period, cb) {
  data.ex.candlesticks(
    symbol?.toUpperCase(),
    period,
    function (error, ticks, symbol) {
      let chart = {
        lowest: 100000000000000,
        highest: 0,
        ohlc: {},
        trends: [],
        breakers: [],
        ticks: [],
        length: Object.keys(ticks).length,
      };

      let amplitud = 0;
      let ticksCount = 1;
      let startZone = false;
      let prevTick = false;
      Object.keys(ticks)
        .reverse()
        .map((i) => {
          const currentTick = getTickData(ticks[i]);
          if (chart.lowest > currentTick.low) {
            chart.lowest = currentTick.low;

            if (!isset(chart.ohlc.lowest)) chart.ohlc.lowest = {};
            chart.ohlc.lowest = currentTick;
            chart.ohlc.lowest.date = new Date(currentTick.time);
            chart.ohlc.lowest.symbol = symbol;
          }

          if (chart.highest < currentTick.high) {
            chart.highest = currentTick.high;

            if (!isset(chart.ohlc.highest)) chart.ohlc.highest = {};
            chart.ohlc.highest = currentTick;
            chart.ohlc.highest.date = new Date(currentTick.time);
            chart.ohlc.highest.symbol = symbol;
          }

          if (i > 0) {
            /*
                trend changes 
                - prev close == current open 
                - spread from prev trend breaker to this is greater than 0.7%
                */

            chart.symbol = symbol?.toUpperCase();
            chart.tempo = period;
            currentTick.bodyLen = bodyLen(currentTick)?.toFixed(2);
            currentTick.wickLen = wickLen(currentTick)?.toFixed(2);
            currentTick.tailLen = tailLen(currentTick)?.toFixed(2);
            currentTick.nextMove = !isBullish(currentTick) ? "UP" : "DOWN";
            currentTick.isEngulfed = isEngulfed(prevTick, currentTick);
            currentTick.date = new Date(currentTick.time).toLocaleString();
            currentTick.spread = Math.abs(
              (1 - currentTick.high / currentTick.low) * 100
            )?.toFixed(4);
            amplitud =
              isBullish(prevTick) == isBullish(currentTick)
                ? amplitud + currentTick.spread * 1
                : amplitud - currentTick.spread * 1;
            currentTick.amplitud = Math.abs(amplitud)?.toFixed(4);
            currentTick.distance = ticksCount;

            if (isBullish(prevTick) != isBullish(currentTick)) {
              //change direction
              if (chart.trends.length > 0) {
                let j = chart.trends.length - 1;
                let spread = Math.abs(
                  (1 -
                    Math.min(chart.trends[j].open, chart.trends[j].close) /
                      Math.max(currentTick.open, currentTick.close)?.toFixed(
                        2
                      )) *
                    100
                )?.toFixed(4);

                if (spread >= 0.7) {
                  currentTick.accumZone = [startZone, prevTick];
                  currentTick.spreadFromLastBreak = spread;
                  ticksCount = 0;
                  chart.breakers.push(currentTick);
                  startZone = false;
                } else {
                  //accumulation period
                  if (!startZone) startZone = currentTick;
                }
                chart.ticks.push(currentTick);

              }

            }
              chart.trends.push(currentTick);

          }
          ticksCount++;
          prevTick = currentTick;
        });

      if (!error && typeof cb == "function") cb([chart, ticks]);
    }
  );
}

if (!isset(data.trends)) data.trends = {};

function showBTCBP() {
  let symbol = "btcusdt";
  let strRepeatNumber = 50;
  const printBK = (chart, ticks, period) => {
    toprint = `BREAK POINTS FOR ${period}
${"-".repeat(strRepeatNumber)}
${Date().toLocaleString()}
${"-".repeat(strRepeatNumber)}
`;
    let firstOne = true;
    chart.breakers
      //.reverse()
      .slice(0, 2)
      .map((bp, i) => {
        /*
            {
                
                time: 1660181760000,
                open: '24409.23000000',
                high: '24442.68000000',
                low: '24406.75000000',
                close: '24420.78000000',
                volume: '228.54476000',
                closeTime: 1660181819999,
                assetVolume: '5582790.18492640',
                trades: 7753,
                buyBaseVolume: '115.67078000',
                buyAssetVolume: '2825533.90577510',
                ignored: '0',
                bodyLen: '11.55',
                wickLen: '21.90',
                tailLen: '2.48',
                nextMove: 'DOWN',
                isEngulfed: true,
                date: '1/24/54579, 12:00:00 PM',
                spread: '0.1472',
                amplitud: '3.3602',
                distance: 466
            }
            */
        if (isset(bp)) {
          toprint += `
Symbol: ${symbol} 
Operation: ${bp.nextMove == "UP" ? "BUY" : "SELL"} 
Price: ${parseFloat(bp.close)?.toFixed(2)} 
Tempo: ${period}
When: ${bp.date}
Amplitude: ${parseFloat(bp.amplitud)?.toFixed(2)}%
Spread: ${parseFloat(bp.spread)?.toFixed(2)}%
Distance: ${bp.distance}
Trades: ${bp.trades}
Volume: ${parseFloat(bp.volume)?.toFixed(2)}
Engulfed: ${isEngulfed ? "Yes" : "No"}
          
        `;
          

          if (!isset(data.trends[symbol + ":" + period]) && firstOne)
            data.trends[symbol + ":" + period] = bp;
          else if (
            data.trends[symbol + ":" + period].date != bp.date &&
            firstOne
          ) {
            data.trends[symbol + ":" + period] = bp;

            const text = `*BTCUSDT Trend Breakout ${bp.nextMove}*
Period: ${period}
Open: ${bp.open}
Close: ${bp.close}
Date: ${bp.date}`;
            //broadcast event into server
            global?.notify({
              body: { text },
              id: symbol + ":" + period,
            });
          }
          firstOne = false;
        }
      });
    toprint += `
${"-".repeat(strRepeatNumber)}`;
    //log(toprint);
      /*
      global?.notify({
        body: { text: toprint },
        id: symbol + ":" + period,
      });
      */
  };

    const criterias = getCriterias();

  backtesting(symbol, "1w", (d) => {
    let chart = d[0];
    let ticks = d[1];
    printBK(chart, ticks, "1w");
    
    for (let i in criterias) {
      if (myData.get("debug")) log("Applying criteria " + criterias[i].name);
      if (typeof criterias[i] == "function" && !isNaN(i)) {
        criterias[i](...[chart, ticks, "1w"]);
      }
    }
  });

  backtesting(symbol, "1d", (d) => {
    let chart = d[0];
    let ticks = d[1];
    printBK(chart, ticks, "1d");
    for (let i in criterias) {
      if (myData.get("debug")) log("Applying criteria " + criterias[i].name);
      if (typeof criterias[i] == "function" && !isNaN(i)) {
        criterias[i](...[chart, ticks, "1d"]);
      }
    }
  });

  backtesting(symbol, "4h", (d) => {
    let chart = d[0];
    let ticks = d[1];
    printBK(chart, ticks, "4h");
    for (let i in criterias) {
      if (myData.get("debug")) log("Applying criteria " + criterias[i].name);
      if (typeof criterias[i] == "function" && !isNaN(i)) {
        criterias[i](...[chart, ticks, "4h"]);
      }
    }
  });

  backtesting(symbol, "1h", (d) => {
    let chart = d[0];
    let ticks = d[1];
    printBK(chart, ticks, "1h");
    for (let i in criterias) {
      if (myData.get("debug")) log("Applying criteria " + criterias[i].name);
      if (typeof criterias[i] == "function" && !isNaN(i)) {
        criterias[i](...[chart, ticks, "1h"]);
      }
    }
  });

  backtesting(symbol, "30m", (d) => {
    let chart = d[0];
    let ticks = d[1];
    printBK(chart, ticks, "30m");
    for (let i in criterias) {
      if (myData.get("debug")) log("Applying criteria " + criterias[i].name);
      if (typeof criterias[i] == "function" && !isNaN(i)) {
        criterias[i](...[chart, ticks, "30m"]);
      }
    }
  });

  backtesting(symbol, "15m", (d) => {
    let chart = d[0];
    let ticks = d[1];
    printBK(chart, ticks, "15m");
    for (let i in criterias) {
      if (myData.get("debug")) log("Applying criteria " + criterias[i].name);
      if (typeof criterias[i] == "function" && !isNaN(i)) {
        criterias[i](...[chart, ticks, "15m"]);
      }
    }
  });

  backtesting(symbol, "5m", (d) => {
    let chart = d[0];
    let ticks = d[1];
    printBK(chart, ticks, "5m");
    for (let i in criterias) {
      if (myData.get("debug")) log("Applying criteria " + criterias[i].name);
      if (typeof criterias[i] == "function" && !isNaN(i)) {
        criterias[i](...[chart, ticks, "5m"]);
      }
    }
  });

  backtesting(symbol, "1m", (d) => {
    let chart = d[0];
    let ticks = d[1];
    printBK(chart, ticks, "1m");
    for (let i in criterias) {
      if (myData.get("debug")) log("Applying criteria " + criterias[i].name);
      if (typeof criterias[i] == "function" && !isNaN(i)) {
        criterias[i](...[chart, ticks, "1m"]);
      }
    }
  });
}

async function __callCriteria() {
    if (!isset(data.ex)) return false;

    showBTCBP();


  return;
}

function getDoorman() {
  return this;
}

module.exports = {
  init,
  start,
  isOK,
  getDoorman,
  addCriteria,
  getCriterias,
  getData,
};

/*************************************************************************************
/*************************************************************************************
/*************************************************************************************
/*************************************************************************************
/*************************************************************************************/

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
}
