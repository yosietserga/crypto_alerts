import * as common from "../utils/common.js";
import { NextResponse } from "next/server";

let __cookies = {};
const __cookie_nonce = common.hash("nonces");
const port = process.env.PORT ?? 3000;
const base_url = process.env.BASE_URL + ":" + port;
const script_sources = process.env.CSP_SCRIPT_SOURCE?.split(",").map((s) =>
  s.trim()
);
const style_sources = process.env.CSP_STYLE_SOURCE?.split(",").map((s) =>
  s.trim()
);
const font_sources = process.env.CSP_FONT_SOURCE?.split(",").map((s) =>
  s.trim()
);
const default_sources = process.env.CSP_DEFAULT_SOURCE?.split(",").map((s) =>
  s.trim()
);

function csp(req, res) {
    //const isProduction = process.env.NODE_ENV == "production";
    const isProduction = true; //forcing env only for testing
    const devScriptPolicy = ["unsafe-eval", "unsafe-inline"]; // NextJS uses react-refresh in dev
    const devStylePolicy = ["unsafe-inline"]; // NextJS uses react-refresh in dev

    const styleNonce = common.nonceGenerator();
    const scriptsNonce = common.nonceGenerator();
    const defaultNonce = common.nonceGenerator();
    const fontNonce = common.nonceGenerator();

    setCookie("styleNonce", styleNonce);
    setCookie("scriptsNonce", scriptsNonce);
    setCookie("defaultNonce", defaultNonce);
    setCookie("fontNonce", fontNonce);
    
    const cookies = common.encryptObject(__cookies);
    res.cookie(__cookie_nonce, cookies);

    

    res.headers.append(
      "Content-Security-Policy",
      [
        ["default-src", "self", "nonce-" + defaultNonce].concat(
          default_sources ?? []
        ),
        ["script-src", "unsafe-inline", "self"]
          .concat(script_sources ?? [])
          //.concat(isProduction ? ["nonce-" + scriptsNonce] : devScriptPolicy),
          .concat(isProduction ? devScriptPolicy : devScriptPolicy),
        ["connect-src", "self", "nonce-" + defaultNonce],
        ["img-src", "self", "nonce-" + defaultNonce],
        ["font-src", "self", "nonce-" + fontNonce].concat(font_sources ?? []),
        ["style-src", "unsafe-inline", "self"]
          .concat(style_sources ?? [])
          .concat(
            isProduction
              ? ["nonce-" + styleNonce]
              : devStylePolicy
          ),
        ["base-uri", "self", "nonce-" + defaultNonce],
        ["form-action", "self", "nonce-" + defaultNonce],
        ["report-to", "main-endpoint"],
      ].reduce((prev, [directive, ...policy]) => {
        return `${prev}${directive} ${policy
          .filter(Boolean)
          .map((src) => (src.startsWith("https") ? src : `'${src}'`))
          .join(" ")};`;
      }, "")
    );

    //api csp legacy
    res.headers.append(
      "Report-To",
      JSON.stringify([
        {
          group: "csp-endpoint",
          max_age: "10886400", //TODO: check and validate expiry date
          endpoints: [
            {
              url: base_url + "/api/security?report=csp",
            },
          ],
          include_subdomains: true,
        },
        {
          group: "network-errors",
          max_age: "10886400", //TODO: check and validate expiry date
          endpoints: [
            {
              url: base_url + "/api/security?report=network",
            },
          ],
          include_subdomains: true,
        }
    ])
    );

    //api csp legacy
    res.headers.append(
      "Report-To",
      JSON.stringify()
    );

    //current api reporting csp
    res.headers.append(
        "Reporting-Endpoints", 
        `main-endpoint="${base_url+"/api/security"}", default="${base_url+"/api/security"}"`
    );
}

function loadCookies(str) {
    if (typeof str !== "string" || !str) return false;
    try {
        const o = common.decryptObject( str );
        __cookies = typeof o === "object" ? common.decryptObject( str ) : {};
    } catch (error) {
        common.log( error );
        __cookies = {};
    }
}

function setCookie(k, v) {
  try {
    const __key = common.hashCookies ? common.hash(k) : k;
    __cookies[__key] = v;
  } catch (error) {
    console.error({ error });
  }
}

export function getCookie(k = null) {
  try {
    const __key = common.hashCookies ? common.hash(k) : k;
    return !k ? __cookies : !!__cookies[__key] ? __cookies[__key] : null;
  } catch (error) {
    console.error({ error });
  }
}

export function writeCookies(res) {
  try {
    res.cookie(common.COOKIE_PATH, cookies);
  } catch (error) {
    console.error({ error });
  }
}

export const middleware = (req, event) => {
    const res = NextResponse.next();
  
    //load cookies from request
    if (typeof req?.page?.name !== "undefined") loadCookies(req.cookies[__cookie_nonce]);

    //write CSP
    //csp(req, res); //uncomment this line to apply CSP
    
    console.log("middleware", req.nextUrl);
    if (req.nextUrl.pathname.startsWith("/dashboard")) {
      // This logic is only applied to /dashboard
    }

    return res;
};