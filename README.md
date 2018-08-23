# react-native-controls

## Components:

- [Grid](#grid)
- [CodeInput](#codeinput)

### Usage

```js
import { Grid } from "react-native-controls";

<Grid />;
```

## Grid

Based on react-native FlatList component, is called to simplify lazy load implementation

| Prop                      | Type     | Required | Default | Description                                                |
| ------------------------- | -------- | -------- | ------- | ---------------------------------------------------------- |
| **`data`**                | array    | +        |         | Data to show                                               |
| **`loadMoreData`**        | function |          |         | Called when additional data should be load                 |
| **`refreshData`**         | function |          |         | Called when data should be re-load                         |
| **`indicatorColor`**      | string   |          | _blue_  |                                                            |
| **`loadDataOnInit`**      | bool     |          | _false_ | Should call `refreshData` on mount                         |
| **`propagateDataErrors`** | bool     |          | _false_ | Should encapsulate error handling in directly in component |
| **`renderError`**         | function |          |         | Custom error component                                     |
| **`renderLoading`**       | function |          |         | Custom loading component                                   |
| **`renderEmpty`**         | function |          |         | Custom empty list component                                |
| **`isLoading`**           | bool     |          | _false_ | Show loading indicator                                     |
| **`isRefreshing`**        | bool     |          | _false_ | Show refreshing indicator                                  |
| **`dataError`**           | any      |          | _null_  |                                                            |

## CodeInput

Set of inputs optimized for SMS codes.

| Prop           | Type     | Required | Default | Description                                                                            |
| -------------- | -------- | -------- | ------- | -------------------------------------------------------------------------------------- |
| **`size`**     | number   | +        | `4`     | Count of inputs                                                                        |
| **`onChange`** | function |          |         | Called on value change. Structure: {`valid`: _bool_, `code`: _string_, `raw`: _array_} |
