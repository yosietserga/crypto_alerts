import InputText from "../../../components/layout/fields/inputText";

export default function FieldName(props) {
  const { handler, value } = props;

  return (
    <>
      <InputText
        handler={handler}
        value={value}
        form="profiles"
        label="Name"
        fieldName="Name"
        placeholder="Ingresa el nombre del perfil"
      />
    </>
  );
}
