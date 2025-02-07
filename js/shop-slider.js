function initializeSlider(imagesArray) {
  let interval = 3; // sec
  let sliderCount = imagesArray.length;

  const sliderWin = document.querySelector(".slider-wrapper");
  const pointsWin = document.querySelector(".levels");
  const nextBTN = document.querySelector(".next-btn");
  const prevBTN = document.querySelector(".prev-btn");

  if (!sliderWin || !pointsWin || !nextBTN || !prevBTN) {
    console.error("Slider elements not found in the DOM");
    return;
  }

  let selected = 0;
  let pauseOn = false;
  let showTools = false;

  let dragging = {
    startX: 0,
    endX: 0,
  };

  function generateSlides(image, index, parent) {
    let slide = document.createElement("div");
    slide.classList.add("slide");
    if (index === 0) {
      slide.classList.add("active");
    }
    parent.appendChild(slide);

    const img = document.createElement("img");
    img.src = image.src;
    img.classList.add("slide-img");
    slide.appendChild(img);
  }

  function generateLevels(index, parent) {
    let point = document.createElement("div");
    point.classList.add("point");

    if (index === 0) {
      point.classList.add("active");
    }

    point.setAttribute("data-id", index);
    parent.appendChild(point);
  }

  function showSlider() {
    imagesArray.forEach((image, index) => {
      generateSlides(image, index, sliderWin);
      generateLevels(index, pointsWin);
    });
  }

  showSlider();

  function changeSlide(actionType = "next", slideNum = null) {
    if (sliderWin.children[selected]) {
      sliderWin.children[selected].classList.remove("active");
    }
    if (pointsWin.children[selected]) {
      pointsWin.children[selected].classList.remove("active");
    }

    if (slideNum !== null) {
      selected = slideNum;
    } else {
      if (actionType === "next") {
        selected++;
        if (selected === sliderCount) {
          selected = 0;
        }
      } else if (actionType === "prev") {
        selected--;
        if (selected < 0) {
          selected = sliderCount - 1;
        }
      }
    }
    
    if (sliderWin.children[selected]) {
      sliderWin.children[selected].classList.add("active");
    }
    if (pointsWin.children[selected]) {
      pointsWin.children[selected].classList.add("active");
    }

    if (actionType || slideNum !== null) {
      clearInterval(timer);
      timer = setInterval(changeSlide, interval * 1000);
    }
  }

  let timer = setInterval(changeSlide, interval * 1000);

  nextBTN.addEventListener("click", () => changeSlide("next"));
  prevBTN.addEventListener("click", () => changeSlide("prev"));

  pointsWin.addEventListener("click", (event) => {
    if (event.target.classList.contains("point")) {
      let pointID = parseInt(event.target.getAttribute("data-id"));
      changeSlide(null, pointID);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.code === "KeyT") {
      if (!showTools) {
        clearInterval(timer);
        document.querySelector(".showNavPanel").classList.add("active");
      } else {
        timer = setInterval(changeSlide, interval * 1000);
        document.querySelector(".showNavPanel").classList.remove("active");
      }
      showTools = !showTools;
    }

    if (event.code === "Space") {
      if (!pauseOn) {
        clearInterval(timer);
      } else {
        timer = setInterval(changeSlide, interval * 1000);
      }
      pauseOn = !pauseOn;
    }

    if (event.code === "ArrowLeft") {
      changeSlide("prev");
    }

    if (event.code === "ArrowRight") {
      changeSlide("next");
    }
  });

  sliderWin.addEventListener("touchstart", (event) => {
    dragging.startX = event.touches[0].clientX;
  });

  sliderWin.addEventListener("touchend", (event) => {
    dragging.endX = event.changedTouches[0].clientX;

    if (dragging.startX < dragging.endX) {
      changeSlide("prev");
    } else {
      changeSlide("next");
    }
  });
}
