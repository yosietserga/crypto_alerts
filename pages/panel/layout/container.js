import React, { useState, useEffect, memo } from "react";
import { useRouter } from "next/router";
import {
  encrypt,
  decrypt,
  getCookie,
  removeCookie,
  setCookie,
  log,
} from "../../../utils/common";
import { Container, Row, Col } from "reactstrap";
import Head from "next/head";

/* Components */
import SideBar from "./sidebar";
import NavBar from "./navbar";

const storeLayout = {};

function AdminContainer(mainProps) {
  const router = useRouter();
  const { children } = mainProps;
  const [session, setSession] = useState();

  const signOut = () => {
    //return;
    setSession({});
    removeCookie("uuid");
    removeCookie("accessToken");
    
    window.location.href = "/login";
  };

  useEffect(() => {
    fetch("/api/auth/session")
      .then((resp) => {
        return resp.json();
      })
      .then((data) => {
        log({ data });
        if (!data?.person?.id) {
          //redirect to homepage
          signOut();
          return;
        } else {
          setSession(data);
        }
      });
  }, [setSession]);

  if (!getCookie("accessToken") || !getCookie("uuid")) {
    signOut();
  }

  return (
    <>
      <Head>
        <title>Admin | CryptoAlerts</title>

        <link rel="icon" href='/favicon.ico' />

        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <link
          href="/assets/static/css/animate.css"
          rel="stylesheet"
          type="text/css"
        />
        <link
          href="/assets/static/css/font-awesome.min.css"
          rel="stylesheet"
          type="text/css"
        />
        <link
          href="/assets/static/css/themify-icons.css"
          rel="stylesheet"
          type="text/css"
        />
        <link
          href="/assets/static/css/flaticon.css"
          rel="stylesheet"
          type="text/css"
        />
        <link href="/assets/static/css/font-awesome.min.css" rel="stylesheet" />
        <link href="/assets/static/css/admin.css" rel="stylesheet" />
      </Head>
      <NavBar
        session={session}
        signOut={() => {
          signOut();
        }}
      />
      <Container fluid className="wrapper">
        <Row>
          <Col className="wrapper-left">
            <SideBar session={session} />
          </Col>
          <Col className="wrapper-content">{children}</Col>
        </Row>
      </Container>
    </>
  );
}

export default AdminContainer;
