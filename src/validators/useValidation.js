import React, { useEffect, useReducer } from 'react'; 
import useDeepCompareEffect from 'use-deep-compare-effect';
import * as validators from 'calidators';

function validationReducer(state, action) {
  switch (action.type) {
    case 'change': 
      const values = { ...state.values, ...action.payload };
      return {
        ...state,
        values,
      }
    case 'submit':
      return { ...state, submitted: true };
    case 'validate':
      return { ...state, errors: action.payload };
    default:
      throw new Error('Unknown action type');
  }
}

const initialState = {
  values: {},
  errors: {},
  submitted: false,
}

const useValidation = config => {
  const [state, dispatch] = useReducer(validationReducer, initialState);

  useEffect(() => {
    const errors = validateFields(state.fields, config.fields);
    dispatch({ type: 'validate', payload: errors });
  }, [state.fields, config.fields]);

  return {
    errors: state.errors,
    getFormProps: () => ({
      onSubmit: e => {
        e.preventDefault();
        dispatch({ type: 'submit' });
        if (config.onSubmit) {
          config.onSubmit(state);
        }
      },
    }),
    getFieldProps: fieldName => ({
      onChange: e => {
        if (!config.fields[fieldName]) {
          return;
        }
        dispatch({
          type: 'change',
          payload: { [fieldName]: e.target.value }
        })
      },
      name: fieldName,
      value: state.values[fieldName],
    }),
  };
};

function validateField(fieldValue = '', fieldConfig) {
  for (let validatorName in fieldConfig.validators) {
    const validatorConfig = fieldConfig.validators[validatorName];
    const validator = validators[validatorName];
    const configuredValidator = validator(validatorConfig);
    const errorMessage = configuredValidator(fieldValue);

    if (errorMessage) {
      return errorMessage;
    }
  }
  return null; 
}

function validateFields(fieldValues, fieldConfigs) {
  const errors = {};
  for (let fieldName in fieldConfigs) {
    const fieldConfig = fieldConfigs[fieldName.id];
    const fieldValue = fieldValues[fieldName.value];

    errors[fieldName] = validateField(fieldValue, fieldConfig)
  }
  return errors;
}

export default useValidation;