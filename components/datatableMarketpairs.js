import BigNumber from "bignumber.js";
import { Container, Row, Col } from "reactstrap";

const Li = (props) => (
      <Row>
            <Col sm={2}>{props.symbol}</Col>
            <Col sm={2}>{new BigNumber(props.lastPrice).toFormat(null, 1)}</Col>
            <Col
              className={
                props.priceChangePercent < 0
                  ? "col text-danger"
                  : "col text-success"
              }
              sm={2}
            >
              {`${new BigNumber(props.priceChangePercent).toFormat(2, 1)}%`}
            </Col>
            <Col sm={2}>{new BigNumber(props.highPrice).toFormat(null, 1)}</Col>
            <Col sm={2}>{new BigNumber(props.lowPrice).toFormat(null, 1)}</Col>
            <Col sm={2}>
              {new BigNumber(props.quoteVolume).toFormat(null, 1)}
            </Col>
      </Row>
);

const DataTable = (props) => {
  let rows = [];
  let tickerArray = Object.values(props.ticker).filter(item => item.symbol.endsWith("USDT"));
  let numRows = tickerArray.length;

  for (var i = 0; i < numRows; i++) {
    //if (props.filter.includes(tickerArray[i].symbol)) {
      rows.push(<Li {...tickerArray[i]} key={tickerArray[i].symbol} />);
    //}
  }
  return (
    <>
      <Container>
          <Row>
            <Col sm={2}>Pair</Col>
            <Col sm={2}>Last Price</Col>
            <Col sm={2}>24h Change</Col>
            <Col sm={2}>24h High</Col>
            <Col sm={2}>24h Low</Col>
            <Col sm={2}>24h Volume</Col>
          </Row>
        {rows}
      </Container>
    </>
  );
};

export default DataTable;