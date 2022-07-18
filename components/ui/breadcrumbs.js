import React from "react";
import Link from "next/link";
import { Breadcrumb, BreadcrumbItem } from "reactstrap";

export default function NextBreadcrumbs({ breadcrumbs }) {
  if (!breadcrumbs) return false;

  return (
    <div className="">
      <Breadcrumb aria-label="breadcrumb" tag="nav" className="breadcrumbs">
        {breadcrumbs.map((crumb, idx) => (
          <Crumb {...crumb} key={idx} last={idx === breadcrumbs.length - 1} />
        ))}
      </Breadcrumb>
    </div>
  );
}

function Crumb( props ) {
  if (props.last) {
    return (
      <BreadcrumbItem>
        <a
          onClick={() => {
            return false;
          }}
          className="current"
        >
          {props.text}
        </a>
      </BreadcrumbItem>
    );
  }

  return (
    <BreadcrumbItem>
      <Link underline="hover" color="inherit" href={"/panel/"+props.href}>
        {props.text}
      </Link>
    </BreadcrumbItem>
  );
}