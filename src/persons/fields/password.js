import InputPassword from "../../../components/layout/fields/inputPassword";

export default function FieldFirstname(props) {
  const { handler, value } = props;

  return (
    <>
      <InputPassword
        handler={handler}
        value={value}
        form="persons"
        label="Password"
        fieldName="password"
      />
    </>
  );
};