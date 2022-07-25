import React, { useState } from "react";
import { useRouter } from "next/router";
import AdminContainer from "../layout/container";
import NextBreadcrumbs from "../../../components/ui/breadcrumbs";
import UIModal from "../../../components/ui/modal";
import { Container, Row, Col } from "reactstrap";
import actions from "../../../src/whatsapps/fragments/form";
import WhatsappQR from "../../../src/whatsapps/fragments/qr";
import { mt_rand, generateRandomString, hash } from "../../../utils/common";

const componentTitle = "WhatsApp Account";

export default function WhatsAppAccounts(props) {
  const router = useRouter();
  const { children } = actions[props.action];

  const [flag, setFlag] = useState("success");
  const [error, setError] = useState("No hay conexión con el servidor");

  const [ref, setRef] = useState(actions.getVar(props, "ref", ""));
  const [storeId, setStoreId] = useState(actions.getVar(props, "storeId", ""));
  const [status, setStatus] = useState(actions.getVar(props, "status", 0));


  //modal controls
  const [modal, setModal] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const toggle = () => setModal(!modal);

  console.log(props.languages);

  const __props = {
    ...props,

    data: props?.data ?? null,

    ref,
    status,
    storeId,

    setRef,
    setStoreId,
    setStatus,

    flag,
    setFlag,
    error,
    setError,
    router,
    toggle,
    setModalContent,
    setModal,
  };

  switch (props.action) {
    case "create":
      props = {
        ...__props,
        title: "Add "+ componentTitle,
      };
      break;
    case "update":
      props = {
        ...__props,
        title: "Edit " + componentTitle,
        breadcrumbs: [
          {
            text: "Dashboard",
            href: "dashboard",
          },
          {
            text: componentTitle,
            href: "whatsapps",
          },
          {
            text: "Edit " + componentTitle,
            href: null,
          },
        ],
      };
      break;
  }

  return (
    <AdminContainer>
      <NextBreadcrumbs breadcrumbs={props.breadcrumbs} />
      <UIModal
        props={{
          title: componentTitle,
          content: modalContent,
          btnAccept: toggle,
          toggle,
          modal,
        }}
      />

      <div className="block">
        <Container>
          <Row>
            <Col sm={6}>{children(props)}</Col>
            <Col sm={6}>
              <WhatsappQR filename={props.filename} />
            </Col>
          </Row>
        </Container>
      </div>
    </AdminContainer>
  );
}

export async function getServerSideProps({ params }) {
  const { pid } = params;

  let action = typeof pid == "object" ? pid[0] : pid;
  let id = typeof pid == "object" ? pid[1] : 0;
  let data = {};

  try {
    const PORT = process.env.PORT ?? 3000;
    const baseurl = process.env.BASE_URL + ":" + PORT;

    //get all profile groups
    const r_profilegroups = await fetch(baseurl + "/api/profilegroups");
    let profileGroups = await r_profilegroups.json();
    if (profileGroups.length === 0) profileGroups = [];

    //get all categories
    const r_categories = await fetch(baseurl + "/api/categories");
    let categories = await r_categories.json();
    if (categories.length === 0) categories = [];

    //get all languages
    const r_languages = await fetch(baseurl + "/api/languages");
    let languages = await r_languages.json();
    if (languages.length === 0) languages = [];

    //get all persons
    const r_persons = await fetch(baseurl + "/api/profiles?include=person");
    let persons = await r_persons.json();
    if (persons.length === 0) persons = [];

    //get all stores
    const r_stores = await fetch(baseurl + "/api/stores");
    let stores = await r_stores.json();
    if (stores.length === 0) stores = [];

    const allowed = ["create", "update"];
    if (!allowed.includes(action)) {
      return {
        redirect: {
          destination: "/404",
          permanent: false,
        },
      };
    }

    if (action == "update" && !isNaN(parseInt(id))) {
      console.log("/api/posts/" + parseInt(id));
      let r = await fetch(baseurl + "/api/posts/" + parseInt(id), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (r.status < 300) {
        data = await r.json();
      }
    }

    //TODO: get the filename of the whatsapp session for this post or generate it if does not exists 
    const filename = generateRandomString(mt_rand());

    return {
      props: {
        filename,
        action,
        data,
        categories,
        languages,
        persons,
        profileGroups,
        stores,
      },
    };
  } catch (err) {
    console.log(err);
    return {
      props: {
        action,
        data: [],
        categories: [],
        languages: [],
        persons: [],
        profileGroups: [],
        stores: [],
      },
    };
  }
}
