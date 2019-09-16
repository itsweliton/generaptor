import React from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import './App.css';

function FormGenerator() {
  return {
    create: function(schema, options) {
      // const [values, setValues] = React.useState(``);
      // const handleChange = name => event => {
      //   setValues({ ...values, [name]: event.target.value });
      // };
      if (!schema || schema === undefined) return;
      let formElements = []
      let formButton = null
      if (options.button) {
        formButton = (
          <Button variant="contained" onClick={options.button.onClick !== undefined ? options.button.onClick : () => {}}>
            {options.button.label}
          </Button>
        )
      }
      schema.fields.map((field => {
        switch (field.type) {
          case 'input':
            formElements.push(
              <TextField
                id={field.id}
                label={field.label}
                value={field.id}
                type={field.inputType}
                onChange={field.handleChange}
                margin="normal"
              />
            )
            break;
          default:
            break;
        }
      }));
      return (
        <form>
          {formElements}
          {formButton}
        </form>
      )
    }
  }

}

export default FormGenerator;
