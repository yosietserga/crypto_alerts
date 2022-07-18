import React from "react";
import { Col, FormGroup, FormText, Label, Input } from "reactstrap";

export default function FilterLocale(props) {
  const { setFilter } = props;
  const [__filters, setFilters] = React.useState({});

  const handler = (e) => {
    setFilter(e.currentTarget.value, "locale");

    setFilters({
      ...__filters,
      ...{ locales: e.currentTarget.value },
    });
  };

  return (
    <>
      <FormGroup row>
        <Col sm={2}>
          <Label for="locales">
            <strong>Folders</strong>
          </Label>
        </Col>
        <Col sm={8}>
          <Input
            id="locales"
            value={__filters?.locales ?? ""}
            onChange={handler}
          />
          <FormText color="muted">Input locales separated with comma</FormText>
        </Col>
      </FormGroup>
    </>
  );
}
