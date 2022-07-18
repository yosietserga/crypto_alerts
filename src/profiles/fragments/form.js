import { ucfirst, isset, empty, getVar } from "../../../utils/common";
import Link from "next/link";
import CheckIcon from "../../../components/ui/icons/check";
import LoadingIcon from "../../../components/ui/icons/loading";
import { Form, Button } from "reactstrap";

import FieldStore from "../fields/storeId";
import FieldStatus from "../fields/status";
import FieldName from "../fields/name";
import FieldSlug from "../fields/slug";
import FieldProfileType from "../fields/profileTypeId";
import FieldPerson from "../fields/personId";

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
          <FieldProfileType value={props.profileTypeId} handler={handler} />
          <FieldPerson value={props.personId} handler={handler} />
          <FieldName value={props.name} handler={handler} />
          <FieldSlug value={props.slug} handler={handler} />
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
          <Link href="/panel/profiles" passHref={true}>
            <Button className="btn btn-default">Cancelar</Button>
          </Link>
        </Form>
      );
    },
    onSubmit: async (e, props) => {
      e.preventDefault();

      const {
        name,
        slug,
        image,
        personId,
        profileTypeId,
        storeId,
        status,
        setFlag,
        router,
      } = props;

      props.setModalContent(<LoadingIcon />);
      props.setModal(true);

      setFlag("none");

      const formData = {};

      if (!empty(name)) formData.name = name;
      if (!empty(slug)) formData.slug = slug;
      if (!empty(image)) formData.image = image;
      if (!empty(personId)) formData.personId = parseInt(personId);
      if (!empty(profileTypeId))
        formData.profileTypeId = parseInt(profileTypeId);
      if (!empty(storeId)) formData.storeId = parseInt(storeId);
      if (!empty(status)) formData.status = parseInt(status);

      //POST form values
      const res = await fetch("/api/profiles", {
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
          router.push("/panel/profiles");
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

  const {
    name,
    slug,
    image,
    personId,
    profileTypeId,
    storeId,
    status,
    setFlag,
    router,
  } = props;
  props.setModalContent(<LoadingIcon />);
  props.setModal(true);

  setFlag("none");

  const formData = {};

  if (!empty(name)) formData.name = name;
  if (!empty(slug)) formData.slug = slug;
  if (!empty(image)) formData.image = image;
  if (!empty(personId)) formData.personId = parseInt(personId);
  if (!empty(profileTypeId)) formData.profileTypeId = parseInt(profileTypeId);
  if (!empty(storeId)) formData.storeId = parseInt(storeId);
  if (!empty(status)) formData.status = parseInt(status);

  //POST form values
  const res = await fetch(`/api/profiles/${props.data.id}`, {
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
      router.push("/panel/profiles");
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
