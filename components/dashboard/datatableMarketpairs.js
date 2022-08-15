import { useContext, useCallback, useEffect, useState } from "react";
import BigNumber from "bignumber.js";
import { Container, Row, Col } from "reactstrap";
import { empty, log } from "../../utils/common";
import { Scrollbars } from "react-custom-scrollbars";
import { StoreContext } from "../../context/store";
import {
  initSocketStream,
  connectSocketStreams,
  disconnectSocketStreams,
  getSocket,
} from "../../libs/services/binance";
function nFormatter(num, digits) {
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "m" },
    { value: 1e9, symbol: "b" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" },
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var item = lookup
    .slice()
    .reverse()
    .find(function (item) {
      return num >= item.value;
    });
  return item
    ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol
    : "0";
}

const Li = (props) => {
  const store = useContext(StoreContext);

  const setSymbolSelected = (symbol) => {
    store.emit("symbol:selected", symbol);
  };
  
  return (
    <Row
      datasymbol={props.symbol}
      datachange={parseFloat(props.percentChange).toFixed(2)}
      datavolume={parseFloat(props.quoteVolume).toFixed(2)}
      onClick={() => setSymbolSelected(props.symbol)}
      className={`listing_row ${
        props.percentChange < 0 ? "red" : "green"
      }`}
    >
      <Col sm={4}>
        {props.symbol}

        <p>
          <small>{nFormatter(props.quoteVolume, 2)}</small>
        </p>
      </Col>
      <Col sm={4}>{new BigNumber(props.close).toFormat(null, 1)}</Col>
      <Col sm={4}>
        <p
          className={
            props.percentChange < 0 ? "col text-danger" : "col text-success"
          }
        >{`${new BigNumber(props.percentChange).toFormat(2, 1)}%`}</p>
      </Col>
    </Row>
  );};

const DataTable = () => {
  const [rows, setRows] = useState([]);
  const store = useContext(StoreContext);
  
  initSocketStream(store);

  useEffect(() => {
    connectSocketStreams(["!ticker@arr"]);

    store.on("UPDATE_MARKET_PAIRS", (data) => {
      setRows(
        Object.values(data)
          .filter((item) => item?.symbol?.endsWith("USDT"))
          .map((i) => {
            return <Li {...i} key={i?.symbol} />;
          })
      );
    });
  }, [store, setRows]);
  
  return (
    <>
      <Row className="listing_head">
        <Col sm={4}>Symbol</Col>
        <Col sm={4}>
          <small>Last Price</small>
        </Col>
        <Col sm={4}>
          <small>Change %</small>
        </Col>
      </Row>
          <Scrollbars className={`h-[36rem] min-h-[36rem]`}>

      {rows}
      </Scrollbars>
    </>
  );
};

export default DataTable;