import InputSelect from "../../../components/layout/fields/inputSelect";

export default function FieldStatus(props) {
  const { handler, value } = props;

  const options = [
    {
      label: "No",
      key: 0,
      value: 0,
    },
    {
      label: "Yes",
      key: 1,
      value: 1,
    },
  ];

  return (
    <>
      <InputSelect
        handler={handler}
        value={value}
        options={options}
        form="mtaccounts"
        label="Account Status"
        fieldName="status"
      />
    </>
  );
}
