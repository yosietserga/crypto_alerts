const fs = require("fs");
const { createServer } = require("http");
const next = require("next");
const Binance = require("node-binance-api");
const tulind = require("tulind");
const { PrismaClient } = require("@prisma/client");
const makeWASocket = require("@adiwajshing/baileys");
const managerWorker = require("./workers/manager");
const { isset, empty, version_compare, log } = require("./utils/helpers");


const runnit = async () => {
  const prisma = new PrismaClient();
  const binance = new Binance();
  //const { state, saveCreds } = await makeWASocket.useMultiFileAuthState("borrar");
  //const sock = makeWASocket.default({ state });

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
    return records.map(item => {
      return JSON.parse(item.value);
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

  let __interval = setInterval(async ()=>{
    const alerts = await getAlerts();
    for(let i in alerts) {
      let alert = alerts[i];

      //get criteria and symbol from DB
      alert.symbol = await getSymbol(alert);
      alert.criterias = await getCriterias(alert);
      //get criteria and symbol from DB

      //sort and fill criterias
      alert.criterias.map((c) => {
        let memoKey = Object.entries(c).join(".");
        if (memo.indexOf(memoKey) === -1) {
          memo.push(memoKey);

          const __index = c.symbol + ":" + c.tempo;
          if (!isset(criterias[__index])) criterias[__index] = {};
          if (
            c.type === "indicator" &&
            isset(tulind.indicators[c.indicator])
          ) {
            if (!isset(criterias[__index][c.indicator])) {
              criterias[__index][c.indicator] = {
                inputs: [],
                options: [],
                outputs: [],
              };
            }

            if (c.group === "inputs") {
              criterias[__index][c.indicator]["inputs"].push({
                option: c.option,
                trigger: c.trigger,
              });
            }

            if (c.group === "options") {
              criterias[__index][c.indicator]["options"].push({
                option: c.option,
                trigger: c.trigger,
              });
            }

            if (c.group === "outputs") {
              criterias[__index][c.indicator]["outputs"].push({
                comparator: c.comparator,
                option: c.option,
                trigger: c.trigger,
              });
            }
          } else {
            if (!isset(criterias[__index]["price"])) {
              criterias[__index]["price"] = [];
            }
            criterias[__index]["price"].push({
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
      if (myData.get("debug")) console.log("got this criterias ", criterias[__index]);


    for (let indicator in criterias[__index]) {
      const c = criterias[__index][indicator];

      //sort and prepare data
      let inputs = [];
      let options = [];
      let outputs = [];
      const indicatorSetup = tulind.indicators[indicator];
      if (!indicatorSetup) return false;
      if (myData.get("debug")) console.log("applying indicator", indicatorSetup);

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
            `${name}`.replace(/[^A-Za-z\d\s]/gi, "")
          ]);

          if (c.options[j].option === `${name}`.replace(/[^A-Za-z\d\s]/gi, "")) {
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
              r[output_names[k].replace(/[^A-Za-z\d\s]/gi, "")] = v[v.length - 1];
            });

            let passed = c.outputs.map((opt, k) => {
              //TODO: transform dynamic values like ohlc and percents referencials 
              return version_compare(
                r[opt.option],
                opt.trigger,
                opt.comparator
              );
            });
            console.log("passed", passed.reduce((a, b) => {
              return a && b;
            }));
            return passed.reduce((a, b) => {
              return a && b;
            });
          } else {
            if (myData.get("debug")) console.log("ERROR:", err);
          }
        }
      );
    }
  }

  myData.set("debug", true);
  myData.set("doorman:criterias", criteriasFn);
  myData.set("config:percentProfit", 0.4);
  myData.set("config:occurrences", 10);
  myData.set("config:confirmations", 3);
  managerWorker.start(binance);
  console.log("running...");
};

runnit();


const hostname = process.env.HOSTNAME ?? "localhost";
const port = process.env.PORT ?? 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();
const baseUrl = process.env.BASE_URL ?? "http://localhost";

const getParamsFromURI = (uri) => {
  const url = new URL(uri, baseUrl);
  return url.searchParams;
};

app.prepare().then(() => {
  createServer((req, res) => {
    let url = req.url;
    const query = getParamsFromURI(url);

    if (url.includes("_next/image") && !!query?.url) {
      url = query?.url
    }
    
    if (url.includes("uploads/")) {
      const __path = url.includes("public/") ? url : "/public/"+url;
      fs.readFile(__dirname + __path, function (err, data) {
        if (err) {
          res.writeHead(404);
          res.end(JSON.stringify(err));
          return;
        }
        res.writeHead(200);
        res.end(data);
      });
    } else {
      handle(req, res);
    }
  }).listen(port, (err) => {
    if (err) {
      console.log(err);
      throw err;
    }
    console.log(`> Ready on http://localhost:${port}`);
  });
});