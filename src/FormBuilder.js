import React, { useState } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

const FormBuilder = ({ fields, options }) => {
  const initialState = fields.map(field => {
    [field.id] = field.value;
  });
  const [values, setValues] = useState(initialState);
  console.log(values);
  const handleChange = name => event => {
    setValues({ ...values, [name]: event.target.value });
  };
  console.log(`new state`, values);
  const formElements = [];
  fields.map(field => {
    switch (field.type) {
      case `input`:
        formElements.push(
          <TextField
            id={field.id}
            label={field.label}
            value={field.id}
            type={field.inputType}
            onChange={handleChange(field.id)}
            margin="normal"
          />,
        );
        break;
      default:
        break;
    }
  });
  let formButton = null;
  if (options.button) {
    formButton = (
      <Button
        variant="contained"
        onClick={options.button.onClick !== undefined ? options.button.onClick : () => {}}
      >
        {options.button.label}
      </Button>
    );
  }
  return (
    <form>
      {formElements}
      {formButton}
    </form>
  );
};

export default FormBuilder;
