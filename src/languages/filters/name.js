import React from "react";
import { Col, FormGroup, FormText, Label, Input } from "reactstrap";

export default function FilterName(props) {
  const { setFilter } = props;
  const [__filters, setFilters] = React.useState({});

  const handler = (e) => {
    setFilter(e.currentTarget.value, "name");

    setFilters({
      ...__filters,
      ...{ names: e.currentTarget.value },
    });
  };

  return (
    <>
      <FormGroup row>
        <Col sm={2}>
          <Label for="names">
            <strong>Folders</strong>
          </Label>
        </Col>
        <Col sm={8}>
          <Input
            id="names"
            value={__filters?.names ?? ""}
            onChange={handler}
          />
          <FormText color="muted">Input names separated with comma</FormText>
        </Col>
      </FormGroup>
    </>
  );
}
