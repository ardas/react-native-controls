import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { View, TextInput, Platform, StyleSheet } from 'react-native';

const DEFAULT_KEYBOARD_TYPE = Platform.select({
  ios: 'number-pad',
  android: 'numeric',
});

export default class CodeInput extends PureComponent {
  static propTypes = {
    size: PropTypes.number.isRequired,
  };

  static defaultProps = {
    size: 4,
    onChange: () => {},
  };

  state = {
    code: new Array(this.props.size).fill(null),
  };
  _inputs = {};

  componentDidMount() {
    this._notifyCodeChange();
  }

  componentDidUpdate(prevProps, prevState) {
    const codeUpdated = prevState.code !== this.state.code;
    if (codeUpdated) {
      this._notifyCodeChange();
    }
  }

  setFocus = index => {
    const { size } = this.props;
    const next = Math.min(Math.max(0, index), size);
    this._inputs[next].focus();
  };

  _onChangeCode = (index, value) => {
    this.setState(
      prevState => {
        const _code = [...prevState.code];
        _code.splice(index, 1, value);
        return {
          code: _code,
        };
      },
      () => this._changeFocus(index)
    );
  };

  _changeFocus = index => {
    const emptyIndex = this._getEmptyCodeIndex(index);
    if (emptyIndex >= 0) {
      this.setFocus(emptyIndex);
    } else {
      this._inputs[index].blur();
    }
  };

  _onKeyPress = (index, evt) => {
    const { code } = this.state;
    const { key } = evt.nativeEvent;
    const isInputFulfilled = !!code[index];

    if (key === 'Backspace') {
      if (!isInputFulfilled) {
        this.setFocus(index - 1);
      }
    } else {
      if (isInputFulfilled) {
        this._onChangeCode(index, key);
      }
    }
  };

  _notifyCodeChange = () => {
    const { code } = this.state;
    this.props.onChange({
      raw: code,
      code: code.join(''),
      valid: this._isValidCode(),
    });
  };

  _isValidCode = () => this._getEmptyCodeIndex() === -1;

  _validate = value => !!value;

  _getEmptyCodeIndex = (startPosition = 0) => {
    const { code } = this.state;
    const idx = [
      ...code.slice(startPosition),
      ...code.slice(0, startPosition),
    ].findIndex(item => !this._validate(item));

    return idx >= 0 ? (startPosition + idx) % code.length : idx;
  };

  render() {
    // eslint-disable-next-line
    const {
      size,
      onChange,
      onChangeText,
      onKeyPress,
      separatorItem,
      separatorIndexes,
      ...props
    } = this.props;
    const { code } = this.state;

    return (
      <View style={style.container}>
        {code.map((value, index) => (
          <Fragment key={index}>
            <TextInput
              ref={ref => (this._inputs[index] = ref)}
              value={value}
              underlineColorAndroid="transparent"
              keyboardType={DEFAULT_KEYBOARD_TYPE}
              returnKeyType="done"
              {...props}
              maxLength={1}
              onChangeText={code => this._onChangeCode(index, code)}
              onKeyPress={e => this._onKeyPress(index, e)}
            />
            {separatorIndexes.some(item => item === index) && separatorItem}
          </Fragment>
        ))}
      </View>
    );
  }
}

const style = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
