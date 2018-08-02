import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { View, TextInput, StyleSheet } from "react-native";

export default class CodeInput extends PureComponent {
  static propTypes = {
    size: PropTypes.number.isRequired
  };

  static defaultProps = {
    size: 4,
    underlineColorAndroid: "transparent",
    keyboardType: "numeric",
    returnKeyType: "done",
    onChange: () => {}
  };

  _code = new Array(this.props.size).fill(null);
  _inputs = {};

  constructor(props) {
    super(props);
    this._notifyCodeChange();
  }

  _onChangeCode = (index, value) => {
    this._code[index] = value;

    if (this._isValidCode(value)) {
      const emptyIndex = this._getEmptyCodeIndex(index);
      if (emptyIndex >= 0) {
        this._inputs[emptyIndex].focus();
      } else {
        this._inputs[index].blur();
      }
    }

    this._notifyCodeChange();
  };

  _notifyCodeChange = () => {
    this.props.onChange({
      raw: this._code,
      code: this._code.join(""),
      valid: this._getEmptyCodeIndex() === -1
    });
  };

  _isValidCode = value => value || value === 0;

  _getEmptyCodeIndex = (startPosition = 0) => {
    const idx = [
      ...this._code.slice(startPosition),
      ...this._code.slice(0, startPosition)
    ].findIndex(item => !this._isValidCode(item));

    return idx >= 0 ? (startPosition + idx) % this._code.length : idx;
  };

  _renderCodeInput = (index, props = {}) => {
    return (
      <TextInput
        ref={ref => (this._inputs[index] = ref)}
        key={index}
        maxLength={1}
        onChangeText={code => this._onChangeCode(index, code)}
        {...props}
      />
    );
  };

  render() {
    // eslint-disable-next-line
    const { size, onChange, onTextChange, ...props } = this.props;

    return (
      <View style={style.container}>
        {this._code.map((value, index) => this._renderCodeInput(index, props))}
      </View>
    );
  }
}

const style = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between"
  }
});
