import * as _ from 'lodash';

class PaginationDTO {
  page = 1;
  count = 10;
}

type FormatStringArgs = {
  value: string;
  suffix?: string;
  prefix?: string;
};
export default class Utils {
  static formatString({ value, suffix, prefix }: FormatStringArgs): string {
    if (null === value) {
      value = '0';
    }
    let cbFn = parseInt;
    if (typeof value === 'string' && value.includes('.')) {
      cbFn = parseFloat;
    }
    return `${prefix ? prefix + ' ' : ''}${cbFn(value).toLocaleString('fr')}${
      suffix ? ' ' + suffix : ''
    }`;
  }

  static paginate(data: any[], pagination: any) {
    if (!pagination) {
      pagination = new PaginationDTO();
    }

    const total_page = Math.ceil(data.length / pagination.count);
    return {
      data: data.slice(
        (pagination.page - 1) * pagination.count,
        pagination.page * pagination.count,
      ),
      page_info: {
        total_page,
        has_next_page: pagination.page < total_page,
        has_previous_page: pagination.page > 1,
      },
    };
  }

  // prices are stored as ints with 4 digits. divide by 100 to keep 2 digits precision
  static priceDecimal(value: number): number {
    return value / 100;
  }

  static round(value: number): number {
    return Math.round(value * 100) / 100;
  }

  static orderByVintage(value: Array<any>): Array<any> {
    return _.sortBy(value, (v) => parseInt(v.vintage));
  }

  static orderByYear(value: Array<any>): Array<any> {
    return _.sortBy(value, (v) => parseInt(v.year));
  }
}
