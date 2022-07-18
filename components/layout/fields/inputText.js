import { useState, useContext } from "react";
import { StoreContext } from "../../../context/store";
import {
  FormGroup,
  Label,
  Input,
} from "reactstrap";

export default function InputText(props) {
  const { handler, value, fieldName, label, placeholder, disabled, form } = props;

  const [__value, setValue] = useState( value );

  const store = useContext( StoreContext );
  
  if (typeof handler !== "function") return null;
  if (typeof fieldName !== "string") return null;
  if (typeof label !== "string") return null;

  const handleField = (e) => {
    const v = e.target.value;
    handler(v, fieldName);
    setValue(v);
    store.emit("field:update:" + `${form ?? "form"}` + ":" + fieldName, v);
  };

  return (
    <FormGroup>
      <Label for={fieldName}>{label}</Label>
      <Input
        type="text"
        name={fieldName}
        id={fieldName}
        value={`${value}`}
        onChange={handleField}
        placeholder={placeholder??""}
        disabled={disabled??""}
      />
    </FormGroup>
  );
};