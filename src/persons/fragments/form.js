import { ucfirst, isset, empty, getVar, encrypt } from "../../../utils/common";
import Link from "next/link";
import CheckIcon from "../../../components/ui/icons/check";
import LoadingIcon from "../../../components/ui/icons/loading";
import { Form, Button } from "reactstrap";
import FieldStatus from "../fields/status";
import FieldFirstname from "../fields/firstname";
import FieldLastname from "../fields/lastname";
import FieldEmail from "../fields/email";
import FieldPhone from "../fields/phone";
import FieldGOB from "../fields/gob";
import FieldDOB from "../fields/dob";
import FieldGender from "../fields/gender";
import FieldPassword from "../fields/password";
import FieldStore from "../fields/storeId";
import FieldUsername from "../fields/username";

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
          <FieldFirstname value={props.firstname} handler={handler} />
          <FieldLastname value={props.lastname} handler={handler} />
          <FieldDOB value={props.dateOfBirthday} handler={handler} />
          <FieldGOB value={props.genderOfBirthday} handler={handler} />
          <FieldGender value={props.gender} handler={handler} />
          <FieldEmail value={props.email} handler={handler} />
          <FieldPhone value={props.phone} handler={handler} />
          <FieldUsername value={props.username} handler={handler} />
          <FieldPassword value={props.password} handler={handler} />
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
          <Link href="/panel/persons" passHref={true}>
            <Button className="btn btn-default">Cancelar</Button>
          </Link>
        </Form>
      );
    },
    onSubmit: async (e, props) => {
      e.preventDefault();

      const {
        firstname,
        lastname,
        email,
        phone,
        username,
        password,
        dateOfBirthday,
        genderOfBirthday,
        gender,
        status,
        setFlag,
        router,
        storeId,
      } = props;

      props.setModalContent(<LoadingIcon />);
      props.setModal(true);

      setFlag("none");

      let encrypted = encrypt(password);

      const formData = {};

      if (!empty(firstname)) formData.firstname = firstname;
      if (!empty(lastname)) formData.lastname = lastname;
      if (!empty(email)) formData.email = email;
      if (!empty(phone)) formData.phone = phone;
      if (!empty(username)) formData.username = username;
      if (!empty(password)) formData.password = encrypted;
      if (!empty(gender)) formData.gender = gender;
      if (!empty(genderOfBirthday))
        formData.genderOfBirthday = genderOfBirthday;
      if (!empty(dateOfBirthday)) formData.dateOfBirthday = dateOfBirthday;
      if (!empty(storeId)) formData.storeId = parseInt(storeId);
      if (!empty(status)) formData.status = parseInt(status);

      //POST form values
      const res = await fetch("/api/persons", {
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
          router.push("/panel/persons");
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
    firstname,
    lastname,
    email,
    phone,
    username,
    password,
    dateOfBirthday,
    genderOfBirthday,
    gender,
    status,
    setFlag,
    router,
    storeId,
  } = props;
  props.setModalContent(<LoadingIcon />);
  props.setModal(true);

  setFlag("none");

  let encrypted = encrypt(password);

  const formData = {};

  if (!empty(firstname)) formData.firstname = firstname;
  if (!empty(lastname)) formData.lastname = lastname;
  if (!empty(email)) formData.email = email;
  if (!empty(phone)) formData.phone = phone;
  if (!empty(username)) formData.username = username;
  if (!empty(password)) formData.password = encrypted;
  if (!empty(gender)) formData.gender = gender;
  if (!empty(genderOfBirthday)) formData.genderOfBirthday = genderOfBirthday;
  if (!empty(dateOfBirthday)) formData.dateOfBirthday = dateOfBirthday;
  if (!empty(storeId)) formData.storeId = parseInt(storeId);
  if (!empty(status)) formData.status = parseInt(status);

  //POST form values
  const res = await fetch(`/api/persons/${props.data.id}`, {
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
      router.push("/panel/persons");
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