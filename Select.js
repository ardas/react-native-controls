import React from 'react';
import MultiSelect from './lib/MultiSelect';
import SingleSelect from './lib/SingleSelect';

const Select = ({ multiSelect, ...props }) => multiSelect ?
    <MultiSelect {...props} />
    : <SingleSelect {...props} />

Select.defaultProps = {
    multiSelect: false
}
export default Select;