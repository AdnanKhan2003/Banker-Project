'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2023-03-01T23:36:17.929Z',
    '2023-03-03T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'en-US',
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2023-03-04T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'hi-IN', // de-DE
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const options = {
  hour: 'numeric',
  minute: 'numeric',
  day: 'numeric',
  // weekday: 'long',
  month: 'numeric',
  year: 'numeric',
};

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    // const day = `${date.getDate()}`.padStart(2, 0);
    // const month = `${date.getMonth() + 1}`.padStart(2, 0);
    // const year = date.getFullYear();
    // return `${day}/${month}/${year}`;
    return new Intl.DateTimeFormat(locale).format(date);
  }
};

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${i + 1} ${type}
      </div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formatCur(
          mov,
          acc.locale,
          acc.currency
        )}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);

  const now = new Date();
  labelDate.textContent = new Intl.DateTimeFormat(acc.locale, options).format(
    now
  );
  labelBalance.textContent = `${formatCur(
    acc.balance,
    acc.locale,
    acc.currency
  )}`;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${formatCur(incomes, acc.locale, acc.currency)}`;

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${formatCur(
    Math.abs(out),
    acc.locale,
    acc.currency
  )}`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${formatCur(
    interest,
    acc.locale,
    acc.currency
  )}`;
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

const startLogOutTimer = function () {
  let time = 300;
  const tick = () => {
    // SET minutes & seconds
    let minutes = String(Math.trunc(time / 60)).padStart(2, 0);
    let seconds = String(Math.trunc(time % 60)).padStart(2, 0);

    // DISPLAY Timer
    labelTimer.textContent = `${minutes}:${seconds}`;

    // STOP Timer
    if (time === 0) {
      containerApp.style.opacity = 0;
      labelWelcome.textContent = `Log in to get started`;
      clearInterval(timer);
    }

    // DECREMENT TIME EVERY SECOND
    time--;
  };

  tick();
  timer = setInterval(tick, 1000);

  return timer;
};

///////////////////////////////////////
// Event handlers
let currentAccount, timer;

// FAKE LOGIN
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    // Update UI
    updateUI(currentAccount);
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(() => {
      // Add movement
      currentAccount.movements.push(amount);

      currentAccount.movementsDates.push(new Date().toISOString());

      if (timer) clearInterval(timer);
      timer = startLogOutTimer();

      // Update UI
      updateUI(currentAccount);
    }, 3000);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    // console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

///////////////////////////////////////////////////////////////////////////
// CONVERTING AND CHECKING NUMBERS
// In javascript, all numbers are internally represented as floating point numbers
// All no are respresented internally in a 64 base 2 format (it means that numbers are always stored in a binary format)
// In binary form, it is hard to represent some fractions that are easy to represent it in based 10 digits
// Javascript behind the scenes can't represent certain fractions
// We can't do very scientific or precise calculations in javascript
// Type coercion happens whenever an operator is dealing with 2 values of different data types, then the js behind the scenes will the convert the one value to match the other value

// NUMBER provides something called namespace. So namespace for all this different functions like parseFloat, parseInt
// ---------

/* 
// 1] JAVASCRIPT CAN'T REPRESENT CERTAIN NUMBERS
// Here, Js couldn't represent number "0.3" it is representing it as     "0.30000000000000004"
// It is because js couldn't represent certain fractions
// Representing such fractions in a base 10 is easy while it is hard is base 2
console.log(0.1 + 0.2);
// FALSE, because it can't calculate precisely certain factores
console.log(0.1 + 0.2 === 0.3);


///// 2] CONVERSION TO NUMBER
// Whenever the js see "+" operator it will type coercion and convert the operands into numbers
console.log(+'23');
console.log(+false);

// 3] READ NUMBERS FROM STRING
// The no. should be the first word
// "parseInt" is a global function it can work without calling it on Number
console.log(parseInt('123asd'));
// BUT NUMBER provides something called namespace. So namespace for all this different functions like parseFloat, parseInt


//////
// PARSING INTEGERS & DECIMALS
// A. parseInt()
console.log('------------ parseInt() ------------');
// 2nd argument is regex is the base of the numeral system that we're using
console.log(Number.parseInt('123dsa', 10));
// console.log(Number.parseInt('123dsa', 2));
console.log(Number.parseInt('123dsa'));
console.log(Number.parseInt('dsa123'));

// B. parseFloat()
console.log('------------ parseFloat() ------------');
console.log(Number.parseFloat('2.3rem'));
console.log(Number.parseFloat('dsa2.3'));
console.log(Number.parseInt('2.3rem'));

// isNaN()
console.log('------------ isNaN() ------------');
console.log(Number.isNaN(20));
console.log(Number.isNaN('20'));
console.log(Number.isNaN(+'20X'));
console.log(Number.isNaN('2/0'));
console.log(Number.isNaN(2 / 0));
console.log(Number.isNaN(+'2/0')); // true
// Any no. when its divided it returns "infinity"
console.log(21 / 0); // Infinity


//// 5. CHECK IF THE VALUE IS NUMBER 
// isFinite()
console.log('------------ isFinite() ------------');
// To check whether it is number or not
console.log(Number.isFinite(2));
console.log(Number.isFinite('2'));
console.log(Number.isFinite(+'2'));
console.log(Number.isFinite(+'2sd'));
console.log(Number.isFinite(+'2/0'));
console.log(Number.isFinite(2 / 0));

//// 6. CHECK IF THE VALUE IS INTEGER 
// isInteger()
console.log('------------ isInteger() ------------');
console.log(Number.isInteger(23));
console.log(Number.isInteger(23.0));
console.log(Number.isInteger(23.5));
console.log(Number.isInteger(23 / 5));
 */

///////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////
// MATH AND ROUNDING

/* 
// 1] Math.sqrt()
console.log(Math.sqrt(25));
// Use exponentiation to find SQUARE ROOT OR CUBE ROOT
console.log(25 ** (1 / 2));
console.log(8 ** (1 / 3));

// 2] Math.min()
// It also does "TYPE COERCION"
console.log(Math.min(1, 3, 5, 6, 7));
console.log(Math.min('1', 3, 5, 6, 7));

// 3] Math.max()
console.log(Math.max(1, 3, 5, 6, 7));

// 4] Math.PI()
// 3.14....
console.log(Math.PI);
console.log(Math.PI * 10 ** 2);

// 5] Math.random()
console.log(Math.trunc(Math.random() * 6)) + 1;

/////////////////////////////
// Creating FUNCTION for generating RANDOM numbers

// It will generate between
// 0 to 0.99...
// const genRandNumber = (max, min) => Math.random();

// It will generate between the difference between the max & min
// 0 to 9.999..
// const genRandNumber = (max, min) => Math.random() * (max - min);

// It will remove the decimal
// 0 to 9
// const genRandNumber = (max, min) => Math.trunc(Math.random() * (max - min));

// 1 to 10
// const genRandNumber = (max, min) => Math.trunc(Math.random() * (max - min) + 1);

// >> THE BELOW ONE ARE THE COMPLETE FUNCTION <<
// Adding minimun value to generate the difference between the min & max above the min value
// FUNCTION 1
// 11 to 20
// const genRandNumber = (max, min) =>
//   Math.trunc(Math.random() * (max - min) + 1) + min;

// FUNCTION 2
// 10 to 20
const genRandNumber = (max, min) =>
  Math.trunc(Math.random() * (max - min + 1)) + min;
console.log(genRandNumber(20, 10));

////// ROUNDING INTEGERS
// 6] Math.round()
// It rounds to the closest number
console.log(Math.round(23.4));
console.log(Math.round(23.8));

// 7] Math.ceil()
console.log(Math.ceil(23.4));
console.log(Math.ceil(23.9));

// 8] Math.floor()
console.log(Math.floor(23.2));
console.log(Math.floor(23.8));

// trunc() & floor() is same but 1 difference which is mentioned below
console.log(Math.trunc(2.3));
console.log(Math.floor(2.3));

// DIFFERENCE between Math.trunc() & Math.floor()
// Is that the "floor()" works perfectly on negative numbers as well
console.log(Math.trunc(-2.3));
console.log(Math.floor(-2.3));

/////// ROUNDING DECIMALS
////

console.log((2.4).toFixed());
console.log((2.4).toFixed(2));
console.log((2.4).toFixed(3));
 */

///////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////
// REMAINDER OPERATOR
// It can use to find out even/odd numbers
// It returns remainder
// Use to find every nth time

/* 
// Difference between DIVISION & REMAINDER
console.log(4 % 2);
console.log(4 / 2);

console.log(5 % 2);
console.log(5 / 2);

console.log(7 % 3);
console.log(7 / 3);

//
const nodeList = document.querySelectorAll('.movements__row');
const nodeToArr = Array.from(nodeList, (cur, i) => cur);
console.log(nodeList);
console.log(nodeToArr);
labelBalance.addEventListener('click', () => {
  [...document.querySelectorAll('.movements__row')].forEach((row, i) => {
    if ((i + 1) % 2 === 0) row.style.backgroundColor = 'green';
    if ((i + 1) % 3 === 0) row.style.background = 'red';
  });
});
 */

///////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////
// NUMERIC SEPERATORS
// - It has made easy for developers to read long numbers easily

/* 
const longNumHard = 1500000;
// Hard to read for developers

// We can use _ to give meanings to certain parts of our numbers
const longNumEasy = 1_500_000; // EASY to read

console.log(longNumHard);
console.log(longNumEasy);

// Little difference in positing "_" will lead to difference in number(only while reading)
const priceCent = 15_00;
const price = 1_500;

console.log(priceCent);
console.log(price);

// ILLEGAL
// "_" It shouldn't be at the beginning and at last or after "."

// const illegal1 = _1500;
// const illegal2 = _1500_;
// const illegal3PI = 3._14;
// const illegal4PI = 3_.14;

console.log(Number('23000'));
// PROBLEM when USING "_"
console.log(Number('23_000'));
// If the string that contains "_" is to be converted to numbers then the js will return "NaN"

// Where "parseInt" will return the string before "_"
console.log(Number.parseInt('23_000'));
 */

///////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////
// BIGINT (BIG INTEGER)
// Numbers are internally represented as 64 bits.
// and that means that there are only 64 ones or zeros to represent any given number
// Out of the 64 bits only 53 bits are used to store the digits themselves
// The rest are for storing the position of the decimal point and the sign

/* 
////////
// The MAXIMUM possible number that we can represent in Js is....
console.log(2 ** 53 - 1);

// The above number is so IMPORTANT that is stored in the NUMBER namespace as "MAX_SAFE_INTEGER"
// Any Number larger than this isn't safe (unsafe) means that it can't be represented accurately
console.log(Number.MAX_SAFE_INTEGER);
console.log(2 ** 53 + 1);
console.log(2 ** 53 + 2);
console.log(2 ** 53 + 3);
console.log(2 ** 53 + 4);
console.log(2 ** 53 + 5);

// It may sometimes represent accurately but only SOMETIMES so that's why any number above "MAX_SAFE_INTEGER" is unsafe number

// There's a solution: BigInt

const amount = 2342389432483435825n;
const amount2 = BigInt(342389432483435825);
console.log(amount);
console.log(amount2);

// OPERATIONS on BigInt
console.log(5n + 4n);
console.log(5n - 4n);
console.log(4n / 2n);
console.log(3n ** 2n);

// NOTE: WE CAN'T COMPARE "BIGINT" WITH OTHER VALUES. BUT THEIR ARE SOME EXCEPTIONS
// 1. LOGICAL COMPARISON OPERATORS 
// 2. CONCATENATE OPERATORS
// console.log(3n + 2); // Illegal
// console.log(5n - 4); // Illegal
// console.log(4n / 2); // Illegal
// console.log(3n ** 2); // Illegal

// EXCEPTIONS (LOGICAL COMPARISON AND CONCATENATE OPERATOR)
console.log(4n > 2);
console.log(2n == 2);
console.log(2n === 2);

const num = 2,
  bigInt = 3n;
console.log(num < bigInt);

console.log(`${324798327987328348372884723874732987498732874n} is a BigInt`);

// DIVISON
// It cuts off the decimal part
console.log(10n / 3n);
// It'll show the recurring decimal numbers
console.log(10 / 3);
 */

///////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////
// CREATING DATES

/* 
// Create DATE
const dateNow = new Date();
console.log(dateNow);

// It can PARSE the date
console.log(new Date('March 14 2023'));
// Year, Month, Date, Hours, Minutes, Seconds, Milliseconds
console.log('---------- UNDERSTANDING PARAMETERS -------------');
console.log(new Date(2023, 11, 20, 5, 30, 12, 12));
console.log(new Date(2023, 11, 20, 5, 30, 12, 12));
// Year, Month, Date, Hours, Minutes, Seconds
console.log(new Date(2023, 11, 20, 5, 30, 12));
// Year, Month, Date, Hours, Minutes
console.log(new Date(2023, 11, 20, 5, 30));
// Year, Month, Date, Hours
console.log(new Date(2023, 11, 20, 5));
// Year, Month, Date
console.log(new Date(2023, 11, 20));
// Year, Month (MONTH is 0 based)
console.log(new Date(2023, 11));
// Milliseconds (it will not take 1 parameters as year but MILLISECONDS)
console.log(new Date(2023));

// It will show the date when the initial unix time begin
console.log(new Date(0));
// 3 days after initial unix time
// DAYS, HOURS, MINUTES, SECONDS, MILLISECONDS
console.log(new Date(3 * 24 * 60 * 60 * 1000));
// 3 * 24 * 60 * 60 * 1000
// 259200000 (The milliseconds that has been passed since the beginning of the unix time till after 3 days of that beginning of unix time)

//
const futureDate = new Date(2037, 11, 20, 5, 30, 30, 30);
console.log(futureDate);

// Since DATE is also a special type of object so it also has methods
console.log(futureDate.getFullYear());
console.log(futureDate.getMonth());
console.log(futureDate.getDate());
console.log(futureDate.getDay());
console.log(futureDate.getHours());
console.log(futureDate.getMinutes());
console.log(futureDate.getSeconds());
console.log(futureDate.getMilliseconds());
// Convert to UTC
console.log(futureDate.toISOString());
// Timestamps (the amt of time passed since the unix time (Jan 4 1970))
console.log(futureDate.getTime());

//
console.log(Date.now());
console.log(new Date('20 Januaray 2050').getTime());

// other SET methods
futureDate.setFullYear(2050);
futureDate.setMonth(1);
futureDate.setDate(2);
futureDate.setHours(2);
futureDate.setMinutes(2);
futureDate.setSeconds(2);
futureDate.setMilliseconds(2);
console.log(futureDate);
console.log(futureDate.toISOString());

/////
// UTC, TIME ZONE & DAY-LIGHT SAVINGS
// A] UTC - Universal Cooperated Time.
// HERE IS HOW TO CONVERT ANY TIME ZONE TO UTC
// console.log(new Date(2023, 11, 20, 5, 30, 12, 12).toISOString());
// console.log(account1.movementsDates[0]);

// B] TIME ZONE- Every place have different time zones because of the difference of getting sunlight.

// C] Day-light saving- During summer time, the clock is adjusted forward or backward so that during summer (when sun rises earlier and sets later) people can come on work earlier and go to home earlier. And due to this electricity can be saved as we're working during day-light.
*/

///////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////
// OPERATIONS WITH DATES

///// THIS RESULTS IN THE DATES BEING CONVERTED INTO TIMESTAMPS
// 1. CONVERTING DATES TO NUMBER
// 2. SUBTRACTING OR ADDING DATES
// - CONVERTING any date or SUBTRACTING one date with another will return TIMESTAMPS

/* 
// DATE to NUMBERS
const date = new Date(2023, 1, 1);
const date2 = new Date(2023, 1, 5);
console.log(+date);

// Operations with dates
console.log(date2 - date);
*/

///////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////
// INTERNATIONALIZING DATES (Intl)
// 1 ARGUMENT
// Locale (language-country) (Country in Capital)
// options (set time, hours, minutes, seconds, weekdays)

/* 
// UNDERSTAND the new Intl, .DateTimeFormat(locale, options), .format(date)
const now = new Date();

// 1 Argument (iso language code) (language, country)
const date = new Intl.DateTimeFormat('en-US').format(now);
console.log(date);

// 2 Argument (options)
const options = {
  hour: 'numeric',
  minute: 'numeric',
  day: 'numeric',
  month: 'long',
  // month: '2-digit',
  year: 'numeric',
  weekday: 'long',
};
const dateWithTime = new Intl.DateTimeFormat('en-US', options).format(now);
console.log(dateWithTime);

// SHOWING THE FORMAT AS PER USER'S BROWSER SETTINGS
const locale = navigator.language;

const userDateTime = new Intl.DateTimeFormat(locale, options).format(now);
console.log(userDateTime);
*/

///////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////
// INTERNATIONALIZING NUMBERS (Intl)

/* 
const number = 2348389.239;

// FORMATING NUMBERS
console.log('------------ 1 Argument -------------');

console.log(new Intl.NumberFormat('en-US').format(number));
console.log(new Intl.NumberFormat('ar-SY').format(number));
console.log(new Intl.NumberFormat('de-DE').format(number));
console.log(new Intl.NumberFormat('hi-IN').format(number));

// UNITS

console.log('------------ 2 Argument -------------');

console.log('------------ 1. style: "unit" -------------');
console.log('------------ style: "unit" -------------');
console.log('------------ unit: "mile-per-hour" -------------');
const option1 = {
  style: 'unit',
  unit: 'mile-per-hour',
};
console.log(new Intl.NumberFormat('en-US', option1).format(number));
console.log(new Intl.NumberFormat('ar-SY', option1).format(number));
console.log(new Intl.NumberFormat('de-DE', option1).format(number));
console.log(new Intl.NumberFormat('hi-IN', option1).format(number));

console.log('------------ style: "unit" -------------');
console.log('------------ unit: "celsius" -------------');
const option2 = {
  style: 'unit',
  unit: 'celsius',
};
console.log(new Intl.NumberFormat('en-US', option2).format(number));
console.log(new Intl.NumberFormat('ar-SY', option2).format(number));
console.log(new Intl.NumberFormat('de-DE', option2).format(number));
console.log(new Intl.NumberFormat('hi-IN', option2).format(number));

console.log('------------ 2. style: "percent" -------------');
const option3 = {
  style: 'percent',
  // unit: 'celsius',
};
console.log(new Intl.NumberFormat('en-US', option3).format(number));
console.log(new Intl.NumberFormat('ar-SY', option3).format(number));
console.log(new Intl.NumberFormat('de-DE', option3).format(number));
console.log(new Intl.NumberFormat('hi-IN', option3).format(number));

console.log('------------ 3. style: "currency" -------------');
console.log('------------ 3. currency: "USD" -------------');
const option4 = {
  style: 'currency',
  // unit: 'celsius',
  currency: 'USD',
};
console.log(new Intl.NumberFormat('en-US', option4).format(number));
console.log(new Intl.NumberFormat('ar-SY', option4).format(number));
console.log(new Intl.NumberFormat('de-DE', option4).format(number));
console.log(new Intl.NumberFormat('hi-IN', option4).format(number));
 */

///////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////
// TIMERS: SETTIMEOUT & SETINTERVAL

/* 
// 1. setTimeout:
// Just runs just once after a definded time
// 2. setInterval:
// It keeps running forever until we set it

// When the execution of our code reaches this point. The setTimeout function is called and the callback function is registered to be called later.

// It schedules a function to run after a certain amount of time. But the callback function runs just once

// 1] setTimeout (Runs just once after a definded time)
// Asap the js execution reaches this line it will keep counting the time defined and register the callback function to be called after the time has passed, then js will move to the last line
// This mechanism is called Asynchronous Javascript

setTimeout(() => {
  console.log(`Here is your Pizza!!`);
}, 3000);

// Pass ARGUMENTS in setTimeout()
// UNDERSTANDING FORMAT....
// setTimeout(callback function, waiting Time, Arguments for the current function)

setTimeout(
  (...ing) => {
    console.log(`Here is your Pizza with ${ing.join(' and ')}!!`);
  },
  3000,
  'Watermelon',
  'Apple'
);

// ASSIGN timer to a variable
const iAmATimer = setTimeout(
  () => console.log(`I'm a timer attached to a variable`),
  3000
);

// CLEAR/DELETE a timer: setTimeout using clearTimer
clearTimeout(iAmATimer);

// 2] setInterval (It keeps running forever until we set it)

setInterval(() => console.log(new Date()), 1000);

// CHALLENGE COMPLETED
setInterval(() => {
  const now = new Date();
  const option = {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  };

  const alu = new Intl.DateTimeFormat('en-US', option).format(now);
  console.log(alu);
}, 1000);
 */

// setInterval(() => {
//   const now = 5;
//   const option2 = {
//     minute: 'numeric',
//     second: 'numeric',
//   };
//   const alu = new Intl.DateTimeFormat('en-US', option2).format(now);
//   console.log(alu);
// }, 1000);

///////////////////////////////////////////////////////////////////////////
