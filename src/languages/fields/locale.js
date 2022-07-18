import InputText from "../../../components/layout/fields/inputText";

export default function FieldLocale(props) {
  const { handler, value } = props;

  return (
    <>
      <InputText
        handler={handler}
        value={value}
        form="languages"
        label="Locale"
        fieldName="locale"
        placeholder=""
      />
    </>
  );
}
