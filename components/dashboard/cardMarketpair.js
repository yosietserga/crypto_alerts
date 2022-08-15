import BigNumber from "bignumber.js";
import React from "react";
import { Sparklines, SparklinesLine, SparklinesSpots } from "react-sparklines";
import {
  Container,
  Row,
  Col,
  Card,
  CardTitle,
  CardSubtitle,
  CardBody,
  CardText,
} from "reactstrap";
import { log, ucfirst, empty, isset } from "../../utils/common";
import moment from  "moment";

let memo = [];
let i = setInterval(() => {
  memo = [];
}, 1000 * 30);

let __data = {};

const CryptoCard = (props) => {
  const { symbol, timeframe, indicators } = props;
  const __timeframes = Array.isArray(timeframe) ? timeframe : timeframe.split(",");
  const __indicators = Array.isArray(indicators) ? indicators : indicators.split(",");

  const [lastPrice, setLastPrice] = React.useState(0);
  const [indicatorsArray, setIndicatorsArray] = React.useState({});
  const [sampleData, setSampleData] = React.useState([]);

  const params = "action=indicators&symbol=" + symbol;

  const loadData = React.useCallback(() => {
    __timeframes.map((t) => {
      let p = params +"&" + "timeframe=" + t;

      __indicators.map((indicator) => {
        if (!memo.includes(indicator + t)) {
          memo.push(indicator + t);
          let _params = p +"&" + "indicator=" + indicator;
          fetch("/api/binance?" + _params)
            .then((resp) => {
              return resp.json();
            })
            .then((resp) => {
              setLastPrice(resp.ticks[symbol.toUpperCase()]?.data.close.pop());
              if (t==="4h") setSampleData(resp.ticks[symbol.toUpperCase()]?.data.close);
              let indi = resp.ticks[symbol.toUpperCase()]?.indicators;
              if (!empty(indi)) {
                __data = { ...__data, ...{ [t]: indi } };
              }
            });
        }
      });
    });
  });

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  let arrayOfIndicators = [];
  for (let t of Object.keys(__data)) {
    let indi = __data[t];

    let time = t;
    for (let i in indi) {
      let values = indi[i];
      arrayOfIndicators.push(
        <div key={symbol + t + i}>
          <strong>
            {ucfirst(i)} {t}:{" "}
          </strong>
          {values
            .map((n) => {
              return parseFloat(n).toFix(2);
            })
            .join(" | ")}
        </div>
      );
    }
  }
  
  return (
    <>
      <Card>
        <CardBody>
          <Col sm={12}>
            <h1>{symbol.toUpperCase()}</h1>
            <h2>{parseFloat(lastPrice).toFix(2)}</h2>
          </Col>

          <Col sm={12}>
            {!empty(__data) && (
              <Sparklines data={sampleData} height={40} limit={500}>
                <SparklinesLine
                  style={{
                    stroke: "#8ed53f",
                    strokeWidth: "1",
                    fill: "none",
                  }}
                />
                <SparklinesSpots />
              </Sparklines>
            )}

            {!empty(__data) && (
              <p>
                <small>
                  last update {moment().startOf("minute").fromNow()}
                </small>
              </p>
            )}
          </Col>
          <Col sm={12}>
            <p>{!empty(arrayOfIndicators) && arrayOfIndicators}</p>
          </Col>
        </CardBody>
      </Card>
    </>
  );
};

export default CryptoCard;