
[![npm](https://img.shields.io/npm/v/generaptor.svg?maxAge=2592000)](https://www.npmjs.com/package/generaptor)
[![downloads](https://img.shields.io/npm/dt/generaptor.svg?maxAge=2592000)](https://www.npmjs.com/package/generaptor)
[![Inline docs](http://inch-ci.org/github/welitonderesende/generaptor.svg?branch=master)](http://inch-ci.org/github/welitonderesende/generaptor)

[![https://nodei.co/npm/generaptor.png?downloads=true&downloadRank=true&stars=true](https://nodei.co/npm/generaptor.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/generaptor)

## This repo is a Alpha version and therefore things can change very suddenly
- Please feel free to send new issues, or PR's 

### Getting Stated: 
`npm i generaptor`

`import Generaptor from 'generaptor'`;

```
const formGen = new Generaptor();
const formGenerated = formGen.create(schema, options);

const App = () => <>{formGenerated}</>;

```

##  This schema can change, but right now is like the following:
```
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
      initialValue: false,
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
```


## Supported Components
- Input Text 
  - text ✅
  - mail ✅
- Input Number
  - number ✅
- Checkbox ✅
- Select ✅
- Radio ✅
- Date picker 
  - hour ✅
  - date ✅

## Supported Masks
- phone [mask] ⛔️
- cep [mask] ️️️️⛔️
- cpf [mask] ⛔️
- currency [mask] ⛔️

## Special Components 
- Button ️️⛔️
- Upload ⛔️


## Validations to support: 
- minLength ⛔️
- maxLength ⛔️
- required ⛔️
- email ⛔️
- telephone ⛔️
- currency values ⛔️
- custom validators ⛔️

## Functions to support: 
- onSubmit ⛔️
- onHandleChange ⛔️
- onClick ⛔️
- verifyValidation ⛔️

## LayoutsFormats to support:
- Group Forms ⛔️
- Tab Forms ⛔️


In the future: 
- Be able to pass custom components, so customizability would be easier
- Be able to customize the structure from schema
- Conditional Rendering, in accords with determined option, something different should render