import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Col, Button, TabPane, TabContent } from "reactstrap";
import { MarketOverview } from "react-ts-tradingview-widgets";
import { empty } from "../../utils/common";

const PORT = process.env.PORT ?? 3000;
const HOST = process.env.BASE_URL ?? "http://localhost";
const baseurl = HOST + ":" + PORT;

const api = axios.create({
  baseURL:baseurl+"/api",
  method: "GET",
  headers:{
    "Content-Type": "application/json",
    Accept: "application/json",
    "Access-Control-Allow-Origin": "http://localhost:3000",
    "Access-Control-Allow-Credentials": "true",
  },
});

export default function TradingViewTabs(props) {
  const { copyrightStyles, symbol } = props;
  const [activeTab, setActiveTab] = useState();

  const toggleTab = (tabName) => {
    setActiveTab(tabName);
  };

  //modal controls
  const [__view, setView] = useState(false);
  const loadAll = useCallback(async () => {
    let alerts = [];
    try {
      const res = await api("/posts", {
        params: {
          where: {
            post_type: "cryptoalert",
            ref: symbol,
          },
        },
      });
      console.log(res);
      alerts = res.data;
    } catch (err) {
      console.log(err);
    }

    setView(
      <>
        <Col sm={12} className={`px-0`}>
          <Button
            onClick={() => {
              toggleTab("info");
            }}
          >
            Info
          </Button>
          <Button
            onClick={() => {
              toggleTab("alerts");
            }}
          >
            Alerts
          </Button>
          <Button
            onClick={() => {
              toggleTab("markets");
            }}
          >
            Markets
          </Button>
        </Col>
        <Col sm={12} className={`px-0 min-h-[36rem]`}>
          <TabContent activeTab={activeTab}>
            <TabPane tabId="info" className={`min-h-[36rem]`}>
              info
            </TabPane>
            <TabPane tabId="alerts" className={`min-h-[36rem]`}>
              {empty(alerts) && "No hay alertas para " + symbol}
              {!empty(alerts) &&
                alerts.map((post) => {
                  return (
                    <>
                      <div key={post.uuid} className="alert alert-info">
                        <h2>{post.ref}</h2>
                      </div>
                    </>
                  );
                })}
            </TabPane>
            <TabPane tabId="markets" className={`min-h-[36rem]`}>
              <MarketOverview
                colorTheme={"dark"}
                copyrightStyles={copyrightStyles}
                locale="en"
                width="100%"
                timezone="America/New York"
              />
            </TabPane>
          </TabContent>
        </Col>
      </>
    );
  }, [setView, copyrightStyles, symbol, activeTab]);

  useEffect(loadAll, [loadAll]);

  return <>{__view}</>;
}