import { useState, useEffect, useCallback, useContext } from "react";
import AdminContainer from "../layout/container";
import { StoreContext } from "../../../context/store";

export default function CryptoChart(props) {
  const  { symbol } = props;
  const store = useContext(StoreContext);

  //modal controls
  const [data, setData] = useState([]);
  const [dataLoaded, setLoaded] = useState(false);
  const [chart, setChart] = useState(false);

  const loadAll = useCallback( async ()=>{
    if (!dataLoaded) {
      const TradingView = (await import("react-tradingview-widget"));
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
          hideSideToolbar={true}
          details
          style={BarStyles.HEIKIN_ASHI}
          news={["headlines"]}
        />
      );
    }
    setLoaded(!!window && !!document);

  },[setLoaded, dataLoaded, setChart, symbol]);

  useEffect(loadAll, [loadAll]);

  return (
    <AdminContainer>
      <h1>Chart and Details for {`${symbol?.toUpperCase()}`}</h1>
      {chart}
    </AdminContainer>
  );
}


export async function getServerSideProps({ params }) {
  try {
    const { symbol } = params;
    let s = typeof symbol === "object" ? symbol[0] : symbol;
    return {
      props: {
        symbol:s,
      },
    };
  } catch (err) {
    console.log(err);
    return {
      props: {
        symbol:null,
      },
    };
  }
}