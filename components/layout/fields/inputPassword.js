import { useState, useContext } from "react";
import { StoreContext } from "../../../context/store";
import {
  FormGroup,
  Label,
  Input,
  Button
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export default function InputText(props) {
  const { handler, value, fieldName, label, placeholder, disabled } = props;

  const [__value, setValue] = useState( value );
  const [visible, setVisible] = useState( false );

  const store = useContext( StoreContext );
  
  if (typeof handler !== "function") return null;
  if (typeof fieldName !== "string") return null;
  if (typeof label !== "string") return null;

  const handleField = (e) => {
    const v = e.target.value;
    handler(v, fieldName);
    setValue(v);
    store.emit("field:update:mtaccount:"+ fieldName, v);
  };

  return (
    <FormGroup>
      <Label for={fieldName}>{label}</Label>
      <Input
        type={visible?"text":"password"}
        name={fieldName}
        id={fieldName}
        value={`${value}`}
        onChange={handleField}
        placeholder={placeholder??""}
        disabled={disabled??""}
      />
      <Button onClick={()=> {setVisible(!visible)}} className="btn btn-primary h-10 w-10">
        <FontAwesomeIcon icon={visible?faEyeSlash:faEye} size="sm" />
      </Button>
    </FormGroup>
  );
};