import InputText from "../../../components/layout/fields/inputText";

export default function FieldImage(props) {
  const { handler, value } = props;

  return (
    <>
      <InputText
        handler={handler}
        value={value}
        form="posts"
        label="Image"
        fieldName="image"
        placeholder=""
      />
    </>
  );
}
