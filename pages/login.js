import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Container from "../components/layout/container";
import { log, encrypt, decrypt, getCookie, setCookie } from "../utils/common";
import CheckIcon from "../components/ui/icons/check";
import LoadingIcon from "../components/ui/icons/loading";
import UIModal from "../components/ui/modal";

export default function Login(data) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [encryptedPwd, setEncryptedPwd] = useState("");

  const inputEmail = useRef(null);
  const inputPassword = useRef(null);

  //modal controls
  const [modal, setModal] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const toggle = () => setModal(!modal);
  const [session, setSession] = useState(false);

  const goToDashboard = () => {
    
    if (typeof window != 'undefined') window.location.href = "/panel";
    else router.push("/panel");
  };
 
  useEffect(() => {
    fetch("/api/auth/session")
      .then((resp) => {
        return resp.json();
      })
      .then((data) => {
        log({ data });
        if (typeof data.user != 'undefined' && data.user?.id) {
          setModal(true);
          setModalContent('Cargando...');
          setSession(data.user);
        } else {
          setSession(null);
        }
      });
  }, [setSession]);

  const onSubmit = async (e) => {
    e.preventDefault();

    setModal(true);
    setModalContent('Cargando...');

    //Validation
    if (!email || !email.includes("@") || !password) {
      log("Invalid details");
      setModalContent("Debe ingresar ambos datos de manera correcta");
      return;
    }
    let pass = inputPassword.current.value;
    let encrypted = encrypt(pass);
    setPassword(pass);
    setEncryptedPwd(encrypted);

    //POST form values
    const res = await fetch("/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password: encrypted,
      }),
    });

    //Await for data for any desirable next steps
    const r = await res.json();

    //workflow success or fail
    if (res.status < 300 && r.result == "OK" && !!r?.payload?.uuid) {
      //setModalContent(<CheckIcon />);
      //TODO: rewrite the oauth token flow
      setCookie("accessToken", r.payload.accessToken);
      setCookie("uuid", r.payload.uuid);

      const urlParams = new URLSearchParams(window.location.search);
      const callbackUrl = urlParams.get("callbackUrl");

      window.location.href = callbackUrl ?? "/panel";
    } else {
      //fail
      setModalContent("No se ha podido iniciar sesión, por favor intente de nuevo");
      console.log("Login fail " + JSON.stringify(r));
    }
  };

  const handleEmail = (e) => {
    e.preventDefault();
    setEmail(e.currentTarget.value);
  };

  const handlePassword = (e) => {
    e.preventDefault();
    setPassword(e.currentTarget.value);
  };

  if (!session) {
    // If no session exists, display login form
    return (
      <Container className="modal-login" pageProps={{ session: 0 }}>
        <UIModal

          props={{
            title: "Inicio de Sesión",
            content: modalContent,
            btnAccept: toggle,
            toggle,
            modal,
          }}
        />
        <div className="login-area area-padding-2 pt130">
          <div className="container">
            <div className="row">
              <div className="col-md-offset-3 col-md-6 col-sm-12 col-xs-12">
                <div className="section-headline text-center">
                  <h3>Iniciar Sesión</h3>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Email"
                    value={email}
                    onChange={handleEmail}
                    ref={inputEmail}
                  />
                  <br />
                  <input
                    type="password"
                    className="form-control"
                    placeholder="********"
                    value={password}
                    onChange={handlePassword}
                    ref={inputPassword}
                  />
                  <br />
                  <button
                    className="ab-btn left-ab-btn btn-service"
                    onClick={onSubmit}
                  >
                    Enviar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    );
  } else {
    //redirect to panel dashboard
    goToDashboard();
    return (
      <>
        <div>Redirecting to Dashboard...</div>
      </>
    );
  }
}
