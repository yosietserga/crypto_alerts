import InputText from "../../../components/layout/fields/inputText";

export default function FieldUsername(props) {
  const { handler, value } = props;

  return (
    <>
      <InputText
        handler={handler}
        value={value}
        form="persons"
        label="Username"
        fieldName="username"
        placeholder=""
      />
    </>
  );
}
