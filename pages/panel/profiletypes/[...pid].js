import React, { useState } from "react";
import { useRouter } from "next/router";
import AdminContainer from "../layout/container";
import NextBreadcrumbs from "../../../components/ui/breadcrumbs";
import UIModal from "../../../components/ui/modal";
import actions from "../../../src/profiletypes/fragments/form";

export default function ProfileTypes(props) {
  const router = useRouter();
  const { children } = actions[props.action];

  const [flag, setFlag] = useState("success");
  const [error, setError] = useState("No hay conexión con el servidor");
  
  const [name, setName] = useState(actions.getVar(props, "name", ""));
  const [slug, setSlug] = useState(actions.getVar(props, "slug", ""));
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
    image,
    status,
    setName,
    setSlug,
    setImage,
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
        title: "Create Profile Type",
      };
      break;
    case "update":
      props = {
        ...__props,
        title: "Edit Profile Type",
        breadcrumbs: [
          {
            text: "Dashboard",
            href: "dashboard",
          },
          {
            text: "Profile Types",
            href: "profiletypes",
          },
          {
            text: "Edit Profile Type",
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
          title: "Profile Type",
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

  const allowed = ['create', 'update'];
  if (!allowed.includes( action )) {
    return {
      redirect: {
        destination: "/404",
        permanent: false,
      },
    };
  }
  
  if (action == "update") {
  const PORT = process.env.PORT ?? 3000;
  const baseurl = process.env.BASE_URL + ":" + PORT;
    let r = await fetch(baseurl + "/api/profiletypes/" + id, {
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
}
