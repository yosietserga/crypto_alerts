import React, { useState, useEffect, memo, useRef } from "react";
import { useRouter } from "next/router";
import AdminContainer from "../layout/container";
import { log, encrypt, decrypt, getCookie } from "../../../utils/common";
import Link from "next/link";
import CheckIcon from "../../../components/ui/icons/check";
import LoadingIcon from "../../../components/ui/icons/loading";
import UIModal from "../../../components/ui/modal";
import { Row, Col, Form, FormGroup, Label, Button, Input } from "reactstrap";

import "react-dropzone-uploader/dist/styles.css";
import Dropzone from "react-dropzone-uploader";
import { getDroppedOrSelectedFiles } from "html5-file-selector";

const actions = {
  create: {
    children: function UIForm(props) {
      const handleTitle = (e) => {
        props.setTitle(e.currentTarget.value);
      };

      const handleDesc = (e) => {
        props.setDesc(e.currentTarget.value);
      };

      const handleLinkButton1 = (e) => {
        props.setLinkButton1(e.currentTarget.value);
      };

      const handleLinkButton2 = (e) => {
        props.setLinkButton2(e.currentTarget.value);
      };

      const handleTextButton1 = (e) => {
        props.setTextButton1(e.currentTarget.value);
      };

      const handleTextButton2 = (e) => {
        props.setTextButton2(e.currentTarget.value);
      };

      return (
        <Form>
          <h2>{props.contentTitle}</h2>
          {props.action == "update" && !!props?.data?.uuid && (
            <>
              <br />
              <small>UUID: {props.data.uuid}</small>
            </>
          )}
          {props.action == "update" && !!props?.data?.image && (
            <>
              <br />
              <img
                src={`/uploads/${props.data.image}`}
                alt="Image"
                width="120"
              />
            </>
          )}
          <hr />
          <FormGroup>
            <Label for="title">Título</Label>
            <Input
              type="title"
              name="title"
              id="title"
              value={props.title}
              onChange={handleTitle}
              placeholder="Ingresa el título"
            />
          </FormGroup>
          <FormGroup>
            <Label for="desc">Descripción</Label>
            <textarea
              className="form-control"
              name="desc"
              id="desc"
              value={props.desc}
              onChange={handleDesc}
            ></textarea>
          </FormGroup>
          <FormGroup>
            <Label for="linkButton1">Link Button 1</Label>
            <Input
              type="url"
              name="linkButton1"
              id="linkButton1"
              value={props.linkButton1}
              onChange={handleLinkButton1}
            />
          </FormGroup>
          <FormGroup>
            <Label for="textButton1">Text Button 1</Label>
            <Input
              type="text"
              name="textButton1"
              id="textButton1"
              value={props.textButton1}
              onChange={handleTextButton1}
            />
          </FormGroup>
          <FormGroup>
            <Label for="linkButton2">Link Button 2</Label>
            <Input
              type="url"
              name="linkButton2"
              id="linkButton2"
              value={props.linkButton2}
              onChange={handleLinkButton2}
            />
          </FormGroup>
          <FormGroup>
            <Label for="textButton2">Text Button 2</Label>
            <Input
              type="text"
              name="textButton2"
              id="textButton2"
              value={props.textButton2}
              onChange={handleTextButton2}
            />
          </FormGroup>
          <hr />
          {props.flag == "error" && (
            <>
              <span className="warning">{props.error}</span>
              <hr />
            </>
          )}
          <Button
            color="primary"
            onClick={(e) => {
              actions[props.action].onSubmit(e, props);
            }}
          >
            Aceptar
          </Button>{" "}
          <Link href="/panel/sliders" passHref={true}>
            <Button className="btn btn-default">Cancelar</Button>
          </Link>
        </Form>
      );
    },
    onSubmit: async (e, props) => {
      e.preventDefault();

      props.setFlag("none");
      props.setModalContent(<LoadingIcon />);
      props.setModal(true);

      //POST form values
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: props.title,
          description: props.desc,
          image: props.image,
          post_type: "slider",
          link_button1: props.linkButton1,
          text_button1: props.textButton1,
          link_button2: props.linkButton2,
          text_button2: props.textButton2,
        }),
      });

      //workflow success or fail
      if (res.status < 300) {
        //Await for data for any desirable next steps
        const r = await res.json();

        //some data process flow controls
        props.setModalContent(<CheckIcon />);
        setTimeout(() => {
          props.router.push("/panel/sliders");
          props.setModal(false);
        }, 1200);
      } else {
        props.setFlag("error");
        props.setModalContent("No se pudo crear, por favor intente de nuevo");
      }
    },
  },
  update: {},
};

