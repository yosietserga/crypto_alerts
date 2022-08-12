import React, { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import AdminContainer from "../layout/container";
import CheckIcon from "../../../components/ui/icons/check";
import LoadingIcon from "../../../components/ui/icons/loading";
import UIModal from "../../../components/ui/modal";
import { StoreContext } from "../../../context/store";
import { Row, Table, Button } from "reactstrap";
import modelPosts from "../../../src/posts/models/index";
import PostsEvents from "../../../src/cryptoalerts/listeners/index";

const POST_TYPE = "cryptoalert";

export default function CryptoAlerts() {
  const router = useRouter();
  const store = React.useContext(StoreContext);
  PostsEvents.listen(store);
  let Records = [];

  //modal controls
  const [data, setData] = useState([]);
  const [dataLoaded, setLoaded] = useState(false);
  const [uuid, setUUID] = useState("");
  const [modal, setModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState("");
  const toggle = () => setModal(!modal);

  const loadData = React.useCallback(async () => {
    if (dataLoaded) return; 
    setData(
      await modelPosts.getAll({
        post_type: POST_TYPE,
      })
    );
    setLoaded(true);
  });

  React.useEffect(() => {
    loadData();
  }, [loadData]);
  
  const refreshData = () => {
    router.replace(router.asPath);
  };
  const updateRecord = (e, id) => {
    e.preventDefault();
    router.push(`/panel/alerts/update/${id}`);
  };
  const removeRecord = (e, id) => {
    e.preventDefault();
    setModalTitle("Eliminar");
    setModalContent("¿Está seguro?");
    setModal(true);
    setUUID(id);
  };
  
  const handleDelete = async (d) => {
    console.log(d);

    setModalContent(<LoadingIcon />);
    //POST form values
    const res = await fetch("/api/posts/" + uuid, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uuid,
      }),
    });

    //workflow success or fail
    if (res?.id) {
    }

    if (res.status < 300) {
      setModalContent(<CheckIcon />);
      refreshData();
      setTimeout(() => {
        toggle();
      }, 1200);
      store.emit("post:delete", await res.json());
    } else {
      setModalContent("No se pudo eliminar, por favor intente de nuevo");
    }
    setModal(true);
  };
  if (typeof error == "undefined") {
    if (data.length > 0) {
      Records = data.map((item) => {
        return (
          <tr key={item.uuid}>
            <th scope="row">
              <input type="checkbox" className="hidden" name="records[]" value={item.id} />
            </th>
            <td>{item.ref}</td>
            <td>{item.status}</td>
            <td>
              <button
                className="btn btn-default"
                onClick={(e) => {
                  updateRecord(e, item.id);
                }}
              >
                <i className="fa fa-edit"></i>
              </button>
              <button
                className="btn btn-default"
                onClick={(e) => {
                  removeRecord(e, item.id);
                }}
              >
                <i className="fa fa-trash"></i>
              </button>
            </td>
          </tr>
        );
      });
    } else {
      Records = (
        <tr>
          <td colSpan="4">No se encontraron registros</td>
        </tr>
      );
    }
  } else {
    Records = (
      <tr>
        <td colSpan="4">{error}</td>
      </tr>
    );
  }

  return (
    <AdminContainer>
      <h1>Alertas</h1>

      <UIModal
        props={{
          title: modalTitle,
          content: modalContent,
          btnAccept: handleDelete,
          btnCancel: toggle,
          toggle,
          modal,
        }}
      />

      <Row>
        <Link href="/panel/alerts/create" passHref={true}>
          <Button className="btn btn-default" color="primary">
            Crear Alerta
          </Button>
        </Link>
      </Row>
      <Table hover>
        <thead>
          <tr>
            <th> </th>
            <th>REF</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>{Records}</tbody>
      </Table>
    </AdminContainer>
  );
}