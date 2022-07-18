import InputSelect from "../../../components/layout/fields/inputSelect";

export default function FieldGOB(props) {
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
  ];
  
  return (
    <>
      <InputSelect
        handler={handler}
        value={value}
        options={options}
        form="persons"
        label="Gender of Birthday"
        fieldName="genderOfBirthday"
      />
    </>
  );
};