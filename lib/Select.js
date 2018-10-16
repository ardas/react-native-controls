import React from 'react';
import MultiSelect from './MultiSelect';
import SingleSelect from './SingleSelect';

export default ({ multiSelect, ...props }) => multiSelect ?
    <MultiSelect {...props}/>
    : <SingleSelect {...props}/>