class DateConverter {
  public static dateToString(date: string) {
    const dateObj = new Date(date);
    const day = dateObj.getDate();
    const month = dateObj.toLocaleString('default', { month: 'short' });
    const year = dateObj.getFullYear();

    // const nthNumber = (number: number) => {
    //   if (number > 3 && number < 21) return 'th';
    //   switch (number % 10) {
    //     case 1:
    //       return 'st';
    //     case 2:
    //       return 'nd';
    //     case 3:
    //       return 'rd';
    //     default:
    //       return 'th';
    //   }
    // };
    // const stringDate = `${day}${nthNumber(day)} ${month} ${year}`;
    const stringDate = `${day} ${month} ${year}`;
    return stringDate;
  }
}

export default DateConverter;
