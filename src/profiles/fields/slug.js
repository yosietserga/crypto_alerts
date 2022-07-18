import InputText from "../../../components/layout/fields/inputText";

export default function FieldSlug(props) {
  const { handler, value } = props;

  return (
    <>
      <InputText
        handler={handler}
        value={value}
        form="profiles"
        label="Slug"
        fieldName="slug"
        placeholder="Ingresa el slug o namespace"
      />
    </>
  );
}
