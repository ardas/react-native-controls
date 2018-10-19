import PropTypes from 'prop-types';
import Select from './Select';

const EMPTY_SELECTION = [];
const SELECTED_VALUE = true;
const UNSELECTED_VALUE = false;

export default class MultiSelect extends Select {
  static propTypes = {
    ...Select.propTypes,
    selected: PropTypes.array,
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

  _renderHeader = () => {
    const { renderHeader } = this.props;
    return renderHeader({
      onCancel: this.toggle,
      onSubmit: this.submit,
      onSearch: this.search,
      onClear: this.clearSelection,
      onSelectAll: this.selectAll,
    });
  };
}
