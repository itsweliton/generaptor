import React from 'react';
import { TextField } from '@material-ui/core/TextField';
import { Button } from '@material-ui/core/Button';
import './App.css';

const FormGenerator = ({ schema, options }) => {
  if (!schema || !schema.fields) throw new Error('You must have a schema');
  const [values, setValues] = React.useState(``);

  const handleChange = name => event => {
    setValues({ ...values, [name]: event.target.value });
  };
  
  const create = (schema, options) => {
    let formElements = []
    let formButton = null
    if (schema.options.button) {
      formButton = (
        <Button variant="contained" onClick={schema.options.button.onClick !== undefined ? schema.options.button.onClick : () => {}}>
          {schema.options.button.label}
        </Button>
      )
    }
    schema.map((field => {
      switch (field.type) {
        case 'input':
          formElements.push(
            <TextField
              id={field.id}
              label={field.label}
              value={field.id}
              type="input"
              onChange={handleChange(field.id)}
              margin="normal"
            />
          )
          break;
        default:
          break;
      }
      return (
        <form>
          {formElements}
          {formButton}
        </form>
      )
    }))
  }

  return (
    <div>
      <form>
        {schema.fields.map(field => (
          <div key={field.id}>
              <label for="name">{field.label}</label>
              <input type="text" id={field.id} name="name" required minlength="4" maxlength="8" size="10" placeholder={field.placeholder}></input>
          </div>)
        )}
      </form>
    </div>
  );
}

export default FormGenerator;
