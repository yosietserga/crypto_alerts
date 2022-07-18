import { ucfirst, isset, empty, getVar } from "../../../utils/common";
import Link from "next/link";
import CheckIcon from "../../../components/ui/icons/check";
import LoadingIcon from "../../../components/ui/icons/loading";
import { Form, Button } from "reactstrap";
import FieldStatus from "../fields/status";
import FieldStore from "../fields/storeId";
import FieldName from "../fields/name";
import FieldProfileType from "../fields/profileTypeId";

const TYPE = "user";

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
          <FieldName value={props.name} handler={handler} />
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
          <Link href="/panel/profilegroups" passHref={true}>
            <Button className="btn btn-default">Cancelar</Button>
          </Link>
        </Form>
      );
    },
    onSubmit: async (e, props) => {
      e.preventDefault();

      const { name, status, setFlag, router, profileTypeId, storeId } = props;

      props.setModalContent(<LoadingIcon />);
      props.setModal(true);

      setFlag("none");

      //POST form values
      const res = await fetch("/api/profilegroups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: TYPE,
          name,
          profileTypeId: parseInt(profileTypeId),
          storeId: parseInt(storeId),
          status: parseInt(status),
        }),
      });

      //workflow success or fail
      if (res.status < 300) {
        //Await for data for any desirable next steps
        const r = await res.json();

        //some data process flow controls
        props.setModalContent(<CheckIcon />);
        setTimeout(() => {
          router.push("/panel/profilegroups");
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

  const { name, status, setFlag, router, profileTypeId, storeId } = props;
  props.setModalContent(<LoadingIcon />);
  props.setModal(true);

  setFlag("none");

  let body = {};
  body.name = name;
  body.status = parseInt(status);
  body.profileTypeId = parseInt(profileTypeId);
  body.storeId = parseInt(storeId);
  body.type = TYPE;

  //POST form values
  const res = await fetch(`/api/profilegroups/${props.data.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  //workflow success or fail
  if (res.status < 300) {
    //Await for data for any desirable next steps
    const r = await res.json();

    //some data process flow controls
    props.setModalContent(<CheckIcon />);
    setTimeout(() => {
      router.push("/panel/profilegroups");
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
