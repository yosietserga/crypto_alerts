import InputProperty from "../../../components/layout/fields/inputProperty";

export default function FieldSymbol(props) {
  const { handler, objectId, objectType, dataType, group, __key, value } =
    props;

  return (
    <>
      <InputProperty
        type="string"
        handler={handler}
        objectId={parseInt(objectId)}
        objectType={objectType}
        dataType={dataType ?? "string"}
        group={group}
        __key={__key}
        value={value}
        form={objectType}
        label="Symbol"
        fieldName="symbol"
      />
    </>
  );
}
