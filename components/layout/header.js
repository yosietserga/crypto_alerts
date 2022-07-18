import { useEffect, useState } from "react";
import MediaQuery from "react-responsive";
import Link from "next/link";
import Img from "../image";

const Logo = () => {
  return <Img s="logo/logoheader.png" />;
};

const Menu = (props) => {
  const { c } = props;

  return (
    <ul className={c ?? ""}>
      <li>
        <Link href="/quienes-somos">
          <a className="pages">Quiénes Somos</a>
        </Link>
      </li>

      <li>
        <Link href="/productos">
          <a className="pages">Fondos de Inversión</a>
        </Link>
        <ul className="sub-menu">
          <li>
            <Link href="/productos/gana-rendimiento">
              <a>GanaRendimiento</a>
            </Link>
          </li>
          <li>
            <Link href="/productos/gana-inversiones">
              <a>GanaInversiones</a>
            </Link>
          </li>
        </ul>
      </li>
      <li>
        <Link
          href="/#comparador"
          onClick={(e) => {
            window &&
              window.scrollTo({
                top: document.querySelector("#comparador").offsetTop,
                behavior: "smooth",
              });
          }}
        >
          <a>Comparador de Fondos</a>
        </Link>
      </li>
      <li>
        <Link href="/contacto">
          <a className="pages">Contáctanos</a>
        </Link>
      </li>
      <li>
        <Link href="/faq">
          <a>Preguntas Frecuentes</a>
        </Link>
      </li>
    </ul>
  );
};

export default function Header({ data }) {
  const breakpoint = 1024;
  const [mmLoaded, setMM] = useState(false);

  useEffect(() => {
  const applyMM = () => {
    if (
      window?.innerWidth < breakpoint &&
      !!window.jQuery?.fn?.meanmenu &&
      !mmLoaded
    ) {
      window.jQuery("nav#dropdown").meanmenu();
      window.mmSetupFront = true;
      setMM(true);
    }
  };

    if (typeof window !== "undefined") applyMM();
  }, []);

  return (
    <>
      {/*<div id="preloader"></div>*/}

      <header className="header-one">
        <MediaQuery query={`(min-width: ${breakpoint}px)`}>
          <div id="sticker" className="header-area hidden-xs">
            <div className="container-fluid">
              <div className="row">
                <div className="col-md-12 col-sm-12">
                  <div className="row">
                    <div className="col-lg-3 col-md-2 col-sm-2">
                      <div className="logo">
                          <Link href="/" >
                            <a className="navbar-brand page-scroll white-logo">
                              <Logo />
                            </a>
                          </Link>
                          
                          <Link href="/" >
                            <a  className="navbar-brand page-scroll black-logo">
                              <Logo />
                            </a>
                          </Link>
                        
                      </div>
                    </div>
                    <div className="col-lg-9 col-md-10 col-sm-10">
                      <div className="header-right-link">
                        <Link href="/URLEXTERNA" >
                          <a className="s-menu">Ingresar</a>
                        </Link>
                      </div>

                      <nav className="navbar navbar-default">
                        <div
                          className="collapse navbar-collapse"
                          id="navbar-example"
                        >
                          <div className="main-menu">
                            <Menu c="nav navbar-nav navbar-right" />
                          </div>
                        </div>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </MediaQuery>

        <MediaQuery query={`(max-width: ${breakpoint}px)`}>
          <div className="mobile-menu-area hidden-lg ">
            <div className="container-fluid ">
              <div className="row">
                <div className="col-md-12">
                  <div className="mobile-menu">
                    <div className="logo">
                      <Link href="/" >
                        <a>
                          <Img s="logo/logoheader.png" w="250px"/>
                        </a>
                      </Link>
                    </div>
                    <nav id="dropdown">
                      <Menu />
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </MediaQuery>
      </header>
    </>
  );
}
