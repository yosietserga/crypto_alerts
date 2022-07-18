import { useState, useEffect, useCallback } from "react";
import InputSelect from "../../../components/layout/fields/inputSelect";

export default function FieldPerson(props) {
  const { handler, value } = props;
  const [options, setOptions] = useState([]);

  const fetchCustomers = useCallback(() => {
    fetch("/api/persons")
      .then((resp) => resp.json())
      .then((resp) => {
        if (resp) {
          setOptions(
            resp.map((opt) => {
              return {
                label:
                  opt.firstname + " " + opt.lastname + " <" + opt.email +">",
                key: opt.uuid,
                value: opt.id,
              };
            })
          );
        } else {
          setOptions([]);
        }
      });
  }, [setOptions]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return (
    <>
      <InputSelect
        handler={handler}
        value={value}
        options={options}
        form="profiles"
        label="Person"
        fieldName="personId"
      />
    </>
  );
}
