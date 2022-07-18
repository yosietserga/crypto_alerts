import Head from "next/head";
import React from "react";
import { StoreContext } from "../../../context/store";

export default function HTMLHead( props ) {
    const store = React.useContext(StoreContext);
    
    store.set("nonce", props.nonce);
    store.set("csp", props.csp);

    const cssFiles = [
      "/assets/static/css/bootstrap.min.css",
      "/assets/static/css/animate.css",
      "/assets/static/css/owl.carousel.css",
      "/assets/static/css/owl.transitions.css",
      "/assets/static/css/meanmenu.min.css",
      "/assets/static/css/nice-select.css",
      "/assets/static/css/font-awesome.min.css",
      "/assets/static/css/themify-icons.css",
      "/assets/static/css/flaticon.css",
      "/assets/static/css/magnific.min.css",
      "/assets/static/css/animate.css",
      "/assets/static/css/globals.css",
    ];
    
    return (
      <Head nonce={props.nonce["default-src"]}>
        <title>
          Ganasafi - Ganadero Asociación Administradora de Fondos de Inversión
          S.A.
        </title>
        <meta name="description" content="" />
        <meta name="csp-nonce" content={props.nonce["style-src"]} />
        <meta name="content-security-policy" content={props.csp} />
        <link
          rel="shortcut icon"
          type="image/png"
          href="img/logo/favicon.png"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {
            cssFiles.map(href => {
                return (
                    <link
                    key={href}
                    href={href}
                    rel="stylesheet"
                    type="text/css"
                    nonce={props.nonce["style-src"]}
                    />
                )
            }) ?? ""
        }
        
        
      </Head>
    );
}