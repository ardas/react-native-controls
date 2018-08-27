# react-native-controls

## Components:

- [Grid](#grid)
- [CodeInput](#codeinput)
- [Select](#select)
- [MultiSelect](#multiselect)

## Grid

Based on react-native FlatList component, is called to simplify lazy load implementation

| Prop                      | Type     | Required | Default | Description                                                                      |
| ------------------------- | -------- | -------- | ------- | -------------------------------------------------------------------------------- |
| **`data`**                | array    | +        |         | Data to show                                                                     |
| **`loadMoreData`**        | function |          |         | Called when additional data should be load. Input params: { `offset`: _number_ } |
| **`refreshData`**         | function |          |         | Called when data should be re-load                                               |
| **`indicatorColor`**      | string   |          | _blue_  |                                                                                  |
| **`loadDataOnInit`**      | bool     |          | _false_ | Should call `refreshData` on mount                                               |
| **`propagateDataErrors`** | bool     |          | _false_ | Should encapsulate error handling in directly in component                       |
| **`renderError`**         | function |          |         | Custom error component                                                           |
| **`renderLoading`**       | function |          |         | Custom loading component                                                         |
| **`renderEmpty`**         | function |          |         | Custom empty list component                                                      |
| **`isLoading`**           | bool     |          | _false_ | Show loading indicator                                                           |
| **`isRefreshing`**        | bool     |          | _false_ | Show refreshing indicator                                                        |
| **`dataError`**           | any      |          | _null_  |                                                                                  |

### Basic usage

```js
import { Grid } from "react-native-controls";

const data = [
    { id: 'item1', value: 5 },
    { id: 'item2', value: 11 },
    ...
];

<Grid
    data={data}
    keyExtractor={item => item.id}
    renderItem={({ item }) => <Text>{item.value}</Text>}
/>;
```

## CodeInput

Set of inputs optimized for SMS codes.

| Prop           | Type     | Required | Default | Description                                                                              |
| -------------- | -------- | -------- | ------- | ---------------------------------------------------------------------------------------- |
| **`size`**     | number   | +        | `4`     | Count of inputs                                                                          |
| **`onChange`** | function |          |         | Called on value change. Structure: { `valid`: _bool_, `code`: _string_, `raw`: _array_ } |

### Basic usage

```js
import { CodeInput } from "react-native-controls";

<CodeInput size={5} onChange={({ code }) => this.setState({ code })} />;
```

## Select

Select based on modal

| Prop                       | Type     | Required | Default | Description                                                                                                           |
| -------------------------- | -------- | -------- | ------- | --------------------------------------------------------------------------------------------------------------------- |
| **`items`**                | array    | +        |         | Select options                                                                                                        |
| **`selected`**             | any      |          | _null_  | Selected items                                                                                                        |
| **`onSelect`**             | function |          |         | Called on selection change with selected items as a param                                                             |
| **`keyExtractor`**         | function |          |         | Should return uniq item identifier                                                                                    |
| **`labelExtractor`**       | function |          |         | Should return item label to show                                                                                      |
| **`renderHeader`**         | function |          |         | Render custom select header. Input params: { `onCancel`: _function_, `onSubmit`: _function_, `onSearch`: _function_ } |
| **`renderDivider`**        | function |          |         | Render custom items divider                                                                                           |
| **`renderSelectedMarker`** | function |          |         | Render marker for selected items                                                                                      |
| **`clearAllText`**         | string   |          |         | Label for clear all button. If not defined button will be hidden                                                      |
| **`innerContainerStyles`** | object   |          |         |                                                                                                                       |
| **`outerContainerStyles`** | object   |          |         |                                                                                                                       |
| **`itemStyle`**            | object   |          |         |                                                                                                                       |
| **`textStyle`**            | object   |          |         |                                                                                                                       |

### Basic usage

```js
import { Select } from "react-native-controls";

state = {
    options: [
        { id: 'option1', label: 'Option #1' },
        { id: 'option2', label: 'Option #2' },
        ...
    ]
};

<Select
    items={options}
    selected={selected}
    onSelect={selected => this.setState({
        selected
    })}
/>;
```

## MultiSelect

Based on [Select](#select) component

| Prop                | Type   | Required | Default | Description                                                       |
| ------------------- | ------ | -------- | ------- | ----------------------------------------------------------------- |
| _Select props..._   |
| **`selected`**      | array  |          | _[]_    | Selected items                                                    |
| **`selectAllText`** | string |          |         | Label for select all button. If not defined button will be hidden |

### Basic usage

```js
import { Select } from "react-native-controls";

state = {
    options: [
        { id: 'option1', label: 'Option #1' },
        { id: 'option2', label: 'Option #2' },
        ...
    ]
};

<MultiSelect
    items={options}
    selected={selected}
    onSelect={selected => this.setState({
        selected
    })}
/>;
```
