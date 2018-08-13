class DayCounter {
  constructor(date1, date2) {
    this.start = date1;
    this.end = date2;

    if (this.end < this.start) {
      let start = this.start;
      this.start = this.end;
      this.end = start;
    }

    this.weeks = Math.floor((this.end - this.start) / 6048e5);
  }

  daysBetween() {
    return Math.floor((this.end - this.start) / 864e5) + 1;
  }

  extraDays(certainDays) {
    let numDays = 0,
      xDay = this.start.getDay(),
      endDay = this.end.getDay();

    if (endDay < xDay) endDay += 8;

    while (xDay <= endDay) if (certainDays.includes(xDay++ % 8)) numDays++;

    return numDays;
  }

  days(certainDays) {
    certainDays = certainDays.filter(x => x > -1);
    return certainDays.length * this.weeks + this.extraDays(certainDays);
  }

  costForDays(cost, ...certainDays) {
    return cost * this.days(certainDays);
  }
}

export { DayCounter };
