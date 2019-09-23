import React from 'react';
import FormBuilder from './FormBuilder';
import './App.css';

const FormGenerator = () => {
  return {
    create(schema, options) {
      // const handleChange = name => event => {
      //   setValues({ ...values, [name]: event.target.value });
      // };
      if (!schema || schema === undefined) return;

      // eslint-disable-next-line consistent-return
      return <FormBuilder fields={schema.fields} options={options} />;
    },
  };
}

export default FormGenerator;
