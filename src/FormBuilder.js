import React, { useState } from 'react';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Select from '@material-ui/core/Select';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';

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
    console.log(`haha`, value, value.type);
    if (event.target.type === `checkbox`) {
      value = event.target.checked;
    }
    setValues({ ...values, [event.target.name]: value });
  };
  const formElements = [];
  fields.map(field => {
    switch (field.type) {
      case `radio`:
        formElements.push(
          <FormControl component="fieldset" key={field.id}>
            <FormLabel component="legend">{field.legend || null}</FormLabel>
            <RadioGroup
              aria-label={field.legend}
              name={field.name}
              value={values[field.name]}
              onChange={handleChange}
            >
              {field.selectItems.map(item => (
                <FormControlLabel
                  value={item.value}
                  disabled={item.disabled || false}
                  control={<Radio />}
                  label={item.label}
                  labelplacement={item.position || `end`}
                  key={item.value + field.id}
                />
              ))}
            </RadioGroup>
          </FormControl>,
        );
        break;
      case `select`:
        formElements.push(
          <FormControl key={field.id}>
            <InputLabel htmlFor={field.id}>{field.label}</InputLabel>
            <Select
              value={values[field.name]}
              onChange={handleChange}
              inputProps={{
                name: field.name,
                id: field.id,
              }}
            >
              {field.selectItems.map(item => (
                <MenuItem value={item.value} key={item.value + field.id}>
                  {item.label}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{field.helperText || null}</FormHelperText>
          </FormControl>,
        );
        break;
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
                labelplacement={field.position || `end`}
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
