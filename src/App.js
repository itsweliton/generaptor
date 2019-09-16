import React from 'react'; 
import FormGenerator from './FormGenerator';
import { Button, TextField } from '@material-ui/core';

const App = () => {
  console.log('what? working?')
  const formGen = new FormGenerator()
  const schema = { 
    fields: [
      {
        id: "le",
        type: "input",
        inputType: "text",
        label: "Name",
        placeholder: "Name",
        model: "name",
        handleChange: () => { console.log('foi') }
      }, 
      {
        id: "lo",
        type: "input",
        inputType: "password",
        label: "Password",
        placeholder: "password",
        model: "password",
        handleChange: () => {console.log('pass')}
      }
    ]
  }
  const options = {
    button: {
      label: "Button, click it",
      onClick: () => {
        console.log('Hey, it works');
      }
    }
  }

  const formGenerated = formGen.create(schema, options);
  console.log(formGenerated);
  return (
    <div>
      eh
      {formGenerated}
    </div>
  )
  
}

export default App;