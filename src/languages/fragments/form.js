import { ucfirst, isset, empty, getVar } from "../../../utils/common";
import Link from "next/link";
import CheckIcon from "../../../components/ui/icons/check";
import LoadingIcon from "../../../components/ui/icons/loading";
import { Form, Button } from "reactstrap";
import FieldIcon from "../fields/icon";
import FieldName from "../fields/name";
import FieldCode from "../fields/code";
import FieldLocale from "../fields/locale";
import FieldFolder from "../fields/folder";
import FieldStatus from "../fields/status";

const OBJECT_TYPE = "language";

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
          <FieldName value={props.name} handler={handler} />
          <FieldIcon
            value={props.icon}
            objectId={props.data.id}
            objectType={OBJECT_TYPE}
            group="data"
            __key="icon"
            handler={handler}
          />
          <FieldCode value={props.code} handler={handler} />
          <FieldLocale value={props.locale} handler={handler} />
          <FieldFolder value={props.folder} handler={handler} />
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
          <Link href="/panel/languages" passHref={true}>
            <Button className="btn btn-default">Cancelar</Button>
          </Link>
        </Form>
      );
    },
    onSubmit: async (e, props) => {
      e.preventDefault();

      const { name, code, folder, locale, image, status, setFlag, router } =
        props;

      props.setModalContent(<LoadingIcon />);
      props.setModal(true);

      setFlag("none");

      const formData = {};

      if (!empty(name)) formData.name = name;
      if (!empty(code)) formData.code = code;
      if (!empty(folder)) formData.folder = folder;
      if (!empty(locale)) formData.locale = locale;
      if (!empty(image)) formData.image = image;
      if (!empty(status)) formData.status = parseInt(status);

      //POST form values
      const res = await fetch("/api/languages", {
        method: "POST",
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
          router.push("/panel/languages");
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

  const { name, code, folder, locale, image, status, setFlag, router } = props;
  props.setModalContent(<LoadingIcon />);
  props.setModal(true);

  setFlag("none");

  const formData = {};

  if (!empty(name)) formData.name = name;
  if (!empty(code)) formData.code = code;
  if (!empty(folder)) formData.folder = folder;
  if (!empty(locale)) formData.locale = locale;
  if (!empty(image)) formData.image = image;
  if (!empty(status)) formData.status = parseInt(status);

  //POST form values
  const res = await fetch(`/api/languages/${props.data.id}`, {
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
      router.push("/panel/languages");
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