import React from 'react';
import ReactDOM from 'react-dom';
import FormGenerator from './FormGenerator';

const schema = { 
  fields: [
      {
          type: "input",
          inputType: "text",
          label: "Name",
          model: "name"
      },
      {
          type: "input",
          inputType: "number",
          id: "current_age",
          label: "Age",
          model: "age"
      }
  ]
}

it('Exports a valid component', () => {
  const div = document.createElement('div');
  ReactDOM.render(<FormGenerator schema={schema}/>, div);
  ReactDOM.unmountComponentAtNode(div);
});
