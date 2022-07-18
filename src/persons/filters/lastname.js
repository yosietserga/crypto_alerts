import React from "react";
import { Col, FormGroup, FormText, Label, Input } from "reactstrap";

export default function FilterLastname(props) {
  const { setFilter } = props;
  const [__filters, setFilters] = React.useState({});

  const handler = (e) => {
    setFilter(e.currentTarget.value, "lastname");

    setFilters({
      ...__filters,
      ...{ lastnames: e.currentTarget.value },
    });
  };

  return (
    <>
      <FormGroup row>
        <Col sm={2}>
          <Label for="lastnames">
            <strong>Lastname</strong>
          </Label>
        </Col>
        <Col sm={8}>
          <Input id="lastnames" value={__filters?.lastnames ?? ""} onChange={handler} />
          <FormText color="muted">
            Input persons lastnames separated with comma
          </FormText>
        </Col>
      </FormGroup>
    </>
  );
}
