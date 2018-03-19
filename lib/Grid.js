import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import {
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Platform,
  View,
  Text,
  Button
} from "react-native";

const DEFAULT_DATA_ERROR_HANDLER = context => (
  <View style={{ flex: 1 }}>
    <Text style={{ textAlign: "center" }}>{context.props.errorLabel}</Text>
    <Button title="Reload" onPress={context.reloadData} />
  </View>
);

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
    renderLoading: PropTypes.func
  };

  static defaultProps = {
    indicatorColor: "blue",
    loadDataOnInit: true,
    propagateDataErrors: false,
    renderError: DEFAULT_DATA_ERROR_HANDLER,
    renderLoading: DEFAULT_LOADING_INDICATOR,
    errorLabel: "Unexpected error when communicating with server."
  };

  state = {
    isLoading: false,
    isRefreshing: false,
    dataError: null
  };

  onEndReachedCalledDuringMomentum = false;

  componentDidMount() {
    if (this.props.loadDataOnInit) {
      this.refreshData();
    }
  }

  componentWillReceiveProps(nextProps) {
    const updatesGetter = this.generateUpdatesGetter(nextProps);
    const stateChanges = {
      ...updatesGetter("isLoading"),
      ...updatesGetter("isRefreshing"),
      ...updatesGetter("dataError")
    };

    if (Object.keys(stateChanges).length) {
      this.setState(stateChanges);
    }
  }

  generateUpdatesGetter = nextProps => key => {
    const nextValue = nextProps[key];
    return (nextValue !== undefined || nextValue !== this.props[key]) &&
      nextValue !== this.state[key]
      ? { [key]: !!nextValue }
      : {};
  };

  /**
   * Load initial data
   * @returns {void}
   */
  refreshData = () => {
    // do nothing if refresh is disabled
    if (!this.refreshEnabled) {
      return;
    }

    // do nothing if method cannot be called
    if (!this.canCallDataMethod) {
      return;
    }

    // fix callbacks double calling on data init phase
    this.onEndReachedCalledDuringMomentum = true;

    this.setState({ isRefreshing: true, dataError: null });
    this.props
      .refreshData()
      .catch(this.handleDataMethodError)
      .finally(() => this.setState({ isRefreshing: false }));
  };

  /**
   * Load next data
   * @returns {void}
   */
  loadMoreData = () => {
    // do nothing if lazy load disabled
    if (!this.lazyLoadEnabled) {
      return;
    }

    // do nothing if method cannot be called
    if (!this.canCallDataMethod) {
      return;
    }

    this.setState({ isLoading: true, dataError: null });
    this.props
      .loadMoreData()
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
    if (this.state.isLoading && this.props.renderLoading) {
      return this.props.renderLoading(this);
    }

    if (this.isDataError && this.props.renderError) {
      return this.props.renderError(this);
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
