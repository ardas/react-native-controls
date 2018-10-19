import React from 'react';
import MultiSelect from './MultiSelect';
import SingleSelect from './Select';

const Select = ({ multi, ...props }) =>
  multi ? <MultiSelect {...props} /> : <SingleSelect {...props} />;

Select.defaultProps = {
  multi: false,
};

export default Select;
