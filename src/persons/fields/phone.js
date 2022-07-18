import InputText from "../../../components/layout/fields/inputText";

export default function FieldPhone(props) {
  const { handler, value } = props;

  return (
    <>
      <InputText
        handler={handler}
        value={value}
        form="persons"
        label="Phone"
        fieldName="phone"
        placeholder="Ingresa tel&eacute;fono"
      />
    </>
  );
}
