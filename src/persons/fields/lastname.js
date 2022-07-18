import InputText from "../../../components/layout/fields/inputText";

export default function FieldLastname(props) {
  const { handler, value } = props;

  return (
    <>
      <InputText
        handler={handler}
        value={value}
        form="persons"
        label="Apellidos"
        fieldName="lastname"
        placeholder="Ingresa los apellidos"
      />
    </>
  );
}
