import React, { useState } from "react";
import { useRouter } from "next/router";
import AdminContainer from "../layout/container";
import UIModal from "../../../components/ui/modal";
import NextBreadcrumbs from "../../../components/ui/breadcrumbs";
import actions from "../../../src/languages/fragments/form";

export default function Languages(props) {
  const router = useRouter();
  const { children } = actions[props.action];

  const [flag, setFlag] = useState("success");
  const [error, setError] = useState("No hay conexión con el servidor");
  
  const [name, setName] = useState(actions.getVar(props, "name", ""));
  const [code, setCode] = useState(actions.getVar(props, "code", ""));
  const [folder, setFolder] = useState(actions.getVar(props, "folder", ""));
  const [locale, setLocale] = useState(actions.getVar(props, "locale", ""));
  const [image, setImage] = useState(actions.getVar(props, "image", ""));
  const [status, setStatus] = useState(actions.getVar(props, "status", 0));
  const [icon, setIcon] = useState(actions.getVar(props, "icon", ""));

  //modal controls
  const [modal, setModal] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const toggle = () => setModal(!modal);

  const __props = {
    ...props,

    data: props?.data ?? null,

    name,
    code,
    folder,
    locale,
    image,
    status,
    icon,

    setName,
    setCode,
    setLocale,
    setFolder,
    setImage,
    setStatus,
    setIcon,

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
        title: "Create Language",
      };
      break;
    case "update":
      props = {
        ...__props,
        title: "Edit Language",
        breadcrumbs: [
          {
            text: "Dashboard",
            href: "dashboard",
          },
          {
            text: "Languages",
            href: "languages",
          },
          {
            text: "Edit Language",
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
          title: "Language",
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
      let r = await fetch(baseurl + "/api/languages/" + id, {
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
      },
    };
  } catch (err) {
    console.log(err);
    return {
      props: {
        action,
        data: [],
      },
    };
  }
}