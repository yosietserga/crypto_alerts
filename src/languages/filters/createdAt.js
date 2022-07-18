import React from "react";
import { Col, FormGroup, FormText, Label } from "reactstrap";
import DatePicker from  "reactstrap-date-picker";


export default function FilterCreatedAt( props ) {
  const { setFilter } = props;
  const [__filters, setFilters] = React.useState({});
  
  const handleCreatedAtFrom = (iso, formatted) => {
    setFilter(iso, "createdAtFrom");

    setFilters({
      ...__filters,
      ...{ createdAtFrom: iso },
    });
  };
  
  const handleCreatedAtTo = (iso, formatted) => {
    setFilter(iso, "createdAtTo");
    setFilters({
      ...__filters,
      ...{ createdAtTo: iso },
    });
  };

  return (
    <>
      <FormGroup row>
          <Col sm={2}>
            <Label for="createdAt">
              <strong>Create At</strong>
              <br />
              <small>[From, To]</small>
            </Label>
          </Col>
          <Col sm={4}>
            <DatePicker
              id="createdAtFrom"
              value={__filters?.createdAtFrom ?? ""}
              onChange={(isoData, formattedDate) => {
                handleCreatedAtFrom(isoData, formattedDate);
              }}
            />
            <FormText color="muted">From this date and after</FormText>
          </Col>
          <Col sm={4}>
            <DatePicker
              id="createdAtTo"
              value={__filters?.createdAtTo ?? ""}
              onChange={(isoData, formattedDate) => {
                handleCreatedAtTo(isoData, formattedDate);
              }}
            />
            <FormText color="muted">Until this date and before</FormText>
          </Col>
      </FormGroup>
    </>
  );
}