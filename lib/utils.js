export function defer(promise) {
  const _d = {};
  let hasCanceled = false;

  _d.promise = new Promise((resolve, reject) => {
    _d.resolve = resolve;
    _d.reject = reject;
  });
  _d.cancel = () => {
    hasCanceled = true;
  };

  const hasParams = arguments.length;
  if (hasParams) {
    Promise.resolve(promise)
      .then(
        val => (hasCanceled ? _d.reject({ isCanceled: true }) : _d.resolve(val))
      )
      .catch(
        error =>
          hasCanceled ? _d.reject({ isCanceled: true }) : _d.reject(error)
      );
  }

  return _d;
}
