//
// ---- CURRENCY -----

let selectedCurrency = sessionStorage.getItem("selectedCurrency") || "CZK";

let currencyRates = {
  CZK: 1,
  UAH: 1.76,
};

let currencySymbols = {
  CZK: "Kč",
  UAH: "₴",
};

// ---- GLOBAL -----

let selectedMeal;

//
// ---- RESTART PAGE -----

document.querySelector(".logo").addEventListener("click", () => {
  document.querySelector(".bgimage").classList.remove("disable");
  location.reload();
});

//
// ---- MAIN GENERATER WIDGET -----

function showMcMenuWidget(widgetSelect, addWidgetClassTitle, products) {
  let widget = document.querySelector(widgetSelect);
  widget.innerHTML = "";

  for (let product of products) {
    let element = document.createElement("div");
    element.classList.add(addWidgetClassTitle);
    element.setAttribute("data-id", product.id);

    let title = document.createElement("h3");
    title.textContent = product.name.toUpperCase();

    let imgCategory = document.createElement("img");
    imgCategory.src = product.image.src;
    imgCategory.alt = product.image.alt;

    widget.appendChild(element);

    if (addWidgetClassTitle === "mcposition") {
      element.appendChild(imgCategory);
    }

    element.appendChild(title);
  }
}

//
// ---- SELECT CURRENCY ----

document
  .querySelector('select[name="currency"]')
  .addEventListener("change", (event) => {
    selectedCurrency = event.target.value;
    sessionStorage.setItem("selectedCurrency", selectedCurrency);
    updatePrices();
    console.log(selectedCurrency);
    location.reload();
  });

//

function updatePrices() {
  document.querySelectorAll(".mealInfo .price").forEach((priceElement) => {
    let mealElement = priceElement.closest(".mcposition");

    if (!mealElement) {
      return;
    }

    let mealId = mealElement.getAttribute("data-id");
    let meal;

    for (let category of mcmenu) {
      meal = category.meals.find((meal) => meal.id === mealId);
    }

    priceElement.textContent = `${(
      meal.price * currencyRates[selectedCurrency]
    ).toFixed(2)}${currencySymbols[selectedCurrency]}`;
  });

  if (selectedMeal) {
    let amount = document.forms.order.orderamount.value;
    let price = selectedMeal.price * currencyRates[selectedCurrency];
    let totalPrice = price * amount;
    document.getElementById("calculation").textContent = `${totalPrice.toFixed(
      2
    )}${currencySymbols[selectedCurrency]}`;
  }
}

//
// ----- SHOW MAIN MENU -----

document.addEventListener("DOMContentLoaded", () => {
  document.querySelector('select[name="currency"]').value = selectedCurrency;
  showMcMenuWidget(".menu-categories", "meal-category", mcmenu);
  console.log("Currency: " + sessionStorage.getItem("selectedCurrency"));
  updatePrices();
});

//
// ---- SELECT CATEGORY POSITION -----

document
  .querySelector(".menu-categories")
  .addEventListener("click", (event) => {
    let categoryElement = event.target.closest(".meal-category");
    if (categoryElement) {
      document.querySelectorAll(".meal-category.select").forEach((item) => {
        item.classList.remove("select");
      });

      categoryElement.classList.add("select");

      let categoryMealId = categoryElement.getAttribute("data-id");
      console.log(categoryMealId);

      document
        .querySelector(".category-positions")
        .setAttribute("data-category-id", categoryMealId);

      showMealsByCategory(categoryMealId);
    }
  });

//

function showMealsByCategory(categoryId) {
  let myMcCategory = mcmenu.find((category) => category.id === categoryId);
  let meal = myMcCategory.meals;

  showMcMenuWidget(".category-positions", "mcposition", meal);
}

//
// ---- SELECT MEAL -----

document
  .querySelector(".category-positions")
  .addEventListener("click", (event) => {
    let mealElement = event.target.closest(".mcposition");

    if (mealElement) {
      document.querySelectorAll(".mcposition.select").forEach((item) => {
        item.classList.remove("select");
      });
      mealElement.classList.add("select");

      let selectedMcCategoryId =
        mealElement.parentNode.getAttribute("data-category-id");
      let mealId = mealElement.getAttribute("data-id");

      let selectedCategory = mcmenu.find(
        (category) => category.id === selectedMcCategoryId
      );
      let selectedMeal = selectedCategory.meals.find(
        (meals) => meals.id === mealId
      );
      console.log(selectedMeal.name);

      let unitPrice = selectedMeal.price * currencyRates[selectedCurrency];
      document.getElementById("calculation").textContent = `${Math.round(
        unitPrice
      )}${currencySymbols[selectedCurrency]}`;

      document.querySelector(".bgimage").classList.add("disable");

      showSelectedMcMeal(selectedMeal);
    }
  });

//

function showSelectedMcMeal(meal) {
  selectedMeal = meal;
  let mcPosition = document.querySelector(".meal-descript");

  mcPosition.innerHTML = `
      <img src='${meal.image.src}' alt='${meal.image.alt}'>
      <div class='mealInfo'>
         <h2>${meal.name}</h2>
         <p>${meal.descript}</p>
         <p class='price'>${Math.round(
           meal.price * currencyRates[selectedCurrency]
         )}${currencySymbols[selectedCurrency]}</p>
         <button type='button' class='getBtn'>GET</button>
      </div>
    `;

  mcPosition.innerHTML += `
    <div class="slider">
      <div class="slider-wrapper"></div>
      <div class="levels"></div>
      <div class="navigaion">
        <button type="button" class="btn prev-btn" data-action="prev">
          <svg class='svg' xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
            <polygon points="15.293 3.293 6.586 12 15.293 20.707 16.707 19.293 9.414 12 16.707 4.707 15.293 3.293"/>
          </svg>
        </button>
        <button type="button" class="btn next-btn" data-action="next">
          <svg class='svg' xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
            <polygon points="7.293 4.707 14.586 12 7.293 19.293 8.707 20.707 17.414 12 8.707 3.293 7.293 4.707"/>
          </svg>
        </button>
      </div>
    </div>`;

  initializeSlider(meal.ingredImg);

  document.querySelector(".getBtn").addEventListener("click", () => {
    document.querySelector(".order-wrapper").classList.remove("hidden");
    document.querySelector(".bg").classList.add("blur");
  });
}

