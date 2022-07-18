import React from "react";
import { Col, FormGroup, FormText, Label, Input } from "reactstrap";


export default function FilterID( props ) {
  const { setFilter } = props;
  const [__filters, setFilters] = React.useState({});
  
  const handler = (e) => {
    setFilter(e.currentTarget.value, "id");

    setFilters({
      ...__filters,
      ...{ accounts: e.currentTarget.value },
    });
  };
  
  return (
    <>
      <FormGroup row>
        <Col sm={2}>
          <Label for="id">
            <strong>IDs</strong>
          </Label>
        </Col>
        <Col sm={8}>
          <Input
            id="id"
            value={__filters?.id ?? ""}
            onChange={handler}
          />
          <FormText color="muted">Input IDs numbers separated with comma</FormText>
        </Col>
      </FormGroup>
    </>
  );
}