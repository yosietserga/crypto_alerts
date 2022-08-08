import { useState, useEffect, useCallback, useContext } from "react";
import { StoreContext } from "../../../context/store";
import { isset, empty } from "../../../utils/common";
import { getProperties, setProperty } from "../../../libs/services/properties";
import { FormGroup, Label, Input } from "reactstrap";

let i=null;

export default function InputProperty(props) {
  const {
    handler,
    value,
    fieldName,
    label,
    placeholder,
    disabled,
    form,
    objectId,
    objectType,
    dataType,
    group,
    __key,
  } = props;

  const [__value, setValue] = useState(value);
  const [__id, setID] = useState(value);

  const store = useContext(StoreContext);

  const __fetch = useCallback(() => {
    console.log(objectId, objectType, group, __key);
    const res = getProperties({
      objectId,
      objectType,
      group,
      key: __key,
    });

    Promise.all([res]).then((property) => {console.log(property);
      setValue(property[0].value);
      setID(property[0].id);
      handler(property[0].value, fieldName);
    });
  }, [setValue, objectId, objectType, group, __key]);

  useEffect(() => { 
    __fetch(); 
  }, [__fetch]);

  if (typeof handler !== "function") return null;
  if (typeof fieldName !== "string") return null;
  if (typeof label !== "string") return null;
  if (typeof objectId !== "number") return null;
  if (typeof objectType !== "string") return null;
  if (typeof group !== "string") return null;
  if (typeof __key !== "string") return null;
  if (empty(objectId)) return null;

  const handleField = (e) => {

      const v = e.target.value;
      handler(v, fieldName);
      setValue(v);
      store.emit("field:update:" + `${form ?? "form"}` + ":" + fieldName, v);
      if (i) {
        clearTimeout(i);
        i = null;
      }
      i = setTimeout(() => {
        save(v);
      }, 1000);
  };

  const save = async (v) => {
    const formData = {};

    formData.objectId = parseInt(objectId);
    formData.objectType = objectType;
    formData.group = group;
    formData.key = __key;
    formData.dataType = dataType;
    formData.value = v;
    
    const result = await setProperty(__id, formData);
    
    store.emit(
      "field:saved:" + `${form ?? "form"}` + ":" + fieldName,
      result
    );
  };

  return (
    <FormGroup>
      {!empty(label) && <Label for={fieldName}>{label}</Label>}
      <Input
        type="text"
        name={fieldName}
        id={fieldName}
        group={`${group}`}
        __key={`${__key}`}
        value={`${__value}`}
        onChange={handleField}
        placeholder={placeholder ?? ""}
        disabled={disabled ?? ""}
      />
    </FormGroup>
  );
}
