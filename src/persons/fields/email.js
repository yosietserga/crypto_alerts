import InputText from "../../../components/layout/fields/inputText";

export default function FieldEmail(props) {
  const { handler, value } = props;

  return (
    <>
      <InputText
        handler={handler}
        value={value}
        form="persons"
        label="Email"
        fieldName="email"
        placeholder="Ingresa el email"
      />
    </>
  );
}
