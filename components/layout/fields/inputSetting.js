import { useState, useEffect, useCallback, useContext } from "react";
import { StoreContext } from "../../../context/store";
import { isset, empty } from "../../../utils/common";
import { getSettings, setSetting } from "../../../libs/services/settings";
import { FormGroup, Label, Input } from "reactstrap";

let i=null;

export default function InputSetting(props) {
  const {
    handler,
    value,
    fieldName,
    label,
    placeholder,
    disabled,
    form,
    storeId,
    dataType,
    group,
    __key,
  } = props;

  const [__value, setValue] = useState(value);
  const [__id, setID] = useState(value);

  const store = useContext(StoreContext);

  const __fetch = useCallback(() => {
    const res = getSettings({
      storeId,
      group,
      key: __key,
    });

    Promise.all([res]).then((property) => {
      setValue(property[0].value);
      setID(property[0].id);
    });
  }, [setValue, storeId, group, __key]);

  useEffect(() => { 
    __fetch(); 
  }, [__fetch]);

  if (typeof handler !== "function") return null;
  if (typeof fieldName !== "string") return null;
  if (typeof label !== "string") return null;
  if (typeof storeId !== "number") return null;
  if (typeof group !== "string") return null;
  if (typeof __key !== "string") return null;
  if (empty(storeId)) return null;

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

    formData.storeId = parseInt(storeId);
    formData.group = group;
    formData.key = __key;
    formData.dataType = dataType;
    formData.value = v;
    
    const result = await setSetting(__id, formData);
    
    store.emit(
      "field:saved:" + `${form ?? "form"}` + ":" + fieldName,
      result
    );
  };

  return (
    <FormGroup>
      <Label for={fieldName}>{label}</Label>
      <Input
        type="text"
        storeId={storeId}
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
