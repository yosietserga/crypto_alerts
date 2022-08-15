import React, { useState, useEffect, memo, useContext } from "react";
import {
  Row, Col,
  Collapse,
  Navbar,
  Button,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  NavbarText,
} from "reactstrap";
import { StoreContext } from "../../../context/store";
import Img from "../../../components/image";

function NavBar(props) {
  const { session } = props;
  const [toggled, setToggled] = useState();
  const store = useContext(StoreContext);

  const handleToggle = () => {
    store.emit("sidebar:toggle", !toggled);
    setToggled(!toggled);
  }
  
  return (
    <div>
      <Navbar color="dark" dark expand="sm" fixed="top" className="shadow">
        <NavbarBrand href="/panel">
          <Col sm={3} className="h-[42px]">
            <Img s="logo/logo.png" a="Logo" c="admin-logo" w={44} h={58} />
          </Col>
        </NavbarBrand>
        <Button onClick={handleToggle}>
          <i className="fas fa-bars"></i>
        </Button>
        <Collapse isOpen={props.isOpen} navbar>
          <Nav className="mr-auto" navbar>
            <NavItem>
              <NavLink href="/panel/alerts">Alerts</NavLink>
            </NavItem>
            <UncontrolledDropdown nav inNavbar>
              <DropdownToggle nav caret>
                Users
              </DropdownToggle>
              <DropdownMenu end>
                <DropdownItem tag="div">
                  <NavLink
                    href="/panel/persons/create"
                    className="text-primary"
                  >
                    Create User
                  </NavLink>
                </DropdownItem>
                <DropdownItem tag="div">
                  <NavLink href="/panel/persons" className="text-primary">
                    All Users
                  </NavLink>
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          </Nav>
          <UncontrolledDropdown inNavbar>
            <DropdownToggle caret nav className="text-secondary">
              <NavbarText className="align-self-center text-left font-weight-bold">
                {session?.user?.name ?? `Mi Cuenta`}
              </NavbarText>
            </DropdownToggle>
            <DropdownMenu>
              <DropdownItem tag="div">
                <a
                  href="#"
                  className="text-dark"
                  onClick={() => {
                    props.signOut();
                  }}
                >
                  <i className="fas fa-home"></i>
                  &nbsp;Cerrar Sesión
                </a>
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </Collapse>
      </Navbar>
    </div>
  );
}

export default NavBar;
