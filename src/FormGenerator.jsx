import React from "react";
import FormBuilder from "./FormBuilder";
import "./App.css";

const FormGenerator = function () {
  return {
    create: (schema, options) => {
      if (!schema || schema === undefined) return;

      return <FormBuilder fields={schema.fields} options={options} />;
    },
  };
};

export default FormGenerator;