//
// ---- ORDER FORM -----

document.addEventListener("DOMContentLoaded", () => {
  const orderAmountInput = document.querySelector('input[name="orderamount"]');
  const orderBtn = document.getElementById("order");

  function updateTotalPrice() {
    if (!selectedMeal) return;

    let amount = orderAmountInput.value;
    if (amount < 1) {
      orderAmountInput.value = 1;
      amount = 1;
    }
    let price = selectedMeal.price * currencyRates[selectedCurrency];
    let totalPrice = price * amount;
    document.getElementById("calculation").textContent = `${Math.round(
      totalPrice
    )}${currencySymbols[selectedCurrency]}`;
    console.log(
      `Amount: x${amount}\nPrice: ${Math.round(totalPrice)}${
        currencySymbols[selectedCurrency]
      }`
    );
  }

  orderAmountInput.addEventListener("change", updateTotalPrice);

  inputValidator('input[name="email"]');
  inputValidator('input[name="phone"]');
  inputValidator('input[name="name"]');
});

//

document.querySelector("#order").addEventListener("click", () => {
  let amount = document.forms.order.orderamount.value;
  let price = selectedMeal.price * currencyRates[selectedCurrency];

  if (amount === "") {
    return;
  }

  let clientOrder = {
    email: document.forms.order.email.value,
    phone: document.forms.order.phone.value,
    name: document.forms.order.name.value,
    product: selectedMeal.name,
    currentPrice: selectedMeal.price,
    amount: amount,
    totalPrice: price * amount,
    currency: selectedCurrency,
  };

  console.log(clientOrder);
  showNotification();
});

//
// ---- CLOSE ORDER FORM -----

document.querySelector(".bg").addEventListener("click", () => {
  document.querySelector(".order-wrapper").classList.add("hidden");
  document.querySelector(".bg").classList.remove("blur");
});

//
// ---- NOTIFICATION -----

function showNotification() {
  let notification = document.querySelector(".notification");
  notification.textContent = "Purchase completed";
  notification.classList.remove("hidden");

  setTimeout(() => {
    notification.classList.add("hidden");
    document.querySelector(".order-wrapper").classList.add("hidden");
    document.querySelector(".bg").classList.remove("blur");
  }, 3000);
}

//
// ---- INPUT VALIDATOR ----

function inputValidator(inputItem) {
  const input = document.querySelector(inputItem);
  const inputGroup = input.closest(".input-group");
  const stateMessage = inputGroup.querySelector("#statusTitle");

  input.addEventListener("change", () => {
    const data = input.value.trim();

    // -- REGULAR EXPRESSIONS

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneRegex =
      /^\+?\d{1,3}?[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;
    const nameRegex = /^[A-ZА-Я][a-zа-я]*$/;

    // -- CHECK INPUT TYPE

    let isValid = false;

    if (input.type === "email") {
      isValid = emailRegex.test(data);
    } else if (input.type === "number") {
      isValid = phoneRegex.test(data);
    } else if (input.type === "text") {
      isValid = nameRegex.test(data) && data.length >= 1;
    }

    // -- INCORRECT
    if (!isValid) {
      stateMessage.textContent = "Incorrect";
      stateMessage.style.color = "red";
      stateMessage.style.opacity = "1";
      input.classList.add("invalid");
      input.classList.remove("valid");
      stateMessage.classList.remove("scale");

      setTimeout(() => {
        input.classList.remove("invalid");
        stateMessage.style.color = "black";
        stateMessage.style.opacity = "0";
        stateMessage.textContent = "";
        input.value = "";
      }, 1200);

      // -- CORRECT
    } else {
      stateMessage.textContent = "Done";
      stateMessage.style.color = "white";
      stateMessage.style.opacity = "1";
      stateMessage.classList.add("scale");
      input.classList.remove("invalid");
      input.classList.add("valid");

      setTimeout(() => {
        input.classList.remove("valid");
        stateMessage.style.color = "black";
        stateMessage.style.opacity = "0";
        stateMessage.textContent = "";
      }, 1800);
    }
  });
}

//
// ---- CHECK ALL FORM ----

document
  .querySelectorAll(
    'input[name="name"], input[name="email"], input[name="phone"]'
  )
  .forEach((input) => {
    input.addEventListener("input", checkFormValidity);
  });

function checkFormValidity() {
  const nameInput = document.querySelector('input[name="name"]');
  const emailInput = document.querySelector('input[name="email"]');
  const phoneInput = document.querySelector('input[name="phone"]');
  const orderBtn = document.getElementById("order");
  const nameRegex = /^[A-ZА-Я][a-zа-я]*$/;

  const isNameFilled = nameInput.value.trim() !== "" && nameInput.value.length > 1 && nameRegex.test(nameInput.value);
  const isEmailFilled = emailInput.value.trim() !== "";
  const isPhoneFilled = phoneInput.value.trim() !== "";

  const isFormValid = isNameFilled && isEmailFilled && isPhoneFilled;

  if (isFormValid) {
    orderBtn.classList.add("showBTN");
  } else {
    orderBtn.classList.remove("showBTN");
  }

  return isFormValid;
}
