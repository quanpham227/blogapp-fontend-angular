import camelCase from 'lodash-es/camelCase';
import snakeCase from 'lodash-es/snakeCase';
import mapKeys from 'lodash-es/mapKeys';

export function convertToCamelCase(data: any): any {
  if (Array.isArray(data)) {
    return data.map((item) => convertToCamelCase(item));
  } else if (data !== null && typeof data === 'object') {
    const convertedData = mapKeys(data, (value, key) => camelCase(key));
    return Object.keys(convertedData).reduce((result, key) => {
      result[key] = convertToCamelCase(convertedData[key]);
      return result;
    }, {} as any);
  } else {
    return data;
  }
}

export function convertToSnakeCase(data: any): any {
  if (Array.isArray(data)) {
    return data.map((item) => convertToSnakeCase(item));
  } else if (data !== null && typeof data === 'object') {
    const convertedData = mapKeys(data, (value, key) => snakeCase(key));
    return Object.keys(convertedData).reduce((result, key) => {
      result[key] = convertToSnakeCase(convertedData[key]);
      return result;
    }, {} as any);
  } else {
    return data;
  }
}
