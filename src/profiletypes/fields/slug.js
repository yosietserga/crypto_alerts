import InputText from "../../../components/layout/fields/inputText";

export default function FieldSlug(props) {
  const { handler, value } = props;

  return (
    <>
      <InputText
        handler={handler}
        value={value}
        form="profiletypes"
        label="Slug"
        fieldName="slug"
        placeholder="Ingresa slug del tipo de perfil"
      />
    </>
  );
}
