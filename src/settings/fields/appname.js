import InputSetting from "../../../components/layout/fields/inputSetting";

export default function FieldAppName(props) {
  const { 
    handler, 
    storeId, 
    dataType, 
    group, 
    __key, 
    value 
  } = props;

  return (
    <>
      <InputSetting
        handler={handler}
        storeId={parseInt(storeId)}
        dataType={dataType ?? "string"}
        group={group}
        __key={__key}
        value={value??""}
        form="settings"
        label="App Name"
        fieldName={__key}
      />
    </>
  );
}
