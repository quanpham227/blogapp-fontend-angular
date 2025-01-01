import camelCase from 'lodash-es/camelCase';
import snakeCase from 'lodash-es/snakeCase';
import mapKeys from 'lodash-es/mapKeys';

export function convertToCamelCase(data: any): any {
  if (Array.isArray(data)) {
    // Nếu là mảng, áp dụng đệ quy trên từng phần tử
    return data.map((item) => convertToCamelCase(item));
  } else if (data !== null && typeof data === 'object' && !Array.isArray(data)) {
    // Nếu là object, chuyển đổi key và đệ quy trên giá trị
    const convertedData = mapKeys(data, (value: any, key: string) => camelCase(key));
    return Object.keys(convertedData).reduce((result, key) => {
      result[key] = convertToCamelCase(convertedData[key]);
      return result;
    }, {} as any);
  } else {
    // Giá trị nguyên thủy hoặc null
    return data;
  }
}

export function convertToSnakeCase(data: any): any {
  if (Array.isArray(data)) {
    return data.map((item) => convertToSnakeCase(item));
  } else if (data !== null && typeof data === 'object') {
    const convertedData = mapKeys(data, (value: any, key: string) => snakeCase(key));
    return Object.keys(convertedData).reduce((result, key) => {
      result[key] = convertToSnakeCase(convertedData[key]);
      return result;
    }, {} as any);
  } else {
    return data;
  }
}
