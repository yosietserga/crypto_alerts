import { useState, useEffect, useCallback } from "react";
import { TickerTape } from "react-ts-tradingview-widgets";

export default function TradingViewTicker(props) {
  const { copyrightStyles } = props;

  //modal controls
  const [__view, setView] = useState(false);
  const loadAll = useCallback(async () => {
    setView(
      <TickerTape
        colorTheme={"dark"}
        copyrightStyles={copyrightStyles}
        locale="en"
        timezone="America/New York"
        autosize={true}
      />
    );
  }, [setView, copyrightStyles]);

  useEffect(loadAll, [loadAll]);

  return <>{__view}</>;
}