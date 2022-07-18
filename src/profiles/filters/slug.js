import React from "react";
import { Col, FormGroup, FormText, Label, Input } from "reactstrap";

export default function FilterSlug(props) {
  const { setFilter } = props;
  const [__filters, setFilters] = React.useState({});

  const handler = (e) => {
    setFilter(e.currentTarget.value, "slug");

    setFilters({
      ...__filters,
      ...{ slugs: e.currentTarget.value },
    });
  };

  return (
    <>
      <FormGroup row>
        <Col sm={2}>
          <Label for="slugs">
            <strong>Slug</strong>
          </Label>
        </Col>
        <Col sm={8}>
          <Input id="slugs" value={__filters?.slugs ?? ""} onChange={handler} />
          <FormText color="muted">
            Input persons slugs separated with comma
          </FormText>
        </Col>
      </FormGroup>
    </>
  );
}
