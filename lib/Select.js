import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';

const EMPTY_SELECTION = null;

export default class Select extends PureComponent {
  state = {
    active: false,
    selected: this.getInitialSelection(),
    itemsToShow: this.props.items,
  };

  static propTypes = {
    items: PropTypes.array.isRequired,
    selected: PropTypes.any,
    onSelect: PropTypes.func,
    onToggleTriggered: PropTypes.func,
    keyExtractor: PropTypes.func,
    labelExtractor: PropTypes.func,
    renderHeader: PropTypes.func,
    renderDivider: PropTypes.func,
    renderSelectedMarker: PropTypes.func,
    renderSelectControls: PropTypes.func,
    innerContainerStyles: PropTypes.object,
    outerContainerStyles: PropTypes.object,
    itemStyle: PropTypes.object,
    textStyle: PropTypes.object,
    ItemsContainer: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
    disabled: PropTypes.bool,
    autoClose: PropTypes.bool,
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node,
    ]),
  };

  static defaultProps = {
    items: [],
    selected: EMPTY_SELECTION,
    keyExtractor: item => item,
    labelExtractor: item => item,
    onSelect: () => {},
    renderHeader: () => null,
    renderDivider: () => null,
    renderSelectedMarker: () => null,
    renderSelectControls: () => null,
    onToggleTriggered: () => null,
    ItemsContainer: FlatList,
    disabled: false,
    autoClose: false,
  };

  componentDidUpdate(prevProps) {
    const { items, selected } = this.props;
    const itemsWasChanged = items !== prevProps.items;
    const selectionWasChanged = selected !== prevProps.selected;

    if (itemsWasChanged) {
      this.resetSearch();
      this.resetSelection();
    } else if (selectionWasChanged) {
      this.resetSelection();
    }
  }

  getInitialSelection() {
    return this.props.selected;
  }

  getSelected = () => {
    const { items } = this.props;
    return items.find(this.isSelected);
  };

  isSelected = item => {
    const { keyExtractor } = this.props;
    const { selected } = this.state;
    return !!selected && keyExtractor(item) === keyExtractor(selected);
  };

  toggle = () => {
    const { onToggleTriggered } = this.props;
    this.setState(
      prevState => ({
        active: !prevState.active,
        selected: this.getInitialSelection(),
      }),
      onToggleTriggered
    );
  };

  submit = () => {
    const { onSelect } = this.props;
    const selected = this.getSelected();
    onSelect(selected);
    this.toggle();
  };

  search = (searchText = '') => {
    const { items, labelExtractor } = this.props;
    const re = new RegExp(searchText, 'i');
    const itemsToShow = searchText
      ? items.filter(item => re.test(labelExtractor(item)))
      : items;

    this.setState({
      searchText,
      itemsToShow,
    });
  };

  resetSearch = () => {
    const { items } = this.props;
    this.setState({
      searchText: '',
      itemsToShow: items,
    });
  };

  toggleSelection = item => {
    this.setState({ selected: item }, this._onToggle);
  };

  resetSelection = () => {
    this.setState({ selected: this.getInitialSelection() });
  };

  clearSelection = () => {
    this.setState({ selected: EMPTY_SELECTION }, this._onToggle);
  };

  _onToggle = () => {
    const { autoClose } = this.props;
    if (autoClose) {
      this.submit();
    }
  };

  _renderItem = ({ item }) => {
    const {
      labelExtractor,
      renderSelectedMarker,
      itemStyle,
      textStyle,
    } = this.props;
    const selected = this.isSelected(item);
    const label = labelExtractor(item);

    return (
      <TouchableOpacity
        onPress={() => this.toggleSelection(item)}
        style={[style.item, itemStyle]}
      >
        <Text style={textStyle}>{label}</Text>
        {selected && renderSelectedMarker()}
      </TouchableOpacity>
    );
  };

  _renderSelectControls = () => {
    const { renderSelectControls } = this.props;
    return renderSelectControls({ onClear: this.clearSelection });
  };

  _renderHeader = () => {
    const { renderHeader } = this.props;
    return renderHeader({
      onCancel: this.toggle,
      onSubmit: this.submit,
      onSearch: this.search,
      onClear: this.clearSelection,
    });
  };

  render() {
    const {
      keyExtractor,
      renderDivider,
      innerContainerStyles,
      outerContainerStyles,
      ItemsContainer,
      ItemsContainerProps,
      children,
      disabled,
    } = this.props;
    const { active, itemsToShow, selected } = this.state;

    return (
      <Fragment>
        <Modal visible={active} onRequestClose={this.toggle}>
          <View style={[style.container, outerContainerStyles]}>
            <View style={[style.container, innerContainerStyles]}>
              {this._renderHeader()}

              <ItemsContainer
                data={itemsToShow}
                renderItem={this._renderItem}
                keyExtractor={keyExtractor}
                ItemSeparatorComponent={renderDivider}
                extraData={selected}
                {...ItemsContainerProps}
              />
            </View>
          </View>
        </Modal>
        <TouchableOpacity onPress={this.toggle} disabled={disabled}>
          {children}
        </TouchableOpacity>
      </Fragment>
    );
  }
}

const style = StyleSheet.create({
  container: {
    flex: 1,
  },
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
