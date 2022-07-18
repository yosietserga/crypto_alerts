import React, { useState } from "react";
import { useRouter } from "next/router";
import AdminContainer from "../layout/container";
import NextBreadcrumbs from "../../../components/ui/breadcrumbs";
import UIModal from "../../../components/ui/modal";
import actions from "../../../src/profiles/fragments/form";

export default function Profiles(props) {
  const router = useRouter();
  const { children } = actions[props.action];

  const [flag, setFlag] = useState("success");
  const [error, setError] = useState("No hay conexión con el servidor");

  const [name, setName] = useState(actions.getVar(props, "name", ""));
  const [slug, setSlug] = useState(actions.getVar(props, "slug", ""));
  const [personId, setPersonId] = useState(actions.getVar(props, "personId", ""));
  const [profileTypeId, setProfileTypeId] = useState(actions.getVar(props, "profileTypeId", ""));
  const [storeId, setStoreId] = useState(actions.getVar(props, "storeId", ""));
  const [image, setImage] = useState(actions.getVar(props, "image", ""));
  const [status, setStatus] = useState(actions.getVar(props, "status", 0));

  //modal controls
  const [modal, setModal] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const toggle = () => setModal(!modal);

  const __props = {
    ...props,

    data: props?.data ?? null,

    name,
    slug,
    personId,
    profileTypeId,
    image,
    status,
    storeId,
    setName,
    setSlug,
    setPersonId,
    setProfileTypeId,
    setImage,
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
        title: "Create Profile",
      };
      break;
    case "update":
      props = {
        ...__props,
        title: "Edit Profile",
        breadcrumbs: [
          {
            text: "Dashboard",
            href: "dashboard",
          },
          {
            text: "Profiles",
            href: "profiles",
          },
          {
            text: "Edit Profile",
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
          title: "Usuario",
          content: modalContent,
          btnAccept: toggle,
          toggle,
          modal,
        }}
      />

      <div className="block">{children(props)}</div>
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
    
    //get all profile types
    const r_profiletypes = await fetch(baseurl + "/api/profiletypes");
    let profileTypes = await r_profiletypes.json();
    if (profileTypes.length === 0) profileTypes = [];
    
    //get all persons
    const r_persons = await fetch(baseurl + "/api/persons");
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

    if (action == "update") {
      let r = await fetch(baseurl + "/api/profiles/" + id, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (r.status < 300) {
        data = await r.json();
      }
    }

    return {
      props: {
        action,
        data,
        persons,
        profileTypes,
        stores,
      },
    };
  } catch (err) {
    console.log(err);
    return {
      props: {
        action,
        data: [],
        persons: [],
        profileTypes: [],
        stores: [],
      },
    };
  }
}
