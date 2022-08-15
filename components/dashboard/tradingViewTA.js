import { useState, useEffect, useCallback } from "react";
import { TechnicalAnalysis } from "react-ts-tradingview-widgets";

export default function TradingViewTicker(props) {
  const { copyrightStyles, symbol } = props;

  //modal controls
  const [__view, setView] = useState(false);
  const loadAll = useCallback(async () => {
    setView(
      <TechnicalAnalysis
        colorTheme={"dark"}
        width="100%"
        copyrightStyles={copyrightStyles}
        symbol={`Binance:${symbol}`}
      />
    );
  }, [setView, copyrightStyles, symbol]);

  useEffect(loadAll, [loadAll]);

  return <>{__view}</>;
}