import BigNumber from "bignumber.js";
import React from "react";
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
import { log, ucfirst, empty, isset } from "../utils/common";
import moment from  "moment";

let memo = [];
let i = setInterval(() => {
  memo = [];
}, 1000 * 30);

const CryptoCard = (props) => {
  const { symbol, timeframe, indicators } = props;
  const __timeframes = Array.isArray(timeframe) ? timeframe : timeframe.split(",");
  const __indicators = Array.isArray(indicators) ? indicators : indicators.split(",");

  const [lastPrice, setLastPrice] = React.useState(0);
  const [indicatorsArray, setIndicatorsArray] = React.useState({});

  const params = "action=indicators&symbol=" + symbol;

  const loadData = () => {
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
              let indi = resp.ticks[symbol.toUpperCase()]?.indicators;
              if (!empty(indi)) {
                setIndicatorsArray({ ...indicatorsArray, ...{ [t]: indi } });
              }
            });
        }
      });
    });
  }

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  console.log(indicatorsArray);

  let arrayOfIndicators = [];
  for (let t of Object.keys(indicatorsArray)) {
    let indi = indicatorsArray[t];

    let time = t;
    for (let i in indi) {
      let values = indi[i];
      console.log(values);
      arrayOfIndicators.push((
        <div key={symbol+t+i}>
          <strong>{ucfirst(i)} {t}: </strong>
          {values.map(n => { return parseFloat(n).toFix(2) }).join(" | ")}
        </div>
      ));
    }
  }
  
  return (
    <>
      <Col sm={4}>
        <Card>
          <CardBody>
            <CardTitle tag="h5">{symbol.toUpperCase()}</CardTitle>
            <div>
              <h2>{parseFloat(lastPrice).toFix(2)}</h2>
              {!empty(arrayOfIndicators) && arrayOfIndicators}

              {!empty(indicatorsArray) && (
                <p>
                  <small>
                    last update {moment().startOf("minute").fromNow()}
                  </small>
                </p>
              )}
            </div>
          </CardBody>
        </Card>
      </Col>
    </>
  );
};

export default CryptoCard;