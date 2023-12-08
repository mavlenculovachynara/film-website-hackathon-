//! Сохраняем API (базу данных)
const API = 'http://localhost:8000/cinema'
const API1 = 'http://localhost:8000/favorite'
const API2 = 'http://localhost:8000/cards'
//! Сохраняем переменные для ввода данных и кнопки
let inpName = document.querySelector('#inpName')
let inpAuthor = document.querySelector('#inpAuthor')
let inpImage = document.querySelector('#inpImage')
let inpYear = document.querySelector('#inpYear')
let inpGenre = document.querySelector('#inpGenre')
let btnAdd = document.querySelector('#btnAdd')
let btnOpenForm = document.querySelector('#flush-collapseOne')
let sectionCinema = document.querySelector('#sectionCinema')
//! Переменные для пагинации
let currentPage = 1
let countPage = 1
//! Кнопки для пагинации
let prevBtn = document.querySelector('#prevBtn')
let nextBtn = document.querySelector('#nextBtn')
let inpSearch = document.querySelector('#inpSearch')
//! Переменная для поиска
let searchValue = ''
//! Навешиваем событие на кнопку - добавить
btnAdd.addEventListener('click', () => {
	if (
		//! Проверка на заполненность полей
		!inpName.value.trim() ||
		!inpAuthor.value.trim() ||
		!inpImage.value.trim() ||
		!inpYear.value.trim() ||
		!inpGenre.value.trim()
	) {
		alert('Заполните все поля!')
		return
	}
	//! Создаём новый объект, куда добавляем значение наших инпутов (создание новой книги)
	let newCinema = {
		cinemaName: inpName.value,
		cinemaAuthor: inpAuthor.value,
		cinemaImage: inpImage.value,
		cinemaYear: inpYear.value,
		cinemaGenre: inpGenre.value,
	}
	createCinema(newCinema) //! Вызываем функцию добавления новой книги в базу данных и передаём в качестве аргумента объект, созданной выше
	readCinema() //! ВЫзываем функцию для отображения данных
})

//! CREATE
//! Функция для добавления новых книг в базу данных
async function createCinema(cinema) {
	await fetch(API, {
		//! Отправляем запрос с помощью метода POST, для отправки данных
		method: 'POST',
		headers: {
			'Content-type': 'application/json; charset=utf-8',
		},
		body: JSON.stringify(cinema),
	})
	//! Совершаем очистку инпутов
	inpName.value = ''
	inpAuthor.value = ''
	inpImage.value = ''
	inpYear.value = ''
	inpGenre.value = ''
	//! Меняем класс с помощью toggle у аккордеона, для того чтобы закрывался аккордеон
	btnOpenForm.classList.toggle('show')
}
//! READ
//! Создаём функцию для отображения данных
async function readCinema() {
	const response = await fetch(
		//! Чтобы передать значение инпута в запрос, мы должны прописать обязательно ?,q=${searchValue}
		`${API}?q=${searchValue}&_page=${currentPage}&_limit=3`
	)
	const data = await response.json() //! Получение данные из bd.json()
	sectionCinema.innerHTML = '' //! Очищаем наш тег section, чтобы не было дубликатов
	data.forEach(item => {
		sectionCinema.innerHTML += `
    <div class="card m-4 cardBook" style="width: 13rem">
    <img
    id="${item.id}"
    src="${item.cinemaImage}"
    alt=""
    class="card-img-top detailsCard"
    style="height: 280px"
    />
    <div class="card-body">
    <h5 class="card-title">${item.cinemaName}</h5>
    <p class="card-text">${item.cinemaAuthor}</p>
    <span class="card-text">${item.cinemaYear}</span>
		<span class="card-text">${item.cinemaGenre}</span>
		<div>
        <button class="btn btn-outline-danger btnDelete" id="${item.id}" >
        Удалить
        </button>
        <button
      class="btn btn-outline-warning btnEdit"
      id="${item.id}"
      data-bs-toggle="modal"
      data-bs-target="#exampleModal"
    >
      Изменить
    </button>
		</div>
    </div>
		</div>
    `
	})
	pageFunc()
}
readCinema() //! Один раз вызываем функцию отображения данных, для того чтобы при первом посещении сайта, данные отобразились

