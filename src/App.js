import React from 'react';
import FormGenerator from './FormGenerator';

const App = () => {
  const schema = {
    fields: [
      {
        id: `nameInput`,
        name: `nameInput`,
        type: `input`,
        inputType: `text`,
        initialValue: ``,
        label: `Name`,
        placeholder: `Name`,
      },
      {
        id: `passwordInput`,
        type: `input`,
        inputType: `password`,
        name: `passwordInput`,
        label: `Password`,
        initialValue: ``,
        placeholder: `password`,
      },
      {
        id: `numberInput`,
        type: `number`,
        inputType: `Number`,
        name: `NumberInput`,
        label: `Number`,
        initialValue: ``,
        placeholder: `Number`,
      },
      {
        id: `emailInput`,
        type: `email`,
        inputType: `email`,
        name: `emailInput`,
        label: `email`,
        initialValue: ``,
        placeholder: `email`,
      },
      {
        id: `checkboxInput`,
        type: `checkbox`,
        inputType: `checkbox`,
        name: `checkboxInput`,
        label: `checkbox`,
        initialValue: false,
      },
      {
        id: `dateInput`,
        type: `date`,
        inputType: `date`,
        name: `dateInput`,
        label: `date`,
        initialValue: new Date(),
        format: `dd/MM/yyyy`,
      },
      {
        id: `hourInput`,
        type: `hour`,
        inputType: `hour`,
        name: `hourInput`,
        label: `hour`,
        initialValue: new Date(),
        format: `MM/dd/yyyy`,
      },
      {
        id: `selectInput`,
        type: `select`,
        inputType: `select`,
        name: `selectInput`,
        label: `select`,
        initialValue: false,
        helperText: `A helper text used`,
        options: [
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
        initialValue: false,
        legend: `Notice radio value must be a string`,
        options: [
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
  const formGen = new FormGenerator();
  const formGenerated = formGen.create(schema, options);
  return (
    <div>
      eh
      {formGenerated}
    </div>
  );
};

export default App;
