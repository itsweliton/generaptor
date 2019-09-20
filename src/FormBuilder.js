import React, { useState } from 'react';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Button from '@material-ui/core/Button';
import _ from 'lodash';

const FormBuilder = ({ fields, options }) => {
  const elNames = _.map(fields, `name`);
  const valNames = _.map(fields, `value`);
  const initialState = {};
  elNames.map((eln, id) => {
    // eslint-disable-next-line no-return-assign
    return (initialState[eln] = valNames[id]);
  });
  const [values, setValues] = useState(initialState);

  const handleChange = event => {
    let { value } = event.target;
    if (event.target.type === `checkbox`) {
      value = event.target.checked;
    }
    setValues({ ...values, [event.target.name]: value });
  };
  const formElements = [];
  fields.map(field => {
    switch (field.type) {
      case `checkbox`:
        formElements.push(
          <FormControlLabel
            control={
              <Checkbox
                checked={!!values[field.name]}
                onChange={handleChange}
                value={values[field.name]}
                color="primary"
                name={field.name}
                labelPlacement={field.position || `end`}
              />
            }
            key={field.id}
            label={field.label}
          />,
        );
        break;

      default:
        formElements.push(
          <TextField
            id={field.id}
            label={field.label}
            value={values[field.name]}
            name={field.name}
            type={field.inputType}
            onChange={handleChange}
            margin="normal"
            key={field.id}
          />,
        );
        break;
    }
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
