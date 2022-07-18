import React from "react";
import { Col, FormGroup, FormText, Label } from "reactstrap";
import DatePicker from  "reactstrap-date-picker";


export default function FilterUpdatedAt( props ) {
  const { setFilter } = props;
  const [__filters, setFilters] = React.useState({});
  
  const handleUpdatedAtFrom = (iso, formatted) => {
    setFilter(iso, "updatedAtFrom");

    setFilters({
      ...__filters,
      ...{ updatedAtFrom: iso },
    });
  };
  
  const handleUpdatedAtTo = (iso, formatted) => {
    setFilter(iso, "updatedAtTo");
    setFilters({
      ...__filters,
      ...{ updatedAtTo: iso },
    });
  };

  return (
    <>
      <FormGroup row>
          <Col sm={2}>
            <Label for="updatedAt">
              <strong>Create At</strong>
              <br />
              <small>[From, To]</small>
            </Label>
          </Col>
          <Col sm={4}>
            <DatePicker
              id="updatedAtFrom"
              value={__filters?.updatedAtFrom ?? ""}
              onChange={(isoData, formattedDate) => {
                handleUpdatedAtFrom(isoData, formattedDate);
              }}
            />
            <FormText color="muted">From this date and after</FormText>
          </Col>
          <Col sm={4}>
            <DatePicker
              id="updatedAtTo"
              value={__filters?.updatedAtTo ?? ""}
              onChange={(isoData, formattedDate) => {
                handleUpdatedAtTo(isoData, formattedDate);
              }}
            />
            <FormText color="muted">Until this date and before</FormText>
          </Col>
      </FormGroup>
    </>
  );
}