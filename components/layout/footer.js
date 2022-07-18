import Script from "next/script";
import Link from "next/link";
import Img from "../image";
import { StoreContext } from "../../context/store";
import React from "react";

export default function Footer() {
  const store = React.useContext( StoreContext );
  const [jQueryLoaded, setJQLoaded] = React.useState(false);

    const jsFirstFiles = ["/assets/static/js/vendor/jquery-1.12.4.min.js"];

    const jsFiles = [
      "/assets/static/js/bootstrap.min.js",
      "/assets/static/js/owl.carousel.min.js",
      "/assets/static/js/jquery.stellar.min.js",
      "/assets/static/js/jquery.counterup.min.js",
      "/assets/static/js/waypoints.js",
    ];

    const jsLazyLoadFiles = [
      "/assets/static/js/jquery.nice-select.min.js",
      "/assets/static/js/magnific.min.js",
      "/assets/static/js/wow.min.js",
      "/assets/static/js/jquery.meanmenu.js",
      "/assets/static/js/form-validator.min.js",
      "/assets/static/js/plugins.js",
      "/assets/static/js/main.js",
    ];

    React.useEffect(()=>{
      let i = setInterval(()=>{
        if (!!window && !!window.jQuery) {
          setJQLoaded(true);
        }
        if (jQueryLoaded) {
          clearInterval(i);
        }
      }, 100);
    }, [setJQLoaded, jQueryLoaded]);

  return (
    <footer className="footer-1">
      <div className="footer-area">
        <div className="container">
          <div className="row">
            {" "}
            <div className="col-md-6 col-sm-6 col-xs-12">
              <div className="footer-content logo-footer">
                <div className="footer-head">
                  <div className="footer-logo">
                    <Link href="/">
                      <a className="footer-black-logo">
                        <Img s="logo/logofooter.png" w="400px" a="" />
                      </a>
                    </Link>
                  </div>
                  <p>
                    La oficina principal de GanaSafi S.A. se encuentra ubicada
                    en la Calle Murillo Nº 89, Planta Alta, de la ciudad de
                    Santa Cruz, teléfono 591- (3) 317-0400.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-md-offset-3 col-sm-6 col-xs-12">
              <div className="footer-content">
                <div className="footer-head">
                  <h4 className="text-light-green">Fondos de Inversión</h4>
                  <ul className="footer-list">
                    <li>
                      <Link href="/productos/gana-inversiones">
                        <a>GanaInversiones</a>
                      </Link>
                    </li>
                    <li>
                      <Link href="/productos/gana-rendimiento">
                        <a>GanaRendimiento</a>
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-area-bottom">
        <div className="container">
          <div className="row">
            <div className="col-md-6 col-sm-6 col-xs-12">
              <div className="copyright">
                <p>
                  Copyright © 2021 <a href="#">GANASAFI</a> Todos los derechos
                  reservados.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {jsFirstFiles.map((src) => {
        return (
          <Script key={src} src={src} nonce={global.nonce["script-src"]} />
        );
      }) ?? ""}

      {jQueryLoaded &&
        jsFiles.map((src) => {
          return (
            <Script
              key={src}
              src={src}
              strategy="afterInteractive"
              defer
              nonce={global.nonce["script-src"]}
            />
          );
        })}

      {jQueryLoaded && jsLazyLoadFiles.map((src) => {
        return (
          <Script
            key={src}
            src={src}
            strategy="lazyOnload"
            nonce={global.nonce["script-src"]}
          />
        );
      })}

      <noscript
        dangerouslySetInnerHTML={{
          __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-PD6NWJG"
height="0" width="0" style="display:none;visibility:hidden" nonce="${global.nonce["default-src"]}"></iframe>`,
        }}
      ></noscript>
    </footer>
  );
}
