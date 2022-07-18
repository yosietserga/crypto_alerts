import InputText from "../../../components/layout/fields/inputText";

export default function FieldCode(props) {
  const { handler, value } = props;

  return (
    <>
      <InputText
        handler={handler}
        value={value}
        form="languages"
        label="ISO Code"
        fieldName="code"
        placeholder="Ingresa iso code"
      />
    </>
  );
}
