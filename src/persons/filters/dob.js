import React from "react";
import { Col, FormGroup, FormText, Label } from "reactstrap";
import DatePicker from  "reactstrap-date-picker";


export default function FilterDOB( props ) {
  const { setFilter } = props;
  const [__filters, setFilters] = React.useState({});
  
  const handleMtCreateAtFrom = (iso, formatted) => {
    setFilter(iso, "dateOfBirthdayFrom");
    
    setFilters({
      ...__filters,
      ...{ dateOfBirthdayFrom: iso },
    });
  };
  
  const handleMtCreateAtTo = (iso, formatted) => {
    setFilter(iso, "dateOfBirthdayTo");
    setFilters({
      ...__filters,
      ...{ dateOfBirthdayTo: iso },
    });
  };

  return (
    <>
      <FormGroup row>
          <Col sm={2}>
            <Label for="dateOfBirthday">
              <strong>Date Of Birthday</strong>
              <br />
              <small>[From, To]</small>
            </Label>
          </Col>
          <Col sm={4}>
            <DatePicker
              id="dateOfBirthdayFrom"
              value={__filters?.dateOfBirthdayFrom ?? ""}
              onChange={(isoData, formattedDate) => {
                handleMtCreateAtFrom(isoData, formattedDate);
              }}
            />
            <FormText color="muted">From this date and after</FormText>
          </Col>
          <Col sm={4}>
            <DatePicker
              id="dateOfBirthdayTo"
              value={__filters?.dateOfBirthdayTo ?? ""}
              onChange={(isoData, formattedDate) => {
                handleMtCreateAtTo(isoData, formattedDate);
              }}
            />
            <FormText color="muted">Until this date and before</FormText>
          </Col>
      </FormGroup>
    </>
  );
}