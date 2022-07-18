import React from "react";
import { Col, FormGroup, FormText, Label, Input } from "reactstrap";

export default function FilterFolder(props) {
  const { setFilter } = props;
  const [__filters, setFilters] = React.useState({});

  const handler = (e) => {
    setFilter(e.currentTarget.value, "folder");

    setFilters({
      ...__filters,
      ...{ folders: e.currentTarget.value },
    });
  };

  return (
    <>
      <FormGroup row>
        <Col sm={2}>
          <Label for="folders">
            <strong>Folders</strong>
          </Label>
        </Col>
        <Col sm={8}>
          <Input
            id="folders"
            value={__filters?.folders ?? ""}
            onChange={handler}
          />
          <FormText color="muted">
            Input folders names separated with comma
          </FormText>
        </Col>
      </FormGroup>
    </>
  );
}
