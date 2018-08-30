import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Select from './Select';

const EMPTY_SELECTION = [];
const SELECTED_VALUE = true;
const UNSELECTED_VALUE = false;

export default class MultiSelect extends Select {
  static propTypes = {
    ...Select.propTypes,
    selected: PropTypes.array,
    selectAllText: PropTypes.string,
  };

  static defaultProps = {
    ...Select.defaultProps,
    selected: EMPTY_SELECTION,
  };

  getSelected = () => {
    const { items } = this.props;
    return items.filter(this.isSelected);
  };

  getInitialSelection = () => {
    const { selected, keyExtractor } = this.props;

    return selected.reduce(
      (results, item) =>
        Object.assign(results, {
          [keyExtractor(item)]: SELECTED_VALUE,
        }),
      {}
    );
  };

  isSelected = item => {
    const { keyExtractor } = this.props;
    const { selected } = this.state;

    return selected[keyExtractor(item)] === SELECTED_VALUE;
  };

  toggleSelection = item => {
    const { keyExtractor } = this.props;
    const key = keyExtractor(item);

    this.setState(prevState => ({
      selected: {
        ...prevState.selected,
        [key]:
          prevState.selected[key] === SELECTED_VALUE
            ? UNSELECTED_VALUE
            : SELECTED_VALUE,
      },
    }));
  };

  clearSelection = () => {
    this.setState({ selected: EMPTY_SELECTION });
  };

  selectAll = () => {
    const { items, keyExtractor } = this.props;
    const selected = items.reduce(
      (results, item) =>
        Object.assign(results, {
          [keyExtractor(item)]: SELECTED_VALUE,
        }),
      {}
    );
    this.setState({ selected });
  };

  _renderSelectControls = () => {
    const { itemStyle, selectAllText, clearAllText } = this.props;
    const showClearAllButton = !!clearAllText;
    const showSelectAllButton = !!selectAllText;
    const showControls = showClearAllButton || showSelectAllButton;

    return (
      showControls && (
        <View style={[style.item, itemStyle]}>
          {showClearAllButton && this._renderClearAllButton()}
          {showSelectAllButton && this._renderSelectAllButton()}
        </View>
      )
    );
  };

  _renderSelectAllButton = () => {
    const { selectAllText, textStyle } = this.props;

    return (
      <TouchableOpacity style={style.selectionControl} onPress={this.selectAll}>
        <Text style={textStyle}>{selectAllText}</Text>
      </TouchableOpacity>
    );
  };
}

const style = StyleSheet.create({
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  selectionControl: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
