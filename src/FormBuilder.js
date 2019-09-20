import React, { useState } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import _ from 'lodash';

const FormBuilder = ({ fields, options }) => {
  const elNames = _.map(fields, `name`);
  const initialState = {};
  elNames.map(eln => {
    // eslint-disable-next-line no-return-assign
    return (initialState[eln] = ``);
  });
  const [values, setValues] = useState(initialState);

  const handleChange = event => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };
  const formElements = [];
  fields.map(field => {
    formElements.push(
      <TextField
        id={field.id}
        label={field.label}
        value={values[field.name]}
        name={field.name}
        type={field.inputType}
        onChange={handleChange}
        margin="normal"
      />,
    );
  });
  let formButton = null;
  if (options.button) {
    formButton = (
      <Button
        variant="contained"
        onClick={
          options.button.onClick !== undefined
            ? options.button.onClick
            : () => {
                console.log(values);
              }
        }
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
