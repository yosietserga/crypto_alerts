import React from "react";
import Link from "next/link";
import {
  ProSidebar,
  Menu,
  MenuItem,
  SubMenu,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
} from "react-pro-sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-solid-svg-icons";
import ThemeSwitcher from "../../../components/ui/themeSwitcher";
import { empty } from "../../../utils/common";
import { StoreContext } from "../../../context/store";
import "react-pro-sidebar/dist/css/styles.css";

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
    children: [
      {
        href: "/panel/settings",
        label: "Settings",
        icon: "fas fa-user",
      },
    ],
  },
];

//TODO: load menu from DB 
//TODO: check modules status before show it 
function SideBar(props) {
  const { activeLink } = props;
  const store = React.useContext(StoreContext);

  const [collapsed, setCollapsed] = React.useState();
  const [toggled, setToggled] = React.useState();

  store.on("sidebar:toggle", (t) => {
    //setToggled(t);
    setCollapsed(t);
  });

  return (
    <>
      <ProSidebar
        collapsed={collapsed}
        toggled={toggled}
        breakPoint="md"
        onToggle={setToggled}
      >
        <SidebarHeader>
          <div className={`px-[5px] py-[10px]`}>
            <ThemeSwitcher />
          </div>
        </SidebarHeader>

        <SidebarContent>
          {MENUS.map((item, k) => {
            const isActive = activeLink === item.name ? true : false;
            return (
                <Menu iconShape="circle" key={k+item.label}>
                  {!empty(item?.children) && (
                    <>
                      <SubMenu
                        icon={item?.icon ? <i className={item.icon}></i> : ""}
                        sufix={item?.sufix ?? ""}
                        prefix={item?.prefix ?? ""}
                        title={item.label}
                      >
                        {item.children.map((subitem, ke) => {
                          return (
                              <MenuItem key={ke+subitem.label}>
                                <Link href={subitem.href}>
                                  <a>
                                    {item?.icon ? (
                                      <i className={item.icon}></i>
                                    ) : (
                                      ""
                                    )}{" "}
                                    {subitem.label}
                                  </a>
                                </Link>
                              </MenuItem>
                          );
                        })}
                      </SubMenu>
                    </>
                  )}
                  {empty(item?.children) && (
                    <MenuItem
                      icon={item?.icon ? <i className={item.icon}></i> : ""}
                      sufix={item?.sufix ?? ""}
                      prefix={item?.prefix ?? ""}
                    >
                      {item?.href && (
                        <Link href={item.href}>
                          <a>{item.label}</a>
                        </Link>
                      )}
                      {!item?.href && item.label}
                    </MenuItem>
                  )}
                </Menu>
            );
          })}
        </SidebarContent>

        <SidebarFooter style={{ textAlign: "center" }}>
          <div
            className="sidebar-btn-wrapper"
            style={{
              padding: "20px 24px",
            }}
          >
            <a
              href="https://github.com/yosietserga/crypto_alerts"
              target="_blank"
              className="sidebar-btn"
              rel="noopener noreferrer"
            >
              <FontAwesomeIcon icon={faGithub} />
              <span
                style={{
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                }}
              >
                {" View Source Code"}
              </span>
            </a>
          </div>
        </SidebarFooter>
      </ProSidebar>
    </>
  );
}

export default SideBar;
