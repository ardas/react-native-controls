import React from "react";
import PropTypes from "prop-types";
import { View, Text, TouchableOpacity } from "react-native";
import Select from "./Select";

const EMPTY_SELECTION = [];

export default class MultiSelect extends Select {
  static propTypes = {
    ...Select.propTypes,
    selected: PropTypes.array,
    selectAllText: PropTypes.string
  };

  static defaultProps = {
    ...Select.defaultProps,
    selected: EMPTY_SELECTION
  };

  getSelected = () => {
    const { items } = this.props;
    return items.filter(this.isSelected);
  };

  isSelected = item => {
    const { keyExtractor } = this.props;
    const { selected } = this.state;
    return !!selected[keyExtractor(item)];
  };

  toggleSelection = item => {
    const { keyExtractor } = this.props;
    const key = keyExtractor(item);

    this.setState(prevState => ({
      selected: {
        ...prevState.selected,
        [key]: !prevState.selected[key]
      }
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
          [keyExtractor(item)]: true
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
