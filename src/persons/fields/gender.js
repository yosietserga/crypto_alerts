import InputSelect from "../../../components/layout/fields/inputSelect";

export default function FieldGender(props) {
  const { handler, value } = props;

  const options = [
    {
      label: "Male",
      key: 1,
      value: "male",
    },
    {
      label: "Female",
      key: 2,
      value: "female",
    },
    {
      label: "Other",
      key: 2,
      value: "other",
    },
  ];
  
  return (
    <>
      <InputSelect
        handler={handler}
        value={value}
        options={options}
        form="persons"
        label="Current Gender"
        fieldName="gender"
      />
    </>
  );
};