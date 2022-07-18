import React from "react";
import { Col, FormGroup, FormText, Label, Input } from "reactstrap";

export default function FilterFirstname(props) {
  const { setFilter } = props;
  const [__filters, setFilters] = React.useState({});

  const handler = (e) => {
    setFilter(e.currentTarget.value, "firstname");

    setFilters({
      ...__filters,
      ...{ firstnames: e.currentTarget.value },
    });
  };

  return (
    <>
      <FormGroup row>
        <Col sm={2}>
          <Label for="firstnames">
            <strong>Firstname</strong>
          </Label>
        </Col>
        <Col sm={8}>
          <Input id="firstnames" value={__filters?.firstnames ?? ""} onChange={handler} />
          <FormText color="muted">
            Input persons firstnames separated with comma
          </FormText>
        </Col>
      </FormGroup>
    </>
  );
}
