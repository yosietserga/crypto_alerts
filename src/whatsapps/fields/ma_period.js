import InputProperty from "../../../components/layout/fields/inputProperty";

export default function FieldMAPeriod(props) {
  const { handler, objectId, objectType, dataType, group, __key, value } =
    props;

  return (
    <>
      <InputProperty
        type="number"
        handler={handler}
        objectId={parseInt(objectId)}
        objectType={objectType}
        dataType={dataType??"string"}
        group={group}
        __key={__key}
        value={value}
        form="languages"
        label="MA Period"
        fieldName="ma_period"
      />
    </>
  );
}
