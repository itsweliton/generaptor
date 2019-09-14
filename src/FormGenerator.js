import React from 'react';
import './App.css';

const FormGenerator = ({ schema }) => {
  if (!schema || !schema.fields) throw new Error('You must have a schema');


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
