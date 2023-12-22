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
    return `${prefix ? prefix + ' ' : ''}${parseInt(value).toLocaleString(
      'fr',
    )}${suffix ? ' ' + suffix : ''}`;
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
}
