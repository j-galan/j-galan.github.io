
function goToHomePage() {
	window.location = '/';
}

async function loadJSON(path) {
	const response = await fetch(path);
	return await response.json();
}

function toThumbnail(path) {
	const split = separatePathByExtension(path);
	return split[0] + "_thumbnail." + split[1];
}

function separatePathByExtension(path) {
	return [
		path.replace(/\.[^/.]+$/, ""),
		path.split('.').pop()
	];
}

function openCategory(index) {
	const cell = document.querySelectorAll('.contentCell')[index];
	if (!cell) throw new Error(`Cell at index ${ index } not found.`);
	window.location = cell.getAttribute('data-url');
}

function openFullImage(index) {
	const cell = document.querySelectorAll('.contentCell')[index];
	if (!cell) throw new Error(`Cell at index ${ index } not found.`);
	const thumbnailSrc = cell.querySelector('img').getAttribute('src');
	const fullPath = thumbnailSrc.replace('_thumbnail.', '.');
	document.getElementById('fullImage').src = fullPath;
	openOverlay();
}

function openOverlay() {
	const overlay = document.getElementById('fullImageOverlay').style.display = 'block';
}

function closeOverlay() {
	const overlay = document.getElementById('fullImageOverlay').style.display = 'none';
	document.getElementById('fullImage').src = '';
}

async function initialize() {
	const configPath = '/config.json';
	const configObject = await loadJSON(configPath);
	document.title = configObject.title;
	document.getElementById('headerLeft').innerHTML = configObject.headerLeft;
	document.getElementById('bannerImage').src = configObject.bannerImage;
	document.getElementById('headerRight').innerHTML = configObject.headerRight;
	document.getElementById('bannerImage').addEventListener('click', goToHomePage);
	document.getElementById('headerRight').addEventListener('click', goToHomePage);

	let pageDefPath = window.location.pathname.replace('.html', '.json');
	if (pageDefPath === '/') pageDefPath = 'index.json';
	const pageDef = await loadJSON(pageDefPath);

	switch (pageDef.pageType) {
		case 'categories': initializeCategories(pageDef); break;
		case 'imageGrid': initializeImageGrid(pageDef); break;
		default: console.warn("Unknown page type", pageDef.pageType);
	}

}

function initializeCategories(pageDef) {
	const grid = document.getElementById('pageContainer').querySelector('.contentGrid');

	for (const cat of pageDef.content) {
		const html =
			`<div class="contentCell" data-url="${ cat.link }">
				<img src="${ cat.thumbnail }" alt="thumbnail"></img>
				<div class="overlay">${ cat.title }</div>
			</div>`;
		grid.innerHTML += html;
	}

	document.querySelectorAll('.contentCell').forEach((e, i) => {
		e.setAttribute('data-index', i);
		e.addEventListener('click', () => openCategory(i));
	});
}

function initializeImageGrid(pageDef) {
	const grid = document.getElementById('pageContainer').querySelector('.contentGrid');

	for (const image of pageDef.content) {
		const html =
			`<div class="contentCell">
				<img src="${ toThumbnail(image.image) }" alt="thumbnail"></img>
				<div class="overlay">${ image.title }</div>
			</div>`;
		grid.innerHTML += html;
	}

	document.querySelectorAll('.contentCell').forEach((e, i) => {
		e.setAttribute('data-index', i);
		e.addEventListener('click', () => openFullImage(i));
	});

	document.getElementById('fullImageOverlay').addEventListener('click', closeOverlay);
	document.getElementById('fullImage').addEventListener('click', e => e.stopPropagation());

	document.addEventListener('keydown', e => {
		switch (e.code) {
			case "Escape": closeOverlay(); break;
		}
	});
}

initialize();
