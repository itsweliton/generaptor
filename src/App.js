import React from 'react';
import FormGenerator from './FormGenerator';

const App = () => {
  const formGen = new FormGenerator();
  const schema = {
    fields: [
      {
        id: `nameInput`,
        type: `input`,
        inputType: `text`,
        value: ``,
        name: `nameInput`,
        label: `Name`,
        placeholder: `Name`,
        model: `name`,
      },
      {
        id: `passwordInput`,
        type: `input`,
        inputType: `password`,
        name: `passwordInput`,
        label: `Password`,
        value: ``,
        placeholder: `password`,
        model: `password`,
      },
      {
        id: `numberInput`,
        type: `number`,
        inputType: `Number`,
        name: `NumberInput`,
        label: `Number`,
        value: ``,
        placeholder: `Number`,
        model: `number`,
      },
      {
        id: `emailInput`,
        type: `email`,
        inputType: `email`,
        name: `emailInput`,
        label: `email`,
        value: ``,
        placeholder: `email`,
        model: `email`,
      },
      {
        id: `checkboxInput`,
        type: `checkbox`,
        inputType: `checkbox`,
        name: `checkboxInput`,
        label: `checkbox`,
        value: false,
      },
      {
        id: `dateInput`,
        type: `date`,
        inputType: `date`,
        name: `dateInput`,
        label: `date`,
        value: new Date(),
        format: `dd/MM/yyyy`,
      },
      {
        id: `hourInput`,
        type: `hour`,
        inputType: `hour`,
        name: `hourInput`,
        label: `hour`,
        value: new Date(),
        format: `MM/dd/yyyy`,
      },
      {
        id: `selectInput`,
        type: `select`,
        inputType: `select`,
        name: `selectInput`,
        label: `select`,
        value: false,
        helperText: `A helper text used`,
        selectItems: [
          {
            value: 234,
            label: `Item 2`,
          },
          {
            value: 232,
            label: `Item 2`,
          },
          {
            value: 235,
            label: `Item 3`,
          },
        ],
      },
      {
        id: `radioInput`,
        type: `radio`,
        inputType: `radio`,
        name: `radioInput`,
        label: `radio`,
        value: false,
        legend: `Notice radio value must be a string`,
        selectItems: [
          {
            value: `something`,
            label: `Radios 2`,
          },
          {
            value: `234`,
            label: `Radio 3`,
          },
          {
            value: `232`,
            label: `Item 3`,
            disabled: true,
          },
        ],
      },
    ],
  };
  const options = {
    button: {
      label: `Button, click it`,
    },
  };

  const formGenerated = formGen.create(schema, options);
  return (
    <div>
      eh
      {formGenerated}
    </div>
  );
};

export default App;
