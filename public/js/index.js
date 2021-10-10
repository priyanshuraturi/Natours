/*eslint-disable*/

import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, logout, signup } from './login';

//Dom Elems
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('#login');
const logOutBtn = document.querySelector('.nav__el--logout');
const singUpForm = document.querySelector('#signUpForm');
//Delegations
if (mapBox) {
  let allLocations = JSON.parse(
    document.getElementById('map').dataset.locations
  );

  displayMap(allLocations);
}

if (loginForm) {
  document.querySelector('.form').addEventListener('submit', (e) => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    e.preventDefault();
    login(email, password);
  });
}

if (logOutBtn) {
  console.log('Logout is Present');
  logOutBtn.addEventListener('click', logout);
}
if (singUpForm) {
  console.log('SingUp Exist');
  document
    .querySelector('#signUpForm')
    .addEventListener('submit', (e) => {
      const email = document.getElementById('email').value;
      const name = document.getElementById('name').value;
      const password = document.getElementById('password').value;
      const confirmPassword =
        document.getElementById('confirmPassword').value;
      console.log(email);
      e.preventDefault();
      signup(name, email, password, confirmPassword);
    });
}
