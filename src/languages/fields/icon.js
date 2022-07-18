import InputProperty from "../../../components/layout/fields/inputProperty";

export default function FieldIcon(props) {
  const { 
    handler, 
    objectId, 
    objectType, 
    dataType, 
    group, 
    __key, 
    value 
  } = props;

  return (
    <>
      <InputProperty
        handler={handler}
        objectId={parseInt(objectId)}
        objectType={objectType}
        dataType={dataType}
        group={group}
        __key={__key}
        value={value}
        form="languages"
        label="Icon"
        fieldName="icon"
      />
    </>
  );
}
