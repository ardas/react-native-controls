import React from 'react';
import MultiSelect from './lib/MultiSelect';
import SingleSelect from './lib/Select';

const Select = ({ multiSelect, ...props }) => multiSelect ?
<MultiSelect {...props} /> : <SingleSelect {...props} />

Select.defaultProps = {
  multiSelect: false,
};

export default Select;
