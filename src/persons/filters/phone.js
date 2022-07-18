import React from "react";
import { Col, FormGroup, FormText, Label, Input } from "reactstrap";

export default function FilterName(props) {
  const { setFilter } = props;
  const [__filters, setFilters] = React.useState({});

  const handler = (e) => {
    setFilter(e.currentTarget.value, "phone");

    setFilters({
      ...__filters,
      ...{ phones: e.currentTarget.value },
    });
  };

  return (
    <>
      <FormGroup row>
        <Col sm={2}>
          <Label for="phones">
            <strong>Phone</strong>
          </Label>
        </Col>
        <Col sm={8}>
          <Input id="phones" value={__filters?.phones ?? ""} onChange={handler} />
          <FormText color="muted">
            Input persons phones separated with comma
          </FormText>
        </Col>
      </FormGroup>
    </>
  );
}
