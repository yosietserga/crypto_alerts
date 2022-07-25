import InputText from "../../../components/layout/fields/inputText";

export default function FieldRef(props) {
  const { handler, value } = props;

  return (
    <>
      <InputText
        handler={handler}
        value={value}
        form="posts"
        label="REF"
        fieldName="ref"
        placeholder="Ingresa referencia"
      />
    </>
  );
}
