import Script from "next/script";
import Link from "next/link";

export default function Slider({ sliders }) {

  return (

    <>
      {/* Start Slider content */}
      <div className="slider-main">
        {sliders.map((item, key) => {
          return <Slide key={key} data={item} />;
        })}
      </div>
      {sliders.length > 1 && (
        <Script
          dangerouslySetInnerHTML={{
            __html: `if ($('.slider-main').length) $('.slider-main').owlCarousel( {
            loop: true,
            nav: true,
            margin: 0,
            dots: false,
            autoplay: true,
            navText: ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i>"],
            responsive: {
              0: {
                items: 1
              },
              768: {
                items: 1
              },
              1000: {
                items: 1
              }
            }
          } );`,
          }}
          strategy="lazyOnload"
          nonce={global.nonce["script-src"]}
        />
      )}
      {/* End Slider content */}
    </>
  );
}

export function Slide(props) {

 
  return (
    <div className="slide-area home fix" data-stellar-background-ratio=".4">
      <div className="display-table">
        <div className="display-table-cell">
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="slide-content">
                  <h2 className="title2">
                    {props?.data?.title.length > 0
                      ? props?.data?.title
                      : `Invierte en Fondos de Inversión`}
                  </h2>
                  <p>
                    {props?.data?.description ??
                      `Los Fondos de Inversión Abiertos se convierten en una
                      alternativa a través la diversificación de la conformación
                      de los portafolios de inversión.`}
                  </p>
                  <div className="layer-1-3">
                    <Link
                      href={
                        props?.data?.link_button1.length > 0
                          ? props?.data?.link_button1
                          : `#`
                      }
                    >
                      <a className="ready-btn left-btn">
                        {props?.data?.text_button1.length > 0
                          ? props?.data?.text_button1
                          : `Simula tu inversión`}
                      </a>
                    </Link>
                    <div className="video-content">
                      <Link
                        href={
                          props?.data?.link_button2.length > 0
                            ? props?.data?.link_button2
                            : `#`
                        }
                      >
                        <a className="video-play vid-zone">
                          <i className="fa fa-dollar"></i>
                          <span>
                            {props?.data?.text_button2.length > 0
                              ? props?.data?.text_button2
                              : `Haz tu consulta`}
                          </span>
                        </a>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


/*
//??????
if (props?.data?.image.length `&gt; 0)
{
  <style jsx>{`
    .slide-area.home {
      background-image: url(/uploads/${props.data.image}) !important;
    }
  `}</style>
}
*/