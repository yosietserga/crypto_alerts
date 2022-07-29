import {useEffect} from "react";
import Container from "../components/layout/container";

export default function Home() {
  useEffect(()=>{
    window.location.href = "/login";
  });

  return (
    <Container>
      home
    </Container>
  );
}

