import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const modalLightboxGallery = new SimpleLightbox('.photo-container a', {
  captionsData: 'alt',
  captionDelay: 250,
});

const refs = {
  searchForm: document.querySelector('.search-form'),
  photoListEl: document.querySelector('.photo-list'),
  loader: document.querySelector('.loader'),
};

function checkResponse(res) {
  if (!res.ok) {
    throw new Error(res.statusText);
  }
  return res.json();
}

refs.loader.style.display = 'none';

refs.searchForm.addEventListener('submit', handleSearch);

function handleSearch(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const query = form.elements.query.value.trim();
  refs.photoListEl.innerHTML = '';

  if (!query) {
    iziToast.show({
      message: 'Please enter your request',
      position: 'topRight',
      color: 'yellow',
    });

    return;
  }
  refs.loader.style.display = 'inline-block';

  searchPhoto(query)
    .then(data => {
      if (data.hits.length === 0) {
        iziToast.show({
          message:
            'Sorry, there are no images matching your search query. Please try again!',
          position: 'center',
          color: 'red',
        });
        return;
      }
      markupPhoto(data);
    })
    .catch(err => console.log(err))
    .finally(() => {
      refs.loader.style.display = 'none';
      form.reset();
    });
}

function searchPhoto(value) {
  const BASE_URL = 'https://pixabay.com/api';
  const API_KEY = '41870399-9b44301246ceb98c07efd626a';

  const urlParams = new URLSearchParams({
    key: API_KEY,
    q: value,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
  });

  const url = `${BASE_URL}/?${urlParams}`;

  return fetch(url).then(checkResponse);
}

function markupPhoto({ hits }) {
  const markup = hits
    .map(
      photo => `<li class="gallery-item">
  <a class="gallery-link" href="${photo.largeImageURL}">
    <img
      class="gallery-image"
      src="${photo.webformatURL}"
      alt="${photo.tags}"
    />
  </a><div class="gallery-descr">
   <p>Likes: <br><span>${photo.likes}</span></p>
   <p>Views: <br><span>${photo.views}</span></p>
   <p>Comment: <br><span>${photo.comments}</span></p>
   <p>Downloads: <br><span>${photo.downloads}</span></p></div>
</li>`
    )
    .join('');

  refs.photoListEl.insertAdjacentHTML('beforeend', markup);
  modalLightboxGallery.refresh();
}