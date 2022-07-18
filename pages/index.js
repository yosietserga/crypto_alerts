import Container from "../components/layout/container";
import Slider from "../components/slider";
import Img from "../components/image";


export async function getServerSideProps(ctx) {
  const PORT = process.env.PORT ?? 3000;
  const baseurl = process.env.BASE_URL + ":" + PORT;
  
  let r = await fetch(baseurl + '/api/posts?where={"post_type":"slider"}');

  let sliders = r.status === 200 ? await r.json() : [];

  return {
    props: {
      sliders,
    },
  };
}

export default function Home({ sliders }) {
  let count = sliders.length;
  
  return (
    <Container>
      {count > 0 && <Slider sliders={sliders} />}

    </Container>
  );
}

