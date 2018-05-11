import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import {
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Platform
} from "react-native";

const DEFAULT_LOADING_INDICATOR = context => (
  <ActivityIndicator
    animating={true}
    size="large"
    color={context.props.indicatorColor}
  />
);

// fix for FlatList issue (android)
// https://github.com/facebook/react-native/issues/11489
const onEndReachedThreshold = Platform.OS === "ios" ? 0 : 0.5;

export default class Grid extends PureComponent {
  static propTypes = {
    data: PropTypes.array.isRequired,
    loadMoreData: PropTypes.func,
    refreshData: PropTypes.func,
    indicatorColor: PropTypes.string,
    loadDataOnInit: PropTypes.bool,
    propagateDataErrors: PropTypes.bool,
    renderError: PropTypes.bool,
    isLoading: PropTypes.bool,
    isRefreshing: PropTypes.bool,
    dataError: PropTypes.any,
    errorLabel: PropTypes.string,
    renderError: PropTypes.func,
    renderLoading: PropTypes.func,
    renderEmpty: PropTypes.func
  };

  static defaultProps = {
    indicatorColor: "blue",
    loadDataOnInit: false,
    propagateDataErrors: false,
    renderLoading: DEFAULT_LOADING_INDICATOR,
    keyExtractor: item => String(item)
  };

  state = {
    isLoading: false,
    isRefreshing: false,
    dataError: null
  };

  // fix callbacks double calling on data init phase
  onEndReachedCalledDuringMomentum = true;

  componentDidMount() {
    if (this.props.loadDataOnInit) {
      this.refreshData();
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const updatesGetter = Grid.generateUpdatesGetter(nextProps, prevState);
    const stateChanges = {
      ...updatesGetter("isLoading"),
      ...updatesGetter("isRefreshing"),
      ...updatesGetter("dataError")
    };
    const changesCount = Object.keys(stateChanges).length;

    return changesCount ? stateChanges : null;
  }

  static generateUpdatesGetter = (nextProps, prevState) => key => {
    const nextValue = nextProps[key];
    return nextValue !== void 0 && nextValue !== prevState[key]
      ? { [key]: nextValue }
      : {};
  };

  /**
   * Load initial data
   * @returns {void}
   */
  refreshData = () => {
    // do nothing if refresh is disabled or method cannot be called
    if (!this.refreshEnabled || !this.canCallDataMethod) {
      return;
    }

    this.setState({ isRefreshing: true, dataError: null });
    Promise.resolve(this.props.refreshData())
      .catch(this.handleDataMethodError)
      .finally(() => this.setState({ isRefreshing: false }));
  };

  /**
   * Load next data
   * @returns {void}
   */
  loadMoreData = () => {
    // do nothing if lazy load disabled or method cannot be called
    if (!this.lazyLoadEnabled || !this.canCallDataMethod) {
      return;
    }

    this.setState({ isLoading: true, dataError: null });

    const options = { offset: this.props.data.length };

    Promise.resolve(this.props.loadMoreData(options))
      .catch(this.handleDataMethodError)
      .finally(() => this.setState({ isLoading: false }));
  };

  /**
   * Repeat previous load data
   * @returns {void}
   */
  reloadData = () => {
    if (this.lazyLoadEnabled) {
      this.loadMoreData();
    } else {
      this.refreshData();
    }
  };

  handleDataMethodError = error => {
    this.setState({ dataError: error });
    if (this.props.propagateErrors) {
      return Promise.reject(error);
    }
  };

  onEndReached = () => {
    // fix for FlatList issue
    // https://github.com/facebook/react-native/issues/14015
    if (this.onEndReachedCalledDuringMomentum) {
      return;
    }
    this.onEndReachedCalledDuringMomentum = true;
    this.loadMoreData();
  };

  /**
   * Data request is already in process
   * @returns {boolean}
   */
  get canCallDataMethod() {
    return !this.state.isLoading && !this.state.isRefreshing;
  }

  /**
   * All conditions fulfilled for lazy load
   * @returns {boolean}
   */
  get lazyLoadEnabled() {
    return !!this.props.loadMoreData;
  }

  /**
   * All conditions fulfilled for refresh
   * @returns {boolean}
   */
  get refreshEnabled() {
    return !!this.props.refreshData;
  }

  renderFooter = () => {
    if (this.props.renderLoading && this.state.isLoading) {
      return this.props.renderLoading(this);
    }

    if (this.props.renderError && this.state.dataError) {
      return this.props.renderError(this);
    }

    if (
      this.props.renderEmpty &&
      this.props.data.length == 0 &&
      !this.state.isRefreshing
    ) {
      return this.props.renderEmpty(this);
    }

    return null;
  };

  renderRefresh = () => {
    return (
      <RefreshControl
        refreshing={this.state.isRefreshing}
        onRefresh={this.refreshData}
        colors={[this.props.indicatorColor]} // android
        tintColor={this.props.indicatorColor} // ios
      />
    );
  };

  render() {
    return (
      <FlatList
        onEndReached={this.onEndReached}
        onEndReachedThreshold={onEndReachedThreshold}
        onMomentumScrollBegin={() => {
          this.onEndReachedCalledDuringMomentum = false;
        }}
        ListFooterComponent={this.renderFooter()}
        refreshControl={this.renderRefresh()}
        {...this.props}
      />
    );
  }
}
