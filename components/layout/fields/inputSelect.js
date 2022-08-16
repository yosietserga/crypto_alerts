import { useState, useContext } from "react";
import { StoreContext } from "../../../context/store";
import { empty } from "../../../utils/common";
import {
  FormGroup,
  Label,
  Input,
} from "reactstrap";

export default function InputSelect(props) {
  const { handler, value, fieldName, label, placeholder, disabled, options, form } = props;

  const [__value, setValue] = useState( value );

  const store = useContext( StoreContext );
  
  if (typeof handler !== "function") return null;
  if (!Array.isArray(options)) return null;
  if (typeof fieldName !== "string") return null;
  if (typeof label !== "string") return null;

  const handleField = (e) => {
    const v = e.target.value;
    handler(v, fieldName);
    setValue(v);
    store.emit("field:update:"+ `${form ?? "form"}` +":"+ fieldName, v);
  };

  return (
    <FormGroup>
      {!empty(label) && <Label for={fieldName}>{label}</Label>}
      <Input
        type="select"
        autoFocus
        name={fieldName}
        id={fieldName}
        value={`${value}`}
        onChange={handleField}
        placeholder={placeholder ?? ""}
        disabled={disabled ?? ""}
      >
        <option key={"none"} value={0}>
          Seleccione una opción
        </option>
        {options.map((opt) => {
          return (
            <option key={opt.key} value={opt.value}>
              {opt.label}
            </option>
          );
        })}
      </Input>
    </FormGroup>
  );
};