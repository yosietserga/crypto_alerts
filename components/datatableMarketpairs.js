import { useContext, useCallback, useEffect, useState } from "react";
import BigNumber from "bignumber.js";
import { Container, Row, Col } from "reactstrap";
import { empty, log } from "../utils/common";
import { StoreContext } from "../context/store";
import {
  initSocketStream,
  connectSocketStreams,
  disconnectSocketStreams,
  getSocket,
} from "../libs/services/binance";

const Li = (props) => (
  <Row>
    <Col sm={2}>{props.symbol}</Col>
    <Col sm={2}>{new BigNumber(props.close).toFormat(null, 1)}</Col>
    <Col
      className={
        props.priceChangePercent < 0 ? "col text-danger" : "col text-success"
      }
      sm={2}
    >
      <strong>{`${new BigNumber(props.percentChange).toFormat(2, 1)}%`}</strong>
    </Col>
    <Col sm={2}>
      {new BigNumber(props.high).toFormat(null, 1)} / 
      {new BigNumber(props.low).toFormat(null, 1)}</Col>
    <Col sm={2}>{new BigNumber(props.quoteVolume).toFormat(2, 1)}</Col>
  </Row>
);

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
        <Container className="table">
          <Row>
            <Col sm={2}>Pair</Col>
            <Col sm={2}>Last Price</Col>
            <Col sm={2}>24h Change</Col>
            <Col sm={2}>24h High/Low</Col>
            <Col sm={2}>24h Volume</Col>
          </Row>
          {rows}
        </Container>
    </>
  );
};

export default DataTable;