//! DELETE
//! Событие на кнопку удаление
document.addEventListener('click', e => {
	let del_class = [...e.target.classList] //! Сохраняем массив с классами в переменную
	if (del_class.includes('btnDelete')) {
		//! Проверяем, если ли в нашем массиве наш класс btnDelete
		let del_id = e.target.id //! Сохраняем id элемента, по которому кликнули
		fetch(`${API}/${del_id}`, {
			method: 'DELETE',
		}).then(() => readCinema()) //! Вызываем функцию отображения данных, для того чтобы всё переотобразилось сразу же после удаления одной книги
	}
})

//! EDIT
let editInpName = document.querySelector('#editInpName')
let editInpAuthor = document.querySelector('#editInpAuthor')
let editInpImage = document.querySelector('#editInpImage')
let editInpYear = document.querySelector('#editInpYear')
let editInpGenre = document.querySelector('#editInpGenre')
let editBtnSave = document.querySelector('#editBtnSave')
document.addEventListener('click', e => {
	let arr = [...e.target.classList]
	if (arr.includes('btnEdit')) {
		let id = e.target.id
		fetch(`${API}/${id}`)
			.then(res => {
				return res.json()
			})
			.then(data => {
				editInpName.value = data.cinemaName
				editInpAuthor.value = data.cinemaAuthor
				editInpImage.value = data.cinemaImage
				editInpYear.value = data.cinemaYear
				editInpGenre.value = data.cinemaGenre
				editBtnSave.setAttribute('id', data.id)
			})
	}
})
editBtnSave.addEventListener('click', () => {
	let editedCinema = {
		cinemaName: editInpName.value,
		cinemaAuthor: editInpAuthor.value,
		cinemaImage: editInpImage.value,
		cinemaYear: editInpYear.value,
		cinemaGenre: editInpGenre.value,
	}
	editCinema(editedCinema, editBtnSave.id)
})
function editCinema(editCinema, id) {
	fetch(`${API}/${id}`, {
		method: 'PATCH',
		headers: {
			'Content-type': 'application/json; charset=utf-8',
		},
		body: JSON.stringify(editCinema),
	}).then(() => readCinema())
}

//! Pagination
//! Функция для отображения определенных элементов на странице (в зависимости от указанного вол-во элементов)
function pageFunc() {
	fetch(`${API}?q=${searchValue}`)
		.then(res => {
			return res.json()
		})
		.then(data => {
			//! Записываем в переменную countPage = текущую страницу
			countPage = Math.ceil(data.length / 3)
		})
}
prevBtn.addEventListener('click', () => {
	//! Проверяем на какой странице мы сейчас находимся
	if (currentPage <= 1) return
	currentPage--
	readCinema()
})
nextBtn.addEventListener('click', () => {
	//! Проверяем на какой странице мы сейчас находимся
	if (currentPage >= countPage) return
	currentPage++
	readCinema()
})

//! SEARCH
inpSearch.addEventListener('input', e => {
	//! Эта строка добавляет слушатель событий для поля ввода в inpSearch. Он реагирует на событие input, то есть каждый раз, когда пользователь что-то вводит в инпут. Внутри этого слушателя событий есть стрелочная функция, которая выполняется при каждом событии input. e.target.value содержит значение, введенное пользователем в инпут.
	currentPage = 1
	searchValue = e.target.value.trim()
	readCinema()
})
//!  Button Подробнее
let btnDetailsList = document.querySelectorAll('.btnDetails')
let modalBody = document.getElementById('modalBody')
let movieModal = new bootstrap.Modal(document.getElementById('movieModal'))
btnDetailsList.forEach(btn => {
	btn.addEventListener('click', event => {
		let movieId = event.currentTarget.getAttribute('data-movie-id')
		showMovieDetails(movieId)
	})
})
function showMovieDetails(movieId) {
	modalBody.innerHTML = ''
	fetch(`${API1}/${movieId}`)
		.then(res => res.json())
		.then(data => {
			modalBody.innerHTML = `
                <h5>${data.movieInfo}</h5>`
			movieModal.show() //! Используем метод show() для открытия модального окна
		})
}
let modalCloseBtn = document.querySelector('.modal .btn-close')
modalCloseBtn.addEventListener('click', () => {
	movieModal.hide() //! Используем метод hide() для закрытия модального окна
})
//! Получаем все кнопки с классом btnCheck
let btnCheckButtons = document.querySelectorAll('.btnCheck')
//! Добавляем обработчик событий для каждой кнопки
btnCheckButtons.forEach(button => {
	button.addEventListener('click', () => {
		//! Получаем информацию о фильме с карточки
		let movieInfo = {
			title: button.closest('.card').querySelector('.card-title').textContent,
		}
		console.log(movieInfo)
		//! Переключаем классы для изменения цвета галочки
		button.classList.toggle('btn-success')
		button.classList.toggle('btn-danger')
	})
})

