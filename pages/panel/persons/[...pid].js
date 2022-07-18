import React, { useState } from "react";
import { useRouter } from "next/router";
import AdminContainer from "../layout/container";
import NextBreadcrumbs from "../../../components/ui/breadcrumbs";
import UIModal from "../../../components/ui/modal";
import actions from "../../../src/persons/fragments/form";

export default function Persons(props) {
  const router = useRouter();
  const { children } = actions[props.action];

  const [flag, setFlag] = useState("success");
  const [error, setError] = useState("No hay conexión con el servidor");

  const [firstname, setFirstname] = useState(actions.getVar(props, "firstname", ""));
  const [lastname, setLastname] = useState(actions.getVar(props, "lastname", ""));
  const [email, setEmail] = useState(actions.getVar(props, "email", ""));
  const [phone, setPhone] = useState(actions.getVar(props, "phone", ""));
  const [username, setUsername] = useState(actions.getVar(props, "username", ""));
  const [password, setPassword] = useState("");
  const [genderOfBirthday, setGenderOfBirthday] = useState(actions.getVar(props, "genderOfBirthday", ""));
  const [gender, setGender] = useState(actions.getVar(props, "gender", ""));
  const [dateOfBirthday, setDateOfBirthday] = useState(actions.getVar(props, "dateOfBirthday", ""));
  const [storeId, setStoreId] = useState(actions.getVar(props, "storeId", ""));
  const [status, setStatus] = useState(actions.getVar(props, "status", 0));

  //modal controls
  const [modal, setModal] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const toggle = () => setModal(!modal);

  const __props = {
    ...props,

    data: props?.data ?? null,

    firstname,
    lastname,
    email,
    phone,
    username,
    password,
    status,
    dateOfBirthday,
    genderOfBirthday,
    gender,
    storeId,
    setFirstname,
    setLastname,
    setUsername,
    setEmail,
    setPhone,
    setPassword,
    setStoreId,
    setStatus,
    setGender,
    setGenderOfBirthday,
    setDateOfBirthday,

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
        title: "Create Person",
      };
      break;
    case "update":
      props = {
        ...__props,
        title: "Editar Persona",
        breadcrumbs: [
          {
            text: "Dashboard",
            href: "dashboard",
          },
          {
            text: "Persons",
            href: "persons",
          },
          {
            text: "Edit Person",
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
      let r = await fetch(baseurl + "/api/persons/" + id, {
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
        stores,
      },
    };
  } catch (err) {
    console.log(err);
    return {
      props: {
        action,
        data: [],
        stores: [],
      },
    };
  }
}
