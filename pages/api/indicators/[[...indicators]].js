import {
  log,
  empty,
} from "../../../utils/common";
import tulind from "tulind";

export default async function handler(req, res) {
  const { query } = req;
  log( query );

  if (empty(query)) {
    res.status(200).json(tulind.indicators);
    res.end();
  } else {
    const results = {};
    let done = false;
    let sent = false;

    let __i = setInterval(()=>{        
      query["indicators"].map((item) => {
        results[item] =
          tulind.indicators[item] ?? `${item} indicator does not exists`;
      });

      done = query["indicators"].length === Object.keys(results).length;

      if (done && !sent) {
        sent = true;
        res.status(200).json(results);
        res.end();
      }
  
      if (done && sent) {
        clearInterval(__i);
        __i = null;
      }
    }, 100);
  }
}