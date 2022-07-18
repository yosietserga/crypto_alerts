import InputText from "../../../components/layout/fields/inputText";

export default function FieldName(props) {
  const { handler, value } = props;

  return (
    <>
      <InputText
        handler={handler}
        value={value}
        form="languages"
        label="Name"
        fieldName="name"
        placeholder="Ingresa el name"
      />
    </>
  );
}
