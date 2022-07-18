import React from "react";
import { Col, FormGroup, FormText, Label, Input } from "reactstrap";

export default function FilterEmail(props) {
  const { setFilter } = props;
  const [__filters, setFilters] = React.useState({});

  const handler = (e) => {
    setFilter(e.currentTarget.value, "email");

    setFilters({
      ...__filters,
      ...{ emails: e.currentTarget.value },
    });
  };

  return (
    <>
      <FormGroup row>
        <Col sm={2}>
          <Label for="emails">
            <strong>Email</strong>
          </Label>
        </Col>
        <Col sm={8}>
          <Input id="emails" value={__filters?.emails ?? ""} onChange={handler} />
          <FormText color="muted">
            Input persons emails separated with comma
          </FormText>
        </Col>
      </FormGroup>
    </>
  );
}