//!! ДОБАВЛЕНИЕ В ИЗБРАННОЕ И САМО ИЗБРАННОЕ START
//! Обработчик событий для каждой кнопки "Избранное"
document.querySelectorAll('.btnCheck').forEach(button => {
	button.addEventListener('click', async () => {
		let movieId = button.getAttribute('data-movie-id')
		console.log(movieId)
		//! Получаем информацию о фильме с карточки
		let movieInfo = {
			title: button.closest('.card').querySelector('.card-title').textContent,
		}
		//! Отправляем данные на сервер Избранного
		try {
			//! Отправляем данные на сервер для добавления в Избранное
			let response = await fetch(API1, {
				method: 'POST',
				headers: {
					'Content-type': 'application/json; charset=utf-8',
				},
				body: JSON.stringify({ movieInfo }),
			})
			if (!response.ok) {
				throw new Error(
					`Не удалось добавить в Избранное. Статус: ${response.status}`
				)
			}
			//! Выводим сообщение только при успешном добавлении
			alert('Добавлено в Избранное!')
			//! Если нужно обновить модальное окно, нужно раскомментировать
			// showFavoriteModal(await fetch(API1).then(response => response.json()));
		} catch (error) {
			console.error(error.message)
			alert('Произошла ошибка. Не удалось добавить в Избранное.')
		}
	})
})
//! Функция для удаления фильма из избранного
async function removeFromFavorites(movieId) {
	try {
		//! Отправляем запрос на сервер для удаления из Избранного
		let response = await fetch(`${API1}/${movieId}`, {
			method: 'DELETE',
		})
		if (!response.ok) {
			throw new Error(
				`Не удалось удалить из Избранного. Статус: ${response.status}`
			)
		}
		//! Выводим сообщение только при успешном удалении
		alert('Фильм удален из Избранного!')
		//! Обновляем модальное окно после удаления
		showFavoriteModal(await fetch(API1).then(response => response.json()))
	} catch (error) {
		console.error(error.message)
		alert('Произошла ошибка. Не удалось удалить из Избранного.')
	}
}
//! Отображаем модальное окно при нажатии на кнопку Избранное
document.getElementById('favoriteBtn').addEventListener('click', async () => {
	try {
		//! Получаем избранные фильмы с сервера
		let favoriteMovies = await fetch(API1).then(response => response.json())

		//! Отображаем модальное окно с избранными фильмами
		if (favoriteMovies.length > 0) {
			showFavoriteModal(favoriteMovies)
		}
	} catch (error) {
		console.error(error.message)
		alert('Произошла ошибка. Не удалось загрузить избранные фильмы.')
	}
})
//! Функция для отображения модального окна с избранными фильмами
function showFavoriteModal(favoriteMovies) {
	let favoriteModal = new bootstrap.Modal(
		document.getElementById('favoriteModal')
	)
	let modalContent = document.getElementById('favoriteModalContent')
	//! Генерируем HTML для отображения списка избранных фильмов
	let htmlContent = '<h5>Избранные фильмы</h5><ul>'
	favoriteMovies.forEach(movie => {
		htmlContent += `<li>${movie.movieInfo.title} 
                            <button class="btn btn-danger btn-sm" onclick="removeFromFavorites('${movie.id}')">Удалить</button>
                        </li>`
	})
	htmlContent += '</ul>'
	modalContent.innerHTML = htmlContent
	favoriteModal.show()
}
//!! ДОБАВЛЕНИЕ В ИЗБРАННОЕ И САМО ИЗБРАННОЕ FINISH
