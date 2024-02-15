export const retiredForYear = (
  reservations: Reservation[],
  vintage: string,
) => {
  return reservations
    .filter((r) => {
      const rf = parseInt(r.reservedFor);
      const v = parseInt(r.vintage);
      if (rf > v) {
        return rf === parseInt(vintage);
      }
      return v === parseInt(vintage);
    })
    .reduce((acc, curr) => acc + curr.count, 0);
};

export const consumedSinceYear = (
  reservations: Reservation[],
  vintage: string,
) => {
  return reservations
    .filter((r) => {
      const rf = parseInt(r.reservedFor);
      const v = parseInt(r.vintage);
      if (rf > v) {
        return rf <= parseInt(vintage);
      }
      return v <= parseInt(vintage);
    })
    .reduce((acc, curr) => acc + curr.count, 0);
};

export class Reservation {
  constructor(
    public readonly id: string,
    public readonly orderId: string,
    public readonly vintage: string,
    public readonly reservedFor: string,
    public readonly count: number,
    public readonly stockId: string,
  ) {}
}
