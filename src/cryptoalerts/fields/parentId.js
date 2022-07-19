import { useState, useEffect, useCallback } from "react";
import InputSelect from "../../../components/layout/fields/inputSelect";

const POST_TYPE = "post";

export default function FieldParent(props) {
  const { handler, value } = props;
  const [options, setOptions] = useState([]);

  const fetchCustomers = useCallback(() => {
    fetch("/api/posts?where="+ JSON.stringify({post_type:POST_TYPE}))
      .then((resp) => resp.json())
      .then((resp) => {
        if (resp) {
          setOptions(
            resp.map((opt) => {
              return {
                label: opt.name,
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
        form="posts"
        label="Parent"
        fieldName="parentId"
      />
    </>
  );
}
