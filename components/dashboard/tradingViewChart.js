import { useState, useEffect, useCallback, useContext } from "react";
import { StoreContext } from "../../context/store";
import { Container, Row, Col } from "reactstrap";

export default function TradingViewChart(props) {
  const { symbol } = props;
  const store = useContext(StoreContext);

  //modal controls
  const [dataLoaded, setLoaded] = useState(false);
  const [chart, setChart] = useState(false);
  const loadAll = useCallback(async () => {
      const TradingView = await import("react-tradingview-widget");
      const TradingViewWidget = TradingView.default;
      const { Themes, BarStyles } = TradingView;
      setChart(
        <TradingViewWidget
          symbol={`Binance:${symbol?.toUpperCase()}`}
          theme={Themes.DARK}
          interval="D"
          locale="en"
          timezone="America/New York"
          allow_symbol_change={false}
          autosize={true}
          hideSideToolbar={true}
          details={false}
          style={BarStyles.HEIKIN_ASHI}
          news={["headlines"]}
        />
      );
    setLoaded(!!window && !!document);
  }, [setLoaded, dataLoaded, setChart, symbol]);

  useEffect(loadAll, [loadAll]);

  return (
    <>
          {chart}
    </>
  );
}