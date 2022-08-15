import { useState, useEffect, useCallback } from "react";
import { SymbolInfo } from "react-ts-tradingview-widgets";

export default function TradingViewSymbolInfo(props) {
  const { copyrightStyles, symbol } = props;

  //modal controls
  const [__view, setView] = useState(false);
  const loadAll = useCallback(async () => {
    setView(
      <SymbolInfo
        copyrightStyles={copyrightStyles}
        colorTheme={"dark"}
        interval="D"
        locale="en"
        timezone="America/New York"
        autosize={true}
        symbol={`Binance:${symbol}`}
      />
    );
  }, [setView, copyrightStyles, symbol]);

  useEffect(loadAll, [loadAll]);

  return <>{__view}</>;
}