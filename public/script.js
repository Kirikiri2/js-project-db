const button = document.getElementById("theme");
const image = document.getElementById("image");
const sliderImage = document.getElementById("sliderImage");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const saturationRange = document.getElementById("saturationRange");
const uploadForm = document.getElementById("uploadForm");
const fileInput = document.getElementById("fileInput");

let slides = [];
let currentIndex = 0;

// Обновление UI слайдера и карточки
function updateUI(index) {
  if (slides.length === 0) {
    sliderImage.src = "";
    image.src = "";
    return;
  }
  sliderImage.src = slides[index].sliderImg;
  image.src = slides[index].cardImg;
}

// Загрузка изображений с сервера при старте
async function loadImagesFromServer() {
  try {
    const response = await fetch('/api/images');
    if (!response.ok) throw new Error('Ошибка при загрузке изображений');
    const images = await response.json();
    images.forEach(img => {
      slides.push({
        sliderImg: img.url,
        cardImg: img.url
      });
    });
    updateUI(currentIndex);
  } catch (error) {
    console.error(error);
  }
}

// Переключение темы
button.addEventListener("click", function () {
  if (document.body.classList.contains("dark-theme-body")) {
    document.body.classList.remove("dark-theme-body");
    button.classList.remove("dark-theme");
    button.classList.add("light-theme");
    button.textContent = "Light";
  } else {
    document.body.classList.add("dark-theme-body");
    button.classList.remove("light-theme");
    button.classList.add("dark-theme");
    button.textContent = "Dark";
  }
});

// Изменение насыщенности
saturationRange.addEventListener("input", function () {
  const saturation = saturationRange.value;
  image.style.filter = `saturate(${saturation}%)`;
  sliderImage.style.filter = `saturate(${saturation}%)`;
});

// Кнопки слайдера
prevBtn.addEventListener("click", () => {
  if (slides.length === 0) return;
  currentIndex = (currentIndex - 1 + slides.length) % slides.length;
  updateUI(currentIndex);
});

nextBtn.addEventListener("click", () => {
  if (slides.length === 0) return;
  currentIndex = (currentIndex + 1) % slides.length;
  updateUI(currentIndex);
});

// Загрузка нового изображения через форму
uploadForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  const file = fileInput.files[0];
  if (!file) {
    alert("Пожалуйста, выберите изображение.");
    return;
  }
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    if (!response.ok) throw new Error('Ошибка загрузки файла');
    const newImage = await response.json();

    slides.push({
      sliderImg: newImage.url,
      cardImg: newImage.url
    });
    currentIndex = slides.length - 1;
    updateUI(currentIndex);

    uploadForm.reset();
  } catch (error) {
    alert(error.message);
  }
});

// Инициализация
loadImagesFromServer();
