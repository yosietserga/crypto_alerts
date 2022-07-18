import React from "react";
import { Col, FormGroup, FormText, Label, Input } from "reactstrap";

export default function FilterCode(props) {
  const { setFilter } = props;
  const [__filters, setFilters] = React.useState({});

  const handler = (e) => {
    setFilter(e.currentTarget.value, "code");

    setFilters({
      ...__filters,
      ...{ codes: e.currentTarget.value },
    });
  };

  return (
    <>
      <FormGroup row>
        <Col sm={2}>
          <Label for="codes">
            <strong>Folders</strong>
          </Label>
        </Col>
        <Col sm={8}>
          <Input
            id="codes"
            value={__filters?.codes ?? ""}
            onChange={handler}
          />
          <FormText color="muted">Input codes separated with comma</FormText>
        </Col>
      </FormGroup>
    </>
  );
}
