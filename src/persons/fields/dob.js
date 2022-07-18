import InputText from "../../../components/layout/fields/inputText";

export default function FieldDOB(props) {
  const { handler, value } = props;

  return (
    <>
      <InputText
        handler={handler}
        value={value}
        form="persons"
        label="Date Of Birthday"
        fieldName="dateOfBirthday"
        placeholder="Ingresa el dia de nacimiento"
      />
    </>
  );
}