actions.update.onSubmit = async (e, props) => {
  e.preventDefault();

  const { title, slug, rate, currencySymbol, currencyRate, setFlag, router } =
    props;

  props.setFlag("none");

  props.setModalContent(<LoadingIcon />);
  props.setModal(true);

  //POST form values
  const res = await fetch(`/api/posts/${props.data.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: props.title,
      description: props.desc,
      image: props.image,
      post_type: "slider",
      link_button1: props.linkButton1,
      text_button1: props.textButton1,
      link_button2: props.linkButton2,
      text_button2: props.textButton2,
    }),
  });

  //workflow success or fail
  if (res.status < 300) {
    //Await for data for any desirable next steps
    const r = await res.json();

    //some data process flow controls
    props.setModalContent(<CheckIcon />);
    setTimeout(() => {
      props.router.push("/panel/sliders");
      props.setModal(false);
    }, 1200);
  } else {
    props.setFlag("error");
    props.setModalContent("No se pudo crear, por favor intente de nuevo");
  }
};
actions.update.children = actions.create.children;

export function FileUploadComponent({ setImage }) {
  const fileParams = ({ meta, file }) => {
    const body = new FormData();
    body.append("file", file);
    return { url: "/api/posts/upload", body };
  };

  const onFileChange = ({ meta, file }, status) => {
    console.log({ method: "onFileChange", status, meta, file });
    if (status == "done") {
      const data = new FormData();

      data.append("file", file);

      fetch("/api/posts/upload", {
        method: "POST",
        body: data,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.result == "OK") {
            setImage(data.image);
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  const onSubmit = (files, allFiles) => {
    console.log({ files });
    console.log(files.map((f) => f.meta));
  };

  const getFilesFromEvent = (e) => {
    return new Promise((resolve) => {
      getDroppedOrSelectedFiles(e).then((chosenFiles) => {
        resolve(chosenFiles.map((f) => f.fileObject));
      });
    });
  };

  const selectFileInput = ({ accept, onFiles, files, getFilesFromEvent }) => {
    const textMsg =
      files.length > 0 ? "Subir de nuevo" : "Seleccionar archivos";

    return (
      <label className="btn btn-primary mt-4">
        {textMsg}
        <input
          style={{ display: "none" }}
          nonce={global.nonce["style-src"]}
          type="file"
          accept={accept}
          multiple
          onChange={(e) => {
            getFilesFromEvent(e).then((chosenFiles) => {
              onFiles(chosenFiles);
            });
          }}
        />
      </label>
    );
  };

  return (
    <Dropzone
      onSubmit={onSubmit}
      onChangeStatus={onFileChange}
      InputComponent={selectFileInput}
      getUploadParams={fileParams}
      getFilesFromEvent={getFilesFromEvent}
      accept="image/*"
      maxFiles={1}
      inputContent="Drop A File"
      styles={{
        dropzone: { width: 600, height: 400 },
        dropzoneActive: { borderColor: "green" },
      }}
    />
  );
}

export default function Products(props) {
  const router = useRouter();
  const { children } = actions[props.action];

  const [flag, setFlag] = useState("success");
  const [error, setError] = useState("No hay conexión con el servidor");
  const [title, setTitle] = useState(
    props.action == "update" ? props.data.title : ""
  );
  const [desc, setDesc] = useState(
    props.action == "update" ? props.data.description : ""
  );
  const [image, setImage] = useState(
    props.action == "update" ? props.data.image : ""
  );
  const [linkButton1, setLinkButton1] = useState(
    props.action == "update" ? props.data.link_button1 : ""
  );
  const [linkButton2, setLinkButton2] = useState(
    props.action == "update" ? props.data.link_button2 : ""
  );
  const [textButton1, setTextButton1] = useState(
    props.action == "update" ? props.data.text_button1 : ""
  );
  const [textButton2, setTextButton2] = useState(
    props.action == "update" ? props.data.text_button2 : ""
  );

  //modal controls
  const [modal, setModal] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const toggle = () => setModal(!modal);

  const PORT = process.env.PORT ?? 3000;
  const baseurl = process.env.BASE_URL + ":" + PORT;

  const __props = {
    ...props,

    title,
    setTitle,

    desc,
    setDesc,

    image,
    setImage,

    linkButton1,
    setLinkButton1,

    linkButton2,
    setLinkButton2,

    textButton1,
    setTextButton1,

    textButton2,
    setTextButton2,

    flag,
    setFlag,

    error,
    setError,

    router,
    toggle,
    setModalContent,
    setModal,

    baseurl,
  };

  switch (props.action) {
    case "create":
      props = {
        ...__props,
        contentTitle: "Crear Slider",
      };
      break;
    case "update":
      props = {
        ...__props,
        contentTitle: "Editar Slider",
      };
      break;
  }

  return (
    <AdminContainer>
      <UIModal
        props={{
          title: "Slider",
          content: modalContent,
          btnAccept: toggle,
          toggle,
          modal,
        }}
      />
      <FileUploadComponent setImage={setImage} />
      {children(props)}
    </AdminContainer>
  );
}

export async function getServerSideProps({ params }) {
  const { pid } = params;

  let action = typeof pid == "object" ? pid[0] : pid;
  let id = typeof pid == "object" ? pid[1] : 0;
  let data = {};

  const allowed = ["create", "update"];
  if (!allowed.includes(action)) {
    return {
      redirect: {
        destination: "/404",
        permanent: false,
      },
    };
  }

  const PORT = process.env.PORT ?? 3000;
  const baseurl = process.env.BASE_URL + ":" + PORT;

  if (action == "update") {
    let r = await fetch(baseurl + "/api/posts/" + id, {
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
