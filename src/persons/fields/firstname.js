import InputText from "../../../components/layout/fields/inputText";

export default function FieldFirstname(props) {
  const { handler, value } = props;

  return (
    <>
      <InputText
        handler={handler}
        value={value}
        form="persons"
        label="Nombres"
        fieldName="firstname"
        placeholder="Ingresa los nombres"
      />
    </>
  );
}
