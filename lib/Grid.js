import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { defer } from './utils';

const DEFAULT_LOADING_INDICATOR = context => (
  <ActivityIndicator
    animating={true}
    size="large"
    color={context.props.indicatorColor}
  />
);

// fix for FlatList issue (android)
// https://github.com/facebook/react-native/issues/11489
const onEndReachedThreshold = Platform.OS === 'ios' ? 0 : 0.5;

export default class Grid extends PureComponent {
  static propTypes = {
    data: PropTypes.array.isRequired,
    loadMoreData: PropTypes.func,
    refreshData: PropTypes.func,
    indicatorColor: PropTypes.string,
    loadDataOnInit: PropTypes.bool,
    propagateDataErrors: PropTypes.bool,
    isLoading: PropTypes.bool,
    isRefreshing: PropTypes.bool,
    dataError: PropTypes.any,
    renderError: PropTypes.func,
    renderLoading: PropTypes.func,
    renderEmpty: PropTypes.func,
  };

  static defaultProps = {
    indicatorColor: 'blue',
    loadDataOnInit: false,
    propagateDataErrors: false,
    renderLoading: DEFAULT_LOADING_INDICATOR,
    keyExtractor: item => String(item),
  };

  state = {
    isLoading: false,
    isRefreshing: false,
    dataError: null,
  };

  onEndReachedCalledDuringMomentum = true;
  deferredRefreshData = null;
  deferredLoadMoreData = null;

  componentDidMount() {
    const { loadDataOnInit } = this.props;

    if (loadDataOnInit) {
      this.refreshData();
    }
  }

  componentWillUnmount() {
    this.deferredRefreshData && this.deferredRefreshData.cancel();
    this.deferredLoadMoreData && this.deferredLoadMoreData.cancel();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const updatesGetter = Grid._generateUpdatesGetter(nextProps, prevState);
    const stateChanges = {
      ...updatesGetter('isLoading'),
      ...updatesGetter('isRefreshing'),
      ...updatesGetter('dataError'),
    };
    const changesCount = Object.keys(stateChanges).length;

    return changesCount ? stateChanges : null;
  }

  static _generateUpdatesGetter = (nextProps, prevState) => key => {
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

    this.setState({ isRefreshing: true, dataError: null }, () => {
      const { refreshData } = this.props;

      this.deferredRefreshData = defer(refreshData());
      this.deferredRefreshData.promise
        .then(this._handleDataMethodSuccess)
        .catch(this._handleDataMethodError);
    });
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

    this.setState({ isLoading: true, dataError: null }, () => {
      const { data, loadMoreData } = this.props;
      const options = { offset: data.length };

      this.deferredLoadMoreData = defer(loadMoreData(options));
      this.deferredLoadMoreData.promise
        .then(this._handleDataMethodSuccess)
        .catch(this._handleDataMethodError);
    });
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

  _handleDataMethodSuccess = data => {
    return new Promise(resolve => {
      this.setState({ isLoading: false, isRefreshing: false }, () =>
        resolve(data)
      );
    });
  };

  _handleDataMethodError = error => {
    const { propagateErrors } = this.props;
    const promise = Promise.resolve(error);

    if (!error.isCanceled) {
      promise.then(
        () =>
          new Promise(resolve => {
            this.setState(
              {
                dataError: error,
                isLoading: false,
                isRefreshing: false,
              },
              resolve
            );
          })
      );
    }

    if (propagateErrors) {
      promise.then(() => Promise.reject(error));
    }

    return promise;
  };

  _onEndReached = () => {
    const { data } = this.props;
    // fix for FlatList issue
    // https://github.com/facebook/react-native/issues/14015
    if (this.onEndReachedCalledDuringMomentum) {
      return;
    }

    // we should check if data loaded to prevent calling loadMoreData on init
    const isDataLoaded = data.length;

    if (isDataLoaded) {
      this.onEndReachedCalledDuringMomentum = true;
      this.loadMoreData();
    }
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
    const { renderLoading, renderError, renderEmpty, data } = this.props;
    const { isLoading, isRefreshing, dataError } = this.state;

    const shouldRenderLoading = !!renderLoading && isLoading;

    if (shouldRenderLoading) {
      return renderLoading(this);
    }

    const shouldRenderError = !!renderError && !!dataError;

    if (shouldRenderError) {
      return renderError(this);
    }

    const shouldRenderEmpty =
      !!renderEmpty && data.length === 0 && !isRefreshing;

    if (shouldRenderEmpty) {
      return renderEmpty(this);
    }

    return null;
  };

  renderRefresh = () => {
    const { indicatorColor } = this.props;
    const { isRefreshing } = this.state;

    return (
      <RefreshControl
        refreshing={isRefreshing}
        onRefresh={this.refreshData}
        colors={[indicatorColor]} // android
        tintColor={indicatorColor} // ios
      />
    );
  };

  render() {
    return (
      <FlatList
        onEndReached={this._onEndReached}
        onEndReachedThreshold={onEndReachedThreshold}
        onScroll={() => {
          this.onEndReachedCalledDuringMomentum = false;
        }}
        ListFooterComponent={this.renderFooter()}
        refreshControl={this.renderRefresh()}
        {...this.props}
      />
    );
  }
}
