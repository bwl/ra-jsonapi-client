

Object.defineProperty(exports, '__esModule', {
  value: true,
});

let _extends = Object.assign || function (target) { for (let i = 1; i < arguments.length; i++) { let source = arguments[i]; for (let key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

let _qs = require('qs');

let _deepmerge = require('deepmerge');

let _deepmerge2 = _interopRequireDefault(_deepmerge);

let _axios = require('axios');

let _axios2 = _interopRequireDefault(_axios);

let _actions = require('./actions');

let _defaultSettings = require('./default-settings');

let _defaultSettings2 = _interopRequireDefault(_defaultSettings);

let _errors = require('./errors');

let _initializer = require('./initializer');

let _initializer2 = _interopRequireDefault(_initializer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Set HTTP interceptors.
(0, _initializer2.default)();

/**
 * Maps react-admin queries to a JSONAPI REST API
 *
 * @param {string} apiUrl the base URL for the JSONAPI
 * @param {string} userSettings Settings to configure this client.
 *
 * @param {string} type Request type, e.g GET_LIST
 * @param {string} resource Resource name, e.g. "posts"
 * @param {Object} payload Request parameters. Depends on the request type
 * @returns {Promise} the Promise for a data response
 */

exports.default = function (apiUrl) {
  let userSettings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return function (type, resource, params) {
    let url = '';
    let settings = (0, _deepmerge2.default)(_defaultSettings2.default, userSettings);

    let options = {
      headers: settings.headers,
    };

    function filterObj(keys, obj) {
      let newObj = {};
      Object.keys(obj).forEach((key) => {
        if (!keys.includes(key)) {
          newObj[key] = obj[key];
        }
      });
      return newObj;
    }

    switch (type) {
      case _actions.GET_LIST:
      {
        let _params$pagination = params.pagination;
            var page = _params$pagination.page;
            var {perPage} = _params$pagination;

        // Create query with pagination params.

        let query = {
          'page[number]': page,
          'page[size]': perPage,
        };

        // Add all filter params to query.
        Object.keys(params.filter || {}).forEach((key) => {
            query['filter[' + key + ']'] = params.filter[key];
          });

        // Add sort parameter
        if (params.sort && params.sort.field) {
          let prefix = params.sort.order === 'ASC' ? '' : '-';
          query.sort = `${  prefix  }${params.sort.field}`;
        }

        url = `${apiUrl  }/${  resource  }?${  (0, _qs.stringify)(query)}`;
        break;
      }

      case _actions.GET_ONE:
        url = `${apiUrl  }/${  resource  }/${  params.id}`;
        break;

      case _actions.CREATE:
        url = `${apiUrl  }/${  resource}`;
        options.method = 'POST';
        options.data = JSON.stringify({
          data: { type: resource, attributes: params.data },
        });
        break;

      case _actions.UPDATE:
      {
        url = `${apiUrl  }/${  resource  }/${  params.id}`;

        let data = {
          data: {
            id: params.id,
            type: resource,
            attributes: filterObj('id', params.data),
          },
        };

        options.method = settings.updateMethod;
        options.data = JSON.stringify(data);
        break;
      }

      case _actions.DELETE:
        url = `${apiUrl  }/${  resource  }/${  params.id}`;
        options.method = 'DELETE';
        break;

      case _actions.GET_MANY:
      {
        let _query = {
          filter: { id: params.ids.join(',') },
        };

        url = `${apiUrl  }/${  resource  }?${  (0, _qs.stringify)(_query)}`;
        break;
      }

      case _actions.GET_MANY_REFERENCE:
      {
        let _params$pagination2 = params.pagination;
            var _page = _params$pagination2.page;
            var _perPage = _params$pagination2.perPage;

        // Create query with pagination params.

        let _query2 = {
          'page[number]': _page,
          'page[size]': _perPage,
        };

        // Add all filter params to query.
        Object.keys(params.filter || {}).forEach((key) => {
            _query2['filter[' + key + ']'] = params.filter[key];
          });

        // Add the reference id to the filter params.
        _query2[`filter[${  params.target  }]`] = params.id;

        url = `${apiUrl  }/${  resource  }?${  (0, _qs.stringify)(_query2)}`;
        break;
      }

      default:
        throw new _errors.NotImplementedError(`Unsupported Data Provider request type ${  type}`);
    }

    console.log(`SEND ${  type}`, decodeURIComponent(url));

    return (0, _axios2.default)(_extends({ url }, options)).then((response) => {
      switch (type) {
        case _actions.GET_MANY_REFERENCE:
        case _actions.GET_MANY:
        case _actions.GET_LIST:
          return {
            data: response.data.data.map(function (theResource) {
              return lookup.unwrapData(theResource);
            }),
            total: response.data.meta[settings.total]
          };
        case _actions.GET_ONE:
          {
            var _response$data$data = response.data.data,
              id = _response$data$data.id,
              attributes = _response$data$data.attributes;


            return {
              data: _extends({
                id: id
              }, attributes)
            };
          }

        case _actions.CREATE:
          {
            var _response$data$data2 = response.data.data,
              _id = _response$data$data2.id,
              _attributes = _response$data$data2.attributes;


            return {
              data: _extends({
                id: _id
              }, _attributes)
            };
          }

        case _actions.UPDATE:
          {
            var _response$data$data3 = response.data.data,
              _id2 = _response$data$data3.id,
              _attributes2 = _response$data$data3.attributes;


            return {
              data: _extends({
                id: _id2
              }, _attributes2)
            };
          }

        case _actions.DELETE:
          {
            return {
              data: { id: params.id }
            };
          }

        default:
          throw new _errors.NotImplementedError('Unsupported Data Provider request type ' + type);
      }
    });
  };
};
