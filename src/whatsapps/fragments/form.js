import {
  ucfirst,
  isset,
  empty,
  getVar
} from "../../../utils/common";
import Link from "next/link";
import CheckIcon from "../../../components/ui/icons/check";
import LoadingIcon from "../../../components/ui/icons/loading";
import { getProperties, setProperty } from "../../../libs/services/properties";
import { Form, Button } from "reactstrap";

import FieldStatus from "../../posts/fields/status";
import FieldTitle from "../../posts/fields/title";
import FieldDescription from "../fields/description";
import FieldRef from "../../posts/fields/ref";
import FieldStore from "../../posts/fields/storeId";

const POST_TYPE = "whatsapp_account";
const OBJECT_TYPE = "whatsapp_account";

const actions = {
  create: {
    children: function UIForm(props) {
      const handler = (value, key) => {
        if (
          isset(props[`set${ucfirst(key)}`]) &&
          typeof props[`set${ucfirst(key)}`] === "function"
        ) {
          props[`set${ucfirst(key)}`](value);
        } else {
          //TODO: thrown error
        }
      };

      return (
        <Form>
          <h2>{props.title}</h2>
          {props.action == "update" && !!props?.data?.uuid && (
            <>
              <br />
              <small>UUID: {props.data.uuid}</small>
            </>
          )}
          <hr />
          <FieldStore value={props.storeId} handler={handler} />
          <FieldRef value={props.ref} handler={handler} />
          {props.languages.map((l) => {
            return (
              <FieldTitle
                key={l.uuid}
                value={""}
                languageId={l.id}
                objectId={props.data.id}
                objectType={OBJECT_TYPE}
                handler={handler}
              />
            );
          })}
          {props.languages.map((l) => {
            return (
              <FieldDescription
                key={l.uuid}
                value={""}
                languageId={l.id}
                objectId={props.data.id}
                objectType={OBJECT_TYPE}
                handler={handler}
              />
            );
          })}
          <FieldStatus value={props.status} handler={handler} />
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
          <Link href="/panel/alerts" passHref={true}>
            <Button className="btn btn-default">Cancelar</Button>
          </Link>
        </Form>
      );
    },
    onSubmit: async (e, props) => {
      e.preventDefault();

      const { ref, storeId, status, setFlag, router } = props;

      props.setModalContent(<LoadingIcon />);
      props.setModal(true);

      setFlag("none");

      const formData = {};

      if (!empty(ref)) formData.ref = ref;
      if (!empty(storeId)) formData.storeId = parseInt(storeId);
      if (!empty(status)) formData.status = parseInt(status);

      formData.post_type = POST_TYPE;

      //POST form values
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      }).then(resp => resp.json()).then(async resp => {
        console.log(resp);
        if (resp.id) {
          const fData = {};
          fData.objectId = parseInt(resp.id);
          fData.objectType = OBJECT_TYPE;
          fData.group = "data";
          fData.key = "session_filename";
          fData.dataType = "string";
          fData.value = props.filename;
          
          const result = await setProperty(null, fData);
        }
      });

      //workflow success or fail
      if (res.status < 300) {
        //Await for data for any desirable next steps
        const r = await res.json();

        //some data process flow controls
        props.setModalContent(<CheckIcon />);
        setTimeout(() => {
          router.push("/panel/alerts");
          props.setModal(false);
        }, 1200);
      } else {
        setFlag("error");
        props.setModalContent("No se pudo crear, por favor intente de nuevo");
      }
    },
  },
  update: {},
};

actions.update.onSubmit = async (e, props) => {
  e.preventDefault();

  const { ref, storeId, status, setFlag, router } = props;

  props.setModalContent(<LoadingIcon />);
  props.setModal(true);

  setFlag("none");

  const formData = {};

  if (!empty(ref)) formData.ref = ref;
  if (!empty(storeId)) formData.storeId = parseInt(storeId);
  if (!empty(status)) formData.status = parseInt(status);

  formData.post_type = POST_TYPE;

  //POST form values
  const res = await fetch(`/api/posts/${props.data.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  //workflow success or fail
  if (res.status < 300) {
    //Await for data for any desirable next steps
    const r = await res.json();

    //some data process flow controls
    props.setModalContent(<CheckIcon />);
    setTimeout(() => {
      router.push("/panel/alerts");
      props.setModal(false);
    }, 1200);
  } else {
    setFlag("error");
    props.setModalContent("No se pudo actualizar, por favor intente de nuevo");
  }
};

actions.update.children = actions.create.children;

actions.getVar = getVar;

export default actions;
