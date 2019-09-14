import React from 'react';
import ReactDOM from 'react-dom';
import FormGenerator from './FormGenerator';
import { shallow, mount } from 'enzyme';
import { create } from 'react-test-renderer';

import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

const schema = { 
  fields: [
    {
      id: "le",
      type: "input",
      inputType: "text",
      place: "Name",
      placeholder: "Name",
      model: "name"
    }
  ]
}

// describe("Form Generator Mounted", () => {
//   it('Exports a valid component', () => {
//     const div = document.createElement('div');
//     ReactDOM.render(<FormGenerator schema={{fields: []}}/>, div);
//     ReactDOM.unmountComponentAtNode(div);
//   });

//   test("Component is created", () => {
//     const formGenerator = create(<FormGenerator schema={{fields: []}}/>);
//     expect(formGenerator.toJSON()).toMatchSnapshot();
//   });

//   it("Component without schema throws error", () => {
//     expect(() => mount(<FormGenerator />)).toThrowError(/^You must have a schema$/);
//   });
// })

describe("Form Generator basic mounting", () => {
  test("It should create a basic input", () => {
    const wrapper = shallow(<FormGenerator schema={schema} />);
    expect(wrapper).toMatchSnapshot()
    expect(wrapper.find(`input#le`).props().placeholder).toBe("Name");
  });
});