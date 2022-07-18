import InputContent from "../../../components/layout/fields/inputContent";

export default function FieldSeoTitle(props) {
  const { handler, value, languageId, objectId, objectType } = props;

  return (
    <>
      <InputContent
        handler={handler}
        value={value}
        languageId={parseInt(languageId)}
        objectId={parseInt(objectId)}
        objectType={objectType}
        form="posts"
        label="SEO Title"
        fieldName="seoTitle"
        placeholder=""
      />
    </>
  );
}
