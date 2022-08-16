import Script from "next/script";
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
      <div className="footer-area-bottom">
        <div className="container">
          <div className="row">
            <div className="col-md-6 col-sm-6 col-xs-12">
              <div className="copyright">
                <p>
                  Copyright © 2022 <a href="#">TU EMPRESA</a> Todos los derechos
                  reservados.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {jsFirstFiles.map((src) => {
        return (
          <Script key={src} src={src} nonce={global?.nonce["script-src"]} />
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
              nonce={global?.nonce["script-src"]}
            />
          );
        })}

      {jQueryLoaded && jsLazyLoadFiles.map((src) => {
        return (
          <Script
            key={src}
            src={src}
            strategy="lazyOnload"
            nonce={global?.nonce["script-src"]}
          />
        );
      })}
    </footer>
  );
}
