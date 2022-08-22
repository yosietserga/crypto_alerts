const Binance = require("node-binance-api");
const tulind = require("tulind");
const managerWorker = require("./workers/manager");
const { isset, empty, version_compare, log, unique, rtrim } = require("./utils/helpers");

const BinanceServer = async (wss, prisma) => {
  const binance = new Binance();

  const getAlerts = async () => {
    return await prisma.post.findMany({
      where: {
        post_type: "cryptoalert",
        status: 1,
      },
    });
  };

  const getCriterias = async (alert) => {
    const records = await prisma.property.findMany({
      where: {
        objectType: "cryptoalert",
        objectId: alert.id,
        group: { startsWith: "criteria" },
      },
    });
    return records.map((item) => {
      return { ...JSON.parse(item.value), ...{ id: item.id, uuid: item.uuid } };
    });
  };

  const getSymbol = async (alert) => {
    const records = await prisma.property.findMany({
      where: {
        objectType: "cryptoalert",
        objectId: alert.id,
        group: "data",
        key: "symbol",
      },
    });

    return JSON.parse(records[0].value);
  };

  const criterias = {};
  const memo = [];

  const signals = {};
  let __interval = setInterval(async () => {
    const alerts = await getAlerts();
    for (let i in alerts) {
      let alert = alerts[i];

      //get criteria and symbol from DB
      alert.symbol = await getSymbol(alert);
      alert.criterias = await getCriterias(alert);
      //get criteria and symbol from DB

      //sort and fill criterias
      alert.criterias.map((c) => {
        let memoKey = c.uuid; //Object.entries(c).join(".");
        if (memo.indexOf(memoKey) === -1) {
          memo.push(memoKey);

          const __index = c.symbol + ":" + c.tempo;
          if (!isset(criterias[alert.id])) criterias[alert.id] = {};
          if (!isset(criterias[alert.id][__index]))
            criterias[alert.id][__index] = {};
          if (!isset(signals[alert.id])) signals[alert.id] = {};

          if (c.type === "indicator" && isset(tulind.indicators[c.indicator])) {
            if (!isset(criterias[alert.id][__index][c.indicator])) {
              signals[alert.id][__index + ":" + c.indicator] = [];
              criterias[alert.id][__index][c.indicator] = {
                inputs: [],
                options: [],
                outputs: [],
              };
            }

            if (c.group === "inputs") {
              criterias[alert.id][__index][c.indicator]["inputs"].push({
                option: c.option,
                trigger: c.trigger,
              });
            }

            if (c.group === "options") {
              criterias[alert.id][__index][c.indicator]["options"].push({
                option: c.option,
                trigger: c.trigger,
              });
            }

            if (c.group === "outputs") {
              criterias[alert.id][__index][c.indicator]["outputs"].push({
                comparator: c.comparator,
                option: c.option,
                trigger: c.trigger,
              });
            }
          } else {
            if (!isset(criterias[alert.id][__index]["price"])) {
              criterias[alert.id][__index]["price"] = [];
              signals[alert.id][__index + ":price"] = [];
            }
            criterias[alert.id][__index]["price"].push({
              comparator: c.comparator,
              trigger: c.trigger,
            });
          }
        }
      });

      alerts[i] = alert;
    }

    myData.set("alerts", alerts);
  }, 1000 * 1);

  function criteriasFn(...args) {
    const [chart, ticks, tempo] = args;

    let __high = [];
    let __close = [];
    let __open = [];
    let __low = [];
    let __volume = [];

    for (let tick of chart.ticks) {
      __high.push(tick.high);
      __low.push(tick.low);
      __open.push(tick.open);
      __close.push(tick.close);
      __volume.push(parseFloat(tick.volume).toFixed(2));
    }

    const __index = chart.symbol + ":" + chart.tempo;
    if (myData.get("debug")) console.log("checking criterias for ", __index);

    for (let alertId in criterias) {
      if (isset(criterias[alertId][__index])) {
        if (myData.get("debug"))
          console.log("got this criterias ", criterias[alertId][__index]);
        for (let indicator in criterias[alertId][__index]) {
          if (myData.get("debug"))
            console.log("processing criteria for ", indicator);
          if (indicator !== "price") {
            const c = criterias[alertId][__index][indicator];

            //sort and prepare data
            let inputs = [];
            let options = [];
            let outputs = [];
            const indicatorSetup = tulind.indicators[indicator];
            if (!indicatorSetup) return false;
            if (myData.get("debug"))
              console.log("applying indicator", indicatorSetup);

            const { input_names, option_names, output_names } = indicatorSetup;
            inputs = input_names.map((name) => {
              if (name === "real") {
                //TODO: get ohlc option name from db
                return __high;
              } else if (name === "open") {
                return __open;
              } else if (name === "high") {
                return __high;
              } else if (name === "low") {
                return __low;
              } else if (name === "close") {
                return __close;
              } else if (name === "volume") {
                return __volume;
              }
            });

            if (myData.get("debug")) console.log("[c.options]", c.options);

            for (let name of option_names) {
              for (let j in c.options) {
                console.log([
                  c.options[j].option,
                  `${name}`.replace(/[^A-Za-z\d\s]/gi, ""),
                ]);

                if (
                  c.options[j].option ===
                  `${name}`.replace(/[^A-Za-z\d\s]/gi, "")
                ) {
                  options.push(c.options[j].trigger);
                }
              }
            }

            if (myData.get("debug")) console.log("[inputs,options]", options);
            tulind.indicators[indicator].indicator(
              inputs,
              options,
              function (err, results) {
                const r = {};
                if (!err) {
                  results.map((v, k) => {
                    r[output_names[k].replace(/[^A-Za-z\d\s]/gi, "")] =
                      v[0];
                  });

                  let passed = c.outputs.map((opt, k) => {
                    //TODO: transform dynamic values like ohlc and percents referencials
                    let value;
                    if (!isNaN(parseFloat(opt.trigger))) {
                      value = opt.trigger;
                    } else if (opt.trigger.toLowerCase() === "open") {
                      value = __open[0];
                    } else if (opt.trigger.toLowerCase() === "high") {
                      value = __high[0];
                    } else if (opt.trigger.toLowerCase() === "low") {
                      value = __low[0];
                    } else if (opt.trigger.toLowerCase() === "close") {
                      value = __close[0];
                    } else if (opt.trigger.toLowerCase() === "volume") {
                      value = __volume[0];
                    }

                    let result = version_compare(
                      r[opt.option],
                      value,
                      opt.comparator
                    );

                    if (!isset(signals[alertId][__index + ":" + indicator]))
                      signals[alertId][__index + ":" + indicator] = [];

                    signals[alertId][__index + ":" + indicator].push(
                      `${parseFloat(r[opt.option]).toFixed(2)} is ${opt.comparator} ${
                        opt.comparator === "equal" ? "to" : "than"
                      } ${rtrim(value, "0")}`
                    );

                    signals[alertId][__index + ":" + indicator] =
                      signals[alertId][__index + ":" + indicator].filter(
                        unique
                      );

                    return result;
                  });

                  const testsResult = passed.every(v => v);

                  if (testsResult) {
                    let text = `*** CRYPTO ALERT ***

ID: ${alertId}
SYMBOL: ${chart.symbol}
PRICE: ${close[0]}
TEMPO: ${chart.tempo}
SEE: ${global.baseURL}/panel/alerts/update/${alertId}

`;
                    /*
                    for (let j in signals[alertId]) {
                text += `
${j.replace(":", " ")}:
  ${signals[alertId][j].join(", ")}
`;
                    }
                    */

                    //broadcast event into server
                    global?.notify({
                      body: { text },
                      id: "alertid_" + alertId,
                    });

                    //send to client 
                    wss?.broadcast?.emit(
                      "cryptoalert",
                      JSON.stringify({
                        id: alertId,
                        signals: signals[alertId],
                      })
                    );
                  }
                  return testsResult;
                } else {
                  if (myData.get("debug")) console.log("ERROR:", err);
                }
              }
            );
          } else {
            //price

            const pricesComparison = criterias[alertId][__index][indicator];

            let passed = pricesComparison.map((opt, k) => {
              let lastPrice = __close[0];
              let result = version_compare(lastPrice, opt.trigger, opt.comparator);
              if (!isset(signals[alertId][__index + ":price"])) signals[alertId][__index + ":price"] = [];
              signals[alertId][__index + ":price"].push(
                `${rtrim(lastPrice,"0")} is ${opt.comparator} ${opt.comparator==="equal"?"to":"than"} ${opt.trigger}`
              );
              signals[alertId][__index + ":price"] = signals[alertId][__index + ":price"].filter(unique);
              
              return result;
            });

            const testsResult = passed.reduce((a, b) => {
              return a && b;
            });

            if (testsResult) {
              let text = `*** CRYPTO ALERT ***

ID: ${alertId}
SYMBOL: ${chart.symbol}
PRICE: ${close[0]}
TEMPO: ${chart.tempo}
SEE: ${global.baseURL}/panel/alerts/update/${alertId}

`;
              /*
              for (let j in signals[alertId]) {
                text += `
${j.replace(":", " ")}:
  ${signals[alertId][j].join(", ")}
`;

              }
              */

              //broadcast event into server
              global?.notify({
                body: { text },
                id: "alertid_" + alertId,
              });

              wss?.broadcast?.emit(
                "cryptoalert",
                JSON.stringify({
                  id: alertId,
                  signals: signals[alertId],
                })
              );
            }
          }
        }
      }
    }
  }

  myData.set("debug", false);
  myData.set("doorman:criterias", criteriasFn);
  myData.set("config:percentProfit", 0.4);
  myData.set("config:occurrences", 10);
  myData.set("config:confirmations", 3);
  managerWorker.start(binance);
  console.log("running...");
};

module.exports = BinanceServer;