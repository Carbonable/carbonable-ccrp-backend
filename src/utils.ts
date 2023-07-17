type FormatStringArgs = {
    value: string, suffix?: string, prefix?: string,
};
export default class Utils {
    static formatString({ value, suffix, prefix }: FormatStringArgs): string {
        return `${prefix ? prefix + ' ' : ''}${parseInt(value).toLocaleString('fr')}${suffix ? ' ' + suffix : ''}`;
    }
}
