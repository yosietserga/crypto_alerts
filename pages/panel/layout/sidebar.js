import React from "react";
import {
  ListGroup,
  ListGroupItem,
  Nav,
  NavItem,
  NavLink,
  UncontrolledCollapse,
} from "reactstrap";
import ThemeSwitcher from "../../../components/ui/themeSwitcher";

// Menus
const MENUS = [
  {
    name: "dashboard",
    as: "a",
    href: "/panel",
    label: "Dashboard",
    icon: "fas fa-chart-pie",
  },
  {
    name: "alerts",
    as: "a",
    href: "/panel/alerts",
    label: "Alerts",
    icon: "fas fa-clone",
  },
  {
    name: "profiletypes",
    as: "a",
    href: "/panel/profiletypes",
    label: "Tipos de Perfiles",
    icon: "fas fa-user",
  },
  {
    name: "profilegroups",
    as: "a",
    href: "/panel/profilegroups",
    label: "Grupos de Perfiles",
    icon: "fas fa-user",
  },
  {
    name: "persons",
    as: "a",
    href: "/panel/persons",
    label: "Persons",
    icon: "fas fa-user",
  },
  {
    name: "profiles",
    as: "a",
    href: "/panel/profiles",
    label: "Profiles",
    icon: "fas fa-user",
  },
  {
    name: "stores",
    as: "a",
    href: "/panel/stores",
    label: "Stores",
    icon: "fas fa-user",
  },
  {
    name: "languages",
    as: "a",
    href: "/panel/languages",
    label: "Language",
    icon: "fas fa-user",
  },
  {
    name: "whatsapp_accounts",
    as: "a",
    href: "/panel/whatsapps",
    label: "Whatsapp Accounts",
    icon: "fas fa-user",
  },
  {
    name: "settings",
    as: "a",
    href: "/panel/settings",
    label: "Settings",
    icon: "fas fa-user",
  },
];

//TODO: load menu from DB 
//TODO: check modules status before show it 
function SideBar(props) {
  const { activeLink, session } = props;
  
  return (
    <>
      <ThemeSwitcher />
      <h4 className="headline">Menu</h4>
      <div className="wrapper-list-group">
        <ListGroup flush className="list-group-nav-left" tag="div">
          {MENUS.map((item, k) => {
            const isActive = activeLink === item.name ? true : false;
            return (
              <ListGroupItem
                key={`l${k}`}
                active={isActive}
                tag={item.as}
                href={item.href}
              >
                {item.icon && <i className={item.icon}></i>} {item.label}
              </ListGroupItem>
            );
          })}
        </ListGroup>
      </div>
       </>
  );
}

export default SideBar;
